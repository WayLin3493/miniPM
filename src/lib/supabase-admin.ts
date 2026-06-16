import { createClient } from "@supabase/supabase-js";
import type { DailyFeed } from "./types";

function hasAdminConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getAdminClient() {
  if (!hasAdminConfig()) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false }
  });
}

export async function persistDailyFeed(feed: DailyFeed) {
  const supabase = getAdminClient();
  if (!supabase) return { persisted: false, reason: "missing_supabase_config" };

  const { data: daily, error: feedError } = await supabase
    .from("daily_feeds")
    .upsert(
      {
        feed_date: feed.date,
        title: feed.title,
        estimate_minutes: feed.estimateMinutes,
        status: "published"
      },
      { onConflict: "feed_date" }
    )
    .select("id")
    .single();

  if (feedError || !daily) return { persisted: false, reason: feedError?.message || "missing_daily_feed" };

  await supabase.from("feed_items").delete().eq("daily_feed_id", daily.id);
  await supabase.from("pmp_questions").delete().eq("daily_feed_id", daily.id);

  const { error: itemError } = await supabase.from("feed_items").insert(
    feed.items.map((item) => ({
      daily_feed_id: daily.id,
      category: item.category,
      growth_route: item.route,
      title: item.title,
      node_label: item.nodeLabel,
      summary: item.summary,
      application: item.application,
      body: item.body,
      source_url: item.sourceUrl,
      minutes: item.minutes,
      tags: item.tags
    }))
  );
  if (itemError) return { persisted: false, reason: itemError.message };

  const { error: questionError } = await supabase.from("pmp_questions").insert(
    feed.questions.map((question) => ({
      daily_feed_id: daily.id,
      question_type: question.type,
      stem: question.stem,
      options: question.options,
      answer: question.answer,
      explanation: question.explanation,
      knowledge_area: question.knowledgeArea
    }))
  );
  if (questionError) return { persisted: false, reason: questionError.message };

  return { persisted: true, reason: "ok" };
}

export async function loadDailyFeed(feedDate: string): Promise<DailyFeed | null> {
  const supabase = getAdminClient();
  if (!supabase) return null;

  const { data: daily } = await supabase
    .from("daily_feeds")
    .select("id, feed_date, title, estimate_minutes")
    .eq("feed_date", feedDate)
    .maybeSingle();

  if (!daily) return null;

  const [{ data: items }, { data: questions }] = await Promise.all([
    supabase.from("feed_items").select("*").eq("daily_feed_id", daily.id),
    supabase.from("pmp_questions").select("*").eq("daily_feed_id", daily.id)
  ]);

  return {
    date: daily.feed_date,
    title: daily.title,
    estimateMinutes: daily.estimate_minutes,
    items: (items || []).map((item) => ({
      id: item.id,
      category: item.category,
      route: item.growth_route,
      title: item.title,
      nodeLabel: item.node_label,
      summary: item.summary,
      application: item.application,
      body: item.body || [],
      sourceUrl: item.source_url || "#",
      minutes: item.minutes,
      tags: item.tags || [],
      accent: item.category === "github" ? "lemon" : item.category === "tool" ? "coral" : item.category === "ai" ? "sky" : "mint"
    })),
    questions: (questions || []).map((question) => ({
      id: question.id,
      type: question.question_type,
      stem: question.stem,
      options: question.options,
      answer: question.answer,
      explanation: question.explanation,
      knowledgeArea: question.knowledge_area
    }))
  };
}

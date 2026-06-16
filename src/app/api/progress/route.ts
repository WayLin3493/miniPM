import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, getCurrentUser } from "@/lib/supabase-server";

type ProgressPayload = {
  date?: string;
  feedItemId?: string;
  questionId?: string;
  selected?: string[];
  isCorrect?: boolean;
};

const emptyProgress = {
  readIds: [] as string[],
  answeredIds: [] as string[],
  wrongIds: [] as string[],
  checkins: [] as string[]
};

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  const supabase = await createSupabaseServerClient();
  const date = request.nextUrl.searchParams.get("date");

  if (!user || !supabase) {
    return NextResponse.json({ ok: true, mode: "local", progress: emptyProgress });
  }

  const [progressResult, wrongResult, checkinResult] = await Promise.all([
    supabase.from("user_progress").select("feed_item_id, pmp_question_id, progress_type").eq("user_id", user.id),
    supabase.from("wrong_questions").select("pmp_question_id").eq("user_id", user.id).eq("mastered", false),
    supabase.from("checkins").select("checkin_date").eq("user_id", user.id)
  ]);

  const readIds = (progressResult.data || [])
    .filter((entry) => entry.progress_type === "read" && entry.feed_item_id)
    .map((entry) => entry.feed_item_id as string);
  const answeredIds = (progressResult.data || [])
    .filter((entry) => entry.progress_type === "answered" && entry.pmp_question_id)
    .map((entry) => entry.pmp_question_id as string);
  const wrongIds = (wrongResult.data || []).map((entry) => entry.pmp_question_id as string);
  const checkins = (checkinResult.data || []).map((entry) => entry.checkin_date as string);

  return NextResponse.json({
    ok: true,
    mode: "supabase",
    date,
    progress: { readIds, answeredIds, wrongIds, checkins }
  });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  const supabase = await createSupabaseServerClient();
  const payload = (await request.json()) as ProgressPayload & { action?: "read" | "answer" | "checkin" };

  if (!user || !supabase) {
    return NextResponse.json({ ok: true, mode: "local", skipped: true });
  }

  const feedDate = payload.date || new Date().toISOString().slice(0, 10);

  if (payload.action === "read" && payload.feedItemId) {
    await supabase.from("user_progress").insert({
      user_id: user.id,
      feed_date: feedDate,
      feed_item_id: payload.feedItemId,
      progress_type: "read"
    });
    return NextResponse.json({ ok: true, mode: "supabase" });
  }

  if (payload.action === "answer" && payload.questionId) {
    const isCorrect = Boolean(payload.isCorrect);
    await supabase.from("user_progress").insert({
      user_id: user.id,
      feed_date: feedDate,
      pmp_question_id: payload.questionId,
      progress_type: "answered",
      is_correct: isCorrect
    });
    if (!isCorrect) {
      const nextReview = new Date(`${feedDate}T00:00:00`);
      nextReview.setDate(nextReview.getDate() + 1);
      await supabase.from("wrong_questions").insert({
        user_id: user.id,
        pmp_question_id: payload.questionId,
        review_stage: 1,
        next_review_at: nextReview.toISOString().slice(0, 10),
        mastered: false
      });
    }
    return NextResponse.json({ ok: true, mode: "supabase" });
  }

  if (payload.action === "checkin") {
    await supabase.from("checkins").upsert(
      {
        user_id: user.id,
        checkin_date: feedDate
      },
      { onConflict: "user_id,checkin_date" }
    );
    return NextResponse.json({ ok: true, mode: "supabase" });
  }

  return NextResponse.json({ ok: false, error: "Unsupported action" }, { status: 400 });
}

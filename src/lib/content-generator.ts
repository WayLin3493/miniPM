import OpenAI from "openai";
import { aiCostLogs, jobLogs, todayFeed } from "./demo-data";
import { chinaDateString } from "./date";
import { fetchCandidates } from "./fetch-candidates";
import { persistDailyFeed } from "./supabase-admin";
import type { DailyFeed, FeedCategory, FeedItem, JobLog, PmpQuestion } from "./types";

type GenerateResult = {
  feed: DailyFeed;
  logs: JobLog[];
  costs: typeof aiCostLogs;
  mode: "demo" | "ai";
  persisted?: boolean;
  persistReason?: string;
};

type AiItem = Partial<Pick<FeedItem, "category" | "title" | "summary" | "application" | "body" | "sourceUrl" | "tags">>;
type AiQuestion = Partial<Pick<PmpQuestion, "type" | "stem" | "options" | "answer" | "explanation" | "knowledgeArea">>;

const categoryMeta: Record<FeedCategory, Pick<FeedItem, "route" | "nodeLabel" | "minutes" | "accent">> = {
  art: { route: "美术管线", nodeLabel: "美术管线知识", minutes: 3, accent: "mint" },
  ai: { route: "AI工具", nodeLabel: "AI前沿知识", minutes: 2, accent: "sky" },
  github: { route: "GitHub工具", nodeLabel: "GitHub项目", minutes: 2, accent: "lemon" },
  tool: { route: "AI工具", nodeLabel: "AI工具推荐", minutes: 2, accent: "coral" }
};

function getAiConfig() {
  const provider = (process.env.AI_PROVIDER || (process.env.DEEPSEEK_API_KEY ? "deepseek" : "openai")).toLowerCase();

  if (provider === "deepseek") {
    return {
      provider,
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
      model: process.env.AI_MODEL || process.env.DEEPSEEK_MODEL || "deepseek-v4-flash"
    };
  }

  return {
    provider: "openai",
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
    model: process.env.AI_MODEL || process.env.OPENAI_MODEL || "gpt-5-nano"
  };
}

export async function generateDailyFeed(): Promise<GenerateResult> {
  const feedDate = chinaDateString();
  const demoFeed = { ...todayFeed, date: feedDate };
  const aiConfig = getAiConfig();

  if (!aiConfig.apiKey) {
    return failedResult(demoFeed, "missing_ai_config");
  }

  try {
    const candidates = await fetchCandidates();
    const client = new OpenAI({ apiKey: aiConfig.apiKey, baseURL: aiConfig.baseURL });
    const response = await client.chat.completions.create({
      model: aiConfig.model,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "你是 MiniPM 的每日学习内容生成器。必须只输出 JSON，不要输出 Markdown。内容要轻松、短句、适合游戏公司美术 PM。PMP 题必须是原创练习题，不能声称是官方真题。"
        },
        {
          role: "user",
          content: JSON.stringify({
            date: feedDate,
            uniquenessSeed: `${feedDate}-${new Date().toISOString()}`,
            task: "生成今天的 MiniPM 学习包，每次运行都必须和旧模板题目不同。",
            requirements: [
              "生成 5 道 PMP 练习题，必须包含单选和多选。",
              "生成 4 条阅读内容：1 条美术管线、1 条 AI 前沿、1 条 GitHub 项目、1 条 AI 工具。",
              "items 必须正好包含 category: art, ai, github, tool 各 1 条。",
              "每条阅读内容必须有 title、summary、application、body 三段、sourceUrl、tags。",
              "每道 PMP 题必须有 type、stem、options、answer、explanation、knowledgeArea。",
              "不要复用这些旧题主题：外包角色资产返修、资产延期风险、主美临时调整风格、AI 版权担忧、美术外包验收节点。",
              "题目和内容要结合真实美术 PM 场景，但每天换不同场景。"
            ],
            outputShape: {
              items: [
                {
                  category: "art|ai|github|tool",
                  title: "string",
                  summary: "string",
                  application: "string",
                  body: ["string", "string", "string"],
                  sourceUrl: "string",
                  tags: ["string"]
                }
              ],
              questions: [
                {
                  type: "single|multiple",
                  stem: "string",
                  options: [
                    { id: "A", text: "string" },
                    { id: "B", text: "string" },
                    { id: "C", text: "string" },
                    { id: "D", text: "string" }
                  ],
                  answer: ["A"],
                  explanation: "string",
                  knowledgeArea: "string"
                }
              ]
            },
            candidates
          })
        }
      ],
      temperature: 0.9
    });

    const content = response.choices[0]?.message.content || "";
    const aiFeed = parseAiResponse(content, feedDate);
    const persistence = await persistDailyFeed(aiFeed);

    return {
      feed: aiFeed,
      logs: [
        ...jobLogs,
        {
          id: `job-${Date.now()}`,
          status: persistence.persisted ? "success" : "failed",
          name: `${aiConfig.provider} 内容生成`,
          detail: `真实 AI 生成完成，候选内容 ${candidates.length} 条，持久化：${persistence.persisted ? "成功" : persistence.reason}`,
          createdAt: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
        }
      ],
      costs: aiCostLogs,
      mode: "ai",
      persisted: persistence.persisted,
      persistReason: persistence.reason
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "ai_generation_failed";
    return failedResult(demoFeed, message);
  }
}

function failedResult(feed: DailyFeed, reason: string): GenerateResult {
  return {
    feed,
    logs: [
      ...jobLogs,
      {
        id: `job-${Date.now()}`,
        status: "failed",
        name: "AI 内容生成失败",
        detail: reason,
        createdAt: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
      }
    ],
    costs: aiCostLogs,
    mode: "demo",
    persisted: false,
    persistReason: reason
  };
}

function parseAiResponse(raw: string, feedDate: string): DailyFeed {
  const parsed = JSON.parse(stripCodeFence(raw)) as { items?: AiItem[]; questions?: AiQuestion[] };
  const items = buildItems(parsed.items || []);
  const questions = buildQuestions(parsed.questions || []);

  if (items.length !== 4) throw new Error("ai_response_missing_items");
  if (questions.length !== 5) throw new Error("ai_response_missing_questions");
  if (looksLikeDemo(questions)) throw new Error("ai_response_reused_demo_questions");

  return {
    date: feedDate,
    title: "今日小冒险",
    estimateMinutes: 10,
    items,
    questions
  };
}

function stripCodeFence(raw: string) {
  return raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");
}

function buildItems(items: AiItem[]): FeedItem[] {
  return (["art", "ai", "github", "tool"] as FeedCategory[]).map((category) => {
    const generated = items.find((item) => item.category === category);
    if (!generated) throw new Error(`missing_${category}_item`);
    const meta = categoryMeta[category];
    return {
      id: `${category}-${Date.now()}`,
      category,
      route: meta.route,
      nodeLabel: meta.nodeLabel,
      title: requiredString(generated.title, `${category}_title`),
      summary: requiredString(generated.summary, `${category}_summary`),
      application: requiredString(generated.application, `${category}_application`),
      body: requiredArray(generated.body, `${category}_body`).slice(0, 3),
      sourceUrl: requiredString(generated.sourceUrl, `${category}_sourceUrl`),
      minutes: meta.minutes,
      tags: requiredArray(generated.tags, `${category}_tags`).slice(0, 4),
      accent: meta.accent
    };
  });
}

function buildQuestions(questions: AiQuestion[]): PmpQuestion[] {
  return questions.slice(0, 5).map((question, index) => {
    const options = question.options || [];
    if (options.length < 4) throw new Error(`question_${index + 1}_missing_options`);
    const answer = question.answer || [];
    if (!answer.length) throw new Error(`question_${index + 1}_missing_answer`);
    return {
      id: `pmp-${index + 1}-${Date.now()}`,
      type: question.type === "multiple" ? "multiple" : "single",
      stem: requiredString(question.stem, `question_${index + 1}_stem`),
      options: options.slice(0, 4).map((option) => ({
        id: requiredString(option.id, `question_${index + 1}_option_id`),
        text: requiredString(option.text, `question_${index + 1}_option_text`)
      })),
      answer,
      explanation: requiredString(question.explanation, `question_${index + 1}_explanation`),
      knowledgeArea: requiredString(question.knowledgeArea, `question_${index + 1}_knowledgeArea`)
    };
  });
}

function requiredString(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`missing_${field}`);
  return value.trim();
}

function requiredArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value) || !value.length || value.some((item) => typeof item !== "string" || !item.trim())) {
    throw new Error(`missing_${field}`);
  }
  return value.map((item) => item.trim());
}

function looksLikeDemo(questions: PmpQuestion[]) {
  const demoPhrases = ["外包角色资产", "资产延期风险", "临时调整角色风格", "版权担忧", "外包验收节点"];
  return questions.some((question) => demoPhrases.some((phrase) => question.stem.includes(phrase)));
}

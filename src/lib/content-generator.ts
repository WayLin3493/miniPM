import OpenAI from "openai";
import { aiCostLogs, jobLogs, todayFeed } from "./demo-data";
import { chinaDateString } from "./date";
import { fetchCandidates } from "./fetch-candidates";
import { persistDailyFeed } from "./supabase-admin";
import type { DailyFeed } from "./types";

type GenerateResult = {
  feed: DailyFeed;
  logs: typeof jobLogs;
  costs: typeof aiCostLogs;
  mode: "demo" | "ai";
  persisted?: boolean;
  persistReason?: string;
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
  const aiConfig = getAiConfig();

  if (!aiConfig.apiKey) {
    const demoFeed = { ...todayFeed, date: feedDate };
    const persistence = await persistDailyFeed(demoFeed);
    return {
      feed: demoFeed,
      logs: jobLogs,
      costs: aiCostLogs,
      mode: "demo",
      persisted: persistence.persisted,
      persistReason: process.env.SUPABASE_SERVICE_ROLE_KEY ? persistence.reason : "missing_ai_config"
    };
  }

  const candidates = await fetchCandidates();
  const client = new OpenAI({ apiKey: aiConfig.apiKey, baseURL: aiConfig.baseURL });
  const response = await client.chat.completions.create({
    model: aiConfig.model,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "你是 MiniPM 的每日学习内容生成器。必须输出 JSON，不要输出 Markdown。不要声称 PMP 题是官方真题。内容轻松、短句、适合美术 PM。"
      },
      {
        role: "user",
        content: JSON.stringify({
          task: "生成今天的 MiniPM 学习包",
          requirements: [
            "5 道 PMP 练习题，单选和多选混合",
            "1 条美术知识、1 条 AI 前沿、1 条 GitHub 项目、1 条 AI 工具",
            "每条阅读内容要有 title、summary、application、body 三段、sourceUrl、tags",
            "PMP 题必须有 stem、type、options、answer、explanation、knowledgeArea",
            "题目必须标注为非官方 PMP 真题，仅作练习",
            "语言轻松，不要考试压迫感"
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
                  { id: "B", text: "string" }
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
    temperature: 0.7
  });

  const aiFeed = mergeAiResponse(response.choices[0]?.message.content || "");
  const persistence = await persistDailyFeed(aiFeed);

  return {
    feed: aiFeed,
    logs: [
      ...jobLogs,
      {
        id: `job-${Date.now()}`,
        status: "success",
        name: `${aiConfig.provider} 内容生成`,
        detail: `已调用真实 AI 生成流程，候选内容 ${candidates.length} 条，持久化：${persistence.persisted ? "成功" : persistence.reason}`,
        createdAt: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
      }
    ],
    costs: aiCostLogs,
    mode: "ai",
    persisted: persistence.persisted,
    persistReason: persistence.reason
  };
}

function mergeAiResponse(raw: string): DailyFeed {
  try {
    const parsed = JSON.parse(raw) as {
      items?: Array<{
        category?: "art" | "ai" | "github" | "tool";
        title?: string;
        summary?: string;
        application?: string;
        body?: string[];
        sourceUrl?: string;
        tags?: string[];
      }>;
      questions?: Array<{
        type?: "single" | "multiple";
        stem?: string;
        options?: Array<{ id: string; text: string }>;
        answer?: string[];
        explanation?: string;
        knowledgeArea?: string;
      }>;
    };
    const itemByCategory = new Map(todayFeed.items.map((item) => [item.category, item]));
    const items = todayFeed.items.map((fallback) => {
      const generated = parsed.items?.find((item) => item.category === fallback.category);
      return {
        ...fallback,
        title: generated?.title || fallback.title,
        summary: generated?.summary || fallback.summary,
        application: generated?.application || fallback.application,
        body: generated?.body?.length ? generated.body.slice(0, 3) : fallback.body,
        sourceUrl: generated?.sourceUrl || fallback.sourceUrl,
        tags: generated?.tags?.length ? generated.tags.slice(0, 4) : fallback.tags,
        nodeLabel: itemByCategory.get(fallback.category)?.nodeLabel || fallback.nodeLabel
      };
    });
    const questions = todayFeed.questions.map((fallback, index) => {
      const generated = parsed.questions?.[index];
      return {
        ...fallback,
        type: generated?.type || fallback.type,
        stem: generated?.stem || fallback.stem,
        options: generated?.options?.length ? generated.options.slice(0, 4) : fallback.options,
        answer: generated?.answer?.length ? generated.answer : fallback.answer,
        explanation: generated?.explanation || fallback.explanation,
        knowledgeArea: generated?.knowledgeArea || fallback.knowledgeArea
      };
    });
    return { ...todayFeed, date: chinaDateString(), items, questions };
  } catch {
    return { ...todayFeed, date: chinaDateString() };
  }
}

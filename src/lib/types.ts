export type FeedCategory = "art" | "ai" | "github" | "tool";

export type FeedItem = {
  id: string;
  category: FeedCategory;
  route: string;
  title: string;
  nodeLabel: string;
  summary: string;
  application: string;
  body: string[];
  sourceUrl: string;
  minutes: number;
  tags: string[];
  accent: "mint" | "sky" | "lemon" | "coral";
};

export type QuestionType = "single" | "multiple";

export type PmpQuestion = {
  id: string;
  type: QuestionType;
  stem: string;
  options: Array<{ id: string; text: string }>;
  answer: string[];
  explanation: string;
  knowledgeArea: string;
};

export type DailyFeed = {
  date: string;
  title: string;
  estimateMinutes: number;
  items: FeedItem[];
  questions: PmpQuestion[];
};

export type JobLog = {
  id: string;
  status: "success" | "warning" | "failed";
  name: string;
  detail: string;
  createdAt: string;
};

export type AiCostLog = {
  id: string;
  task: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCny: number;
};

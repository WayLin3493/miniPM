export type ContentSource = {
  name: string;
  category: "art" | "ai" | "tool";
  url: string;
  keywords: string[];
};

export const githubQueries = [
  "comfyui stars:>200 pushed:>2026-01-01",
  "\"game art\" stars:>50 pushed:>2026-01-01",
  "\"asset management\" game stars:>50 pushed:>2026-01-01",
  "\"stable diffusion\" workflow stars:>200 pushed:>2026-01-01"
];

export const contentSources: ContentSource[] = [
  {
    name: "Unreal Engine Blog",
    category: "art",
    url: "https://www.unrealengine.com/en-US/blog",
    keywords: ["art", "pipeline", "animation", "asset", "workflow"]
  },
  {
    name: "Unity Blog",
    category: "art",
    url: "https://unity.com/blog",
    keywords: ["art", "artist", "pipeline", "asset", "workflow"]
  },
  {
    name: "OpenAI News",
    category: "ai",
    url: "https://openai.com/news/",
    keywords: ["image", "video", "agent", "multimodal", "model"]
  },
  {
    name: "Hugging Face Blog",
    category: "ai",
    url: "https://huggingface.co/blog",
    keywords: ["image", "video", "diffusion", "multimodal", "tool"]
  },
  {
    name: "Product Hunt AI",
    category: "tool",
    url: "https://www.producthunt.com/topics/artificial-intelligence",
    keywords: ["design", "image", "workflow", "automation", "creative"]
  }
];

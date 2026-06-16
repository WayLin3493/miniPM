import { contentSources, githubQueries } from "./source-config";

export type CandidateContent = {
  category: "art" | "ai" | "github" | "tool";
  title: string;
  excerpt: string;
  sourceUrl: string;
  sourceName: string;
  score: number;
};

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreText(text: string, keywords: string[]) {
  const lower = text.toLowerCase();
  return keywords.reduce((score, keyword) => score + (lower.includes(keyword.toLowerCase()) ? 10 : 0), 0);
}

export async function fetchGithubCandidates(): Promise<CandidateContent[]> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  const results: CandidateContent[] = [];
  for (const query of githubQueries.slice(0, 2)) {
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=3`;
    try {
      const response = await fetch(url, { headers, next: { revalidate: 3600 } });
      if (!response.ok) continue;
      const data = (await response.json()) as {
        items?: Array<{ full_name: string; html_url: string; description: string | null; stargazers_count: number; language: string | null }>;
      };
      for (const repo of data.items || []) {
        results.push({
          category: "github",
          title: repo.full_name,
          excerpt: `${repo.description || "暂无简介"}。语言：${repo.language || "未知"}，Stars：${repo.stargazers_count}`,
          sourceUrl: repo.html_url,
          sourceName: "GitHub",
          score: repo.stargazers_count
        });
      }
    } catch {
      continue;
    }
  }
  return results;
}

export async function fetchWebCandidates(): Promise<CandidateContent[]> {
  const results: CandidateContent[] = [];
  for (const source of contentSources) {
    try {
      const response = await fetch(source.url, {
        headers: {
          "User-Agent": "MiniPM/0.1"
        },
        next: { revalidate: 3600 }
      });
      if (!response.ok) continue;
      const text = stripHtml((await response.text()).slice(0, 120000));
      const score = scoreText(text, source.keywords);
      if (score <= 0) continue;
      results.push({
        category: source.category,
        title: source.name,
        excerpt: text.slice(0, 1800),
        sourceUrl: source.url,
        sourceName: source.name,
        score
      });
    } catch {
      continue;
    }
  }
  return results;
}

export async function fetchCandidates() {
  const [github, web] = await Promise.all([fetchGithubCandidates(), fetchWebCandidates()]);
  return [...github, ...web]
    .sort((a, b) => b.score - a.score)
    .filter((candidate, index, list) => list.findIndex((item) => item.sourceUrl === candidate.sourceUrl) === index)
    .slice(0, 16);
}

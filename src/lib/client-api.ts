"use client";

import { todayFeed } from "./demo-data";
import { loadProgress, saveProgress, type ProgressState } from "./progress";
import type { DailyFeed } from "./types";

const emptyProgress: ProgressState = {
  readIds: [],
  answeredIds: [],
  wrongIds: [],
  checkins: []
};

export async function fetchTodayFeed(): Promise<DailyFeed> {
  try {
    const response = await fetch(`/api/today?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return todayFeed;
    const data = (await response.json()) as { feed?: DailyFeed };
    return data.feed || todayFeed;
  } catch {
    return todayFeed;
  }
}

export async function fetchProgress(date: string): Promise<ProgressState> {
  const local = loadProgress();
  try {
    const response = await fetch(`/api/progress?date=${encodeURIComponent(date)}`, { cache: "no-store" });
    if (!response.ok) return local;
    const data = (await response.json()) as { mode?: string; progress?: ProgressState };
    if (data.mode === "supabase" && data.progress) {
      const merged = mergeProgress(local, data.progress);
      saveProgress(merged);
      return merged;
    }
    return local;
  } catch {
    return local;
  }
}

export async function postProgress(payload: {
  action: "read" | "answer" | "checkin";
  date: string;
  feedItemId?: string;
  questionId?: string;
  isCorrect?: boolean;
}) {
  try {
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch {
    // Local mode remains authoritative when the server is unavailable.
  }
}

function mergeProgress(a: ProgressState, b: ProgressState): ProgressState {
  return {
    readIds: unique([...a.readIds, ...b.readIds]),
    answeredIds: unique([...a.answeredIds, ...b.answeredIds]),
    wrongIds: unique([...a.wrongIds, ...b.wrongIds]),
    checkins: unique([...a.checkins, ...b.checkins])
  };
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}

export { emptyProgress };

"use client";

export type ProgressState = {
  readIds: string[];
  answeredIds: string[];
  wrongIds: string[];
  checkins: string[];
};

const key = "minipm-progress";

const fallback: ProgressState = {
  readIds: [],
  answeredIds: [],
  wrongIds: [],
  checkins: []
};

export function loadProgress(): ProgressState {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

export function saveProgress(next: ProgressState) {
  window.localStorage.setItem(key, JSON.stringify(next));
}

export function markRead(id: string) {
  const state = loadProgress();
  if (!state.readIds.includes(id)) state.readIds.push(id);
  saveProgress(state);
  return state;
}

export function markAnswered(id: string, wrong: boolean) {
  const state = loadProgress();
  if (!state.answeredIds.includes(id)) state.answeredIds.push(id);
  if (wrong && !state.wrongIds.includes(id)) state.wrongIds.push(id);
  saveProgress(state);
  return state;
}

export function markCheckin(date: string) {
  const state = loadProgress();
  if (!state.checkins.includes(date)) state.checkins.push(date);
  saveProgress(state);
  return state;
}

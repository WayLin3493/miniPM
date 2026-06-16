"use client";

import { ArrowRight, Check, Clock3, Flame, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { todayFeed } from "@/lib/demo-data";
import { fetchProgress, fetchTodayFeed } from "@/lib/client-api";
import type { DailyFeed } from "@/lib/types";

function iconFor(category: string) {
  if (category === "art") return "B";
  if (category === "ai") return "A";
  if (category === "github") return "G";
  return "M";
}

export default function TodayPage() {
  const [feed, setFeed] = useState<DailyFeed>(todayFeed);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [answeredIds, setAnsweredIds] = useState<string[]>([]);
  const [checkedIn, setCheckedIn] = useState(false);

  useEffect(() => {
    async function load() {
      const nextFeed = await fetchTodayFeed();
      const state = await fetchProgress(nextFeed.date);
      setFeed(nextFeed);
      setReadIds(state.readIds);
      setAnsweredIds(state.answeredIds);
      setCheckedIn(state.checkins.includes(nextFeed.date));
    }
    void load();
  }, []);

  const pathItems = useMemo(
    () => [
      { id: "quiz", label: "PMP挑战", href: "/app/quiz", icon: "?" },
      ...feed.items.map((item) => ({ id: item.id, label: item.nodeLabel, href: `/app/read/${item.id}`, icon: iconFor(item.category) }))
    ],
    [feed.items]
  );

  const completed = useMemo(() => {
    const quizDone = feed.questions.every((question) => answeredIds.includes(question.id));
    return feed.items.filter((item) => readIds.includes(item.id)).length + (quizDone ? 1 : 0);
  }, [answeredIds, feed.items, feed.questions, readIds]);

  return (
    <main className="px-5 py-6">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-black text-leaf-600">MiniPM</p>
          <h1 className="text-[clamp(1.75rem,8vw,2rem)] font-black tracking-tight text-leaf-950">今日小冒险</h1>
        </div>
        <div className="shrink-0 rounded-3xl bg-white px-3 py-2 text-xs font-black text-leaf-700 shadow-soft">
          <Flame className="mr-1 inline h-4 w-4 fill-lemon text-lemon" />
          连续3天
        </div>
      </header>

      <section className="relative mt-6 overflow-hidden rounded-[2rem] bg-leaf-500 p-5 text-white shadow-soft">
        <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/20" />
        <div className="absolute -bottom-12 left-10 h-28 w-28 rounded-full bg-lemon/35" />
        <div className="relative">
          <div className="flex items-center gap-2 text-sm font-bold text-white/80">
            <Clock3 className="h-4 w-4" />
            约 {feed.estimateMinutes} 分钟
          </div>
          <h2 className="mt-3 text-2xl font-black">10分钟能量补给</h2>
          <p className="mt-2 text-sm font-semibold text-white/86">已完成 {completed}/5，今天也轻松前进一点。</p>
          <div className="mt-5 h-4 rounded-full bg-white/28 p-1">
            <div className="h-full rounded-full bg-lemon" style={{ width: `${Math.min(100, completed * 20)}%` }} />
          </div>
        </div>
      </section>

      <section className="mt-7">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black text-leaf-950">学习小岛路线</h2>
          {checkedIn ? <span className="rounded-full bg-leaf-100 px-3 py-1 text-xs font-black text-leaf-700">已打卡</span> : null}
        </div>
        <div className="relative space-y-4">
          <div className="absolute left-8 top-8 h-[calc(100%-4rem)] w-2 rounded-full bg-leaf-100" />
          {pathItems.map((item, index) => {
            const done = item.id === "quiz" ? feed.questions.every((question) => answeredIds.includes(question.id)) : readIds.includes(item.id);
            return (
              <Link
                className="island-card relative flex items-center gap-4 rounded-[1.7rem] p-4 pressable"
                href={item.href}
                key={item.id}
              >
                <div className={`z-10 flex h-14 w-14 items-center justify-center rounded-3xl text-xl font-black ${done ? "bg-leaf-500 text-white" : "bg-white text-leaf-500"} shadow-button`}>
                  {done ? <Check className="h-7 w-7" /> : item.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-slate-400">第 {index + 1} 站</p>
                  <h3 className="text-lg font-black text-slate-900">{item.label}</h3>
                </div>
                <ArrowRight className="h-5 w-5 text-leaf-500" />
              </Link>
            );
          })}
        </div>
      </section>

      <Link
        href={completed >= 5 ? "/app/checkin" : pathItems.find((item) => item.id === "quiz" && !feed.questions.every((question) => answeredIds.includes(question.id)))?.href ?? pathItems.find((item) => item.id !== "quiz" && !readIds.includes(item.id))?.href ?? "/app/checkin"}
        className="pressable mt-6 flex items-center justify-center gap-2 rounded-3xl bg-leaf-500 px-5 py-4 text-center font-black text-white shadow-button"
      >
        <Sparkles className="h-5 w-5" />
        {completed >= 5 ? "领取今日打卡" : "继续出发"}
      </Link>
    </main>
  );
}

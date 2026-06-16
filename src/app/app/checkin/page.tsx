"use client";

import { CheckCircle2, Gift, Home } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Confetti } from "@/components/confetti";
import { todayFeed } from "@/lib/demo-data";
import { fetchProgress, fetchTodayFeed, postProgress } from "@/lib/client-api";
import { loadProgress, markCheckin } from "@/lib/progress";
import type { DailyFeed } from "@/lib/types";

export default function CheckinPage() {
  const [feed, setFeed] = useState<DailyFeed>(todayFeed);
  const [canCheckin, setCanCheckin] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    async function load() {
      const nextFeed = await fetchTodayFeed();
      const state = await fetchProgress(nextFeed.date);
      setFeed(nextFeed);
      const readDone = nextFeed.items.every((item) => state.readIds.includes(item.id));
      const quizDone = nextFeed.questions.every((question) => state.answeredIds.includes(question.id));
      const already = state.checkins.includes(nextFeed.date);
      setCanCheckin(readDone && quizDone);
      setChecked(already);
      if (readDone && quizDone && !already) {
        markCheckin(nextFeed.date);
        await postProgress({ action: "checkin", date: nextFeed.date });
        setChecked(true);
      }
    }
    void load();
  }, []);

  useEffect(() => {
    const state = loadProgress();
    const readDone = feed.items.every((item) => state.readIds.includes(item.id));
    const quizDone = feed.questions.every((question) => state.answeredIds.includes(question.id));
    const already = state.checkins.includes(feed.date);
    setCanCheckin(readDone && quizDone);
    setChecked(already);
  }, [feed]);

  const title = useMemo(() => {
    if (checked) return "今日打卡完成";
    if (canCheckin) return "正在记录打卡";
    return "还差一点点";
  }, [canCheckin, checked]);

  return (
    <main className="flex min-h-[calc(100dvh-7rem)] items-center px-5 py-6">
      <section className="relative w-full overflow-hidden rounded-[2.2rem] bg-white p-6 text-center shadow-soft">
        <Confetti />
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-leaf-500 text-white shadow-button">
          {checked ? <CheckCircle2 className="h-12 w-12" /> : <Gift className="h-12 w-12" />}
        </div>
        <h1 className="relative mt-6 text-3xl font-black text-leaf-950">{title}</h1>
        <p className="relative mt-3 text-lg font-black text-leaf-600">今天的成长能量 +1</p>
        <p className="relative mt-2 text-sm leading-6 text-slate-500">
          {checked ? "完成后当天后续提醒会自动停止。" : "读完所有内容并完成 PMP 挑战后，就能领取今日成长能量。"}
        </p>
        <Link className="relative mt-7 flex items-center justify-center gap-2 rounded-3xl bg-leaf-500 px-5 py-4 font-black text-white shadow-button" href="/app/today">
          <Home className="h-5 w-5" />
          回到今日小岛
        </Link>
      </section>
    </main>
  );
}

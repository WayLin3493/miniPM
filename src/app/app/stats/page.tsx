"use client";

import { CalendarCheck2, Flame } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchProgress, fetchTodayFeed } from "@/lib/client-api";
import { continuousCheckins } from "@/lib/stats";

export default function StatsPage() {
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    async function load() {
      const feed = await fetchTodayFeed();
      const state = await fetchProgress(feed.date);
      setTotal(state.checkins.length);
      setStreak(continuousCheckins(state.checkins, feed.date));
    }
    void load();
  }, []);

  return (
    <main className="px-5 py-6">
      <header>
        <p className="text-sm font-black text-leaf-600">成长记录</p>
        <h1 className="mt-1 text-3xl font-black text-leaf-950">学习统计</h1>
      </header>

      <section className="mt-6 grid gap-4">
        <article className="rounded-[2rem] bg-leaf-500 p-6 text-white shadow-soft">
          <CalendarCheck2 className="h-9 w-9" />
          <p className="mt-5 text-sm font-bold text-white/80">打卡天数</p>
          <h2 className="mt-1 text-5xl font-black">{total}</h2>
        </article>
        <article className="rounded-[2rem] bg-white p-6 shadow-soft">
          <Flame className="h-9 w-9 fill-lemon text-lemon" />
          <p className="mt-5 text-sm font-bold text-slate-500">连续打卡</p>
          <h2 className="mt-1 text-5xl font-black text-leaf-700">{streak}</h2>
        </article>
      </section>

      <section className="mt-5 rounded-[2rem] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-slate-950">成长路线</h2>
        <div className="mt-4 space-y-3">
          {["PMP基础", "美术管线", "AI工具", "GitHub工具"].map((route, index) => (
            <div className="flex items-center gap-3" key={route}>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-leaf-400" style={{ width: `${30 + index * 12}%` }} />
              </div>
              <span className="w-20 text-right text-sm font-black text-slate-600">{route}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

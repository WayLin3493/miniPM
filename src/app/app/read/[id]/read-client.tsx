"use client";

import { ArrowUpRight, Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { todayFeed } from "@/lib/demo-data";
import { fetchTodayFeed, postProgress } from "@/lib/client-api";
import { markRead } from "@/lib/progress";
import type { DailyFeed } from "@/lib/types";

const accentClasses = {
  mint: "from-leaf-200 to-skysoft",
  sky: "from-sky-200 to-white",
  lemon: "from-lemon to-white",
  coral: "from-orange-100 to-white"
};

function sourceHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "原始来源";
  }
}

export function ReadClient({ id }: { id: string }) {
  const [feed, setFeed] = useState<DailyFeed>(todayFeed);
  const item = feed.items.find((entry) => entry.id === id);
  const [done, setDone] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function load() {
      setFeed(await fetchTodayFeed());
    }
    void load();
  }, []);

  useEffect(() => {
    if (!item || !sentinelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          markRead(item.id);
          void postProgress({
            action: "read",
            date: feed.date,
            feedItemId: item.id
          });
          setDone(true);
        }
      },
      { threshold: 0.8 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [feed.date, item]);

  if (!item) {
    return (
      <main className="px-5 py-6">
        <div className="rounded-[2rem] bg-white p-6 text-center shadow-soft">
          <h1 className="text-2xl font-black text-slate-950">没有找到这条内容</h1>
          <Link className="mt-5 inline-flex rounded-3xl bg-leaf-500 px-5 py-3 font-black text-white" href="/app/today">
            返回今日小岛
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="px-5 py-6">
      <header>
        <p className="text-sm font-black text-leaf-600">{item.route}</p>
        <h1 className="mt-1 text-3xl font-black text-leaf-950">{item.nodeLabel}</h1>
      </header>

      <section className={`mt-5 overflow-hidden rounded-[2rem] bg-gradient-to-br ${accentClasses[item.accent]} p-5 shadow-soft`}>
        <div className="rounded-[1.5rem] bg-white/65 p-4">
          <div className="mb-8 flex justify-between">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-leaf-700">{item.minutes} 分钟</span>
            <Sparkles className="text-leaf-500" />
          </div>
          <h2 className="max-w-[15rem] text-2xl font-black leading-8 text-slate-950">{item.title}</h2>
          <div className="mt-8 grid grid-cols-3 gap-2">
            {item.tags.map((tag) => (
              <span className="rounded-2xl bg-white/85 px-2 py-2 text-center text-[11px] font-black text-slate-600" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="island-card mt-5 rounded-[2rem] p-5">
        <p className="text-sm font-black text-leaf-600">Mini总结</p>
        <p className="mt-2 text-base font-bold leading-7 text-slate-800">{item.summary}</p>
      </section>

      <section className="mt-5 space-y-4">
        {item.body.map((paragraph, index) => (
          <article className="rounded-[1.6rem] bg-white p-5 leading-7 text-slate-700 shadow-sm" key={paragraph}>
            <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-leaf-100 text-sm font-black text-leaf-700">
              {index + 1}
            </span>
            <p>{paragraph}</p>
          </article>
        ))}
      </section>

      <section className="mt-5 rounded-[2rem] bg-leaf-500 p-5 text-white shadow-soft">
        <p className="text-sm font-black text-white/75">今天可以这样用</p>
        <p className="mt-2 text-lg font-black leading-7">{item.application}</p>
      </section>

      <a className="mt-5 flex items-center justify-between gap-4 rounded-3xl bg-white px-5 py-4 font-bold text-slate-700 shadow-sm" href={item.sourceUrl} rel="noreferrer" target="_blank">
        <span>
          <span className="block">查看原文或资源链接</span>
          <span className="mt-1 block text-xs text-slate-400">{sourceHost(item.sourceUrl)}</span>
        </span>
        <ArrowUpRight className="h-5 w-5 shrink-0 text-leaf-500" />
      </a>

      <div ref={sentinelRef} className="mt-8 rounded-[2rem] border-2 border-dashed border-leaf-200 p-5 text-center">
        {done ? (
          <div className="font-black text-leaf-700">
            <Check className="mx-auto mb-2 h-8 w-8" />
            已完成阅读
          </div>
        ) : (
          <p className="text-sm font-bold text-slate-500">滑到这里即完成本条学习</p>
        )}
      </div>

      <Link className="mt-5 block rounded-3xl bg-leaf-500 px-5 py-4 text-center font-black text-white shadow-button" href="/app/today">
        返回小岛路线
      </Link>
    </main>
  );
}

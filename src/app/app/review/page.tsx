"use client";

import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { todayFeed } from "@/lib/demo-data";
import { fetchProgress, fetchTodayFeed } from "@/lib/client-api";
import type { DailyFeed } from "@/lib/types";

export default function ReviewPage() {
  const [feed, setFeed] = useState<DailyFeed>(todayFeed);
  const [wrongIds, setWrongIds] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      const nextFeed = await fetchTodayFeed();
      const state = await fetchProgress(nextFeed.date);
      setFeed(nextFeed);
      setWrongIds(state.wrongIds);
    }
    void load();
  }, []);

  const questions = feed.questions.filter((question) => wrongIds.includes(question.id));

  return (
    <main className="px-5 py-6">
      <header>
        <p className="text-sm font-black text-leaf-600">遗忘曲线复习</p>
        <h1 className="mt-1 text-3xl font-black text-leaf-950">错题补给站</h1>
      </header>

      <section className="island-card mt-5 rounded-[2rem] p-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-leaf-100 text-leaf-600">
          <RotateCcw />
        </div>
        <h2 className="mt-4 text-xl font-black text-slate-950">今日到期复习</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          第一版采用第 1 / 3 / 7 / 14 天复习间隔。当前 Demo 会显示你本地答错过的题。
        </p>
      </section>

      <section className="mt-5 space-y-3">
        {questions.length ? (
          questions.map((question) => (
            <article className="rounded-[1.6rem] bg-white p-5 shadow-sm" key={question.id}>
              <p className="text-xs font-black text-leaf-600">{question.knowledgeArea}</p>
              <h3 className="mt-2 font-black leading-7 text-slate-900">{question.stem}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-500">{question.explanation}</p>
            </article>
          ))
        ) : (
          <div className="rounded-[1.6rem] bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-black text-slate-900">暂时没有到期错题</p>
            <p className="mt-2 text-sm text-slate-500">完成 PMP 挑战后，这里会自动出现需要复习的题。</p>
            <Link className="mt-5 inline-flex rounded-3xl bg-leaf-500 px-5 py-3 font-black text-white shadow-button" href="/app/quiz">
              去挑战
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

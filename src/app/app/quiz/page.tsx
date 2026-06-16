"use client";

import { CheckCircle2, ChevronRight, Info, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { todayFeed } from "@/lib/demo-data";
import { fetchTodayFeed, postProgress } from "@/lib/client-api";
import { markAnswered } from "@/lib/progress";
import type { DailyFeed } from "@/lib/types";

function sameAnswer(a: string[], b: string[]) {
  return a.slice().sort().join(",") === b.slice().sort().join(",");
}

export default function QuizPage() {
  const [feed, setFeed] = useState<DailyFeed>(todayFeed);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const question = feed.questions[index] || todayFeed.questions[0];
  const correct = useMemo(() => sameAnswer(selected, question.answer), [question.answer, selected]);
  const isLast = index === feed.questions.length - 1;

  useEffect(() => {
    async function load() {
      setFeed(await fetchTodayFeed());
    }
    void load();
  }, []);

  useEffect(() => {
    setSelected([]);
    setSubmitted(false);
  }, [index]);

  function toggle(optionId: string) {
    if (submitted) return;
    if (question.type === "single") {
      setSelected([optionId]);
      return;
    }
    setSelected((current) => (current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId]));
  }

  function submit() {
    if (!selected.length) return;
    const isCorrect = sameAnswer(selected, question.answer);
    setSubmitted(true);
    markAnswered(question.id, !isCorrect);
    void postProgress({
      action: "answer",
      date: feed.date,
      questionId: question.id,
      isCorrect
    });
  }

  return (
    <main className="px-5 py-6">
      <header>
        <p className="text-sm font-black text-leaf-600">非官方 PMP 真题，仅作练习</p>
        <h1 className="mt-1 text-3xl font-black text-leaf-950">PMP挑战</h1>
      </header>

      <section className="mt-5 rounded-[2rem] bg-white p-4 shadow-soft">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-leaf-100 px-3 py-1 text-xs font-black text-leaf-700">
            {question.type === "multiple" ? "多选" : "单选"}
          </span>
          <span className="text-sm font-black text-slate-400">
            {index + 1}/{feed.questions.length}
          </span>
        </div>
        <h2 className="mt-5 text-xl font-black leading-8 text-slate-950">{question.stem}</h2>
        <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">
          <Info className="h-3.5 w-3.5" />
          {question.knowledgeArea}
        </p>
      </section>

      <section className="mt-5 space-y-3">
        {question.options.map((option) => {
          const active = selected.includes(option.id);
          const right = submitted && question.answer.includes(option.id);
          const wrong = submitted && active && !question.answer.includes(option.id);
          return (
            <button
              className={clsx(
                "w-full rounded-[1.5rem] border-2 bg-white px-4 py-4 text-left font-bold leading-6 shadow-sm transition",
                active && !submitted && "border-leaf-400 bg-leaf-50",
                !active && !submitted && "border-transparent",
                right && "border-leaf-500 bg-leaf-50",
                wrong && "border-coral bg-red-50"
              )}
              key={option.id}
              onClick={() => toggle(option.id)}
            >
              <span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-black text-slate-600">
                {option.id}
              </span>
              {option.text}
            </button>
          );
        })}
      </section>

      {submitted ? (
        <section className={clsx("mt-5 rounded-[2rem] p-5 shadow-soft", correct ? "bg-leaf-500 text-white" : "bg-white text-slate-900")}>
          <div className="flex items-center gap-2 text-xl font-black">
            {correct ? <CheckCircle2 /> : <XCircle className="text-coral" />}
            {correct ? "答对啦！" : "差一点，再看一眼"}
          </div>
          <div className={clsx("mt-4 rounded-[1.5rem] p-4", correct ? "bg-white/18" : "bg-leaf-50")}>
            <p className="text-sm font-black">PM小贴士</p>
            <p className="mt-2 text-sm leading-6">{question.explanation}</p>
          </div>
        </section>
      ) : null}

      <div className="mt-6">
        {!submitted ? (
          <button
            className="pressable w-full rounded-3xl bg-leaf-500 px-5 py-4 font-black text-white shadow-button disabled:bg-slate-300 disabled:shadow-none"
            disabled={!selected.length}
            onClick={submit}
          >
            提交答案
          </button>
        ) : isLast ? (
          <Link className="pressable flex w-full items-center justify-center gap-2 rounded-3xl bg-leaf-500 px-5 py-4 font-black text-white shadow-button" href="/app/today">
            完成挑战
            <ChevronRight className="h-5 w-5" />
          </Link>
        ) : (
          <button
            className="pressable flex w-full items-center justify-center gap-2 rounded-3xl bg-leaf-500 px-5 py-4 font-black text-white shadow-button"
            onClick={() => setIndex((value) => value + 1)}
          >
            下一题
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </main>
  );
}

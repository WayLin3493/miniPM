import { Activity, Coins, DatabaseZap, FileText, RadioTower, Users } from "lucide-react";
import Link from "next/link";
import { aiCostLogs, jobLogs, todayFeed } from "@/lib/demo-data";

const totalCost = aiCostLogs.reduce((sum, entry) => sum + entry.estimatedCny, 0);

export default function AdminPage() {
  return (
    <main className="min-h-dvh px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black text-leaf-600">MiniPM Admin</p>
            <h1 className="text-3xl font-black text-leaf-950">后台总览</h1>
          </div>
          <Link className="rounded-3xl bg-leaf-500 px-5 py-3 font-black text-white shadow-button" href="/app/today">
            打开手机端
          </Link>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-4">
          <Metric icon={<FileText />} label="今日内容" value={`${todayFeed.items.length + 1} 组`} />
          <Metric icon={<Activity />} label="PMP 题目" value={`${todayFeed.questions.length} 道`} />
          <Metric icon={<Coins />} label="今日 AI 成本" value={`¥${totalCost.toFixed(2)}`} />
          <Metric icon={<Users />} label="用户规模" value="个人自用" />
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-[2rem] bg-white p-6 shadow-soft">
            <div className="flex items-center gap-2">
              <RadioTower className="text-leaf-600" />
              <h2 className="text-xl font-black text-slate-950">自动发布与抓取状态</h2>
            </div>
            <div className="mt-5 space-y-3">
              {jobLogs.map((log) => (
                <article className="rounded-2xl border border-slate-100 p-4" key={log.id}>
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-black text-slate-900">{log.name}</h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${log.status === "success" ? "bg-leaf-100 text-leaf-700" : "bg-amber-100 text-amber-700"}`}>
                      {log.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{log.detail}</p>
                  <p className="mt-2 text-xs font-bold text-slate-400">{log.createdAt}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-soft">
            <div className="flex items-center gap-2">
              <DatabaseZap className="text-leaf-600" />
              <h2 className="text-xl font-black text-slate-950">AI 成本</h2>
            </div>
            <div className="mt-5 space-y-3">
              {aiCostLogs.map((entry) => (
                <article className="rounded-2xl bg-slate-50 p-4" key={entry.id}>
                  <h3 className="font-black text-slate-900">{entry.task}</h3>
                  <p className="mt-1 text-sm text-slate-500">{entry.model}</p>
                  <div className="mt-3 flex justify-between text-sm font-bold text-slate-600">
                    <span>{entry.inputTokens + entry.outputTokens} tokens</span>
                    <span>¥{entry.estimatedCny.toFixed(2)}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-soft">
          <h2 className="text-xl font-black text-slate-950">今日内容</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {todayFeed.items.map((item) => (
              <article className="rounded-2xl border border-slate-100 p-4" key={item.id}>
                <p className="text-xs font-black text-leaf-600">{item.nodeLabel}</p>
                <h3 className="mt-1 font-black text-slate-900">{item.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{item.summary}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <article className="rounded-[2rem] bg-white p-5 shadow-soft">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-leaf-100 text-leaf-600">{icon}</div>
      <p className="mt-4 text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
    </article>
  );
}

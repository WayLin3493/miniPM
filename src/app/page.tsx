import { ArrowRight, BookOpenCheck, Brain, Check, Clock3, Download, Flame, FolderHeart, Github, Palette, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const featureCards = [
  {
    title: "每日推送",
    body: ["精选主题每日送达", "持续积累不间断"],
    icon: Check,
    iconClass: "bg-leaf-100 text-leaf-600"
  },
  {
    title: "AI 摘要",
    body: ["AI 助你提炼重点", "快速掌握核心要点"],
    icon: Brain,
    iconClass: "bg-sky-100 text-sky-600"
  },
  {
    title: "PMP 练习",
    body: ["高频考点随时练", "掌握即战力"],
    icon: BookOpenCheck,
    iconClass: "bg-amber-100 text-amber-500"
  },
  {
    title: "收藏复盘",
    body: ["重点内容随时回顾", "长期记忆更牢固"],
    icon: FolderHeart,
    iconClass: "bg-violet-100 text-violet-500"
  }
];

const feedCards = [
  { title: "PMP题库", text: "单选、多选和错题复习", icon: BookOpenCheck },
  { title: "美术管线", text: "资产流程、验收和外包协作", icon: Palette },
  { title: "AI前沿", text: "技术趋势到工作场景应用", icon: Sparkles },
  { title: "GitHub项目", text: "值得收藏的开源工具", icon: Github }
];

const appPathItems = [
  { label: "PMP挑战", icon: "?", done: false },
  { label: "美术管线知识", icon: "B", done: false },
  { label: "AI前沿知识", icon: "A", done: false }
];

export default function HomePage() {
  return (
    <main className="min-h-dvh overflow-hidden">
      <section className="relative px-5 pb-10 pt-5 sm:px-8 lg:px-10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_10%,rgba(255,231,115,0.48),transparent_20rem),radial-gradient(circle_at_82%_4%,rgba(123,234,171,0.42),transparent_24rem),linear-gradient(180deg,#e7fbff_0%,#f3fff7_58%,#ffffff_100%)]" />
        <nav className="mx-auto flex max-w-[1180px] items-center justify-between gap-4">
          <Link className="flex items-center gap-3" href="/">
            <Image className="rounded-2xl shadow-button" src="/icon-192.png" alt="MiniPM" width={44} height={44} priority />
            <span className="text-xl font-black text-leaf-700">MiniPM</span>
          </Link>
          <div className="hidden items-center gap-7 text-sm font-bold text-leaf-900/70 md:flex">
            <a href="#intro">产品介绍</a>
            <a href="#features">功能</a>
            <a href="#install">安装</a>
          </div>
          <Link className="pressable rounded-2xl bg-white px-4 py-2 text-sm font-black text-leaf-700 shadow-soft" href="/app/today">
            打开 App
          </Link>
        </nav>

        <div className="mx-auto grid max-w-[1180px] items-center gap-10 pb-8 pt-12 lg:min-h-[calc(100dvh-5rem)] lg:grid-cols-[1fr_0.95fr] lg:pt-14">
          <div id="intro" className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-leaf-700 shadow-soft">
              <Sparkles className="h-4 w-4 text-lemon" />
              为美术PM设计
            </div>
            <h1 className="mt-6 text-5xl font-black leading-[1.08] text-leaf-950 sm:text-6xl">
              美术PM的
              <span className="block text-leaf-600">每日成长小助手</span>
            </h1>
            <p className="mt-6 max-w-[34rem] text-lg font-semibold leading-8 text-slate-600">
              每天 10 分钟，把 PMP、美术管线、AI 前沿和工具项目变成可执行的工作能力。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {["为美术PM设计", "轻量每日学习", "工作场景应用"].map((chip) => (
                <span className="rounded-full bg-white/82 px-4 py-2 text-sm font-black text-leaf-800 shadow-soft" key={chip}>
                  {chip}
                </span>
              ))}
            </div>
            <div id="install" className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                className="pressable inline-flex items-center justify-center gap-2 rounded-3xl bg-leaf-500 px-6 py-4 text-center text-base font-black text-white shadow-button"
                href="/downloads/MiniPM-android-latest.apk"
                download
              >
                <Download className="h-5 w-5" />
                下载 Android APK
              </a>
              <Link
                className="pressable inline-flex items-center justify-center gap-2 rounded-3xl bg-white px-6 py-4 text-center text-base font-black text-leaf-700 shadow-soft"
                href="/app/today"
              >
                打开网页版 App
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <p className="mt-4 text-sm font-bold leading-6 text-slate-500">安卓手机可下载安装包；iPhone 可用浏览器添加到主屏幕。</p>

            <div id="features" className="mt-9 grid gap-4 sm:grid-cols-2">
              {featureCards.map((card) => {
                const Icon = card.icon;
                return (
                  <article className="flex min-h-[8.25rem] items-center gap-4 rounded-[1.4rem] bg-white/90 p-5 shadow-soft" key={card.title}>
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${card.iconClass}`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base font-black leading-6 text-slate-950">{card.title}</h2>
                      <p className="mt-1 text-sm font-bold leading-6 text-slate-500">
                        {card.body[0]}
                        <br />
                        {card.body[1]}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[22rem] lg:mr-8">
            <div className="relative mx-auto aspect-[9/19] w-full overflow-hidden rounded-[3rem] bg-slate-950 p-[0.7rem] shadow-[0_28px_80px_rgba(15,95,53,0.24)]">
              <div className="absolute left-1/2 top-[1.35rem] z-20 h-7 w-28 -translate-x-1/2 rounded-full bg-slate-950 shadow-[inset_0_-1px_0_rgba(255,255,255,0.12)]" />
              <div className="h-full overflow-hidden rounded-[2.35rem] bg-gradient-to-b from-skysoft to-white">
                <div className="px-4 pb-4 pt-12">
                  <header className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-black text-leaf-600">MiniPM</p>
                      <h2 className="mt-1 text-[1.7rem] font-black leading-8 text-leaf-950">今日小冒险</h2>
                    </div>
                    <div className="shrink-0 rounded-full bg-white px-3 py-2 text-xs font-black leading-4 text-leaf-700 shadow-soft">
                      <Flame className="mr-1 inline h-4 w-4 fill-lemon text-lemon" />
                      连续3天
                    </div>
                  </header>

                  <section className="relative mt-5 overflow-hidden rounded-[1.65rem] bg-leaf-500 p-4 text-white shadow-soft">
                    <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-white/22" />
                    <div className="absolute -bottom-12 left-10 h-24 w-24 rounded-full bg-lemon/35" />
                    <div className="relative">
                      <div className="flex items-center gap-2 text-sm font-bold text-white/82">
                        <Clock3 className="h-4 w-4" />
                        约 10 分钟
                      </div>
                      <p className="mt-3 text-[1.55rem] font-black leading-8">10分钟能量补给</p>
                      <p className="mt-2 text-sm font-semibold leading-6 text-white/86">已完成 0/5，今天也轻松前进一点。</p>
                    </div>
                  </section>

                  <section className="mt-5 space-y-3">
                    {appPathItems.map((item, index) => (
                      <div className="island-card flex items-center gap-3 rounded-[1.3rem] p-3" key={item.label}>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-base font-black text-leaf-500 shadow-button">
                          {item.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[0.7rem] font-black text-slate-400">第 {index + 1} 站</p>
                          <p className="truncate text-sm font-black text-slate-950">{item.label}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-leaf-500" />
                      </div>
                    ))}
                  </section>
                </div>
                <nav className="grid grid-cols-4 gap-2 bg-white/86 px-5 pb-5 pt-3 text-center text-xs font-black text-slate-400">
                  <span className="rounded-2xl bg-leaf-100 px-2 py-2 text-leaf-700">今日</span>
                  <span className="px-2 py-2">挑战</span>
                  <span className="px-2 py-2">复习</span>
                  <span className="px-2 py-2">统计</span>
                </nav>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.4rem] bg-white/90 p-4 shadow-soft">
                <p className="text-xs font-black text-slate-400">应用内能力</p>
                <p className="mt-1 text-base font-black text-leaf-800">AI 摘要先提炼重点</p>
              </div>
              <div className="rounded-[1.4rem] bg-white/90 p-4 shadow-soft">
                <p className="text-xs font-black text-slate-400">应用内能力</p>
                <p className="mt-1 text-base font-black text-leaf-800">错题复习按节奏回顾</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="-mt-2 px-5 pb-16 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-black text-leaf-600">内容模块</p>
              <h2 className="mt-2 text-3xl font-black text-leaf-950">每天推什么</h2>
            </div>
            <Link className="hidden items-center gap-2 text-sm font-black text-leaf-700 sm:inline-flex" href="/app/today">
              进入今日学习
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {feedCards.map((card) => {
              const Icon = card.icon;
              return (
                <article className="island-card min-h-[9rem] rounded-[1.6rem] p-5" key={card.title}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-leaf-100 text-leaf-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-black text-slate-950">{card.title}</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{card.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

import Link from "next/link";
import { CloudOff, RotateCcw } from "lucide-react";

export default function OfflinePage() {
  return (
    <main className="phone-shell flex min-h-dvh items-center px-6 py-10">
      <section className="w-full text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-white text-leaf-500 shadow-button">
          <CloudOff className="h-10 w-10" />
        </div>
        <p className="mt-6 text-sm font-black text-leaf-600">MiniPM</p>
        <h1 className="mt-2 text-2xl font-black text-leaf-950">暂时离线了</h1>
        <p className="mx-auto mt-3 max-w-[18rem] text-sm font-semibold leading-6 text-slate-500">
          当前网络不可用。已缓存的学习页仍可尝试打开，恢复网络后会继续同步进度。
        </p>
        <Link
          className="pressable mx-auto mt-7 flex w-full max-w-[18rem] items-center justify-center gap-2 rounded-3xl bg-leaf-500 px-5 py-4 text-center font-black text-white shadow-button"
          href="/app/today"
        >
          <RotateCcw className="h-5 w-5" />
          返回今日学习
        </Link>
      </section>
    </main>
  );
}

"use client";

import { Mail, Sparkles } from "lucide-react";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("本地开发模式可直接进入 Demo。配置 Supabase 后将发送邮箱登录链接。");

  async function signIn() {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      window.location.href = "/app/today";
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/app/today` }
    });
    setMessage(error ? error.message : "登录链接已发送，请查收邮箱。");
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-8">
      <section className="island-card w-full max-w-md rounded-[2rem] p-6">
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-leaf-500 text-white shadow-button">
          <Sparkles />
        </div>
        <h1 className="text-3xl font-black text-leaf-900">MiniPM</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">每天 10 分钟，轻松补一点 PM 成长能量。</p>
        <label className="mt-8 block text-sm font-bold text-slate-700">邮箱</label>
        <div className="mt-2 flex items-center gap-2 rounded-3xl border border-leaf-100 bg-white px-4 py-3">
          <Mail className="h-5 w-5 text-leaf-500" />
          <input
            className="min-w-0 flex-1 bg-transparent outline-none"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <button
          className="pressable mt-5 w-full rounded-3xl bg-leaf-500 px-5 py-4 font-black text-white shadow-button"
          onClick={signIn}
        >
          邮箱登录 / 进入 Demo
        </button>
        <p className="mt-4 text-xs leading-5 text-slate-500">{message}</p>
      </section>
    </main>
  );
}

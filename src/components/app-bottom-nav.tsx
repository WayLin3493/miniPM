"use client";

import { BarChart3, BookOpenCheck, Home, RotateCcw } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const tabs = [
  { href: "/app/today", label: "今日", icon: Home },
  { href: "/app/quiz", label: "挑战", icon: BookOpenCheck },
  { href: "/app/review", label: "复习", icon: RotateCcw },
  { href: "/app/stats", label: "统计", icon: BarChart3 }
];

export function AppBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[480px] bg-white/88 px-4 pt-3 shadow-[0_-12px_35px_rgba(15,95,53,0.12)] backdrop-blur">
      <div className="grid grid-cols-4 gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              className={clsx(
                "flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs font-bold",
                active ? "bg-leaf-100 text-leaf-700" : "text-slate-400"
              )}
              href={tab.href}
              key={tab.href}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

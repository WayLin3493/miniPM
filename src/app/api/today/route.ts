import { NextResponse } from "next/server";
import { todayFeed } from "@/lib/demo-data";
import { chinaDateString } from "@/lib/date";
import { loadDailyFeed } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const today = chinaDateString();
  const cloudFeed = await loadDailyFeed(today);
  const demoFeed = { ...todayFeed, date: today };

  return NextResponse.json(
    {
      ok: true,
      mode: cloudFeed ? "supabase" : "demo",
      feed: cloudFeed || demoFeed,
      reminderTimes: ["09:00", "14:00", "21:00"],
      completionRules: {
        readItem: "滑到底即完成",
        quiz: "5 道 PMP 题全部作答",
        checkin: "全部阅读内容完成且 PMP 刷题组完成"
      }
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate"
      }
    }
  );
}

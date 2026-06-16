import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authorization = request.headers.get("authorization");
    if (authorization !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.json({
    ok: true,
    mode: "demo",
    sentAt: new Date().toISOString(),
    channel: ["in-app", "email"],
    rule: "已打卡用户跳过当天后续提醒",
    message: "MiniPM 今日学习还差一点点，继续完成今日小冒险吧。"
  });
}

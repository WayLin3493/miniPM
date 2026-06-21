import { NextRequest, NextResponse } from "next/server";
import { generateDailyFeed } from "@/lib/content-generator";

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authorization = request.headers.get("authorization");
    if (authorization !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const result = await generateDailyFeed();
  const ok = result.mode === "ai" && result.persisted;
  return NextResponse.json(
    {
      ok,
      generatedAt: new Date().toISOString(),
      ...result
    },
    { status: ok ? 200 : 500 }
  );
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authorization = request.headers.get("authorization");
    if (authorization !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const result = await generateDailyFeed();
  const ok = result.mode === "ai" && result.persisted;
  return NextResponse.json(
    {
      ok,
      generatedAt: new Date().toISOString(),
      ...result
    },
    { status: ok ? 200 : 500 }
  );
}

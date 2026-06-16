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
  return NextResponse.json({
    ok: true,
    generatedAt: new Date().toISOString(),
    ...result
  });
}

export async function GET() {
  const result = await generateDailyFeed();
  return NextResponse.json({
    ok: true,
    generatedAt: new Date().toISOString(),
    ...result
  });
}

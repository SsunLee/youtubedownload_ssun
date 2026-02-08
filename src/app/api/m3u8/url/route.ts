import { NextRequest, NextResponse } from "next/server";
import { createJob, startUrlJob } from "@/lib/m3u8-jobs";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const url = String(body?.url ?? "").trim();
  if (!url) {
    return NextResponse.json({ error: "Missing URL" }, { status: 400 });
  }

  const job = createJob();
  startUrlJob(job.id, url);

  return NextResponse.json({ jobId: job.id });
}

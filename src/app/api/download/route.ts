import { NextRequest, NextResponse } from "next/server";
import { createJob, startJob } from "@/lib/download-jobs";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const url = String(body?.url ?? "").trim();
  const format = String(body?.format ?? "Best (Video+Audio)");

  if (!url) {
    return NextResponse.json({ error: "Missing URL" }, { status: 400 });
  }

  const job = createJob(url, format);
  startJob(job);

  return NextResponse.json({ jobId: job.id });
}

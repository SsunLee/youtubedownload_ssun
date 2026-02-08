import { NextRequest, NextResponse } from "next/server";
import { createJob, startFileJob } from "@/lib/m3u8-jobs";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const job = createJob();
  startFileJob(job.id, file);

  return NextResponse.json({ jobId: job.id });
}

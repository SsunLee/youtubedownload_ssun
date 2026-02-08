import { NextRequest, NextResponse } from "next/server";
import { cancelJob, getJob } from "@/lib/download-jobs";

export const runtime = "nodejs";

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const job = getJob(id);
  if (!job) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  cancelJob(id);
  return NextResponse.json({ ok: true });
}

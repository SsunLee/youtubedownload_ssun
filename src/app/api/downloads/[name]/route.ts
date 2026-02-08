import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { Readable } from "stream";

export const runtime = "nodejs";

const BASE_DIR = process.env.VERCEL ? "/tmp" : process.cwd();
const DOWNLOAD_DIR = path.join(BASE_DIR, "downloads");

export async function GET(_req: NextRequest, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  const rawName = name;
  const safeName = path.basename(rawName);
  const filePath = path.join(DOWNLOAD_DIR, safeName);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const stat = fs.statSync(filePath);
  const stream = fs.createReadStream(filePath);
  const asciiFallback = safeName.replace(/[^\x20-\x7E]/g, "_");
  const encodedName = encodeURIComponent(safeName);

  return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": stat.size.toString(),
      "Content-Disposition": `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodedName}`,
    },
  });
}

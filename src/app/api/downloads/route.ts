import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export const runtime = "nodejs";

const DOWNLOAD_DIR = path.join(process.cwd(), "downloads");
const MANIFEST_PATH = path.join(DOWNLOAD_DIR, "manifest.json");

function readManifest(): Array<Record<string, unknown>> {
  try {
    const raw = fs.readFileSync(MANIFEST_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function GET() {
  const entries = readManifest();
  return NextResponse.json(entries);
}

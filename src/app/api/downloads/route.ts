import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { getWritableBaseDir } from "@/lib/storage-path";

export const runtime = "nodejs";

const BASE_DIR = getWritableBaseDir();
const DOWNLOAD_DIR = path.join(BASE_DIR, "downloads");
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

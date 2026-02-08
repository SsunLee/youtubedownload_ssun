import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
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

function writeManifest(entries: Array<Record<string, unknown>>) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(entries, null, 2), "utf8");
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const names = Array.isArray(body?.names) ? body.names.map(String) : [];
  if (names.length === 0) {
    return NextResponse.json({ error: "No items" }, { status: 400 });
  }

  const manifest = readManifest();
  const filtered = manifest.filter((entry) => !names.includes(String(entry?.name)));
  writeManifest(filtered);

  for (const name of names) {
    const safe = path.basename(name);
    const filePath = path.join(DOWNLOAD_DIR, safe);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch {
        // ignore
      }
    }
  }

  return NextResponse.json({ ok: true });
}

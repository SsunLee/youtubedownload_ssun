import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

const DOWNLOAD_DIR = path.join(process.cwd(), "downloads");
const MANIFEST_PATH = path.join(DOWNLOAD_DIR, "manifest.json");

function ensureDirs() {
  if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
  }
  if (!fs.existsSync(MANIFEST_PATH)) {
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify([]), "utf8");
  }
}

function readManifest(): Array<Record<string, unknown>> {
  ensureDirs();
  try {
    const raw = fs.readFileSync(MANIFEST_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeManifest(entries: Array<Record<string, unknown>>) {
  ensureDirs();
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(entries, null, 2), "utf8");
}

function safeName(input: string) {
  return input.replace(/[<>:"/\\|?*]+/g, "_").slice(0, 120);
}

function runFfmpeg(inputUrl: string, outputPath: string) {
  return new Promise<void>((resolve, reject) => {
    const args = [
      "-protocol_whitelist",
      "file,http,https,tcp,tls,crypto",
      "-i",
      inputUrl,
      "-c",
      "copy",
      "-bsf:a",
      "aac_adtstoasc",
      "-y",
      outputPath,
    ];
    const proc = spawn("ffmpeg", args);
    let stderr = "";
    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr || "ffmpeg failed"));
    });
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = String(body?.url ?? "").trim();
    if (!url) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    ensureDirs();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `m3u8_${timestamp}.mp4`;
    const outputPath = path.join(DOWNLOAD_DIR, safeName(fileName));

    await runFfmpeg(url, outputPath);

    const stat = fs.statSync(outputPath);
    const entry = {
      id: null,
      name: path.basename(outputPath),
      size: stat.size,
      createdAt: new Date().toISOString(),
      format: "m3u8",
    };

    const manifest = readManifest();
    manifest.unshift(entry);
    writeManifest(manifest.slice(0, 50));

    return NextResponse.json({ fileName: entry.name, size: stat.size, createdAt: entry.createdAt });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

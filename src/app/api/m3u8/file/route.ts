import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

const BASE_DIR = process.env.VERCEL ? "/tmp" : process.cwd();
const DOWNLOAD_DIR = path.join(BASE_DIR, "downloads");
const TMP_DIR = path.join(DOWNLOAD_DIR, "_tmp");
const MANIFEST_PATH = path.join(DOWNLOAD_DIR, "manifest.json");

function ensureDirs() {
  if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
  }
  if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR, { recursive: true });
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

function runFfmpeg(inputPath: string, outputPath: string) {
  return new Promise<void>((resolve, reject) => {
    const args = [
      "-protocol_whitelist",
      "file,http,https,tcp,tls,crypto",
      "-i",
      inputPath,
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
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    ensureDirs();
    const buffer = Buffer.from(await file.arrayBuffer());
    const tmpName = safeName(file.name || "input.m3u8");
    const tmpPath = path.join(TMP_DIR, `${Date.now()}_${tmpName}`);
    fs.writeFileSync(tmpPath, buffer);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const outputName = safeName(`${path.parse(tmpName).name}_${timestamp}.mp4`);
    const outputPath = path.join(DOWNLOAD_DIR, outputName);

    await runFfmpeg(tmpPath, outputPath);

    fs.rmSync(tmpPath, { force: true });

    const stat = fs.statSync(outputPath);
    const entry = {
      id: null,
      name: outputName,
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

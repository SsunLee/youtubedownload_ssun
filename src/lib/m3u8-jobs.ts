import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { getWritableBaseDir } from "@/lib/storage-path";
import { ensureFfmpeg } from "@/lib/ffmpeg";

export type M3u8Status = "queued" | "running" | "done" | "error";

export type M3u8Job = {
  id: string;
  status: M3u8Status;
  progress: number;
  fileName?: string;
  error?: string;
  startedAt: string;
  updatedAt: string;
};

type JobStore = Map<string, M3u8Job>;
const store = (globalThis as { __m3u8Jobs?: JobStore }).__m3u8Jobs ?? new Map();
(globalThis as { __m3u8Jobs?: JobStore }).__m3u8Jobs = store;

const BASE_DIR = getWritableBaseDir();
const DOWNLOAD_DIR = path.join(BASE_DIR, "downloads");
const TMP_DIR = path.join(DOWNLOAD_DIR, "_tmp");
const MANIFEST_PATH = path.join(DOWNLOAD_DIR, "manifest.json");

function ensureDirs() {
  if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
  if (!fs.existsSync(MANIFEST_PATH)) {
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify([]), "utf8");
  }
}

function readManifest(): Array<Record<string, unknown>> {
  ensureDirs();
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
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

function setJob(id: string, patch: Partial<M3u8Job>) {
  const existing = store.get(id);
  if (!existing) return;
  store.set(id, { ...existing, ...patch, updatedAt: new Date().toISOString() });
}

export function getJob(id: string) {
  return store.get(id) ?? null;
}

export function createJob(): M3u8Job {
  const now = new Date().toISOString();
  const job: M3u8Job = {
    id: crypto.randomUUID(),
    status: "queued",
    progress: 0,
    startedAt: now,
    updatedAt: now,
  };
  store.set(job.id, job);
  return job;
}

function parseTimeToSeconds(value: string): number {
  const match = value.match(/(\d+):(\d+):(\d+\.?\d*)/);
  if (!match) return 0;
  const h = Number(match[1]);
  const m = Number(match[2]);
  const s = Number(match[3]);
  return h * 3600 + m * 60 + s;
}

async function runFfmpeg(inputPath: string, outputPath: string, jobId: string, attempts = 3) {
  const ffmpegPath = process.platform === "win32" ? "ffmpeg" : await ensureFfmpeg();
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

  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await new Promise<void>((resolve, reject) => {
        const proc = spawn(ffmpegPath, args);
        let duration = 0;
        let stderr = "";

        proc.stderr.on("data", (chunk) => {
          const text = chunk.toString();
          stderr += text;

          const durMatch = text.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
          if (durMatch) {
            duration = parseTimeToSeconds(durMatch[0].replace("Duration: ", ""));
          }

          const timeMatch = text.match(/time=(\d+):(\d+):(\d+\.\d+)/);
          if (timeMatch && duration > 0) {
            const current = parseTimeToSeconds(timeMatch[0].replace("time=", ""));
            const progress = Math.min(100, Math.max(0, (current / duration) * 100));
            setJob(jobId, { progress, status: "running" });
          }
        });

        proc.on("close", (code) => {
          if (code === 0) resolve();
          else reject(new Error(stderr || "ffmpeg failed"));
        });
      });
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("ffmpeg failed");
      setJob(jobId, { status: "running", error: `Retry ${attempt}/${attempts}` });
    }
  }
  throw lastError ?? new Error("ffmpeg failed");
}

export async function startUrlJob(jobId: string, url: string) {
  ensureDirs();
  setJob(jobId, { status: "running" });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outputName = safeName(`m3u8_${timestamp}.mp4`);
  const outputPath = path.join(DOWNLOAD_DIR, outputName);

  try {
    await runFfmpeg(url, outputPath, jobId);
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

    setJob(jobId, { status: "done", progress: 100, fileName: outputName });
  } catch (error) {
    setJob(jobId, { status: "error", error: error instanceof Error ? error.message : "Unknown error" });
  }
}

export async function startFileJob(jobId: string, file: File) {
  ensureDirs();
  setJob(jobId, { status: "running" });

  const buffer = Buffer.from(await file.arrayBuffer());
  const tmpName = safeName(file.name || "input.m3u8");
  const tmpPath = path.join(TMP_DIR, `${Date.now()}_${tmpName}`);
  fs.writeFileSync(tmpPath, buffer);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outputName = safeName(`${path.parse(tmpName).name}_${timestamp}.mp4`);
  const outputPath = path.join(DOWNLOAD_DIR, outputName);

  try {
    await runFfmpeg(tmpPath, outputPath, jobId);
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

    setJob(jobId, { status: "done", progress: 100, fileName: outputName });
  } catch (error) {
    setJob(jobId, { status: "error", error: error instanceof Error ? error.message : "Unknown error" });
  }
}

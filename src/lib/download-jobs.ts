import path from "path";
import fs from "fs";
import { getWritableBaseDir } from "@/lib/storage-path";
import { getYtDlpExecFn } from "@/lib/ytdlp";

export type JobStatus = "queued" | "running" | "done" | "error";

export type DownloadJob = {
  id: string;
  url: string;
  format: string;
  status: JobStatus;
  progress: number;
  fileName?: string;
  error?: string;
  startedAt: string;
  updatedAt: string;
};

const BASE_DIR = getWritableBaseDir();
const DOWNLOAD_DIR = path.join(BASE_DIR, "downloads");
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

function extractVideoId(url: string): string | null {
  const patterns = [
    /[?&]v=([^&]+)/,
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/shorts\/([^?&]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

function formatString(choice: string): {
  format: string;
  extractAudio?: boolean;
  audioFormat?: string;
  audioQuality?: string;
} {
  switch (choice) {
    case "1080p":
      return { format: "bestvideo[height<=1080]+bestaudio/best[height<=1080]" };
    case "720p":
      return { format: "bestvideo[height<=720]+bestaudio/best[height<=720]" };
    case "480p":
      return { format: "bestvideo[height<=480]+bestaudio/best[height<=480]" };
    case "Audio Only (MP3)":
      return {
        format: "bestaudio",
        extractAudio: true,
        audioFormat: "mp3",
        audioQuality: "192K",
      };
    default:
      return { format: "bestvideo+bestaudio/best" };
  }
}

function findDownloadedFile(videoId: string | null): string | null {
  const files = fs.readdirSync(DOWNLOAD_DIR);
  const candidates = files
    .filter((name) => (videoId ? name.includes(`[${videoId}]`) : true))
    .map((name) => ({ name, time: fs.statSync(path.join(DOWNLOAD_DIR, name)).mtimeMs }))
    .sort((a, b) => b.time - a.time);
  return candidates[0]?.name ?? null;
}

type JobStore = Map<string, DownloadJob>;
type YtProcess = {
  kill: (signal?: NodeJS.Signals) => void;
  stdout?: NodeJS.ReadableStream | null;
  stderr?: NodeJS.ReadableStream | null;
  then: (onfulfilled?: (value: unknown) => unknown, onrejected?: (reason: unknown) => unknown) => unknown;
  catch: (onrejected?: (reason: unknown) => unknown) => unknown;
};
type ProcessStore = Map<string, YtProcess>;

const store = (globalThis as { __downloadJobs?: JobStore }).__downloadJobs ?? new Map();
(globalThis as { __downloadJobs?: JobStore }).__downloadJobs = store;
const processes =
  (globalThis as { __downloadProcesses?: ProcessStore }).__downloadProcesses ?? new Map();
(globalThis as { __downloadProcesses?: ProcessStore }).__downloadProcesses = processes;

export function createJob(url: string, format: string): DownloadJob {
  const now = new Date().toISOString();
  const job: DownloadJob = {
    id: crypto.randomUUID(),
    url,
    format,
    status: "queued",
    progress: 0,
    startedAt: now,
    updatedAt: now,
  };
  store.set(job.id, job);
  return job;
}

export function getJob(id: string) {
  return store.get(id) ?? null;
}

function setJob(id: string, patch: Partial<DownloadJob>) {
  const existing = store.get(id);
  if (!existing) return;
  store.set(id, {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
  });
}

export function startJob(job: DownloadJob) {
  ensureDirs();

  const formatInfo = formatString(job.format);
  const outputTemplate = path.join(DOWNLOAD_DIR, "%(title)s [%(id)s].%(ext)s");
  let execFn: ((url: string, flags: Record<string, unknown>) => YtProcess) | null = null;
  try {
    execFn = getYtDlpExecFn() as (url: string, flags: Record<string, unknown>) => YtProcess;
  } catch (error) {
    setJob(job.id, {
      status: "error",
      error: error instanceof Error ? error.message : "yt-dlp unavailable",
    });
    return;
  }

  const execOptions: Record<string, unknown> = {
    format: formatInfo.format,
    output: outputTemplate,
    noPlaylist: true,
    mergeOutputFormat: "mp4",
    newline: true,
  };

  if (formatInfo.extractAudio) {
    execOptions.extractAudio = true;
    execOptions.audioFormat = formatInfo.audioFormat;
    execOptions.audioQuality = formatInfo.audioQuality;
  }

  const subprocess: YtProcess = execFn(job.url, execOptions);

  processes.set(job.id, subprocess);
  setJob(job.id, { status: "running" });

  const handleLine = (line: string) => {
    const match = line.match(/\[download\]\s+(\d+(?:\.\d+)?)%/);
    if (match) {
      const value = Math.min(100, Math.max(0, Number(match[1])));
      setJob(job.id, { progress: value });
    }
  };

  subprocess.stdout?.on("data", (chunk: Buffer) => {
    const text = chunk.toString("utf8");
    text.split(/\r?\n/).forEach(handleLine);
  });

  subprocess.stderr?.on("data", (chunk: Buffer) => {
    const text = chunk.toString("utf8");
    text.split(/\r?\n/).forEach(handleLine);
  });

  const subprocessPromise = Promise.resolve(subprocess as unknown);
  subprocessPromise
    .then(() => {
      const videoId = extractVideoId(job.url);
      const fileName = findDownloadedFile(videoId);
      if (!fileName) {
        setJob(job.id, { status: "error", error: "File not found after download" });
        return;
      }

      const filePath = path.join(DOWNLOAD_DIR, fileName);
      const stat = fs.statSync(filePath);

      const entry = {
        id: videoId ?? null,
        name: fileName,
        size: stat.size,
        createdAt: new Date().toISOString(),
        format: job.format,
      };

      const manifest = readManifest();
      manifest.unshift(entry);
      writeManifest(manifest.slice(0, 50));

      setJob(job.id, { status: "done", progress: 100, fileName });
      processes.delete(job.id);
    })
    .catch((error: Error) => {
      setJob(job.id, { status: "error", error: error.message });
      processes.delete(job.id);
    });
}

export function cancelJob(id: string) {
  const proc = processes.get(id);
  if (proc) {
    proc.kill("SIGTERM");
    processes.delete(id);
  }
  setJob(id, { status: "error", error: "Cancelled by user" });
}

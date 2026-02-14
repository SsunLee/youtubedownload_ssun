import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import ytdlpExec from "yt-dlp-exec";

type YtDlpModule = typeof ytdlpExec & { create: (binaryPath: string) => typeof ytdlpExec };
type ExecFn = (url: string, flags: Record<string, unknown>) => unknown;

const ytdlp = ytdlpExec as YtDlpModule;

let pythonAvailable: boolean | null = null;

function hasPython(): boolean {
  if (process.platform === "win32") return true;
  if (pythonAvailable !== null) return pythonAvailable;

  const commands = ["python3", "python"];
  pythonAvailable = commands.some((command) => {
    const res = spawnSync(command, ["--version"], { stdio: "ignore" });
    return res.status === 0;
  });
  return pythonAvailable;
}

function firstLine(filePath: string): string {
  try {
    const fd = fs.openSync(filePath, "r");
    try {
      const buffer = Buffer.alloc(256);
      const bytes = fs.readSync(fd, buffer, 0, buffer.length, 0);
      return buffer.toString("utf8", 0, bytes).split(/\r?\n/)[0] ?? "";
    } finally {
      fs.closeSync(fd);
    }
  } catch {
    return "";
  }
}

function requiresPython(filePath: string): boolean {
  if (process.platform === "win32") return false;
  const line = firstLine(filePath);
  return line.includes("python3") || line.includes("python");
}

function buildCandidates(): string[] {
  const candidates: string[] = [];
  const envPath = process.env.YTDLP_BINARY_PATH?.trim();
  if (envPath) {
    candidates.push(path.resolve(envPath));
  }

  const root = process.cwd();
  const localBin = path.join(root, "bin");
  const moduleBin = path.join(root, "node_modules", "yt-dlp-exec", "bin");

  const platformNames =
    process.platform === "win32"
      ? ["yt-dlp.exe"]
      : process.platform === "linux"
        ? ["yt-dlp_linux", "yt-dlp"]
        : process.platform === "darwin"
          ? ["yt-dlp_macos", "yt-dlp"]
          : ["yt-dlp"];

  for (const name of platformNames) {
    candidates.push(path.join(localBin, name));
  }
  for (const name of platformNames) {
    candidates.push(path.join(moduleBin, name));
  }

  return candidates;
}

export function resolveYtDlpBinaryPath(): string | null {
  const candidates = buildCandidates();
  for (const candidate of candidates) {
    if (!fs.existsSync(candidate)) continue;
    if (requiresPython(candidate) && !hasPython()) continue;
    return candidate;
  }
  return null;
}

export function createYtDlpClient() {
  const binaryPath = resolveYtDlpBinaryPath();
  if (!binaryPath) {
    throw new Error(
      "yt-dlp binary is missing or requires python3. Run npm install to fetch platform binary, or set YTDLP_BINARY_PATH."
    );
  }
  return ytdlp.create(binaryPath);
}

export function getYtDlpExecFn(): ExecFn {
  const client = createYtDlpClient() as unknown as { exec?: ExecFn } & ExecFn;
  return client.exec ?? client;
}

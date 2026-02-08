import { NextRequest, NextResponse } from "next/server";
import ytdlpExec from "yt-dlp-exec";
import path from "path";
import fs from "fs";

export const runtime = "nodejs";

type YtInfo = {
  title?: string;
  formats?: Array<{ height?: number; vcodec?: string; filesize?: number; filesize_approx?: number }>;
  filesize?: number;
  filesize_approx?: number;
};
type SizeMap = Partial<Record<"best" | "1080" | "720" | "480", number>>;

function parseJson(text: string): YtInfo {
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) {
    return JSON.parse(trimmed) as YtInfo;
  }
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return JSON.parse(trimmed.slice(start, end + 1)) as YtInfo;
  }
  throw new Error("Failed to parse metadata");
}

function extractUrl(raw: string): string {
  const trimmed = raw.trim();
  const match = trimmed.match(/https?:\/\/\S+/);
  return match ? match[0] : trimmed;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = extractUrl(String(body?.url ?? ""));
    if (!url) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const binaryName = process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp";
    const binaryPath = path.join(process.cwd(), "node_modules", "yt-dlp-exec", "bin", binaryName);
    const ytdlp = fs.existsSync(binaryPath)
      ? (ytdlpExec as unknown as { create: (bin: string) => typeof ytdlpExec }).create(binaryPath)
      : ytdlpExec;
    const execFn =
      ((ytdlp as unknown as { exec?: (url: string, flags: Record<string, unknown>) => unknown }).exec ??
        (ytdlp as unknown as (url: string, flags: Record<string, unknown>) => unknown));

    const result = await execFn(url, {
      dumpSingleJson: true,
      skipDownload: true,
      noPlaylist: true,
      noWarnings: true,
    });

    let info: YtInfo;
    try {
      if (result && typeof result === "object" && "stdout" in (result as Record<string, unknown>)) {
        const stdout = String((result as { stdout?: unknown }).stdout ?? "");
        const stderr = String((result as { stderr?: unknown }).stderr ?? "");
        if (!stdout.trim()) {
          return NextResponse.json(
            { error: "No metadata returned", detail: stderr || "stdout empty" },
            { status: 500 }
          );
        }
        info = parseJson(stdout);
      } else if (typeof result === "string") {
        info = parseJson(result);
      } else {
        info = result as YtInfo;
      }
    } catch (err) {
      return NextResponse.json(
        { error: "Failed to parse metadata", detail: err instanceof Error ? err.message : String(err) },
        { status: 500 }
      );
    }

    let bestHeight = 0;
    let sizeBytes: number | undefined;
    const sizeBy = (limit: number, formats: NonNullable<YtInfo["formats"]>): number | undefined => {
      const videoFormats = formats
        .filter((fmt) => fmt.vcodec !== "none" && fmt.height && fmt.height <= limit)
        .sort((a, b) => (b.height ?? 0) - (a.height ?? 0));
      if (videoFormats.length === 0) return undefined;
      const pick = videoFormats[0];
      return pick.filesize ?? pick.filesize_approx;
    };
    const sizeMap: SizeMap = {};

    if (info.formats) {
      for (const fmt of info.formats) {
        if (fmt.vcodec === "none") continue;
        if (fmt.height && fmt.height > bestHeight) {
          bestHeight = fmt.height;
          sizeBytes = fmt.filesize ?? fmt.filesize_approx;
        }
      }
      sizeMap.best = sizeBy(9999, info.formats);
      sizeMap["1080"] = sizeBy(1080, info.formats);
      sizeMap["720"] = sizeBy(720, info.formats);
      sizeMap["480"] = sizeBy(480, info.formats);
    }

    sizeBytes = sizeBytes ?? info.filesize ?? info.filesize_approx;

    return NextResponse.json({
      title: info.title ?? null,
      bestHeight: bestHeight || null,
      sizeBytes: sizeBytes ?? null,
      sizeMap,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

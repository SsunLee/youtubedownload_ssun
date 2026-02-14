import { NextRequest, NextResponse } from "next/server";
import { getYtDlpExecFn } from "@/lib/ytdlp";

export const runtime = "nodejs";

type YtInfo = {
  title?: string;
  formats?: Array<{ height?: number; vcodec?: string; filesize?: number; filesize_approx?: number }>;
  filesize?: number;
  filesize_approx?: number;
};
type SizeMap = Partial<Record<"best" | "1080" | "720" | "480", number>>;
type ExecResult = YtInfo | string | { stdout?: unknown; stderr?: unknown };

function toErrorDetail(err: unknown): string {
  if (err instanceof Error) {
    const candidate = err as Error & { stderr?: unknown; stdout?: unknown };
    const stderr = String(candidate.stderr ?? "").trim();
    if (stderr) return stderr;
    const stdout = String(candidate.stdout ?? "").trim();
    if (stdout) return stdout;
    return err.message;
  }
  return String(err);
}

function parseJson(text: string): YtInfo {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("stdout empty");
  }
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
  const match = trimmed.match(/https?:\/\/[^\s"'<>`]+/i);
  const candidate = (match ? match[0] : trimmed).replace(/[)\],.;]+$/, "");
  return candidate;
}

function parseExecResult(result: ExecResult): YtInfo {
  if (result && typeof result === "object" && "stdout" in result) {
    const stdout = String(result.stdout ?? "");
    const stderr = String(result.stderr ?? "");
    if (!stdout.trim()) {
      throw new Error(stderr || "No metadata returned");
    }
    return parseJson(stdout);
  }
  if (typeof result === "string") {
    return parseJson(result);
  }
  return result as YtInfo;
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
    let normalizedUrl: string;
    try {
      normalizedUrl = new URL(url).toString();
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const execFn = getYtDlpExecFn();
    const baseFlags = {
      dumpSingleJson: true,
      skipDownload: true,
      noPlaylist: true,
      noWarnings: true,
    } as const;
    const attempts: Array<{ name: string; flags: Record<string, unknown> }> = [
      { name: "default", flags: {} },
      {
        name: "youtube-fallback",
        flags: { extractorArgs: "youtube:player_client=android,web", forceIpv4: true },
      },
    ];

    let info: YtInfo | null = null;
    const errors: string[] = [];
    for (const attempt of attempts) {
      try {
        const result = (await execFn(normalizedUrl, {
          ...baseFlags,
          ...attempt.flags,
        })) as ExecResult;
        info = parseExecResult(result);
        break;
      } catch (err) {
        errors.push(`${attempt.name}: ${toErrorDetail(err)}`);
      }
    }

    if (!info) {
      return NextResponse.json(
        { error: "Metadata lookup failed", detail: errors.join(" | ") || "Unknown error" },
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

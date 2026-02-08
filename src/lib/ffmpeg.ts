import fs from "fs";
import path from "path";

const FFMPEG_URL = "https://github.com/SsunLee/youtubedownload_ssun/releases/download/ffmpeg-v1/ffmpeg";

export async function ensureFfmpeg(): Promise<string> {
  const binDir = path.join(process.env.TMPDIR || process.env.TEMP || "/tmp", "bin");
  const ffmpegPath = path.join(binDir, "ffmpeg");

  if (fs.existsSync(ffmpegPath)) {
    return ffmpegPath;
  }

  fs.mkdirSync(binDir, { recursive: true });

  const res = await fetch(FFMPEG_URL);
  if (!res.ok || !res.body) {
    throw new Error(`Failed to download ffmpeg: ${res.status}`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(ffmpegPath, buf, { mode: 0o755 });

  return ffmpegPath;
}

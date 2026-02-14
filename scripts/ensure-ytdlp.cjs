/* eslint-disable @typescript-eslint/no-require-imports */
"use strict";

const fs = require("fs");
const path = require("path");
const https = require("https");

function resolveAssetName() {
  if (process.platform === "win32") return "yt-dlp.exe";
  if (process.platform === "linux") return "yt-dlp_linux";
  if (process.platform === "darwin") return "yt-dlp_macos";
  return null;
}

function requestBuffer(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          "User-Agent": "youtube-download-app",
          Accept: "application/octet-stream",
        },
      },
      (res) => {
        const statusCode = res.statusCode ?? 0;
        const location = res.headers.location;
        if ([301, 302, 303, 307, 308].includes(statusCode) && location) {
          if (redirects >= 5) {
            reject(new Error("Too many redirects"));
            return;
          }
          const nextUrl = location.startsWith("http")
            ? location
            : new URL(location, url).toString();
          resolve(requestBuffer(nextUrl, redirects + 1));
          return;
        }
        if (statusCode !== 200) {
          reject(new Error(`HTTP ${statusCode}`));
          return;
        }

        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      }
    );

    req.on("error", reject);
  });
}

async function main() {
  const assetName = resolveAssetName();
  if (!assetName) {
    console.log("[ensure-ytdlp] skip: unsupported platform");
    return;
  }

  const binDir = path.join(process.cwd(), "bin");
  const targetName = process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp";
  const targetPath = path.join(binDir, targetName);
  if (fs.existsSync(targetPath)) {
    console.log(`[ensure-ytdlp] exists: ${targetPath}`);
    return;
  }

  const url = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${assetName}`;
  console.log(`[ensure-ytdlp] downloading ${assetName}`);
  const buffer = await requestBuffer(url);

  fs.mkdirSync(binDir, { recursive: true });
  fs.writeFileSync(targetPath, buffer, { mode: 0o755 });
  if (process.platform !== "win32") {
    fs.chmodSync(targetPath, 0o755);
  }
  console.log(`[ensure-ytdlp] ready: ${targetPath}`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`[ensure-ytdlp] warning: ${message}`);
});

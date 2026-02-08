import fs from "fs";
import path from "path";

export function getWritableBaseDir() {
  const tmpDir = process.env.TMPDIR || process.env.TEMP || "/tmp";
  const candidates = [process.cwd(), tmpDir];
  for (const base of candidates) {
    try {
      fs.mkdirSync(path.join(base, ".writetest"), { recursive: true });
      fs.rmdirSync(path.join(base, ".writetest"));
      return base;
    } catch {
      // try next
    }
  }
  return tmpDir;
}

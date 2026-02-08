import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

const DATA_DIR = path.join(process.cwd(), "data");
const COUNTER_PATH = path.join(DATA_DIR, "visits.json");

function ensureData() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(COUNTER_PATH)) {
    fs.writeFileSync(COUNTER_PATH, JSON.stringify({ count: 0 }), "utf8");
  }
}

function readCount(): number {
  ensureData();
  try {
    const raw = fs.readFileSync(COUNTER_PATH, "utf8");
    const data = JSON.parse(raw) as { count?: number };
    return typeof data.count === "number" ? data.count : 0;
  } catch {
    return 0;
  }
}

function writeCount(count: number) {
  ensureData();
  fs.writeFileSync(COUNTER_PATH, JSON.stringify({ count }, null, 2), "utf8");
}

export async function GET() {
  const count = readCount();
  return NextResponse.json({ count });
}

export async function POST() {
  const count = readCount() + 1;
  writeCount(count);
  return NextResponse.json({ count });
}

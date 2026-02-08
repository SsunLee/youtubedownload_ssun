"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  FolderOpen,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

type Locale = "EN" | "KR" | "JP";

const navItems = [{ label: "YouTube Download", active: true }];
const formats = ["Best (Video+Audio)", "1080p", "720p", "480p", "Audio Only (MP3)"];

const copy = {
  EN: {
    nav: "YouTube Download",
    dashboard: "Dashboard",
    title: "YouTube Download",
    downloadCenter: "Download Center",
    downloadDesc:
      "Paste a YouTube link, choose output resolution, and download to the server. If you select a local folder, it will copy the result to your device.",
    urlLabel: "YouTube URL",
    outputFolder: "Output Folder",
    selectFolder: "Select Folder",
    format: "Format",
    progress: "Progress",
    download: "Download",
    downloading: "Downloading...",
    settings: "Settings",
    settingsDesc: "Customize your experience and manage support details.",
    theme: "Theme",
    themeDesc: "Dark mode / White mode",
    sponsor: "Donation Account",
    sponsorText: "Temporary text",
    history: "Download History",
    refresh: "Refresh",
    emptyHistory: "No downloads yet.",
    downloadFile: "Download",
    ready: "Ready",
    serverFolder: "Server storage (download button to save)",
    statusQueued: "Queued...",
    statusPreparing: "Preparing download...",
    statusServerDone: "Server download completed",
    statusLocalCopy: "Copying to local folder...",
    statusFolderNotSupported: "This browser does not support folder selection.",
    statusFolderSelected: "Local folder selected:",
    statusMissingUrl: "Please enter a URL.",
    statusNotFound: "Job not found.",
    statusLocalFailed: "Local save failed: unable to fetch file.",
    stop: "Stop",
  },
  KR: {
    nav: "유튜브 다운로드",
    dashboard: "대시보드",
    title: "유튜브 다운로드",
    downloadCenter: "다운로드 센터",
    downloadDesc:
      "유튜브 링크를 붙여넣고 해상도를 선택한 뒤 서버에 다운로드합니다. 로컬 폴더를 선택하면 결과를 기기에 복사합니다.",
    urlLabel: "YouTube URL",
    outputFolder: "저장 폴더",
    selectFolder: "폴더 선택",
    format: "포맷",
    progress: "진행률",
    download: "다운로드",
    downloading: "다운로드 중...",
    settings: "설정",
    settingsDesc: "환경을 설정하고 후원 정보를 관리하세요.",
    theme: "테마",
    themeDesc: "다크 모드 / 화이트 모드",
    sponsor: "후원 계좌",
    sponsorText: "임시 텍스트",
    history: "다운로드 히스토리",
    refresh: "새로고침",
    emptyHistory: "다운로드 기록이 없습니다.",
    downloadFile: "다운로드",
    ready: "준비 완료",
    serverFolder: "서버 저장 (다운로드 버튼으로 받기)",
    statusQueued: "대기 중...",
    statusPreparing: "다운로드 준비 중...",
    statusServerDone: "서버 다운로드 완료",
    statusLocalCopy: "로컬 폴더로 복사 중...",
    statusFolderNotSupported: "이 브라우저는 폴더 선택을 지원하지 않습니다.",
    statusFolderSelected: "로컬 폴더 선택됨:",
    statusMissingUrl: "URL을 입력해주세요.",
    statusNotFound: "작업을 찾을 수 없습니다.",
    statusLocalFailed: "로컬 저장 실패: 파일을 가져오지 못했습니다.",
    stop: "중지",
  },
  JP: {
    nav: "YouTube ダウンロード",
    dashboard: "ダッシュボード",
    title: "YouTube ダウンロード",
    downloadCenter: "ダウンロードセンター",
    downloadDesc:
      "YouTube のリンクを貼り付け、解像度を選んでサーバーに保存します。ローカルフォルダを選ぶと端末へコピーします。",
    urlLabel: "YouTube URL",
    outputFolder: "保存フォルダ",
    selectFolder: "フォルダ選択",
    format: "フォーマット",
    progress: "進捗",
    download: "ダウンロード",
    downloading: "ダウンロード中...",
    settings: "設定",
    settingsDesc: "体験をカスタマイズし、支援情報を管理します。",
    theme: "テーマ",
    themeDesc: "ダークモード / ホワイトモード",
    sponsor: "支援口座",
    sponsorText: "仮テキスト",
    history: "ダウンロード履歴",
    refresh: "更新",
    emptyHistory: "ダウンロード履歴がありません。",
    downloadFile: "ダウンロード",
    ready: "準備完了",
    serverFolder: "サーバー保存（ダウンロードで保存）",
    statusQueued: "待機中...",
    statusPreparing: "ダウンロード準備中...",
    statusServerDone: "サーバーダウンロード完了",
    statusLocalCopy: "ローカルフォルダにコピー中...",
    statusFolderNotSupported: "このブラウザはフォルダ選択に対応していません。",
    statusFolderSelected: "ローカルフォルダ選択:",
    statusMissingUrl: "URLを入力してください。",
    statusNotFound: "ジョブが見つかりません。",
    statusLocalFailed: "ローカル保存に失敗しました。",
    stop: "停止",
  },
};

type DownloadEntry = {
  name: string;
  size: number;
  createdAt: string;
  format?: string;
};

type DownloadJob = {
  id: string;
  status: "queued" | "running" | "done" | "error";
  progress: number;
  fileName?: string;
  error?: string;
};

type DirectoryHandle = {
  name: string;
  getFileHandle: (name: string, opts: { create: boolean }) => Promise<FileSystemFileHandle>;
};

type FileSystemFileHandle = {
  createWritable: () => Promise<FileSystemWritableFileStream>;
};

type FileSystemWritableFileStream = {
  write: (data: Uint8Array) => Promise<void>;
  close: () => Promise<void>;
};

export function AppShell() {
  const [collapsed, setCollapsed] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const [url, setUrl] = React.useState("");
  const [format, setFormat] = React.useState(formats[0]);
  const [locale, setLocale] = React.useState<Locale>("KR");
  const t = copy[locale];
  const [status, setStatus] = React.useState(t.ready);
  const [downloading, setDownloading] = React.useState(false);
  const [history, setHistory] = React.useState<DownloadEntry[]>([]);
  const [folderHandle, setFolderHandle] = React.useState<DirectoryHandle | null>(null);
  const [progress, setProgress] = React.useState(0);
  const [jobId, setJobId] = React.useState<string | null>(null);

  const folderName = folderHandle?.name ?? t.serverFolder;

  const loadHistory = React.useCallback(async () => {
    const res = await fetch("/api/downloads", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as DownloadEntry[];
    setHistory(data);
  }, []);

  React.useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  React.useEffect(() => {
    if (!jobId) return;
    let alive = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/progress/${jobId}`, { cache: "no-store" });
        if (!res.ok) {
          if (res.status === 404) {
            setStatus(t.statusNotFound);
            setDownloading(false);
            setJobId(null);
            clearInterval(interval);
          }
          return;
        }
        const data = (await res.json()) as DownloadJob;
        if (!alive) return;
        setProgress(data.progress ?? 0);

        if (data.status === "running") {
          setStatus(`다운로드 중... ${Math.round(data.progress ?? 0)}%`);
        }
        if (data.status === "queued") {
          setStatus("대기 중...");
        }
        if (data.status === "error") {
          setStatus(`실패: ${data.error ?? "Unknown error"}`);
          setDownloading(false);
          setJobId(null);
          clearInterval(interval);
        }
        if (data.status === "done") {
          setStatus(t.statusServerDone);
          setDownloading(false);
          setJobId(null);
          clearInterval(interval);
          await loadHistory();

          if (folderHandle && data.fileName) {
            setStatus(t.statusLocalCopy);
            await saveToFolder(data.fileName);
          }
        }
      } catch {
        // ignore
      }
    }, 1000);

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [jobId, folderHandle, loadHistory]);

  const onSelectFolder = async () => {
    if (typeof window === "undefined") return;
    const anyWindow = window as unknown as { showDirectoryPicker?: () => Promise<DirectoryHandle> };
    if (!anyWindow.showDirectoryPicker) {
      setStatus(t.statusFolderNotSupported);
      return;
    }
    const handle = await anyWindow.showDirectoryPicker();
    setFolderHandle(handle);
    setStatus(`${t.statusFolderSelected} ${handle.name}`);
  };

  const saveToFolder = async (fileName: string) => {
    if (!folderHandle) return;
    const res = await fetch(`/api/downloads/${encodeURIComponent(fileName)}`);
    if (!res.ok) {
      setStatus(t.statusLocalFailed);
      return;
    }

    const fileHandle = await folderHandle.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();

    if (res.body && "pipeTo" in res.body) {
      await res.body.pipeTo(writable as unknown as WritableStream);
      setStatus(`OK: ${fileName}`);
      return;
    }

    const blob = await res.blob();
    const buffer = new Uint8Array(await blob.arrayBuffer());
    await writable.write(buffer);
    await writable.close();
    setStatus(`OK: ${fileName}`);
  };

  const onDownload = async () => {
    if (!url.trim()) {
      setStatus(t.statusMissingUrl);
      return;
    }
    setDownloading(true);
    setProgress(0);
    setStatus(t.statusPreparing);

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, format }),
      });

      if (!res.ok) {
        const data = await res.json();
        setStatus(`실패: ${data?.error ?? "Unknown error"}`);
        setDownloading(false);
        return;
      }

      const data = (await res.json()) as { jobId: string };
      setJobId(data.jobId);
      setStatus(t.statusQueued);
    } catch (error) {
      setStatus(`실패: ${error instanceof Error ? error.message : "Unknown error"}`);
      setDownloading(false);
    }
  };

  const onCancel = async () => {
    if (!jobId) return;
    await fetch(`/api/cancel/${jobId}`, { method: "POST" });
    setStatus("취소 요청됨");
    setDownloading(false);
    setJobId(null);
  };

  const statusTone = React.useMemo(() => {
    if (downloading || status.includes("다운로드") || status.includes("Downloading") || status.includes("待機") || status.includes("待機中") || status.includes("Queued")) {
      return "bg-amber-400";
    }
    if (status.toLowerCase().includes("fail") || status.includes("실패") || status.includes("error") || status.includes("失敗")) {
      return "bg-red-500";
    }
    if (status.toLowerCase().includes("ok") || status.includes("완료") || status.includes("completed") || status.includes("完了")) {
      return "bg-emerald-500";
    }
    return "bg-slate-400";
  }, [downloading, status]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/40">
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px] gap-6 px-4 py-6">
        <aside
          className={cn(
            "relative flex h-[calc(100vh-3rem)] flex-col rounded-3xl border border-border/60 bg-card/80 p-4 backdrop-blur transition-all",
            collapsed ? "w-20" : "w-72"
          )}
        >
          <div className="flex items-center justify-between">
            <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                YD
              </div>
              {!collapsed && (
                <div className="text-lg font-semibold italic tracking-tight font-brand">
                  쑨에듀
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCollapsed((prev) => !prev)}
              aria-label="Toggle sidebar"
            >
              {collapsed ? <ChevronRight /> : <ChevronLeft />}
            </Button>
          </div>

          <Separator className="my-4" />

          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.label}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm font-medium transition",
                  item.active
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-foreground/70 hover:bg-muted/60"
                )}
              >
                <span className="h-2.5 w-2.5 rounded-full bg-current" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-4">
            <Separator className="my-4" />
            <div className={cn("space-y-2", collapsed && "text-center")}>
              <p
                className={cn(
                  "text-xs uppercase tracking-[0.2em] text-muted-foreground",
                  collapsed && "text-[10px]"
                )}
              >
                Settings
              </p>
              <div
                className={cn(
                  "flex items-center justify-between rounded-2xl border border-border/60 bg-background/60 px-3 py-2",
                  collapsed && "flex-col gap-2"
                )}
              >
                {!collapsed && (
                  <div className="flex items-center gap-2 text-sm">
                    {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    Theme
                  </div>
                )}
                <Switch
                  checked={isDark}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                  aria-label="Toggle theme"
                />
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border/60 bg-card/70 px-6 py-5 backdrop-blur">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                {t.dashboard}
              </p>
              <h1 className="text-2xl font-semibold">{t.title}</h1>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/70 px-4 py-2 text-sm">
              <span className="text-muted-foreground">Theme</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setTheme(isDark ? "light" : "dark")}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </header>

          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm">
              <h2 className="text-lg font-semibold">{t.downloadCenter}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t.downloadDesc}</p>

              <div className="mt-6 grid gap-4">
                <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {t.urlLabel}
                  </p>
                  <input
                    className="mt-3 w-full rounded-xl border border-border/60 bg-background px-4 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {t.outputFolder}
                  </p>
                    <p className="mt-2 text-sm">{folderName}</p>
                  </div>
                  <Button
                    variant="outline"
                    className="h-full rounded-2xl px-4"
                    onClick={onSelectFolder}
                  >
                    <FolderOpen className="mr-2 h-4 w-4" />
                    {t.selectFolder}
                  </Button>
                </div>

                <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {t.format}
                  </p>
                  <select
                    className="mt-3 w-full rounded-xl border border-border/60 bg-background px-4 py-2 text-sm"
                    value={format}
                    onChange={(event) => setFormat(event.target.value)}
                  >
                    {formats.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t.progress}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="mt-3" />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    className="rounded-2xl"
                    onClick={onDownload}
                    disabled={downloading}
                  >
                    {downloading ? t.downloading : t.download}
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-2xl"
                    onClick={onCancel}
                    disabled={!downloading}
                  >
                    {t.stop}
                  </Button>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className={`h-2.5 w-2.5 rounded-full ${statusTone}`} />
                    {status}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm">
              <h2 className="text-lg font-semibold">{t.settings}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t.settingsDesc}</p>

                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                      <p className="text-sm font-medium">{t.theme}</p>
                      <p className="text-xs text-muted-foreground">{t.themeDesc}</p>
                      </div>
                      <Switch
                        checked={isDark}
                        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                      />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <p className="text-sm font-medium">{t.sponsor}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{t.sponsorText}</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <p className="text-sm font-medium">Language</p>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                      {(["EN", "KR", "JP"] as Locale[]).map((code) => (
                        <Button
                          key={code}
                          variant={locale === code ? "default" : "outline"}
                          className="rounded-xl"
                          onClick={() => {
                            setLocale(code);
                            setStatus(copy[code].ready);
                          }}
                        >
                          {code}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{t.history}</h2>
                  <Button variant="ghost" size="sm" onClick={loadHistory}>
                    {t.refresh}
                  </Button>
                </div>
                <div className="mt-4 space-y-3">
                  {history.length === 0 && (
                    <p className="text-sm text-muted-foreground">{t.emptyHistory}</p>
                  )}
                  {history.map((item) => (
                    <div
                      key={`${item.name}-${item.createdAt}`}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/70 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(item.size / (1024 * 1024)).toFixed(1)} MB · {item.format ?? ""}
                        </p>
                      </div>
                      <a
                        className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1 text-sm hover:bg-muted/40"
                        href={`/api/downloads/${encodeURIComponent(item.name)}`}
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

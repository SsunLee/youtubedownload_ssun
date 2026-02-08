"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Download,
  Search,
  Wand2,
  FileVideo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

type Locale = "EN" | "KR" | "JP";

const formats = ["Best (Video+Audio)", "1080p", "720p", "480p", "Audio Only (MP3)"];

type Copy = {
  navDownload: string;
  navM3u8: string;
  navSettings: string;
  navSupport: string;
  dashboard: string;
  title: string;
  settingsTitle: string;
  supportTitle: string;
  downloadCenter: string;
  downloadDesc: string;
  urlLabel: string;
  m3u8UrlLabel: string;
  m3u8FileLabel: string;
  m3u8Upload: string;
  m3u8Convert: string;
  m3u8UrlConvert: string;
  m3u8Hint: string;
  m3u8Title: string;
  m3u8NoFile: string;
  m3u8Reset: string;
  analyze: string;
  analyzing: string;
  metaTitle: string;
  metaBest: string;
  metaSize: string;
  metaUnknown: string;
  outputFolder: string;
  format: string;
  progress: string;
  logTitle: string;
  logClear: string;
  logEmpty: string;
  download: string;
  downloading: string;
  settings: string;
  settingsDesc: string;
  supportDesc: string;
  supportContact: string;
  supportEmail: string;
  supportHours: string;
  supportOwner: string;
  theme: string;
  themeDesc: string;
  sponsor: string;
  sponsorText: string;
  language: string;
  visitors: string;
  history: string;
  refresh: string;
  deleteSelected: string;
  emptyHistory: string;
  downloadFile: string;
  ready: string;
  serverStorage: string;
  statusQueued: string;
  statusPreparing: string;
  statusDownloading: string;
  statusServerDone: string;
  statusMissingUrl: string;
  statusNotFound: string;
  stop: string;
};

const copy: Record<Locale, Copy> = {
  EN: {
    navDownload: "YouTube Download",
    navM3u8: "M3U8 Download",
    navSettings: "Settings",
    navSupport: "Support",
    dashboard: "Dashboard",
    title: "YouTube Download",
    settingsTitle: "Settings",
    supportTitle: "Support",
    downloadCenter: "Download Center",
    downloadDesc:
      "Paste a YouTube link, choose output resolution, and download to the server. Use the Download button to save the file.",
    urlLabel: "YouTube URL",
    m3u8UrlLabel: "M3U8 URL",
    m3u8FileLabel: "M3U8 File",
    m3u8Upload: "Upload .m3u8",
    m3u8Convert: "Convert",
    m3u8UrlConvert: "Convert URL",
    m3u8Hint: "Requires ffmpeg installed on the server.",
    m3u8Title: "M3U8 Download",
    m3u8NoFile: "No file selected",
    m3u8Reset: "Reset",
    analyze: "Analyze",
    analyzing: "Analyzing...",
    metaTitle: "Title",
    metaBest: "Best Estimate",
    metaSize: "Estimated Size",
    metaUnknown: "Analyze to load",
    outputFolder: "Storage",
    format: "Format",
    progress: "Progress",
    logTitle: "Log",
    logClear: "Clear",
    logEmpty: "No logs yet.",
    download: "Download",
    downloading: "Downloading...",
    settings: "Settings",
    settingsDesc: "Customize your experience and manage support details.",
    supportDesc: "Need help? Get in touch with the team.",
    supportContact: "Contact",
    supportEmail: "Email: tnsqo1126@naver.com",
    supportHours: "Hours: Weekdays 10:00–18:00 (KST)",
    supportOwner: "Team: SSUN EDU Team",
    theme: "Theme",
    themeDesc: "Dark mode / White mode",
    sponsor: "Donation Account",
    sponsorText: "Temporary text",
    language: "Language",
    visitors: "Visitors",
    history: "Download History",
    refresh: "Refresh",
    deleteSelected: "Delete Selected",
    emptyHistory: "No downloads yet.",
    downloadFile: "Download",
    ready: "Ready",
    serverStorage: "Server storage",
    statusQueued: "Queued...",
    statusPreparing: "Preparing download...",
    statusDownloading: "Downloading",
    statusServerDone: "Server download completed",
    statusMissingUrl: "Please enter a URL.",
    statusNotFound: "Job not found.",
    stop: "Stop",
  },
  KR: {
    navDownload: "유튜브 다운로드",
    navM3u8: "M3U8 Download",
    navSettings: "설정",
    navSupport: "Support",
    dashboard: "대시보드",
    title: "유튜브 다운로드",
    settingsTitle: "설정",
    supportTitle: "Support",
    downloadCenter: "다운로드 센터",
    downloadDesc:
      "유튜브 링크를 붙여넣고 해상도를 선택한 뒤 서버에 다운로드합니다. 다운로드 버튼으로 파일을 저장합니다.",
    urlLabel: "YouTube URL",
    m3u8UrlLabel: "M3U8 URL",
    m3u8FileLabel: "M3U8 파일",
    m3u8Upload: "파일 선택",
    m3u8Convert: "변환",
    m3u8UrlConvert: "URL 변환",
    m3u8Hint: "서버에 ffmpeg 설치가 필요합니다.",
    m3u8Title: "M3U8 다운로드",
    m3u8NoFile: "선택된 파일 없음",
    m3u8Reset: "초기화",
    analyze: "메타 조회",
    analyzing: "조회 중...",
    metaTitle: "제목",
    metaBest: "Best 예상",
    metaSize: "예상 용량",
    metaUnknown: "메타 조회 후 표시",
    outputFolder: "저장 위치",
    format: "포맷",
    progress: "진행률",
    logTitle: "로그",
    logClear: "로그 지우기",
    logEmpty: "로그가 없습니다.",
    download: "다운로드",
    downloading: "다운로드 중...",
    settings: "설정",
    settingsDesc: "환경을 설정하고 후원 정보를 관리하세요.",
    supportDesc: "문의가 필요하시면 아래 연락처로 연락 주세요.",
    supportContact: "연락처",
    supportEmail: "이메일: tnsqo1126@naver.com",
    supportHours: "운영시간: 평일 10:00–18:00 (KST)",
    supportOwner: "개발/담당: SSUN EDU Team",
    theme: "테마",
    themeDesc: "다크 모드 / 화이트 모드",
    sponsor: "후원 계좌",
    sponsorText: "임시 텍스트",
    language: "언어",
    visitors: "방문자 수",
    history: "다운로드 히스토리",
    refresh: "새로고침",
    deleteSelected: "선택 삭제",
    emptyHistory: "다운로드 기록이 없습니다.",
    downloadFile: "다운로드",
    ready: "준비 완료",
    serverStorage: "서버 저장",
    statusQueued: "대기 중...",
    statusPreparing: "다운로드 준비 중...",
    statusDownloading: "다운로드 중",
    statusServerDone: "서버 다운로드 완료",
    statusMissingUrl: "URL을 입력해주세요.",
    statusNotFound: "작업을 찾을 수 없습니다.",
    stop: "중지",
  },
  JP: {
    navDownload: "YouTube ダウンロード",
    navM3u8: "M3U8 ダウンロード",
    navSettings: "設定",
    navSupport: "Support",
    dashboard: "ダッシュボード",
    title: "YouTube ダウンロード",
    settingsTitle: "設定",
    supportTitle: "Support",
    downloadCenter: "ダウンロードセンター",
    downloadDesc:
      "YouTube のリンクを貼り付け、解像度を選んでサーバーに保存します。ダウンロードボタンで保存します。",
    urlLabel: "YouTube URL",
    m3u8UrlLabel: "M3U8 URL",
    m3u8FileLabel: "M3U8 ファイル",
    m3u8Upload: "ファイル選択",
    m3u8Convert: "変換",
    m3u8UrlConvert: "URL 変換",
    m3u8Hint: "サーバーに ffmpeg が必要です。",
    m3u8Title: "M3U8 ダウンロード",
    m3u8NoFile: "選択されたファイルなし",
    m3u8Reset: "リセット",
    analyze: "メタ取得",
    analyzing: "取得中...",
    metaTitle: "タイトル",
    metaBest: "Best 予測",
    metaSize: "推定容量",
    metaUnknown: "メタ取得後に表示",
    outputFolder: "保存先",
    format: "フォーマット",
    progress: "進捗",
    logTitle: "ログ",
    logClear: "クリア",
    logEmpty: "ログがありません。",
    download: "ダウンロード",
    downloading: "ダウンロード中...",
    settings: "設定",
    settingsDesc: "体験をカスタマイズし、支援情報を管理します。",
    supportDesc: "お問い合わせはこちらまでご連絡ください。",
    supportContact: "連絡先",
    supportEmail: "メール: tnsqo1126@naver.com",
    supportHours: "営業時間: 平日 10:00–18:00 (KST)",
    supportOwner: "担当: SSUN EDU Team",
    theme: "テーマ",
    themeDesc: "ダークモード / ホワイトモード",
    sponsor: "支援口座",
    sponsorText: "仮テキスト",
    language: "言語",
    visitors: "訪問者数",
    history: "ダウンロード履歴",
    refresh: "更新",
    deleteSelected: "選択削除",
    emptyHistory: "ダウンロード履歴がありません。",
    downloadFile: "ダウンロード",
    ready: "準備完了",
    serverStorage: "サーバー保存",
    statusQueued: "待機中...",
    statusPreparing: "ダウンロード準備中...",
    statusDownloading: "ダウンロード中",
    statusServerDone: "サーバーダウンロード完了",
    statusMissingUrl: "URLを入力してください。",
    statusNotFound: "ジョブが見つかりません。",
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

type MetaInfo = {
  title?: string;
  bestHeight?: number;
  sizeBytes?: number;
  sizeMap?: Partial<Record<"best" | "1080" | "720" | "480", number>>;
};

type AppShellProps = {
  view?: "download" | "m3u8" | "settings" | "support";
};

export function AppShell({ view = "download" }: AppShellProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const isDark = theme === "dark";

  const [url, setUrl] = React.useState("");
  const [format, setFormat] = React.useState(formats[0]);
  const [locale, setLocale] = React.useState<Locale>("KR");
  const [hydrated, setHydrated] = React.useState(false);
  const t = copy[locale];
  const [status, setStatus] = React.useState(t.ready);
  const [downloading, setDownloading] = React.useState(false);
  const [history, setHistory] = React.useState<DownloadEntry[]>([]);
  const [progress, setProgress] = React.useState(0);
  const [jobId, setJobId] = React.useState<string | null>(null);
  const [meta, setMeta] = React.useState<MetaInfo | null>(null);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [m3u8Url, setM3u8Url] = React.useState("");
  const [m3u8Files, setM3u8Files] = React.useState<File[]>([]);
  const [m3u8Busy, setM3u8Busy] = React.useState(false);
  const [m3u8Progress, setM3u8Progress] = React.useState(0);
  const [m3u8JobId, setM3u8JobId] = React.useState<string | null>(null);
  const [selectedHistory, setSelectedHistory] = React.useState<Set<string>>(new Set());
  const [logs, setLogs] = React.useState<string[]>([]);
  const m3u8FileRef = React.useRef<HTMLInputElement | null>(null);
  const [visits, setVisits] = React.useState<number | null>(null);

  const loadHistory = React.useCallback(async () => {
    const res = await fetch("/api/downloads", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as DownloadEntry[];
    setHistory(data);
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("locale");
    if (saved === "EN" || saved === "KR" || saved === "JP") {
      setLocale(saved);
    }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const savedJob = window.localStorage.getItem("m3u8_job_id");
    if (savedJob) {
      setM3u8JobId(savedJob);
    }
  }, []);

  React.useEffect(() => {
    if (!m3u8JobId) return;
    let alive = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/m3u8/progress/${m3u8JobId}`, { cache: "no-store" });
        if (!res.ok) {
          if (res.status === 404) {
            setM3u8JobId(null);
            setM3u8Progress(0);
            window.localStorage.removeItem("m3u8_job_id");
          }
          return;
        }
        const data = (await res.json()) as { status: string; progress: number; error?: string; fileName?: string };
        if (!alive) return;
        setM3u8Progress(data.progress ?? 0);
        if (data.status === "done") {
          setStatus(`OK: ${data.fileName ?? ""}`);
          addLog(`[M3U8] 완료: ${data.fileName ?? ""}`);
          setM3u8Busy(false);
          setM3u8JobId(null);
          window.localStorage.removeItem("m3u8_job_id");
          await loadHistory();
          clearInterval(interval);
        }
        if (data.status === "error") {
          setStatus(`실패: ${data.error ?? "Unknown error"}`);
          addLog(`[M3U8] 실패: ${data.error ?? "Unknown error"}`);
          setM3u8Busy(false);
          setM3u8JobId(null);
          window.localStorage.removeItem("m3u8_job_id");
          clearInterval(interval);
        }
      } catch {
        // ignore
      }
    }, 1000);

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [m3u8JobId, loadHistory]);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`].slice(-200));
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const resetM3u8File = () => {
    setM3u8Files([]);
    if (m3u8FileRef.current) {
      m3u8FileRef.current.value = "";
    }
  };

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const bump = async () => {
      try {
        const res = await fetch("/api/visits", { method: "POST" });
        if (!res.ok) return;
        const data = (await res.json()) as { count?: number };
        if (typeof data.count === "number") {
          setVisits(data.count);
        }
      } catch {
        // ignore
      }
    };
    bump();
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    if (typeof window !== "undefined") {
      window.localStorage.setItem("locale", locale);
    }
    setStatus(copy[locale].ready);
  }, [hydrated, locale]);

  React.useEffect(() => {
    if (view === "download") {
      loadHistory();
    }
  }, [loadHistory, view]);

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
          setStatus(`${t.statusDownloading} ${Math.round(data.progress ?? 0)}%`);
        }
        if (data.status === "queued") {
          setStatus(t.statusQueued);
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
        }
      } catch {
        // ignore
      }
    }, 1000);

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [jobId, loadHistory, t]);

  const onAnalyze = async () => {
    if (!url.trim()) {
      setStatus(t.statusMissingUrl);
      return;
    }
    setAnalyzing(true);
    addLog(`[YouTube] 메타 조회 시작`);
    try {
      const res = await fetch("/api/meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        setAnalyzing(false);
        addLog(`[YouTube] 메타 조회 실패`);
        return;
      }
      const data = (await res.json()) as MetaInfo;
      setMeta(data);
      addLog(`[YouTube] 메타 조회 완료`);
    } finally {
      setAnalyzing(false);
    }
  };

  const onDownload = async () => {
    if (!url.trim()) {
      setStatus(t.statusMissingUrl);
      return;
    }
    setDownloading(true);
    setProgress(0);
    setStatus(t.statusPreparing);
    addLog(`[YouTube] 다운로드 시작`);

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, format }),
      });

      if (!res.ok) {
        const data = await res.json();
        setStatus(`실패: ${data?.error ?? "Unknown error"}`);
        addLog(`[YouTube] 실패: ${data?.error ?? "Unknown error"}`);
        setDownloading(false);
        return;
      }

      const data = (await res.json()) as { jobId: string };
      setJobId(data.jobId);
      setStatus(t.statusQueued);
    } catch (error) {
      setStatus(`실패: ${error instanceof Error ? error.message : "Unknown error"}`);
      addLog(`[YouTube] 실패: ${error instanceof Error ? error.message : "Unknown error"}`);
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

  const onM3u8File = async () => {
    if (m3u8Files.length === 0) {
      setStatus(t.statusMissingUrl);
      return;
    }
    setM3u8Busy(true);
    try {
      for (const file of m3u8Files) {
        addLog(`[M3U8] 파일 변환 시작: ${file.name}`);
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/m3u8/file", { method: "POST", body: formData });
        if (!res.ok) {
          const data = await res.json();
          setStatus(`실패: ${data?.error ?? "Unknown error"}`);
          addLog(`[M3U8] 실패: ${data?.error ?? "Unknown error"}`);
          continue;
        }
        const data = (await res.json()) as { jobId: string };
        setM3u8JobId(data.jobId);
        window.localStorage.setItem("m3u8_job_id", data.jobId);
        setM3u8Progress(0);
        setStatus(t.statusQueued);
      }
    } finally {
      setM3u8Busy(false);
    }
  };

  const onM3u8Url = async () => {
    if (!m3u8Url.trim()) {
      setStatus(t.statusMissingUrl);
      return;
    }
    setM3u8Busy(true);
    addLog(`[M3U8] URL 변환 시작: ${m3u8Url}`);
    try {
      const res = await fetch("/api/m3u8/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: m3u8Url }),
      });
      if (!res.ok) {
        const data = await res.json();
        setStatus(`실패: ${data?.error ?? "Unknown error"}`);
        addLog(`[M3U8] 실패: ${data?.error ?? "Unknown error"}`);
        return;
      }
      const data = (await res.json()) as { jobId: string };
      setM3u8JobId(data.jobId);
      window.localStorage.setItem("m3u8_job_id", data.jobId);
      setM3u8Progress(0);
      setStatus(t.statusQueued);
    } finally {
      setM3u8Busy(false);
    }
  };

  const toggleHistory = (name: string) => {
    setSelectedHistory((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const clearSelectedHistory = async () => {
    if (selectedHistory.size === 0) return;
    const names = Array.from(selectedHistory);
    const res = await fetch("/api/downloads/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ names }),
    });
    if (res.ok) {
      setSelectedHistory(new Set());
      await loadHistory();
    }
  };

  const statusTone = React.useMemo(() => {
    if (
      downloading ||
      status.includes("다운로드") ||
      status.includes("Downloading") ||
      status.includes("待機") ||
      status.includes("Queued")
    ) {
      return "bg-amber-400";
    }
    if (
      status.toLowerCase().includes("fail") ||
      status.includes("실패") ||
      status.includes("error") ||
      status.includes("失敗")
    ) {
      return "bg-red-500";
    }
    if (
      status.toLowerCase().includes("ok") ||
      status.includes("완료") ||
      status.includes("completed") ||
      status.includes("完了")
    ) {
      return "bg-emerald-500";
    }
    return "bg-slate-400";
  }, [downloading, status]);

  const nav = [
    { label: t.navDownload, href: "/" },
    { label: t.navM3u8, href: "/m3u8" },
    { label: t.navSettings, href: "/settings" },
  ];

  const bestLabel = meta?.bestHeight ? `${meta.bestHeight}p` : t.metaUnknown;
  const sizeLabel =
    meta?.sizeBytes && meta.sizeBytes > 0
      ? `${(meta.sizeBytes / (1024 * 1024)).toFixed(1)} MB`
      : t.metaUnknown;
  const formatSizeLabel = (key: "best" | "1080" | "720" | "480") => {
    const size = meta?.sizeMap?.[key];
    if (!size || size <= 0) return t.metaUnknown;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

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
                <img src="/icon.svg" alt="SsunEdu" className="h-6 w-6" />
              </div>
              {!collapsed && (
                <div className="text-lg font-semibold italic tracking-tight font-brand">쑨에듀</div>
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
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm font-medium transition",
                    active
                      ? "bg-primary text-primary-foreground shadow"
                      : "text-foreground/70 hover:bg-muted/60"
                  )}
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-current" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
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
                {t.settings}
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
                    {t.theme}
                  </div>
                )}
                <Switch
                  checked={isDark}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                  aria-label="Toggle theme"
                />
              </div>
              <Link
                href="/support"
                className={cn(
                  "mt-3 inline-flex items-center justify-center rounded-full border border-border/50 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition hover:bg-muted/40",
                  collapsed && "mx-auto"
                )}
              >
                {t.navSupport}
              </Link>
              <div
                className={cn(
                  "mt-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground",
                  collapsed && "text-center"
                )}
              >
                {t.visitors}: {visits ?? "-"}
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
              <h1 className="text-2xl font-semibold">
                {view === "settings"
                  ? t.settingsTitle
                  : view === "support"
                    ? t.supportTitle
                    : view === "m3u8"
                      ? t.m3u8Title
                      : t.title}
              </h1>
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

          {view === "download" && (
            <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm">
                <h2 className="text-lg font-semibold">{t.downloadCenter}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{t.downloadDesc}</p>

                <div className="mt-6 grid gap-4">
                  <>
                    <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {t.urlLabel}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <input
                            className="min-w-[220px] flex-1 rounded-xl border border-border/60 bg-background px-4 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={url}
                            onChange={(event) => setUrl(event.target.value)}
                          />
                          <Button
                            variant="outline"
                            className="rounded-xl"
                            onClick={onAnalyze}
                            disabled={analyzing}
                          >
                            <Search className="mr-2 h-4 w-4" />
                            {analyzing ? t.analyzing : t.analyze}
                          </Button>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          {t.metaTitle}
                        </p>
                        <p className="mt-2 text-sm line-clamp-2">
                          {meta?.title ?? t.metaUnknown}
                        </p>
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
                          {formats.map((item) => {
                            let label = item;
                            if (item === "Best (Video+Audio)") {
                              label = `Best (${formatSizeLabel("best")})`;
                            } else if (item === "1080p") {
                              label = `1080p (${formatSizeLabel("1080")})`;
                            } else if (item === "720p") {
                              label = `720p (${formatSizeLabel("720")})`;
                            } else if (item === "480p") {
                              label = `480p (${formatSizeLabel("480")})`;
                            }
                            return (
                              <option key={item} value={item}>
                                {label}
                              </option>
                            );
                          })}
                        </select>
                        {format === "Best (Video+Audio)" && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            {t.metaBest}: {bestLabel}
                          </p>
                        )}
                      </div>

                      <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{t.progress}</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="mt-3" />
                      </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <Button className="rounded-2xl" onClick={onDownload} disabled={downloading}>
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

                    <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          {t.logTitle}
                        </p>
                        <Button variant="ghost" size="sm" onClick={clearLogs}>
                          {t.logClear}
                        </Button>
                      </div>
                      <div className="mt-3 h-40 overflow-auto rounded-xl bg-black/70 p-3 font-mono text-[11px] text-green-200">
                        {logs.length === 0
                          ? t.logEmpty
                          : logs.map((line, idx) => <div key={idx}>{line}</div>)}
                      </div>
                    </div>
                  </>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">{t.history}</h2>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={clearSelectedHistory}>
                        {t.deleteSelected}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={loadHistory}>
                        {t.refresh}
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {history.length === 0 && (
                      <p className="text-sm text-muted-foreground">{t.emptyHistory}</p>
                    )}
                    {history.map((item) => (
                      <div
                        key={`${item.name}-${item.createdAt}`}
                        className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border border-border/60 bg-background/70 px-4 py-3"
                      >
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={selectedHistory.has(item.name)}
                            onChange={() => toggleHistory(item.name)}
                          />
                        </label>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(item.size / (1024 * 1024)).toFixed(1)} MB · {item.format ?? ""}
                          </p>
                        </div>
                        <a
                          className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1 text-sm hover:bg-muted/40"
                          href={`/api/downloads/${encodeURIComponent(item.name)}`}
                        >
                          <Download className="h-4 w-4" />
                          {t.downloadFile}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {view === "settings" && (
            <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
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
                    <p className="text-sm font-medium">{t.language}</p>
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
                <h2 className="text-lg font-semibold">{t.sponsor}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{t.sponsorText}</p>
                <div className="mt-6 rounded-2xl border border-border/60 bg-background/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {t.sponsor}
                  </p>
                  <p className="mt-2 text-base">{t.sponsorText}</p>
                </div>
              </div>
            </section>
          )}

          {view === "m3u8" && (
            <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm">
                <h2 className="text-lg font-semibold">{t.m3u8Title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{t.m3u8Hint}</p>

                <div className="mt-6 grid gap-4">
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {t.m3u8FileLabel}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <input
                        ref={m3u8FileRef}
                        type="file"
                        accept=".m3u8"
                        className="hidden"
                        multiple
                        onChange={(event) =>
                          setM3u8Files(event.target.files ? Array.from(event.target.files) : [])
                        }
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => m3u8FileRef.current?.click()}
                      >
                        {t.m3u8Upload}
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        {m3u8Files.length > 0
                          ? `${m3u8Files.length} files`
                          : t.m3u8NoFile}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetM3u8File}
                        disabled={m3u8Files.length === 0}
                      >
                        {t.m3u8Reset}
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-xl"
                        onClick={onM3u8File}
                        disabled={m3u8Busy || m3u8Files.length === 0}
                      >
                        <FileVideo className="mr-2 h-4 w-4" />
                        {m3u8Busy ? t.analyzing : t.m3u8Convert}
                      </Button>
                    </div>
                    {m3u8Files.length > 0 && (
                      <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                        {m3u8Files.map((file) => (
                          <li key={file.name} className="truncate">
                            {file.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {t.m3u8UrlLabel}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <input
                        className="min-w-[220px] flex-1 rounded-xl border border-border/60 bg-background px-4 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        placeholder="https://example.com/playlist.m3u8"
                        value={m3u8Url}
                        onChange={(event) => setM3u8Url(event.target.value)}
                      />
                      <Button
                        variant="outline"
                        className="rounded-xl"
                        onClick={onM3u8Url}
                        disabled={m3u8Busy}
                      >
                        <Wand2 className="mr-2 h-4 w-4" />
                        {m3u8Busy ? t.analyzing : t.m3u8UrlConvert}
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t.progress}</span>
                      <span>{Math.round(m3u8Progress)}%</span>
                    </div>
                    <Progress value={m3u8Progress} className="mt-3" />
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className={`h-2.5 w-2.5 rounded-full ${statusTone}`} />
                    {status}
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {t.logTitle}
                      </p>
                      <Button variant="ghost" size="sm" onClick={clearLogs}>
                        {t.logClear}
                      </Button>
                    </div>
                    <div className="mt-3 h-40 overflow-auto rounded-xl bg-black/70 p-3 font-mono text-[11px] text-green-200">
                      {logs.length === 0
                        ? t.logEmpty
                        : logs.map((line, idx) => <div key={idx}>{line}</div>)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-semibold">{t.history}</h2>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant="outline" size="sm" onClick={clearSelectedHistory}>
                        {t.deleteSelected}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={loadHistory}>
                        {t.refresh}
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {history.length === 0 && (
                      <p className="text-sm text-muted-foreground">{t.emptyHistory}</p>
                    )}
                    {history.map((item) => (
                      <div
                        key={`${item.name}-${item.createdAt}`}
                        className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border border-border/60 bg-background/70 px-4 py-3"
                      >
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={selectedHistory.has(item.name)}
                            onChange={() => toggleHistory(item.name)}
                          />
                        </label>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(item.size / (1024 * 1024)).toFixed(1)} MB · {item.format ?? ""}
                          </p>
                        </div>
                        <a
                          className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1 text-sm hover:bg-muted/40"
                          href={`/api/downloads/${encodeURIComponent(item.name)}`}
                        >
                          <Download className="h-4 w-4" />
                          {t.downloadFile}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {view === "support" && (
            <section className="max-w-3xl">
              <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm">
                <h2 className="text-lg font-semibold">{t.supportTitle}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{t.supportDesc}</p>
                <div className="mt-6 space-y-3 rounded-2xl border border-border/60 bg-background/70 p-4 text-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {t.supportContact}
                  </p>
                  <p>{t.supportEmail}</p>
                  <p>{t.supportHours}</p>
                  <p>{t.supportOwner}</p>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

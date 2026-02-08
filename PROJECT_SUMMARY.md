# Project Summary

Base directory: `C:\Users\tnsqo\sunbae\youtube_download`

## Root
- `main.py`
  - PySide6 기반 YouTube 다운로드 데스크톱 앱.
  - URL 입력, 폴더 선택, 해상도/오디오 선택, 진행률 표시, 로그 출력.
  - 파일명 충돌 방지를 위해 `[id]`가 포함된 파일명 템플릿 사용.
  - 경고/에러 로그 출력 개선.
  - URL 자동 추출(예: `URL: https://...` 형태도 인식).
- `requirements.txt`
  - PySide6, yt-dlp 의존성.
- `README.txt`
  - 파이썬 앱 실행 방법 요약.

## Web App (Next.js + React + TS + Tailwind + shadcn/ui)
- `package.json`
  - Next.js + Tailwind + shadcn/ui + next-themes + yt-dlp-exec + lucide-react.
- `downloads/`
  - 서버(로컬) 다운로드 파일 저장 폴더.
  - `manifest.json`에 최근 다운로드 히스토리 저장.

### src/app
- `layout.tsx`
  - 폰트 구성(브랜드/메인), ThemeProvider 설정.
- `globals.css`
  - shadcn/ui 테마 변수, 배경 그라디언트, `font-brand` 클래스.
- `page.tsx`
  - `AppShell` 렌더링.

### src/components
- `app-shell.tsx`
  - 좌측 GNB(접힘/펼침), 로고(쑨에듀 italic).
  - 다운로드 UI: URL 입력, 폴더 선택, 포맷 선택.
  - 진행률(Progress), 상태 표시(신호등 UI).
  - 다운로드 히스토리 리스트 + 파일 다운로드 링크.
  - 테마 토글, 언어 토글(EN/KR/JP), 후원 계좌(임시 텍스트).
- `theme-provider.tsx`
  - `next-themes` 래퍼.

### src/components/ui (shadcn/ui)
- `button.tsx`, `switch.tsx`, `separator.tsx`, `progress.tsx`
  - 기본 UI 컴포넌트.

### src/app/api
- `download/route.ts`
  - 다운로드 작업 생성 API.
- `progress/[id]/route.ts`
  - 다운로드 진행률 조회 API.
- `cancel/[id]/route.ts`
  - 다운로드 중지 API.
- `downloads/route.ts`
  - 다운로드 히스토리 조회 API.
- `downloads/[name]/route.ts`
  - 파일 다운로드 스트리밍 API.
  - 한글 파일명 대응(Content-Disposition 이중 설정).

### src/lib
- `download-jobs.ts`
  - 다운로드 작업/프로세스 상태 관리.
  - yt-dlp 실행 및 진행률 파싱.
  - 취소 처리 및 히스토리 저장.

## 실행 방법

### 데스크톱 앱
```powershell
pip install -r requirements.txt
python main.py
```

### 웹 앱
```powershell
npm install
npm run dev
```

## 주의사항
- `Audio Only (MP3)`는 `ffmpeg` 설치 필요.
- 폴더 선택 기능은 브라우저(Chrome/Edge) + localhost 환경에서 동작.

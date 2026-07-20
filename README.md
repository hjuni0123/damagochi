# 쓔 키우기 프로젝트

중기부 청년인턴 정책 체험 게이미피케이션 프로그램. 팀(권역) 단위로 중기부 마스코트 '쓔'를 육성하며 정책 현장 미션(백년가게·온누리·전통시장·팀미션·정책행사)을 인증하고, XP·쓔코인·레벨·아이템·업적·랭킹으로 이어지는 성장 루프를 제공하는 모바일 우선 PWA입니다.

## 기술 스택

- **Next.js 16** (App Router, Turbopack) + TypeScript
- **Tailwind CSS v4**
- **Prisma 6 + PostgreSQL** (Vercel + Neon 무료 배포 기준)
- **framer-motion** (레벨업/XP바/카드 애니메이션)
- 쿠키 기반 자체 세션 인증 (팀 로그인 / 관리자 로그인 분리)
- PWA manifest + service worker (오프라인 셸 캐싱)

## 시작하기 (로컬)

로컬에 PostgreSQL이 필요합니다. `.env.example`을 `.env`로 복사하고 `DATABASE_URL`을 본인 Postgres 접속 정보로 채우세요 (git에는 커밋되지 않습니다).

```bash
cp .env.example .env   # DATABASE_URL을 실제 값으로 수정
npm install             # postinstall에서 prisma generate 자동 실행
npm run setup            # 최초 1회: 마이그레이션 + 시드 데이터
npm run dev
```

`http://localhost:3000` 접속. 최초 진입 시 로그인 여부에 따라 `/login`(팀) 또는 `/home`으로 리다이렉트됩니다.

## 배포 (Vercel)

1. Vercel에서 이 저장소를 Import
2. **Storage** 탭 → **Create Database** → **Neon (Postgres)** 로 DB 생성 후 프로젝트에 **Connect** — `DATABASE_URL` 환경변수가 자동 주입됩니다
3. **Deploy** — 빌드 시 `vercel-build` 스크립트(`prisma migrate deploy && seed && next build`)가 자동으로 테이블 생성과 초기 데이터 시드까지 처리합니다
4. `DATABASE_URL`이 설정되지 않은 채로 배포하면 빌드가 실패합니다(로컬 `.env`는 배포에 포함되지 않음) — 이 경우 Storage 연결 여부를 다시 확인하세요. `/api/health`로 배포된 앱의 DB 연결 상태를 확인할 수 있습니다.

### 로그인 정보 (seed 기준)

- **팀 로그인**: `seoul` / `busan` / `daegu` / `incheon` / `gwangju` / `daejeon` / `ulsan` / `chungbuk`, 비밀번호 `ssyu1234`
- **관리자 로그인**: `/admin/login` → 아이디 `admin`, 비밀번호 `admin1234`

실제 운영 전 반드시 팀/관리자 비밀번호를 변경하세요 (관리자 → 팀 관리에서 비밀번호 재설정 가능).

## 핵심 게임 루프

```
팀 생성 → 쓔 지급(알) → 미션 인증(사진 업로드) → 관리자 승인(클릭 1번)
→ XP·쓔코인 자동 지급 → 레벨업 → 퀘스트/업적 자동 체크 → 상점에서 아이템 구매
→ 쓔 꾸미기(레이어 합성) → 랭킹/명예의 전당 반영
```

- **XP**: 레벨업 전용 재화. 레벨 테이블은 `src/lib/levels.ts` (Lv1 알 → Lv6 정책마스터, 임계치 0/100/300/700/1500/3100)
- **쓔코인**: 상점 재화. 미션·퀘스트·업적 보상으로 획득, 상점에서 소비
- **업적**: 달성 전까지 `???`로 숨김 처리 (`src/lib/game.ts`의 `checkAchievements`가 미션 승인·출석마다 자동 평가)
- **퀘스트**: 일일/주간 퀘스트 풀에서 팀별로 랜덤 배정 (`src/lib/quests.ts`), 인증/댓글/출석 트리거로 자동 진행
- **랜덤 이벤트**: 관리자가 버튼 클릭 한 번으로 전체 팀에 코인 2배·XP 3배 등 시간제한 이벤트 발동 (`/admin/events`)

## 폴더 구조

```
prisma/schema.prisma       데이터 모델 (Team, Item, Mission, Quest, Achievement, ...)
prisma/seed.ts             데모 데이터 시더
src/lib/                   레벨링, 인증, 게임 로직(승인→보상→업적), 퀘스트 배정
src/components/SsyuAvatar  레벨별 색상 + 아이템 레이어 합성 캐릭터 컴포넌트
src/app/(app)/             팀(사용자) 화면: 홈, 미션, 쓔꾸미기(상점), 랭킹, 퀘스트, 업적, 갤러리, 알림, 명예의 전당
src/app/admin/(dashboard)/ 관리자 화면: 승인 대기, 팀/미션/아이템/업적/퀘스트 관리, 랜덤 이벤트
src/app/api/                REST 라우트 핸들러 (팀/관리자 각각 세션 검증)
```

## 관리자 운영 가이드

- **승인**: `/admin/approvals`에서 사진 확인 → 승인 클릭 한 번으로 XP·코인 지급, 레벨업 판정, 퀘스트 진행, 업적 체크, 활동 피드 기록이 모두 자동 처리됩니다.
- **콘텐츠 편집**: 미션 보상치, 상점 가격, 업적 조건, 퀘스트 보상은 모두 관리자 페이지에서 즉시 수정 가능하며 DB 재배포가 필요 없습니다.
- **팀 관리**: `/admin/teams`에서 팀 생성 및 XP/코인 수동 보정 가능 (이벤트 보정 등 예외 상황용).

## 알려진 한계 (MVP 범위)

- 인증 사진은 DB(`MissionSubmission.photoData`, bytea)에 직접 저장되어 서버리스 배포에서도 동작합니다. 사용량이 많아지면 S3 등 오브젝트 스토리지로 교체를 권장합니다.
- PWA 아이콘은 SVG 플레이스홀더입니다. 배포 전 실제 브랜드 아이콘(PNG, 다양한 해상도)으로 교체를 권장합니다.
- 랭킹/갤러리는 요청마다 전체 팀을 순회하여 집계합니다 — 팀 수가 수십 개 이하인 이 프로그램 규모에서는 충분하지만, 대규모 확장 시 캐싱/집계 테이블이 필요합니다.

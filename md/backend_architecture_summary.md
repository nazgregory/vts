# 백엔드 아키텍처 요약

## 개요
- **프로젝트명**: 데이터 시각화 도구 트래킹 서버
- **버전**: 1.0.0
- **최종 업데이트**: 2026-10-21
- **기술 스택**: Node.js 18 + Express + TypeScript + Prisma + PostgreSQL
- **역할**: 차트 화면의 사용 이력과 만족도를 저장한다. 차트 렌더링은 브라우저에서 한다.
- **진입점**: `server/src/index.ts`
- **포트**: `PORT` (기본 3001). `0.0.0.0`에 바인딩한다.

관리자 API, 메시지 API, 분석 대시보드, 데이터 자동 삭제 스케줄러는 이 배포본에 없다.

## 계층

| 계층 | 구성 |
| --- | --- |
| 라우트 | `session.ts`, `collect.ts`, `satisfaction.ts` |
| 서비스 | `SessionService`, `EventService` |
| 데이터 | Prisma, PostgreSQL |
| 인프라 | Helmet, CORS, 속도 제한, IP 추출, 요청 로그, Pino |

만족도 저장은 별도 서비스 없이 `routes/satisfaction.ts`에서 Prisma를 직접 호출한다.

## API

### 세션
- `POST /api/session/start` — 세션 생성. 응답은 `{ sid }`
- `POST /api/session/validate` — 본문 `{ sid }`로 세션 존재 여부 확인

세션 시작은 15분에 100회, 이벤트 수집은 1분에 200회로 제한한다.

IP는 `IP_SALT`와 합쳐 SHA-256으로 해시해 저장한다. 원본 IP는 테이블에 넣지 않는다. `approxGeo`는 좌표가 아니라 `intranet` 또는 `external` 구분이다. User-Agent에 bot, crawler, spider, scraper가 있으면 세션 생성을 거절한다.

`trust proxy`는 `loopback`이다. Nginx가 같은 서버에서 프록시할 때만 `X-Forwarded-For`를 신뢰한다.

### 이벤트
- `POST /api/collect` — 세션 ID와 이벤트 배열. 한 요청에 최대 200건

카테고리는 `page`, `upload`, `chart`, `gallery`, `customize`, `download`, `error`, `satisfaction`이다. 파일 행은 이름, 크기, 행·열 수, MIME만 저장하고 파일 내용은 저장하지 않는다.

### 만족도
- `POST /api/satisfaction-ratings` — 차트 유형, 추천 여부(`recommend` / `not_recommend`), 별점(0–5)

### 상태
- `GET /` — 서버 이름과 버전
- `GET /health` — 상태, 업타임, 메모리

## 데이터 모델

Prisma 스키마는 `server/prisma/schema.prisma`이다.

- **sessions**: `ipHash`, User-Agent, `firstSeenAt`, `lastSeenAt`, `approxGeo`, `networkBucket`
- **events**: 세션, 시각, 카테고리, 이름, 경로, JSON 페이로드
- **files**: 업로드 파일 메타데이터
- **charts**: 차트 유형, 라이브러리, 렌더 시간, 성공 여부
- **downloads**: 차트와 세션, 파일 형식
- **errors**: 오류 메시지와 시각
- **satisfaction_ratings**: 차트 유형, 구분(`visualization`, `customization`, `gallery`), 추천 여부, 별점

## 보안

- CORS는 `ALLOWED_ORIGINS`에 적힌 출처만 허용한다. 기본값은 `http://localhost:3000`이다.
- 요청 본문 상한은 1MB이다.
- Helmet으로 보안 헤더를 붙인다.
- 오류 응답에는 스택을 넣지 않는다. 스택은 서버 로그에만 남긴다.

## 환경변수

`server/env.example`을 `server/.env`로 복사한다.

- `DATABASE_URL` — PostgreSQL 접속 문자열
- `IP_SALT` — IP 해시 소금값
- `ALLOWED_ORIGINS` — 브라우저 출처. 쉼표로 구분
- `PORT` — 기본 3001
- `NODE_ENV`
- `BATCH_MAX` — 예시 값 200. 수집 API의 상한은 스키마에서 200으로 고정한다.
- `LOG_LEVEL` — `error`, `warn`, `info`, `debug`

## 배포

프론트 정적 파일과 `/api` 프록시 예시는 `deploy/nginx.conf`, 프로세스 예시는 `deploy/pm2.config.cjs`이다. 비밀은 PM2 설정에 넣지 않고 `server/.env`에서 읽는다.

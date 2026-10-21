# 데이터 시각화 도구 트래킹 서버

> IP 기반 사용자 트래킹을 위한 Node.js 백엔드 서버

## 📊 프로젝트 개요

데이터 시각화 도구의 사용자 행동을 추적하고 분석하기 위한 백엔드 서버입니다. 로그인 없이 IP 기반으로 사용자를 식별하고, 이벤트 소싱 방식으로 사용자 활동을 수집합니다.

## ✨ 주요 기능

### 🔐 보안 및 개인정보 보호
- **IP 해시화**: 원본 IP 주소를 SHA-256으로 해시화하여 저장
- **봇 필터링**: User Agent 기반 봇/크롤러 감지 및 차단
- **속도 제한**: IP 기반 요청 속도 제한으로 DDoS 방지

### 📈 이벤트 수집
- **배치 처리**: 최대 200개 이벤트를 한 번에 처리
- **실시간 수집**: 클라이언트 시간과 서버 시간 동기화
- **이벤트 소싱**: 모든 사용자 활동을 이벤트로 기록
- **메타데이터 수집**: 파일, 차트, 다운로드 메타데이터 저장

## 🛠 기술 스택

### Backend
- **Node.js 18+** - 런타임 환경
- **Express.js** - 웹 프레임워크
- **TypeScript 5.3** - 타입 안전성
- **Prisma** - ORM 및 데이터베이스 마이그레이션
- **PostgreSQL** - 메인 데이터베이스

### 보안 및 미들웨어
- **Helmet** - 보안 헤더 설정
- **CORS** - 크로스 오리진 리소스 공유
- **Rate Limiting** - 요청 속도 제한
- **Compression** - 응답 압축

### 로깅 및 모니터링
- **Pino** - 고성능 로깅
- **Zod** - 스키마 검증
- **Crypto** - 해시 및 암호화

## 🚀 설치 및 실행

### 필수 요구사항
- Node.js >= 18.0.0
- PostgreSQL >= 13.0
- npm >= 9.0.0

### 설치
```bash
# 서버 디렉토리로 이동
cd server

# 의존성 설치
npm install

# 환경변수 설정
cp env.example .env
# .env 파일을 편집하여 데이터베이스 URL과 보안 설정을 구성
```

### 데이터베이스 설정
```bash
# Prisma 클라이언트 생성
npm run db:generate

# 데이터베이스 스키마 적용
npm run db:push

# (선택) 마이그레이션 파일 생성
npm run db:migrate
```

### 개발 서버 실행
```bash
# 개발 서버 시작 (핫 리로드)
npm run dev

# 프로덕션 빌드
npm run build
npm start
```

## 📁 프로젝트 구조

```
server/
├── src/
│   ├── services/           # 비즈니스 로직
│   │   ├── sessionService.ts    # 세션 관리
│   │   └── eventService.ts      # 이벤트 수집
│   ├── routes/             # API 라우트
│   │   ├── session.ts           # 세션 API
│   │   └── collect.ts           # 이벤트 수집 API
│   ├── middleware/         # 미들웨어
│   │   └── security.ts          # 보안 미들웨어
│   ├── utils/              # 유틸리티
│   │   ├── security.ts          # 보안 유틸리티
│   │   └── logger.ts            # 로깅 설정
│   ├── types/              # TypeScript 타입
│   │   └── index.ts             # API 스키마 및 타입
│   └── index.ts            # 서버 진입점
├── prisma/
│   └── schema.prisma       # 데이터베이스 스키마
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 환경변수 설정

```env
# 데이터베이스 설정
DATABASE_URL="postgresql://username:password@localhost:5432/visualization_tracking"

# 보안 설정
IP_SALT="change_me_to_secure_random_string"
ALLOWED_ORIGINS="http://localhost:3000"

# 서버 설정
PORT=3001
NODE_ENV="development"

# 트래킹 설정
BATCH_MAX=200

# 로깅 설정
LOG_LEVEL="info"
```

## 📡 API 엔드포인트

### 세션 관리
- `POST /api/session/start` - 세션 시작
- `POST /api/session/validate` - 세션 유효성 검증

### 이벤트 수집
- `POST /api/collect` - 이벤트 배치 수집

### 만족도
- `POST /api/satisfaction-ratings` - 차트 만족도 저장

## 📊 데이터 모델

### Sessions (세션)
- IP 해시 기반 사용자 식별
- User Agent, 네트워크 버킷, intranet/external 구분
- 생성/마지막 접근 시간

### Events (이벤트)
- 범용 이벤트 소싱
- 카테고리별 이벤트 분류
- JSONB 페이로드로 세부 정보 저장

### Files, Charts, Downloads, Errors
- 각각의 메타데이터 테이블
- 세션과의 관계 설정

## 🔒 보안 고려사항

### 개인정보 보호
- 원본 IP 주소 저장 금지
- 해시된 IP만 저장하여 고유성 확보
- 파일 내용 수집 금지 (메타데이터만)

### 접근 제어
- IP 기반 속도 제한
- CORS 정책 적용

## 🧪 테스트

```bash
# 타입 체크
npm run type-check

# 린트 검사
npm run lint

# 린트 자동 수정
npm run lint:fix
```

## 📈 모니터링

### 로그 레벨
- `error`: 오류 및 예외 상황
- `warn`: 경고 및 보안 이슈
- `info`: 일반적인 정보
- `debug`: 상세한 디버그 정보

### 메트릭
- 요청 처리 시간
- 데이터베이스 쿼리 성능
- 메모리 사용량
- 오류율

## 🚀 배포

### Docker (권장)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

### PM2
```bash
npm install -g pm2
pm2 start dist/index.js --name "tracking-server"
pm2 startup
pm2 save
```

## 📞 문의

- **개발팀**: 서초구청 스마트도시과 AI빅데이터팀
- **연락처**: 02-2155-6089
- **이메일**: irize@seocho.go.kr

## 📄 라이선스

ⓒ 2025 서초구청 AI빅데이터팀 All rights reserved

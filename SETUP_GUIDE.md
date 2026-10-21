# 데이터 시각화 도구 트래킹 시스템 설정 가이드

[English](./SETUP_GUIDE.en.md)

> IP 기반 사용자 트래킹 설정 및 실행 가이드

## 📋 목차

1. [시스템 요구사항](#시스템-요구사항)
2. [백엔드 서버 설정](#백엔드-서버-설정)
3. [프론트엔드 설정](#프론트엔드-설정)
4. [데이터베이스 설정](#데이터베이스-설정)
5. [환경변수 설정](#환경변수-설정)
6. [실행 및 테스트](#실행-및-테스트)
7. [문제 해결](#문제-해결)

## 🖥 시스템 요구사항

### 필수 소프트웨어
- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **PostgreSQL**: >= 13.0
- **Git**: 최신 버전

### 권장 사양
- **RAM**: 4GB 이상
- **저장공간**: 2GB 이상
- **네트워크**: 내부망 환경(단, 지도와 관련하여 카카오 API와 지도 바탕은 인터넷 환경이 필요함)

## 🔧 백엔드 서버 설정

### 1. 서버 디렉토리로 이동
```bash
cd server
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경변수 설정
```bash
cp env.example .env
```

`.env` 파일을 편집하여 다음 값들을 설정:
```env
# 데이터베이스 설정
DATABASE_URL="postgresql://postgres:password@localhost:5432/visualization_tracking"

# 보안 설정 (중요!)
IP_SALT="your-secure-random-salt-string-here"
ALLOWED_ORIGINS="http://localhost:3000"

# 서버 설정
PORT=3001
NODE_ENV="development"

# 트래킹 설정
BATCH_MAX=200

# 로깅 설정
LOG_LEVEL="info"
```

### 4. 데이터베이스 스키마 생성
```bash
# Prisma 클라이언트 생성
npm run db:generate

# 데이터베이스 스키마 적용
npm run db:push
```

### 5. 서버 실행
```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm run build
npm start
```

## 🎨 프론트엔드 설정

### 1. 루트 디렉토리로 이동
```bash
cd ..
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경변수 설정
```bash
cp env.example .env
```

`.env` 파일을 편집:
```env
# API 설정
VITE_API_SERVER_HOST=localhost
VITE_API_SERVER_PORT=3001
VITE_API_PROTOCOL=http

# 환경 설정
NODE_ENV=development
```

### 4. 개발 서버 실행
```bash
npm run dev
```

## 🗄 데이터베이스 설정

### PostgreSQL 설치 및 설정

#### Windows
1. [PostgreSQL 공식 사이트](https://www.postgresql.org/download/windows/)에서 다운로드
2. 설치 시 비밀번호 설정
3. pgAdmin 또는 psql로 데이터베이스 생성

#### macOS
```bash
# Homebrew 사용
brew install postgresql
brew services start postgresql

# 데이터베이스 생성
createdb visualization_tracking
```

#### Linux (Ubuntu/Debian)
```bash
# PostgreSQL 설치
sudo apt update
sudo apt install postgresql postgresql-contrib

# 서비스 시작
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 데이터베이스 생성
sudo -u postgres createdb visualization_tracking
```

### 데이터베이스 사용자 설정
```sql
-- PostgreSQL에 접속 후 실행
CREATE USER visualization_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE visualization_tracking TO visualization_user;
```

## 🔐 환경변수 설정

### 보안 설정 (중요!)

#### IP_SALT 생성
```bash
# Node.js로 안전한 랜덤 문자열 생성
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 환경별 설정

#### 개발 환경
```env
NODE_ENV=development
LOG_LEVEL=debug
```

#### 프로덕션 환경
```env
NODE_ENV=production
LOG_LEVEL=info
```

## 🚀 실행 및 테스트

### 1. 전체 시스템 실행

#### 터미널 1: 백엔드 서버
```bash
cd server
npm run dev
```

#### 터미널 2: 프론트엔드
```bash
npm run dev
```

### 2. 접속 확인
- **메인 앱**: http://localhost:3000
- **백엔드 API**: http://localhost:3001

### 3. API 테스트

#### 세션 시작 테스트
```bash
curl -X POST http://localhost:3001/api/session/start \
  -H "Content-Type: application/json" \
  -d '{
    "ua": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "client_time": "2025-01-03T10:00:00.000Z"
  }'
```

#### 이벤트 수집 테스트
```bash
curl -X POST http://localhost:3001/api/collect \
  -H "Content-Type: application/json" \
  -d '{
    "sid": "your-session-id-here",
    "events": [{
      "category": "page",
      "name": "page_view",
      "page_path": "/test",
      "success": true,
      "payload": {},
      "client_time": "2025-01-03T10:00:00.000Z"
    }]
  }'
```

## 🔍 문제 해결

### 일반적인 문제들

#### 1. 데이터베이스 연결 오류
```bash
# PostgreSQL 서비스 상태 확인
sudo systemctl status postgresql

# 연결 테스트
psql -h localhost -U visualization_user -d visualization_tracking
```

#### 2. 포트 충돌
```bash
# 포트 사용 확인
netstat -tulpn | grep :3001
netstat -tulpn | grep :5173

# 프로세스 종료
kill -9 <PID>
```

#### 3. 의존성 설치 오류
```bash
# 캐시 정리
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### 4. Prisma 오류
```bash
# Prisma 재생성
npx prisma generate
npx prisma db push --force-reset
```

### 로그 확인

#### 백엔드 로그
```bash
cd server
npm run dev
# 콘솔에서 실시간 로그 확인
```

#### 프론트엔드 로그
```bash
# 브라우저 개발자 도구 > Console 탭
# 네트워크 탭에서 API 요청 확인
```

### 성능 최적화

#### 데이터베이스 인덱스 확인
```sql
-- 인덱스 상태 확인
SELECT schemaname, tablename, indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('sessions', 'events', 'files', 'charts');
```

#### 메모리 사용량 모니터링
```bash
# Node.js 프로세스 메모리 사용량
ps aux | grep node

# PostgreSQL 메모리 사용량
ps aux | grep postgres
```

## 📈 모니터링 및 유지보수

### 1. 정기 작업
- **일일**: 로그 파일 확인, 오류율 모니터링
- **주간**: 데이터베이스 통계 확인, 성능 분석
- **월간**: 데이터 정리 작업, 보안 업데이트

### 2. 백업 전략
```bash
# 데이터베이스 백업
pg_dump -h localhost -U visualization_user visualization_tracking > backup_$(date +%Y%m%d).sql

# 복원
psql -h localhost -U visualization_user visualization_tracking < backup_20250103.sql
```

### 3. 보안 점검
- IP_SALT 정기 변경
- 데이터베이스 접근 권한 검토
- 로그 파일 보안 확인

## 📞 지원 및 문의

- **개발팀**: 서초구청 스마트도시과 AI빅데이터팀
- **연락처**: 02-2155-6089
- **이메일**: irize@seocho.go.kr

---

## 📄 라이선스

ⓒ 2025 서초구청 AI빅데이터팀 All rights reserved

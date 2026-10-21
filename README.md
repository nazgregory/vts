# 데이터 시각화 도구 (배포용 소스)

<p align="center">
  <a href="./README.md">한국어</a> | <a href="./README.en.md">English</a>
</p>

[![version](https://img.shields.io/badge/version-1.0.0-blue)](./package.json)
[![license](https://img.shields.io/badge/license-MIT-green)](./LICENSE.md)
[![node](https://img.shields.io/badge/node-%3E%3D18-339933?logo=nodedotjs&logoColor=white)](./package.json)
[![react](https://img.shields.io/badge/react-18.2.0-149ECA?logo=react&logoColor=white)](./package.json)
[![plotly.js](https://img.shields.io/badge/plotly.js-2.27.0-3D4C73)](./public/vendor/plotly-2.27.0.min.js)
[![leaflet](https://img.shields.io/badge/leaflet-1.9.4-199900)](./package.json)
[![typescript](https://img.shields.io/badge/typescript-5.9.2-3178C6?logo=typescript&logoColor=white)](./package.json)
[![vite](https://img.shields.io/badge/vite-4.5.14-646CFF?logo=vite&logoColor=white)](./package.json)
[![express](https://img.shields.io/badge/express-4.18.2-000000?logo=express&logoColor=white)](./server/package.json)
[![prisma](https://img.shields.io/badge/prisma-5.7.1-2D3748?logo=prisma&logoColor=white)](./server/package.json)

## 프로젝트 소개

[![사용 화면](https://img.youtube.com/vi/lZly16Eou30/hqdefault.jpg)](https://youtu.be/lZly16Eou30)
<p align="center">
  <a href="https://vts.seocho.go.kr">시각화 도구 사용해보기</a>
</p>

누구나 복잡한 데이터를 쉽고 직관적으로 이해하고 활용할 수 있도록 개발한 웹 기반 오픈소스 데이터 시각화 플랫폼입니다.

데이터 시각화는 복잡한 정보를 효과적으로 전달하고 데이터 기반 의사결정을 지원하는 중요한 수단입니다. 그러나 다양한 차트를 제작하기 위해서는 데이터 처리 역량과 전문적인 시각화 도구에 대한 이해가 필요하다는 어려움이 있습니다.

서초구는 이러한 기술적 진입장벽을 낮추고, 누구나 별도의 전문 지식 없이 데이터를 손쉽게 시각화할 수 있도록 본 서비스를 개발했습니다.

사용자는 CSV 및 Excel 파일을 업로드하여 21종의 차트를 간편하게 생성할 수 있으며, 다양한 커스터마이징 기능을 통해 차트의 디자인과 표현 방식을 목적에 맞게 조정할 수 있습니다. 또한 완성된 차트를 이미지 파일로 다운로드하여 보고서, 발표자료 등 다양한 업무에 활용할 수 있습니다.

본 프로젝트는 데이터 활용의 접근성을 높이고, 데이터 기반 의사결정과 행정업무의 효율성 향상을 지원하는 것을 목표로 합니다.

특히 다른 지방자치단체와 공공기관, 민간 개발자들이 자유롭게 소스코드를 활용하고 각자의 환경과 목적에 맞게 확장·발전시킬 수 있도록 프로젝트를 오픈소스로 공개합니다.

## 주요 기능

다양한 데이터 형식 지원: CSV 및 Excel 파일 업로드를 통한 데이터 시각화

21종의 차트 제공: 데이터의 특성과 분석 목적에 적합한 다양한 시각화 방식 지원

차트 커스터마이징: 색상, 레이아웃 등 다양한 디자인 요소를 사용자 목적에 맞게 설정

이미지 다운로드: 생성한 차트를 이미지 파일로 저장하여 보고서 및 발표자료 등에 활용

시각화 갤러리 : 다양한 차트 예제를 제공하여 사용자가 적절한 시각화 전략을 수립할 수 있도록 지원

[![사용 화면](https://img.youtube.com/vi/ATuh7xSUmv4/hqdefault.jpg)](https://youtu.be/ATuh7xSUmv4)


## 오픈소스 공개 및 활용 안내

본 저장소는 다른 기관과 개발자가 소스코드를 활용하여 자체 환경에 서비스를 구축·운영할 수 있도록 정리한 독립 배포용 소스코드 스냅샷입니다.

기관별 시스템 환경에 맞춰 자유롭게 수정·확장할 수 있으며, 보안과 독립적인 운영을 고려하여 추가적인 설계 및 개발이 필요할 수 있습니다.

프로젝트 라이선스는 MIT이고, Plotly·Leaflet·React의 라이선스 고지는 `LICENSE.md`에 따로 있습니다.

## 프로젝트 정보

|구분|내용|
|개발기관|서울특별시 서초구청|
|개발부서|스마트도시과 AI빅데이터팀|
|라이선스|MIT License (LICENSE.md)|
|주요 기술|React, Plotly, Leaflet, Node.js, PostgreSQL|
|실행 환경|Node.js 18 이상, npm 9 이상, PostgreSQL 13 이상|
|문의전화|02-2155-6089|
|문의메일|irize@seocho.go.kr|
※ Plotly, Leaflet, React 등 외부 라이브러리에는 각각의 라이선스가 적용되므로, 활용 및 재배포 시 해당 라이선스 조건을 별도로 확인해야 합니다.


## 프로젝트 구성

```
migration/
├── src/                  프론트엔드 (React 18 + TypeScript + Vite)
├── public/sample_data/   차트별 샘플 CSV와 XLSX
├── public/vendor/        Plotly 2.27.0, Leaflet 마커 이미지
├── server/               사용 이력 API (Express + Prisma)
│   ├── src/
│   ├── prisma/           스키마와 마이그레이션
│   └── env.example
├── deploy/
│   ├── nginx.conf        정적 파일 + /api 프록시 예시
│   └── pm2.config.cjs    백엔드 프로세스 예시 (비밀 없음)
├── json/, md/            차트 분류와 서버 구조를 코드에 맞춰 적은 참조 문서
├── .env.example          프론트엔드 환경변수 템플릿
└── index.html
```

차트 분야는 `src/components/ChartTypeSelector.tsx`가 기준입니다.

- 비교·추세 4종: 선형, 누적 영역, 막대, 누적 막대
- 비율·구성 4종: 원형, 도넛, 선버스트, 트리맵
- 분포·관계 4종: 산점도, 버블, 히스토그램, 박스플롯
- 특수 분석 4종: 레이더, 타임라인, 게이지, 워드클라우드
- 고급 분석 4종: 히트맵, 워터폴, 콤보, 파넬
- 지도 1종

대부분의 차트는 `public/vendor/plotly-2.27.0.min.js`로 그립니다. 지도, 게이지, 워드클라우드, 타임라인은 각각 `MapChart`, `GaugeChart`, `WordCloudChart`, `TimelineChart`가 그립니다. 샘플 버튼은 XLSX를 받고, 화면 안내는 같은 이름의 CSV를 읽습니다. 업로드 상한은 10MB이며 `src/utils/dataParser.ts`에 고정되어 있습니다.

## 로컬 실행

PostgreSQL 데이터베이스와 계정은 기관 환경에서 준비합니다. 앱은 그 접속 문자열만 `server/.env`의 `DATABASE_URL`로 받습니다.

### 1. 백엔드

```powershell
cd server
copy env.example .env
# .env 의 DATABASE_URL, IP_SALT, ALLOWED_ORIGINS 를 수정
npm install
npx prisma migrate deploy
npm run dev
```

백엔드는 `http://localhost:3001` 에서 동작합니다.

`ALLOWED_ORIGINS`에는 브라우저 주소만 적습니다. 로컬은 `http://localhost:3000` 입니다. 배포 도메인이 다르면 그 출처를 쉼표로 추가합니다.

API는 다음 네 가지입니다.

- `POST /api/session/start`
- `POST /api/session/validate`
- `POST /api/collect` (한 요청 최대 200건)
- `POST /api/satisfaction-ratings`

상태 확인은 `GET /health` 입니다. 자세한 표는 `md/backend_architecture_summary.md`에 있습니다.

### 2. 프론트엔드

```powershell
cd ..
copy .env.example .env
npm install
npm run dev
```

화면은 `http://localhost:3000` 입니다. 개발 서버는 `/api` 요청을 `.env`의 `VITE_API_SERVER_HOST`와 `VITE_API_SERVER_PORT`로 프록시합니다.

## 서버 배포

```powershell
# 프론트엔드 빌드. 빌드 전에 .env 의 API 주소를 배포 서버 주소로 맞춘다.
npm run build

# 백엔드 빌드
cd server
npm install
npx prisma generate
npm run build
npx prisma migrate deploy
```

- 프론트엔드 결과물 `dist/` 를 Nginx `root`에 둡니다. 예시는 `deploy/nginx.conf` 입니다.
- 백엔드는 `server/.env`를 읽습니다. PM2 예시는 `deploy/pm2.config.cjs` 입니다. 프로젝트 루트에서 실행합니다.

```bash
pm2 start deploy/pm2.config.cjs
pm2 save
```

Nginx를 쓰면 브라우저는 같은 출처의 `/api`로 호출하게 `.env`를 맞춥니다.

```
VITE_API_SERVER_HOST=실제호스트
VITE_API_SERVER_PORT=80
VITE_API_PROTOCOL=http
```

값을 바꾼 뒤에는 `npm run build`를 다시 실행합니다. Vite는 이 값을 빌드 시점에 넣습니다.

## 내부망

차트 라이브러리와 지도 마커 이미지는 `public/vendor/`에 포함되어 있습니다. 글꼴은 설치되어 있는 시스템 글꼴을 씁니다. 일반 인터넷이 없어도 차트 화면은 열립니다.

지도는 두 가지를 더 확인합니다.

- 배경 타일: `.env`의 `VITE_MAP_TILE_URL`에 기관 타일 서버 주소를 넣습니다. `{z}`, `{x}`, `{y}`를 포함합니다. 비우면 OpenStreetMap과 Carto를 쓰며, 이 주소는 외부망이 있어야 그림이 나옵니다. 타일을 못 받아도 좌표가 있으면 마커는 표시됩니다.
- 위치: 데이터에 `위도`, `경도` 열이 있으면 그 값을 사용합니다. 주소만 있을 때는 카카오 로컬 API가 필요합니다. 키는 [카카오 개발자 콘솔](https://developers.kakao.com)에서 REST API 키를 발급한 뒤 `.env`에 적습니다.

```
VITE_KAKAO_REST_API_KEY=발급받은_REST_API_키
VITE_MAP_TILE_URL=https://tiles.example.go.kr/{z}/{x}/{y}.png
```

Vite는 이 값을 빌드 시점에 넣습니다. 바꾼 뒤에는 `npm run build`를 다시 실행합니다.

## 참조 문서

`json/`과 `md/`는 실행에 쓰이지 않는 설명입니다. 차트 분류는 `ChartTypeSelector.tsx`, 서버는 `server/src`와 `server/prisma/schema.prisma`를 따른 내용으로 맞춰 두었습니다. 색상 팔레트 JSON만 `src/utils/colorPalettes.ts`가 직접 읽습니다.

## 가져갈 때 주의

- `.env`, `server/.env`는 각 기관이 새로 만듭니다. 저장소에 올리지 않습니다.
- 화면 하단 문의처는 서초구청 연락처입니다. 운영 기관에 맞게 `src/components/VisualizationDashboard.tsx`의 문의 문구를 수정하면 됩니다.

## 제외한 항목

- AI 차트 추천, 메시지, 관리자 통계 기능 및 사용자 추적
- 서버 계정, 비밀번호, SSH 키, DB 비밀번호
- `node_modules`, 프론트·백엔드 빌드 결과
- 특정 VM으로 파일을 올리는 배포 스크립트

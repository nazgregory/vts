# 프로젝트 구조 요약

## 개요
- **프로젝트명**: 데이터 시각화 대시보드
- **버전**: 1.0.0
- **최종 업데이트**: 2026-10-21
- **기술 스택**: React 18 + TypeScript + Vite + Plotly.js 2.27.0 + Leaflet + Tailwind CSS

## 디렉토리 구조

### 📁 루트 디렉토리
프로젝트 설정 및 구성 파일들
- `package.json` - 의존성 및 스크립트 정의
- `tsconfig.json` - TypeScript 설정
- `vite.config.ts` - Vite 번들러 설정
- `tailwind.config.js` - Tailwind CSS 설정
- `README.md` - 프로젝트 메인 문서

### 📁 src/ (소스 코드)
#### components/ - React 컴포넌트들
- `App.tsx` - 애플리케이션 진입점, 라우팅, 상태 관리
- `VisualizationDashboard.tsx` - 메인 대시보드, 단계별 차트 생성 프로세스
- `ChartTypeSelector.tsx` - 6개 분야별 21가지 차트 유형 선택 및 샘플 데이터 다운로드
- `DataInputCard.tsx` - CSV/Excel 파일 업로드 및 데이터 입력
- `ChartCustomizationPanel.tsx` - 차트 커스터마이징 (색상, 범례, 축 등)
- `UnifiedChartRenderer.tsx` - 차트 유형별 렌더링
- `MapChart.tsx` - 지도 시각화
- `SampleVisualizationGallery.tsx` - 샘플 시각화 갤러리
- `ChartSatisfactionRating.tsx` - 차트 만족도 입력
- `TrackingProvider.tsx` - 사용 이력 수집
- `StarLoader.tsx` - 로딩 애니메이션 컴포넌트

#### utils/ - 유틸리티 함수들
- `dataParser.ts` - CSV/Excel 파싱
- `plotlyChartRenderer.ts` - Plotly.js 기반 차트 렌더링
- `chartRenderer.ts` - 차트 렌더링 보조
- `colorPalettes.ts` - 색상 팔레트 관리
- `downloadUtils.ts` - 차트 이미지 다운로드
- `dataExport.ts` - 데이터 내보내기
- `sampleDataManager.ts` - 샘플 데이터 관리
- `apiConfig.ts` - 백엔드 API 주소
- `tracking.ts` - 사용 이력 수집

#### types/ - TypeScript 타입 정의
- `index.ts` - 기본 타입 정의
- `chartCustomization.ts` - 차트 커스터마이징 타입

#### test/ - 테스트 파일들
- `setup.ts` - 테스트 환경 설정

### 📁 public/ (정적 파일들)
#### sample_data/ - 6개 분야별 21가지 차트 유형별 샘플 데이터
- `area_chart.csv`, `bar_chart.csv`, `boxplot_chart.csv`
- `bubble_chart.csv`, `combo_chart.csv`, `donut_chart.csv`
- `gauge_chart.csv`, `heatmap_chart.csv`, `histogram_chart.csv`
- `line_chart.csv`, `map.csv`, `panel_chart.csv`
- `pie_chart.csv`, `radar_chart.csv`, `scatter_chart.csv`
- `stacked_bar_chart.csv`, `sunburst_chart.csv`, `timeline_chart.csv`
- `treemap_chart.csv`, `waterfall_chart.csv`, `wordcloud_chart.csv`

### 📁 json/ (프로젝트 참조 데이터)
- `definition.json` - 프로젝트 정의 및 개념
- `function.json` - 함수 정의 및 설명
- `variable.json` - 변수 정의 및 설명
- `hardcode.json` - 하드코딩된 값들
- `project_structure.json` - 프로젝트 구조 정보
- `chart_mapping.json` - 차트 매핑 정보
- `color_palettes.json` - 색상 팔레트 정보

### 📁 md/ (프로젝트 문서)
각 JSON 파일에 대응하는 요약 문서들

### 📁 server/ (사용 이력 API)
- `src/routes/session.ts` - 세션 시작, 검증
- `src/routes/collect.ts` - 이벤트 수집
- `src/routes/satisfaction.ts` - 만족도 저장
- `src/services/sessionService.ts`, `eventService.ts`
- `prisma/schema.prisma` - PostgreSQL 스키마

### 📁 public/vendor/
- `plotly-2.27.0.min.js` - 차트 라이브러리
- `leaflet/` - 지도 마커 이미지

## 주요 의존성

### 핵심 라이브러리
- **React**: ^18.2.0 - UI 컴포넌트 라이브러리
- **TypeScript**: ^5.9.2 - 정적 타입 검사
- **Plotly.js**: 2.27.0 - `public/vendor/plotly-2.27.0.min.js`로 포함
- **Leaflet**: ^1.9.4 - 지도 차트

### 데이터 처리
- **Papa Parse**: ^5.4.1 - CSV 파싱
- **XLSX**: ^0.18.5 - Excel 파일 처리

### UI 프레임워크
- **Tailwind CSS**: ^3.3.5 - CSS 프레임워크
- **Lucide React**: ^0.294.0 - 아이콘 라이브러리

### 개발 도구
- **Vite**: ^4.5.14 - 빌드 도구 및 개발 서버

## 빌드 구성
- **번들러**: Vite
- **트랜스파일러**: TypeScript
- **CSS 프레임워크**: Tailwind CSS
- **차트 라이브러리**: Plotly.js
- **개발 서버**: Vite Dev Server (포트 3000)

## 아키텍처 특징
1. **컴포넌트 기반**: 재사용 가능한 React 컴포넌트 구조
2. **타입 안전성**: TypeScript를 통한 정적 타입 검사
3. **모듈화**: 기능별로 분리된 유틸리티 함수들
4. **데이터 시각화**: 21가지 차트 유형 지원
5. **반응형 디자인**: 모바일과 데스크톱 환경 최적화

---

**최종 업데이트**: 2026년 10월 20일

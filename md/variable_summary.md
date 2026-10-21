# 변수 정의 요약

## 개요
이 문서는 데이터 시각화 대시보드에서 사용되는 주요 변수들과 그 정의를 설명합니다.

## 상태 변수 (State Variables)

### 1. 차트 관련 상태

#### selectedChartType
- **타입**: `string`
- **설명**: 사용자가 선택한 차트 유형
- **값**: 21가지 차트 유형
  - 막대 그래프, 선형 그래프, 원형 차트, 도넛 차트
  - 누적 막대 그래프, 산점도, 버블 차트, 히스토그램
  - 박스플롯, 레이더 차트, 타임라인 차트, 게이지 차트
  - 워드클라우드, 히트맵, 워터폴 차트, 콤보 차트
  - 파넬 차트, 선버스트 차트, 트리맵, 지도 시각화
- **파일 위치**: `src/components/ChartTypeSelector.tsx`

#### chartData
- **타입**: `array`
- **설명**: 차트에 표시할 데이터 배열
- **구조**: 각 객체는 헤더를 키로, 데이터 값을 값으로 가지는 형태
- **예시**: `[{"날짜": "2024-01", "매출": 1200}, {"날짜": "2024-02", "매출": 1350}]`
- **파일 위치**: `src/components/DataInputCard.tsx`

#### currentStep
- **타입**: `number`
- **설명**: 현재 진행 단계
- **범위**: [1, 2, 3]
  - 1: 차트 선택
  - 2: 데이터 입력
  - 3: 차트 생성
- **파일 위치**: `src/components/VisualizationDashboard.tsx`

### 2. 파일 업로드 상태

#### uploadedFile
- **타입**: `File | null`
- **설명**: 사용자가 업로드한 파일 객체
- **허용 형식**: `.csv`, `.xlsx`
- **파일 위치**: `src/components/DataInputCard.tsx`

### 3. 차트 커스터마이징 상태

#### chartCustomization
- **타입**: `object`
- **설명**: 차트 커스터마이징 설정
- **속성**:
  - `title`: 차트 제목
  - `colors`: 색상 팔레트
  - `axisLabels`: 축 레이블
  - `legendPosition`: 범례 위치
  - `legendStyle`: 범례 스타일
  - `gridLines`: 격자선 표시
  - `tooltip`: 툴팁 표시
- **파일 위치**: `src/components/ChartCustomizationPanel.tsx`

## 함수 매개변수 (Function Parameters)

### 1. 차트 관련 콜백

#### onTypeSelect
- **타입**: `function`
- **설명**: 차트 유형 선택 시 호출되는 콜백 함수
- **매개변수**: `chartType: string`
- **파일 위치**: `src/components/ChartTypeSelector.tsx`

#### onDataSubmit
- **타입**: `function`
- **설명**: 데이터 제출 시 호출되는 콜백 함수
- **매개변수**: `data: array`
- **파일 위치**: `src/components/DataInputCard.tsx`

#### onFileUpload
- **타입**: `function`
- **설명**: 파일 업로드 시 호출되는 콜백 함수
- **매개변수**: `file: File`
- **파일 위치**: `src/components/FileUpload.tsx`

#### onCustomizationChange
- **타입**: `function`
- **설명**: 커스터마이징 설정 변경 시 호출되는 콜백 함수
- **매개변수**: `settings: object`
- **파일 위치**: `src/components/ChartCustomizationPanel.tsx`

## 상수 (Constants)

### 1. 파일 관련 상수

#### MAX_FILE_SIZE
- **값**: `10485760` (10MB)
- **설명**: 최대 파일 크기
- **단위**: bytes
- **파일 위치**: `src/utils/dataParser.ts`

#### SUPPORTED_CHART_TYPES
- **값**: 21가지 차트 유형 배열
- **설명**: 지원되는 차트 유형 목록
- **파일 위치**: `src/components/ChartTypeSelector.tsx`

### 2. 색상 관련 상수

#### DEFAULT_COLORS
- **값**: `["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]`
- **설명**: 기본 차트 색상 팔레트
- **파일 위치**: `src/utils/colorPalettes.ts`

## 데이터 구조 (Data Structures)

### 1. 차트 데이터 구조

#### ChartData
- **설명**: 차트 데이터 구조
- **예시**:
  ```typescript
  [
    {"날짜": "2024-01", "매출": 1200, "방문자수": 450},
    {"날짜": "2024-02", "매출": 1350, "방문자수": 520}
  ]
  ```
- **파일 위치**: `src/types/index.ts`

### 2. 차트 커스터마이징 구조

#### ChartCustomization
- **설명**: 차트 커스터마이징 설정 구조
- **속성**:
  - `title`: `string`
  - `subtitle`: `string`
  - `colors`: `array<string>`
  - `axisLabels`: `{x: string, y: string}`
  - `legendPosition`: `string`
  - `legendStyle`: `string`
  - `gridLines`: `boolean`
  - `tooltip`: `boolean`
- **파일 위치**: `src/types/chartCustomization.ts`

## 색상 팔레트 (Color Palettes)

### 1. 히트맵 전용 색상

#### heatmap_colors
- **plasma**: `["#0d0887", "#7e03a8", "#cc4778", "#f89441", "#f0f921"]`
- **inferno**: `["#000004", "#1b0c41", "#4a0c6b", "#781c6d", "#a52c60", "#cf4446", "#e76d5a", "#f7b799", "#fde725"]`
- **magma**: `["#000004", "#180f3e", "#440f76", "#721f81", "#9e2f7f", "#cb3e71", "#e95c5c", "#f78357", "#fbb43f", "#fde725"]`
- **viridis**: `["#440154", "#482878", "#3e4989", "#31688e", "#26828e", "#1f9e89", "#35b779", "#6ece58", "#b5de2b", "#fde725"]`
- **ReBu**: `["#67001f", "#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#f7f7f7", "#d1e5f0", "#92c5de", "#4393c3", "#2166ac", "#053061"]`
- **Blues**: `["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c", "#08306b"]`
- **coolwarm**: `["#3b4cc0", "#6877d1", "#8fa0e0", "#b3c7ed", "#d4e4f7", "#f7f7f7", "#fde0d9", "#fcc5c0", "#fa9fb5", "#f768a1", "#dd3497", "#ae017e", "#7a0177"]`
- **Greens**: `["#f7fcf5", "#e5f5e0", "#c7e9c0", "#a1d99b", "#74c476", "#41ab5d", "#238b45", "#006d2c", "#00441b"]`
- **Oranges**: `["#fff7ec", "#fee8c8", "#fdd49e", "#fdbe85", "#fd8d3c", "#e6550d", "#d94801", "#a63603", "#7f2704"]`
- **Reds**: `["#fff5f0", "#fee0d2", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#a50f15", "#67000d"]`
- **Purples**: `["#fcfbfd", "#efedf5", "#dadaeb", "#bcbddc", "#9e9ac8", "#807dba", "#6a51a3", "#54278f", "#3f007d"]`
- **YlOrBr**: `["#ffffe5", "#fff7bc", "#fee391", "#fec44f", "#fe9929", "#ec7014", "#cc4c02", "#993404", "#662506"]`

### 2. 카테고리별 색상

#### category_colors
`ChartTypeSelector.tsx`의 분야 제목 색과 같다.

- **comparison_trend**: `#2563EB` (파란색)
- **ratio_composition**: `#9333EA` (보라색)
- **distribution_relation**: `#16A34A` (초록색)
- **special_analysis**: `#EA580C` (주황색)
- **advanced_analysis**: `#DC2626` (빨간색)
- **map_location**: `#4F46E5` (남색)

## 변수 사용 가이드

### 1. 상태 변수 관리
- React의 `useState` 훅을 사용하여 상태 관리
- 상태 변경 시 적절한 콜백 함수 호출
- 컴포넌트 간 상태 공유 시 props 또는 context 사용

### 2. 상수 활용
- 하드코딩된 값은 상수로 정의하여 재사용성 향상
- 환경별로 다른 값을 사용할 수 있도록 설정 가능
- 타입 안전성을 위해 TypeScript 상수 타입 활용

### 3. 데이터 구조 활용
- TypeScript 인터페이스를 통한 타입 안전성 보장
- 데이터 검증 및 변환 시 구조 활용
- API 응답 데이터와 일치하는 구조 설계

### 4. 색상 팔레트 활용
- 차트 유형별로 적절한 색상 팔레트 선택
- 사용자 커스터마이징 옵션으로 제공
- 접근성을 고려한 색상 대비 유지

## 주의사항

### 1. 타입 안전성
- 모든 변수는 적절한 TypeScript 타입 정의 필요
- 런타임 에러 방지를 위한 타입 검증 구현
- 인터페이스 변경 시 관련 컴포넌트 동기화

### 2. 상태 관리
- 상태 변경 시 불필요한 리렌더링 방지
- 복잡한 상태는 useReducer 또는 상태 관리 라이브러리 사용
- 상태 초기화 및 정리 로직 구현

### 3. 성능 최적화
- 대용량 데이터 처리 시 메모리 사용량 모니터링
- 불필요한 객체 생성 방지
- 메모이제이션을 통한 계산 최적화

---

**최종 업데이트**: 2026년 10월 20일 
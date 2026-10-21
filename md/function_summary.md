# 함수 정의 요약

## 개요
이 문서는 데이터 시각화 대시보드의 주요 함수들과 그 기능을 설명합니다.

## 핵심 함수

### 1. 데이터 파싱 함수

#### parseCSV
- **설명**: CSV 텍스트를 파싱하여 JavaScript 객체 배열로 변환
- **매개변수**: `csvText: string`
- **반환값**: `array<object>`
- **예시**: `parseCSV('날짜,매출\n2024-01,1200') → [{'날짜': '2024-01', '매출': 1200}]`
- **에러 처리**: 잘못된 CSV 형식 시 에러 발생
- **파일 위치**: `src/utils/dataParser.ts`

#### parseExcel
- **설명**: Excel 파일을 파싱하여 데이터 배열로 변환
- **매개변수**: `file: File`
- **반환값**: `Promise<array<object>>`
- **의존성**: read-excel-file 라이브러리
- **에러 처리**: 파일 읽기 실패 시 Promise rejection
- **파일 위치**: `src/utils/dataParser.ts`

### 2. 차트 렌더링 함수

`generateChart`라는 함수는 없다. 대부분의 차트는 `src/utils/plotlyChartRenderer.ts`의 `createPlotlyChartData`, `createPlotlyLayout`을 `UnifiedChartRenderer`가 호출한다.

지도는 `MapChart.tsx`, 게이지는 `GaugeChart.tsx`, 워드클라우드는 `WordCloudChart.tsx`, 타임라인은 `TimelineChart.tsx`가 따로 그린다. 차트 종류 21종과 분야 분류는 `ChartTypeSelector.tsx`가 기준이다.

## 유틸리티 함수

### 1. 파일 검증 함수

#### validateFile
- **설명**: 업로드된 파일의 유효성 검사
- **매개변수**: `file: File`
- **반환값**: `object<{isValid: boolean, error?: string}>`
- **검증 항목**:
  - 파일 크기 제한 (10MB)
  - 파일 형식 (.csv, .xlsx)
- **파일 위치**: `src/utils/dataParser.ts`

### 2. 차트 다운로드 함수

#### downloadChart
- **설명**: 생성된 차트를 이미지 파일로 다운로드
- **매개변수**: `chartContainer: HTMLElement`, `format: 'png' | 'svg' | 'pdf'`, `filename: string`
- **반환값**: `Promise<void>`
- **지원 형식**: PNG, SVG, PDF
- **의존성**: html2canvas
- **파일 위치**: `src/utils/dataExport.ts`. 대시보드가 이 파일을 사용한다

### 3. 데이터 내보내기 함수

#### exportData
- **설명**: 차트 데이터를 다양한 형식으로 내보내기
- **매개변수**: `data: array<object>`, `format: string`
- **반환값**: `string | Blob`
- **지원 형식**: CSV, JSON, Excel
- **파일 위치**: `src/utils/dataExport.ts`

### 4. 샘플 데이터 다운로드 함수

#### downloadSampleData
- **설명**: 차트 유형별 샘플 데이터 다운로드
- **매개변수**: `chartType: string`
- **반환값**: `void`
- **파일 위치**: `src/utils/sampleDataManager.ts`

## 이벤트 핸들러

### 1. 파일 업로드 처리

#### handleFileUpload
- **설명**: 파일 업로드 이벤트 처리
- **트리거**: drag & drop, file input change
- **동작**:
  - 파일 유효성 검사
  - 파일 파싱
- **파일 위치**: `src/components/DataInputCard.tsx`

### 2. 차트 유형 선택 처리

#### handleChartTypeSelect
- **설명**: 차트 유형 선택 이벤트 처리
- **트리거**: 차트 유형 버튼 클릭
- **동작**:
  - 선택된 차트 유형 저장
  - 다음 단계로 진행
  - 관련 샘플 데이터 표시
- **파일 위치**: `src/components/ChartTypeSelector.tsx`

### 3. 커스터마이징 변경 처리

#### handleCustomizationChange
- **설명**: 차트 커스터마이징 설정 변경 이벤트 처리
- **트리거**: 색상 변경, 제목 입력, 축 레이블 수정, 범례 설정
- **동작**:
  - 설정 값 업데이트
  - 차트 재렌더링
  - 설정 저장
- **파일 위치**: `src/components/ChartCustomizationPanel.tsx`

## 함수 사용 예시

### 기본 사용법
```typescript
const data = parseCSV(csvText);
const traces = createPlotlyChartData(data, 'bar', customization);
const layout = createPlotlyLayout(data, 'bar', customization);
```

## 에러 처리

### 일반적인 에러 상황
1. **파일 형식 오류**: 지원하지 않는 파일 형식
2. **데이터 구조 오류**: 잘못된 CSV/Excel 구조
3. **메모리 부족**: 대용량 파일 처리 시
4. **네트워크 오류**: 서버 통신 실패

### 에러 처리 전략
- 사용자 친화적인 에러 메시지 표시
- 로그 기록
- 자동 재시도 메커니즘
- 폴백 옵션 제공

---

**최종 업데이트**: 2026년 10월 20일 
// 차트 데이터 타입
export interface ChartData {
  [key: string]: string | number;
}

// 차트 커스터마이징 설정 타입은 chartCustomization.ts에서 정의
export type { ChartCustomization } from './chartCustomization';

// 차트 유형 타입
export type ChartType = 
  | 'line' 
  | 'bar' 
  | 'pie' 
  | 'donut'
  | 'area' 
  | 'scatter' 
  | 'bubble' 
  | 'histogram' 
  | 'radar' 
  | 'timeline' 
  | 'gauge' 
  | 'wordcloud' 
  | 'heatmap' 
  | 'waterfall' 
  | 'combo'
  | 'stackedBar'
  | 'treemap'
  | 'sunburst'
  | 'boxplot'
  | 'panel'
  | 'map';

// 차트 카테고리 타입
export interface ChartCategory {
  title: string;
  charts: ChartOption[];
}

// 차트 옵션 타입
export interface ChartOption {
  id: ChartType;
  name: string;
  icon: any; // React.ComponentType<{ className?: string }>;
  description: string;
}

// 파일 업로드 결과 타입
export interface FileUploadResult {
  isValid: boolean;
  error?: string;
  data?: ChartData[];
}

// 샘플 데이터 템플릿 타입
export interface SampleDataTemplate {
  [key: string]: string;
}

// 하드코딩 값 타입
export interface HardcodeValues {
  chart_colors: {
    primary: string[];
    secondary: string[];
    pastel: string[];
  };
  chart_types: {
    comparison_trend: ChartType[];
    ratio_composition: ChartType[];
    distribution_relation: ChartType[];
    special_analysis: ChartType[];
    advanced_analysis: ChartType[];
  };
  sample_data_templates: SampleDataTemplate;
  file_upload: {
    max_size_mb: number;
    allowed_types: string[];
    drag_drop_text: string;
  };
} 
import { ChartData, ChartType, ChartCustomization } from '@/types';

// 기본 색상 팔레트
const DEFAULT_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

/**
 * 차트 데이터에서 수치형 컬럼 키들을 추출
 */
export const getNumericKeys = (data: ChartData[]): string[] => {
  if (!data || data.length === 0) return [];
  
  return Object.keys(data[0]).filter(key => 
    typeof data[0][key] === 'number'
  );
};

/**
 * 차트 데이터에서 카테고리형 컬럼 키들을 추출
 */
export const getCategoricalKeys = (data: ChartData[]): string[] => {
  if (!data || data.length === 0) return [];
  
  return Object.keys(data[0]).filter(key => 
    typeof data[0][key] === 'string'
  );
};

/**
 * 기본 차트 커스터마이징 설정 생성
 */
export const createDefaultCustomization = (data: ChartData[], chartType: ChartType): ChartCustomization => {
  const numericKeys = getNumericKeys(data);
  
  return {
    common: {
      title: {
        text: `${chartType.toUpperCase()} 차트`,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333'
      },
      margin: {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50
      },
      legend: {
        position: 'right'
      },
      colors: {
        palette: 'brand'
      },
      labels: {
        show: true,
        format: 'number',
        decimals: 0,
        thousandsSeparator: true,
        unit: '',
        position: 'outside'
      },
      axes: {
        x: {
          name: numericKeys[0] || '카테고리',
          unit: '',
          tickInterval: 'auto',
          format: '',
          reverse: false,
          gridLines: true
        },
        y: {
          name: numericKeys[0] || '값',
          unit: '',
          tickInterval: 'auto',
          format: '',
          reverse: false,
          gridLines: true
        }
      },
      referenceLines: {
        horizontal: [],
        vertical: [],
        bands: []
      },
      sorting: {
        type: 'value',
        direction: 'desc'
      },
      interaction: {
        tooltip: true,
        highlight: true,
        brush: false,
        zoom: false,
        pan: false,
        drillDown: false,
        crossFilter: false
      },
      download: {
        formats: ['png'],        
      }
    }
  };
};

/**
 * 차트 데이터를 특정 차트 유형에 맞게 변환
 */
export const transformDataForChart = (data: ChartData[], chartType: ChartType) => {
  switch (chartType) {
    case 'pie':
    case 'donut':
      // 원형 차트용 데이터 변환
      const pieData = data.map((item, index) => {
        const keys = Object.keys(item);
        return {
          name: item[keys[0]],
          value: item[keys[1]],
          fill: DEFAULT_COLORS[index % DEFAULT_COLORS.length]
        };
      });
      return pieData;
      
    case 'scatter':
      // 산점도용 데이터 변환
      const numericKeys = getNumericKeys(data);
      if (numericKeys.length >= 2) {
        return data.map(item => ({
          x: item[numericKeys[0]],
          y: item[numericKeys[1]],
          size: numericKeys[2] ? item[numericKeys[2]] : 1
        }));
      }
      break;
      
    case 'bubble':
      // 버블 차트용 데이터 변환
      const bubbleKeys = getNumericKeys(data);
      if (bubbleKeys.length >= 3) {
        return data.map(item => ({
          x: item[bubbleKeys[0]],
          y: item[bubbleKeys[1]],
          size: item[bubbleKeys[2]]
        }));
      }
      break;
      
    default:
      return data;
  }
  
  return data;
};

/**
 * 차트 제목 생성
 */
export const generateChartTitle = (data: ChartData[], chartType: ChartType): string => {
  const numericKeys = getNumericKeys(data);
  
  let title = '';
  
  switch (chartType) {
    case 'line':
      title = '시계열 추세 분석';
      break;
    case 'bar':
      title = '카테고리별 비교 분석';
      break;
    case 'pie':
    case 'donut':
      title = '구성 비율 분석';
      break;
    case 'area':
      title = '누적 영역 분석';
      break;
    case 'scatter':
      title = '상관관계 분석';
      break;
    case 'bubble':
      title = '3차원 데이터 분석';
      break;
    case 'histogram':
      title = '데이터 분포 분석';
      break;
    default:
      title = '데이터 시각화';
  }
  
  if (numericKeys.length > 0) {
    title += ` - ${numericKeys[0]}`;
  }
  
  return title;
};

/**
 * 차트 설명 생성
 */
export const generateChartDescription = (data: ChartData[], chartType: ChartType): string => {
  const rows = data.length;
  const columns = Object.keys(data[0]).length;
  
  let description = `총 ${rows}행, ${columns}열의 데이터를 `;
  
  switch (chartType) {
    case 'line':
      description += '선형 그래프로 시각화했습니다.';
      break;
    case 'bar':
      description += '막대 그래프로 시각화했습니다.';
      break;
    case 'pie':
    case 'donut':
      description += '원형 차트로 시각화했습니다.';
      break;
    case 'area':
      description += '영역 차트로 시각화했습니다.';
      break;
    case 'scatter':
      description += '산점도로 시각화했습니다.';
      break;
    case 'bubble':
      description += '버블 차트로 시각화했습니다.';
      break;
    case 'histogram':
      description += '히스토그램으로 시각화했습니다.';
      break;
    default:
      description += '시각화했습니다.';
  }
  
  return description;
};

/**
 * 차트 색상 팔레트 생성
 */
export const generateColorPalette = (dataLength: number, paletteType: 'primary' | 'secondary' | 'pastel' = 'primary'): string[] => {
  const palettes = {
    primary: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'],
    secondary: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'],
    pastel: ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFB3F7', '#B3F7FF']
  };
  
  const selectedPalette = palettes[paletteType];
  const colors: string[] = [];
  
  for (let i = 0; i < dataLength; i++) {
    colors.push(selectedPalette[i % selectedPalette.length]);
  }
  
  return colors;
};

/**
 * 차트 데이터 유효성 검사
 */
export const validateChartData = (data: ChartData[], chartType: ChartType): { isValid: boolean; error?: string } => {
  if (!data || data.length === 0) {
    return { isValid: false, error: '데이터가 없습니다.' };
  }
  
  if (data.length < 2) {
    return { isValid: false, error: '최소 2개 이상의 데이터 포인트가 필요합니다.' };
  }
  
  const numericKeys = getNumericKeys(data);
  const categoricalKeys = getCategoricalKeys(data);
  
  switch (chartType) {
    case 'line':
    case 'area':
      if (numericKeys.length < 1) {
        return { isValid: false, error: '선형 그래프에는 최소 1개의 수치형 컬럼이 필요합니다.' };
      }
      break;
      
    case 'bar':
      if (categoricalKeys.length < 1 || numericKeys.length < 1) {
        return { isValid: false, error: '막대 그래프에는 최소 1개의 카테고리형 컬럼과 1개의 수치형 컬럼이 필요합니다.' };
      }
      break;
      
    case 'pie':
    case 'donut':
      if (categoricalKeys.length < 1 || numericKeys.length < 1) {
        return { isValid: false, error: '원형 차트에는 최소 1개의 카테고리형 컬럼과 1개의 수치형 컬럼이 필요합니다.' };
      }
      break;
      
    case 'scatter':
      if (numericKeys.length < 2) {
        return { isValid: false, error: '산점도에는 최소 2개의 수치형 컬럼이 필요합니다.' };
      }
      break;
      
    case 'bubble':
      if (numericKeys.length < 3) {
        return { isValid: false, error: '버블 차트에는 최소 3개의 수치형 컬럼이 필요합니다.' };
      }
      break;
  }
  
  return { isValid: true };
}; 
import { ChartData, ChartType, ChartCustomization } from '@/types';
import { getColorPaletteByDataCount, getBrandColors, getColorPalette } from './colorPalettes';
import { getCategoricalKeys, getNumericKeys } from './dataParser';

// 색상 팔레트 가져오기 헬퍼 함수
const getColors = (customization: ChartCustomization | undefined, dataLength: number): string[] => {
  // 사용자 정의 색상이 있으면 사용
  if (customization?.common?.colors?.palette === 'custom' && customization.common.colors.customColors) {
    return customization.common.colors.customColors;
  }
  
  // 브랜드 색상 (10색 조합)
  if (customization?.common?.colors?.palette === 'brand') {
    return getColorPalette('under_10');
  }
  
  // 무지개 색상 (12색 조합)
  if (customization?.common?.colors?.palette === 'rainbow') {
    return getColorPalette('12_colors');
  }
  
  // 행정동 색상 (18색 조합)
  if (customization?.common?.colors?.palette === 'reference18') {
    return getColorPalette('18_colors');
  }
  
  // 기본값: 데이터 개수에 맞는 색상 팔레트
  return getColorPaletteByDataCount(dataLength);
};

// Plotly 차트 데이터 변환 및 설정 생성
export const createPlotlyChartData = (
  data: ChartData[], 
  chartType: ChartType, 
  customization: ChartCustomization | undefined
) => {
  console.log('🔍 createPlotlyChartData called with:', { chartType, dataLength: data.length, customization });
  
  switch (chartType) {
    case 'line':
      return createLineChartData(data, customization);
    case 'bar':
      return createBarChartData(data, customization);
    case 'stackedBar':
      return createStackedBarChartData(data, customization);
    case 'pie':
      return createPieChartData(data, customization);
    case 'donut':
      return createDonutChartData(data, customization);
    case 'area':
      return createAreaChartData(data, customization);
    case 'scatter':
      return createScatterChartData(data, customization);
    case 'bubble':
      return createBubbleChartData(data, customization);
    case 'histogram':
      return createHistogramChartData(data, customization);
    case 'radar':
      return createRadarChartData(data, customization);
    case 'gauge':
      // 게이지 차트는 별도 컴포넌트로 처리
      console.log('🎯 Gauge chart case - using dedicated component');
      return [];
    case 'wordcloud':
      return createWordCloudChartData(data, customization);
    case 'heatmap':
      return createHeatmapChartData(data, customization);
    case 'waterfall':
      return createWaterfallChartData(data);
    case 'combo':
      return createComboChartData(data);
    case 'treemap':
      return createTreemapChartData(data, customization);
    case 'sunburst':
      return createSunburstChartData(data, customization);
    case 'boxplot':
      return createBoxplotChartData(data, customization);
    case 'panel':
      return createPanelChartData(data, customization);
    case 'timeline': {
      const timelineData = createTimelineChartData(data, customization);
      return Array.isArray(timelineData) ? timelineData : (timelineData as any)?.traces || [];
    }
    default:
      console.log('⚠️ Default case triggered for chartType:', chartType);
      return [];
  }
};

// 선형 그래프 데이터 생성
const createLineChartData = (data: ChartData[], customization: ChartCustomization | undefined) => {
  const numericKeys = getNumericKeys(data);
  const categoricalKeys = getCategoricalKeys(data);
  
  if (numericKeys.length === 0 || categoricalKeys.length === 0) return [];
  
  const colors = getColors(customization, data.length);
  
  // 선형 그래프 커스터마이징 설정
  const lineSettings = customization?.line?.lines || {};
  const markerSettings = customization?.line?.markers || {};
  
  // visualization_sample.html과 동일한 구조
  // 첫 번째 범주 컬럼을 X축(시간/카테고리)으로, 두 번째 범주 컬럼을 범례로, 첫 번째 수치 컬럼을 Y축으로 사용
  
  // X축 값들 (첫 번째 범주 컬럼)
  const xValues = [...new Set(data.map(row => row[categoricalKeys[0]]))];
  
  // 범례 값들 (두 번째 범주 컬럼이 있으면 사용, 없으면 첫 번째 수치 컬럼명 사용)
  const legendValues = categoricalKeys.length > 1 
    ? [...new Set(data.map(row => row[categoricalKeys[1]]))]
    : numericKeys;
  
  // 각 범례별로 시리즈 생성
  return legendValues.map((legendValue, index) => {
    const seriesData = xValues.map(x => {
      const row = data.find(r => 
        categoricalKeys.length > 1 
          ? r[categoricalKeys[0]] === x && r[categoricalKeys[1]] === legendValue
          : r[categoricalKeys[0]] === x
      );
      return row ? row[numericKeys[0]] : 0;
    });
    
    return {
      x: xValues,
      y: seriesData,
      type: 'scatter',
      mode: 'lines+markers',
      name: String(legendValue),
      line: {
        color: colors[index % colors.length],
        width: (lineSettings as any)?.thickness || 2,
        dash: (lineSettings as any)?.style === 'dashed' ? 'dash' : 
              (lineSettings as any)?.style === 'longDashed' ? 'longdash' : 'solid',
        shape: (lineSettings as any)?.curveInterpolation === 'smooth' ? 'spline' : 'linear'
      },
      marker: {
        size: (markerSettings as any)?.size || 6,
        color: (markerSettings as any)?.fill === 'style2' ? (markerSettings as any)?.borderColor || '#ffffff' : colors[index % colors.length],
        symbol: (markerSettings as any)?.shape === 'square' ? 'square' : 
                (markerSettings as any)?.shape === 'diamond' ? 'diamond' : 'circle',
        line: (markerSettings as any)?.fill === 'hollow' ? {
          color: (markerSettings as any)?.borderColor || colors[index % colors.length],
          width: (markerSettings as any)?.borderWidth || 1
        } : (markerSettings as any)?.fill === 'style2' ? {
          color: colors[index % colors.length],
          width: (markerSettings as any)?.borderWidth || 1
        } : undefined
      }
    };
  });
};

// 막대 그래프 데이터 생성 (데이터 자동 판단)
const createBarChartData = (data: ChartData[], customization: ChartCustomization | undefined) => {
  const numericKeys = getNumericKeys(data);
  const categoricalKeys = getCategoricalKeys(data);
  
  if (numericKeys.length === 0 || categoricalKeys.length === 0) return [];
  
  const colors = getColors(customization, data.length);
  const barSettings = customization?.bar?.bars || {};
  const isHorizontal = (barSettings as any)?.direction === 'horizontal';
  
  // 데이터 구조 자동 판단
  const isGroupedBar = categoricalKeys.length > 1 && numericKeys.length === 1;
  
  if (isGroupedBar) {
    // 그룹 막대 그래프: 여러 범주 컬럼을 시리즈로 사용
    const xValues = [...new Set(data.map(row => row[categoricalKeys[0]]))];
    const legendValues = [...new Set(data.map(row => row[categoricalKeys[1]]))];
    
    return legendValues.map((legendValue, index) => {
      const seriesData = xValues.map(x => {
        const row = data.find(r => 
          r[categoricalKeys[0]] === x && r[categoricalKeys[1]] === legendValue
        );
        return row ? row[numericKeys[0]] : 0;
      });
      
      return {
        x: isHorizontal ? seriesData : xValues,
        y: isHorizontal ? xValues : seriesData,
        type: 'bar',
        name: String(legendValue),
        marker: {
          color: colors[index % colors.length],
          line: {
            color: (barSettings as any)?.borderColor || '#ffffff',
            width: (barSettings as any)?.borderWidth || 1
          }
        },
        orientation: isHorizontal ? 'h' : 'v'
      };
    });
  } else {
    // 단순 막대 그래프: 첫 번째 범주 컬럼을 X축으로, 첫 번째 수치 컬럼을 Y축으로
    const xValues = [...new Set(data.map(row => row[categoricalKeys[0]]))];
    const yValues = xValues.map(x => {
      const row = data.find(r => r[categoricalKeys[0]] === x);
      return row ? row[numericKeys[0]] : 0;
    });
    
    return [{
      x: isHorizontal ? yValues : xValues,
      y: isHorizontal ? xValues : yValues,
      type: 'bar',
      marker: {
        color: colors[0],
        line: {
          color: (barSettings as any)?.borderColor || '#ffffff',
          width: (barSettings as any)?.borderWidth || 1
        }
      },
      orientation: isHorizontal ? 'h' : 'v'
    }];
  }
};

// 원형 차트 데이터 생성
const createPieChartData = (data: ChartData[], customization: ChartCustomization | undefined) => {
  const categoricalKeys = getCategoricalKeys(data);
  const numericKeys = getNumericKeys(data);
  
  if (categoricalKeys.length === 0 || numericKeys.length === 0) return [];
  
  const colors = getColors(customization, data.length);
  
  // 라벨 표시 설정
  const showLabels = customization?.common?.labels?.show !== false;
  const labelFormat = customization?.common?.labels?.format || 'number';
  const decimals = customization?.common?.labels?.decimals || 2;
  
  // 라벨 텍스트 생성
  const getLabelText = (value: number, label: string) => {
    if (!showLabels) return '';
    
    let text = label;
    if (labelFormat === 'number' || labelFormat === 'custom') {
      const formattedValue = Number(value).toFixed(decimals);
      text += `: ${formattedValue}`;
    }
    if (labelFormat === 'percentage') {
      const total = data.reduce((sum, row) => sum + (row[numericKeys[0]] as number), 0);
      const percentage = ((value / total) * 100).toFixed(decimals);
      text += ` (${percentage}%)`;
    }
    return text;
  };
  
  // 원형 차트 커스터마이징 설정
  const pieSettings = customization?.pie?.layout || {};
  const labelSettings = customization?.pie?.labels || {};
  
  // 라벨 색상 설정
  let labelColors: string[] = [];
  if ((labelSettings as any).colorMode === 'custom' && (labelSettings as any).customColor) {
    // 지정색: 모든 라벨에 동일한 색상 적용
    labelColors = data.map(() => (labelSettings as any).customColor);
  } else {
    // 범례색과 동일: 각 데이터 항목의 범례 색상과 동일하게 적용
    labelColors = data.map((_, index) => colors[index % colors.length]);
  }
  
  return [{
    values: data.map(row => row[numericKeys[0]]),
    labels: data.map(row => row[categoricalKeys[0]]),
    type: 'pie',
    rotation: (pieSettings as any).startAngle || 0,
    direction: (pieSettings as any).clockwise ? 'clockwise' : 'counterclockwise',
    marker: {
      colors: data.map((_, index) => colors[index % colors.length])
    },
    textinfo: showLabels ? 'label+percent' : 'none',
    textposition: (labelSettings as any).position || 'outside',
    text: showLabels ? data.map(row => getLabelText(row[numericKeys[0]] as number, row[categoricalKeys[0]] as string)) : undefined,
    textfont: {
      size: (labelSettings as any).fontSize || 12,
      color: labelColors
    }
  }];
};

// 영역 차트 데이터 생성
const createAreaChartData = (data: ChartData[], customization: ChartCustomization | undefined) => {
  const numericKeys = getNumericKeys(data);
  const categoricalKeys = getCategoricalKeys(data);
  
  if (numericKeys.length === 0 || categoricalKeys.length === 0) return [];
  
  const colors = getColors(customization, data.length);
  
  // visualization_sample.html과 동일한 구조
  // 첫 번째 범주 컬럼을 X축(시간/카테고리)으로, 두 번째 범주 컬럼을 범례로, 첫 번째 수치 컬럼을 Y축으로 사용
  
  // X축 값들 (첫 번째 범주 컬럼)
  const xValues = [...new Set(data.map(row => row[categoricalKeys[0]]))];
  
  // 범례 값들 (두 번째 범주 컬럼이 있으면 사용, 없으면 첫 번째 수치 컬럼명 사용)
  const legendValues = categoricalKeys.length > 1 
    ? [...new Set(data.map(row => row[categoricalKeys[1]]))]
    : numericKeys;
  
  // 각 범례별로 시리즈 생성
  return legendValues.map((legendValue, index) => {
    const seriesData = xValues.map(x => {
      const row = data.find(r => 
        categoricalKeys.length > 1 
          ? r[categoricalKeys[0]] === x && r[categoricalKeys[1]] === legendValue
          : r[categoricalKeys[0]] === x
      );
      return row ? row[numericKeys[0]] : 0;
    });
    
    return {
      x: xValues,
      y: seriesData,
      type: 'scatter',
      mode: 'lines',
      fill: 'tonexty', // 누적 영역 효과
      name: String(legendValue),
      line: {
        color: colors[index % colors.length],
        width: 2
      },
      fillcolor: colors[index % colors.length] + '40', // 투명도 추가
      stackgroup: 'one' // 누적 그룹 설정
    };
  });
};

// 산점도 데이터 생성
const createScatterChartData = (data: ChartData[], customization: ChartCustomization | undefined) => {
  const numericKeys = getNumericKeys(data);
  
  if (numericKeys.length < 2) return [];
  
  const colors = getColors(customization, numericKeys.length);
  
  return [{
    x: data.map(row => row[numericKeys[0]]),
    y: data.map(row => row[numericKeys[1]]),
    type: 'scatter',
    mode: 'markers',
    marker: {
      size: 8,
      color: colors[0],
      opacity: 0.7
    },
    name: `${numericKeys[0]} vs ${numericKeys[1]}`
  }];
};

// 버블 차트 데이터 생성
const createBubbleChartData = (data: ChartData[], customization: ChartCustomization | undefined) => {
  const numericKeys = getNumericKeys(data);
  const categoricalKeys = getCategoricalKeys(data);
  
  if (numericKeys.length < 3) return [];
  
  const colors = getColors(customization, data.length);
  
  // 버블 크기 계산 함수 (visualization_sample.html과 동일)
  const bubbleSize = (value: number) => Math.sqrt(value) / 15;
  
  return [{
    x: data.map(row => row[numericKeys[0]]),
    y: data.map(row => row[numericKeys[1]]),
    mode: 'markers',
    type: 'scatter',
    marker: {
      size: data.map(row => bubbleSize(row[numericKeys[2]] as number)),
      color: data.map((_, index) => colors[index % colors.length]),
      opacity: 0.7
    },
    text: data.map(row => {
      const category = categoricalKeys.length > 0 ? row[categoricalKeys[0]] : '';
      return `${category}<br>${numericKeys[0]}: ${row[numericKeys[0]]}<br>${numericKeys[1]}: ${row[numericKeys[1]]}<br>${numericKeys[2]}: ${row[numericKeys[2]]}`;
    }),
    hoverinfo: 'text'
  }];
};

// 히스토그램 데이터 생성
const createHistogramChartData = (data: ChartData[], customization: ChartCustomization | undefined) => {
  const numericKeys = getNumericKeys(data);
  
  if (numericKeys.length === 0) return [];
  
  // 히스토그램 전용 색상 팔레트 적용
  let colors: string[] = [];
  if (customization?.histogram?.colors?.palette === 'custom' && customization.histogram.colors.customColors) {
    colors = customization.histogram.colors.customColors;
  } else if (customization?.histogram?.colors?.palette === 'brand') {
    colors = getBrandColors();
  } else if (customization?.histogram?.colors?.palette === 'rainbow') {
    colors = getColorPalette('12_colors');
  } else if (customization?.histogram?.colors?.palette === 'reference18') {
    colors = getColorPalette('18_colors');
  } else {
    colors = getColors(customization, numericKeys.length);
  }
  
  // 히스토그램 설정 가져오기
  const histogramSettings = customization?.histogram || {};
  const barSettings = (histogramSettings as any).bars || {};
  const gradientSettings = (histogramSettings as any).gradient || {};
  
  // 그라데이션 색상 생성
  let markerColor: string | string[] = colors[0];
  if (gradientSettings.enabled && colors.length > 1) {
    const numBins = Math.min(20, Math.ceil(Math.sqrt(data.length)));
    
    console.log('🔍 히스토그램 그라데이션 디버깅:', {
      colors,
      numBins,
      direction: gradientSettings.direction,
      enabled: gradientSettings.enabled
    });
    
    if (colors.length === 2) {
      // 2개 색상인 경우: 단순 그라데이션
      markerColor = generateGradientColors(colors[0], colors[1], numBins, gradientSettings.direction);
      console.log('🔍 2색 그라데이션 생성:', markerColor);
    } else if (colors.length > 2) {
      // 3개 이상 색상인 경우: 다중 색상 그라데이션
      markerColor = generateMultiColorGradient(colors, numBins, gradientSettings.direction);
      console.log('🔍 다중 색상 그라데이션 생성:', markerColor);
    } else {
      // 1개 색상인 경우: 단일 색상
      markerColor = colors[0];
      console.log('🔍 단일 색상 사용:', markerColor);
    }
  }
  
  return [{
    x: data.map(row => row[numericKeys[0]]),
    type: 'histogram',
    marker: {
      color: markerColor,
      opacity: barSettings.opacity || 0.8,
      line: {
        color: barSettings.borderColor || '#000000',
        width: barSettings.borderWidth || 1
      }
    },
    nbinsx: Math.min(20, Math.ceil(Math.sqrt(data.length))),
    name: numericKeys[0]
  }];
};

// 레이더 차트 데이터 생성
const createRadarChartData = (data: ChartData[], customization: ChartCustomization | undefined) => {
  const numericKeys = getNumericKeys(data);
  const categoricalKeys = getCategoricalKeys(data);
  
  if (numericKeys.length === 0 || categoricalKeys.length === 0) return [];
  
  const colors = getColors(customization, data.length);
  
  // 레이더 차트 커스터마이징 설정 가져오기
  const radarSettings = customization?.radar || {};
  const axesSettings = (radarSettings as any).axes || {};
  
  console.log('🔍 레이더 차트 레이아웃 설정:', radarSettings);
  
  // visualization_sample.html과 동일한 구조
  // 첫 번째 범주 컬럼을 지표로, 나머지 수치 컬럼들을 시리즈로 사용
  const indicators = [...new Set(data.map(row => row[categoricalKeys[0]]))];
  
  // 각도 계산 (360도를 지표 개수로 나누기)
  const thetaValues = indicators.map((_, index) => (index * 360) / indicators.length);
  
  // 마지막 행과 첫 번째 행 사이의 연결을 위해 첫 번째 값을 마지막에 추가
  const series = numericKeys.map((key, index) => {
    const values = indicators.map(indicator => {
      const row = data.find(r => r[categoricalKeys[0]] === indicator);
      return row ? row[key] : 0;
    });
    
    // 정규화가 활성화된 경우 0-100 범위로 정규화
    let normalizedValues = values;
    if (axesSettings.normalize) {
      const maxValue = Math.max(...values.map(v => Number(v)));
      if (maxValue > 0) {
        normalizedValues = values.map(v => (Number(v) / maxValue) * 100);
      }
    }
    
    // 마지막 행과 첫 번째 행 사이의 연결을 위해 첫 번째 값을 마지막에 추가
    const extendedValues = [...normalizedValues, normalizedValues[0]];
    const extendedThetaValues = [...thetaValues, thetaValues[0]];
    
    return {
      type: 'scatterpolar',
      r: extendedValues,
      theta: extendedThetaValues,
      fill: 'toself',
      name: key,
      line: {
        color: colors[index % colors.length],
        width: 2
      },
      fillcolor: colors[index % colors.length] + '4D',
      marker: {
        size: 6,
        color: colors[index % colors.length],
        symbol: 'circle'
      }
    };
  });
  
  return series;
};



// 워드클라우드 차트 데이터 생성
const createWordCloudChartData = (data: ChartData[], customization: ChartCustomization | undefined) => {
  const categoricalKeys = getCategoricalKeys(data);
  const numericKeys = getNumericKeys(data);
  
  if (categoricalKeys.length === 0 || numericKeys.length === 0) return [];
  
  const colors = getColors(customization, data.length);
  
  // visualization_sample.html과 동일한 구조
  // 첫 번째 범주 컬럼을 단어로, 첫 번째 수치 컬럼을 빈도로 사용
  const words = data.map((row, index) => ({
    text: String(row[categoricalKeys[0]]),
    value: row[numericKeys[0]] as number,
    color: colors[index % colors.length]
  }));
  
  return [{
    type: 'scatter',
    mode: 'text',
    x: words.map(() => Math.random() * 100), // 랜덤 X 위치
    y: words.map(() => Math.random() * 100), // 랜덤 Y 위치
    text: words.map(word => word.text),
    textfont: {
      size: words.map(word => Math.max(12, Math.min(40, word.value / 10))), // 빈도에 따른 크기
      color: words.map(word => word.color)
    },
    hoverinfo: 'text',
    hovertext: words.map(word => `${word.text}: ${word.value}`)
  }];
};

// 히트맵 데이터 생성
const createHeatmapChartData = (data: ChartData[], customization: ChartCustomization | undefined) => {
  const numericKeys = getNumericKeys(data);
  const categoricalKeys = getCategoricalKeys(data);
  
  if (numericKeys.length === 0 || categoricalKeys.length < 2) return [];
  
  // 히트맵 커스터마이징 설정 가져오기
  const heatmapSettings = customization?.heatmap || {};
  const legendSettings = (heatmapSettings as any).legend || {};
  const cellSettings = (heatmapSettings as any).cells || {};
  
  console.log('🔍 히트맵 커스터마이징 설정:', heatmapSettings);
  
  const xValues = [...new Set(data.map(row => row[categoricalKeys[0]]))];
  const yValues = [...new Set(data.map(row => row[categoricalKeys[1]]))];
  
  const zValues = yValues.map(y => 
    xValues.map(x => {
      const row = data.find(r => r[categoricalKeys[0]] === x && r[categoricalKeys[1]] === y);
      return row ? row[numericKeys[0]] : 0;
    })
  );
  
  // 히트맵 색상 팔레트 설정
  let colorscale: string | string[][] = 'Viridis';
  
  // 색상 팔레트가 설정된 경우 적용
  if ((heatmapSettings as any).colors?.palette) {
    if ((heatmapSettings as any).colors.palette === 'custom' && (heatmapSettings as any).colors.customColors) {
      // 사용자 정의 색상을 Plotly colorscale 형식으로 변환
      const customColors = (heatmapSettings as any).colors.customColors;
      if (customColors.length >= 3) {
        const customColorscale = customColors.map((color: string, index: number) => {
          const position = index / (customColors.length - 1);
          return [position, color];
        });
        colorscale = customColorscale;
        console.log('🔍 히트맵 사용자 정의 색상 적용:', customColors);
      }
    } else {
      // 미리 정의된 색상 팔레트 적용
      if ((heatmapSettings as any).colors.palette === 'plasma') {
        // Plasma 색상 팔레트 (보라색→빨간색→노란색)
        colorscale = [
          ['0', '#0d0887'],      // 진한 보라색
          ['0.25', '#7e03a8'],   // 보라색
          ['0.5', '#cc4778'],    // 빨간색
          ['0.75', '#f89441'],   // 주황색
          ['1', '#f0f921']       // 노란색
        ];
        console.log('🔍 히트맵 Plasma 색상 팔레트 적용');
      } else if ((heatmapSettings as any).colors.palette === 'inferno') {
        // Inferno 색상 팔레트 (검은색→빨간색→노란색)
        colorscale = [
          ['0', '#000004'],      // 검은색
          ['0.25', '#1f0c48'],   // 진한 보라색
          ['0.5', '#7a0f7a'],    // 보라색
          ['0.75', '#e55c30'],   // 빨간색
          ['1', '#f6d746']       // 노란색
        ];
        console.log('🔍 히트맵 Inferno 색상 팔레트 적용');
      } else if ((heatmapSettings as any).colors.palette === 'magma') {
        // Magma 색상 팔레트 (검은색→보라색→노란색)
        colorscale = [
          ['0', '#000004'],      // 검은색
          ['0.25', '#180f3e'],   // 진한 보라색
          ['0.5', '#51127c'],    // 보라색
          ['0.75', '#c9325c'],   // 빨간색
          ['1', '#f6d746']       // 노란색
        ];
        console.log('🔍 히트맵 Magma 색상 팔레트 적용');
      } else if ((heatmapSettings as any).colors.palette === 'viridis') {
        // Viridis 색상 팔레트 (파란색→초록색→노란색)
        colorscale = 'Viridis';
        console.log('🔍 히트맵 Viridis 색상 팔레트 적용');
      } else if ((heatmapSettings as any).colors.palette === 'rdbu') {
        // RdBu 색상 팔레트 (파란색→흰색→빨간색)
        colorscale = 'RdBu';
        console.log('🔍 히트맵 RdBu 색상 팔레트 적용');
      } else if ((heatmapSettings as any).colors.palette === 'blues') {
        // Blues 색상 팔레트 (흰색→파란색)
        colorscale = [
          ['0', '#f7fbff'],      // 흰색
          ['0.25', '#deebf7'],   // 연한 파란색
          ['0.5', '#c6dbef'],    // 파란색
          ['0.75', '#9ecae1'],   // 진한 파란색
          ['1', '#08519c']       // 매우 진한 파란색
        ];
        console.log('🔍 히트맵 Blues 색상 팔레트 적용');
      } else if ((heatmapSettings as any).colors.palette === 'coolwarm') {
        // Cool-Warm 색상 팔레트 (파란색→흰색→빨간색)
        colorscale = [
          ['0', '#3b4cc0'],      // 진한 파란색
          ['0.25', '#7aa5d6'],   // 파란색
          ['0.5', '#f7f7f7'],    // 흰색
          ['0.75', '#e07a5f'],   // 빨간색
          ['1', '#b40f20']       // 진한 빨간색
        ];
        console.log('🔍 히트맵 Cool-Warm 색상 팔레트 적용');
      } else if ((heatmapSettings as any).colors.palette === 'greens') {
        // Greens 색상 팔레트 (흰색→초록색)
        colorscale = [
          ['0', '#f7fcf5'],      // 흰색
          ['0.25', '#e5f5e0'],   // 연한 초록색
          ['0.5', '#c7e9c0'],    // 초록색
          ['0.75', '#74c476'],   // 진한 초록색
          ['1', '#238b45']       // 매우 진한 초록색
        ];
        console.log('🔍 히트맵 Greens 색상 팔레트 적용');
      } else if ((heatmapSettings as any).colors.palette === 'oranges') {
        // Oranges 색상 팔레트 (흰색→주황색)
        colorscale = [
          ['0', '#fff5eb'],      // 흰색
          ['0.25', '#fee6ce'],   // 연한 주황색
          ['0.5', '#fdd0a2'],    // 주황색
          ['0.75', '#fdae6b'],   // 진한 주황색
          ['1', '#d94801']       // 매우 진한 주황색
        ];
        console.log('🔍 히트맵 Oranges 색상 팔레트 적용');
      } else if ((heatmapSettings as any).colors.palette === 'reds') {
        // Reds 색상 팔레트 (흰색→빨간색)
        colorscale = [
          ['0', '#fff5f0'],      // 흰색
          ['0.25', '#fee0d2'],   // 연한 빨간색
          ['0.5', '#fcbba1'],    // 빨간색
          ['0.75', '#fb6a4a'],   // 진한 빨간색
          ['1', '#a50f15']       // 매우 진한 빨간색
        ];
        console.log('🔍 히트맵 Reds 색상 팔레트 적용');
      } else if ((heatmapSettings as any).colors.palette === 'purples') {
        // Purples 색상 팔레트 (흰색→보라색)
        colorscale = [
          ['0', '#fcfbfd'],      // 흰색
          ['0.25', '#efedf5'],   // 연한 보라색
          ['0.5', '#dadaeb'],    // 보라색
          ['0.75', '#bcbddc'],   // 진한 보라색
          ['1', '#54278f']       // 매우 진한 보라색
        ];
        console.log('🔍 히트맵 Purples 색상 팔레트 적용');
      } else if ((heatmapSettings as any).colors.palette === 'ylorbr') {
        // YlOrBr 색상 팔레트 (노란색→주황색→갈색)
        colorscale = [
          ['0', '#ffffd4'],      // 노란색
          ['0.25', '#fed98e'],   // 연한 주황색
          ['0.5', '#fe9929'],    // 주황색
          ['0.75', '#d95f0e'],   // 진한 주황색
          ['1', '#993404']       // 갈색
        ];
        console.log('🔍 히트맵 YlOrBr 색상 팔레트 적용');
      }
    }
  }
  
  return [{
    type: 'heatmap',
    x: xValues,
    y: yValues,
    z: zValues,
    colorscale: colorscale,
    // x축 텍스트 회전 없음 (항상 수평) - 강제 적용
    xaxis: 'x',
    yaxis: 'y',
    colorbar: {
      // 범례 위치에 따른 자동 방향 설정
      x: legendSettings.position === 'right' ? 1.05 : undefined,
      y: legendSettings.position === 'bottom' ? -0.25 : undefined,
      orientation: legendSettings.position === 'bottom' ? 'h' : 'v',
      len: legendSettings.position === 'bottom' ? 0.8 : 0.6,
      thickness: 15
    },
    // 셀 스타일 설정
    ...(cellSettings.border && {
      line: {
        color: cellSettings.borderColor || '#FFFFFF',
        width: 1
      }
    }),
    // 셀 간격 설정
    ...(cellSettings.gap && cellSettings.gap > 0 && {
      xgap: cellSettings.gap,
      ygap: cellSettings.gap
    })
  }];
};

// 워터폴 차트 데이터 생성
const createWaterfallChartData = (data: ChartData[]) => {
  const categoricalKeys = getCategoricalKeys(data);
  const numericKeys = getNumericKeys(data);
  
  if (categoricalKeys.length === 0 || numericKeys.length === 0) return [];
  
  const values = data.map(row => row[numericKeys[0]] as number);
  const measure = values.map((_, idx) => 
    idx === 0 ? 'absolute' : 
    idx === values.length - 1 ? 'absolute' : 'relative'
  );
  
  return [{
    type: 'waterfall',
    x: data.map(row => row[categoricalKeys[0]]),
    y: values,
    measure: measure,
    connector: { line: { color: 'rgb(63, 63, 63)' } },
    decreasing: { marker: { color: '#EF4444' } },
    increasing: { marker: { color: '#3B82F6' } },
    totals: { marker: { color: '#10B981' } }
  }];
};

// 콤보 차트 데이터 생성
const createComboChartData = (data: ChartData[]) => {
  const numericKeys = getNumericKeys(data);
  const categoricalKeys = getCategoricalKeys(data);
  
  if (numericKeys.length < 2 || categoricalKeys.length === 0) return [];
  
  const colors = getColors(undefined, numericKeys.length);
  
  return [
    // 막대 그래프
    {
      x: data.map(row => row[categoricalKeys[0]]),
      y: data.map(row => row[numericKeys[0]]),
      type: 'bar',
      name: numericKeys[0],
      marker: {
        color: colors[0],
        opacity: 0.7
      }
    },
    // 선 그래프
    {
      x: data.map(row => row[categoricalKeys[0]]),
      y: data.map(row => row[numericKeys[1]]),
      type: 'scatter',
      mode: 'lines+markers',
      name: numericKeys[1],
      yaxis: 'y2',
      line: {
        color: colors[1],
        width: 3
      },
      marker: {
        color: colors[1],
        size: 6
      }
    }
  ];
};

// 도넛 차트 데이터 생성
const createDonutChartData = (data: ChartData[], customization: ChartCustomization | undefined) => {
  const categoricalKeys = getCategoricalKeys(data);
  const numericKeys = getNumericKeys(data);
  
  if (categoricalKeys.length === 0 || numericKeys.length === 0) return [];
  
  const colors = getColors(customization, data.length);
  const safeCustomization = customization || {};
  
  // 도넛 차트 설정 적용
  const donutSettings = (safeCustomization as any).donut;
  const pieSettings = (safeCustomization as any).pie;
  const labelSettings = pieSettings?.labels || {};
  
  // 라벨 색상 설정
  let labelColors: string[] = [];
  if (labelSettings.colorMode === 'custom') {
    // 지정 색상 모드: 모든 라벨에 동일한 색상 적용
    labelColors = data.map(() => labelSettings.customColor || '#333333');
  } else {
    // 범례색과 동일 모드: 각 데이터 항목의 범례 색상과 동일하게 적용
    labelColors = data.map((_, index) => colors[index % colors.length]);
  }
  
  // 도넛 두께 계산 (donutRatio가 0.5면 hole은 0.5, 0.3이면 hole은 0.7)
  const holeRatio = pieSettings?.layout?.donutRatio ? 1 - pieSettings.layout.donutRatio : 0.4;
  
  // 시작 각도 적용
  const startAngle = pieSettings?.layout?.startAngle || 0;
  
  // 시계 방향 설정
  const direction = pieSettings?.layout?.clockwise ? 'clockwise' : 'counterclockwise';
  
  // 중앙 텍스트 설정을 위한 annotations 배열 생성
  const annotations = [];
  if (donutSettings?.center?.customText) {
    annotations.push({
      text: donutSettings.center.customText,
      font: {
        size: donutSettings.center.fontSize || 24,
        color: donutSettings.center.color || '#333'
      },
      showarrow: false,
      x: 0.5,
      y: 0.5,
      xref: 'paper',
      yref: 'paper'
    });
  }
  
  return [{
    values: data.map(row => row[numericKeys[0]]),
    labels: data.map(row => row[categoricalKeys[0]]),
    type: 'pie',
    hole: holeRatio,
    marker: {
      colors: data.map((_, index) => colors[index % colors.length])
    },
    textinfo: 'label+percent',
    textposition: 'outside',
    hoverinfo: 'label+percent+value',
    rotation: startAngle,
    direction: direction,
    textfont: {
      size: labelSettings.fontSize || 12,
      color: labelColors
    }
  }];
};

// 누적 막대 차트 데이터 생성 (일반/100% 누적 선택 가능)
const createStackedBarChartData = (data: ChartData[], customization: ChartCustomization | undefined) => {
  const numericKeys = getNumericKeys(data);
  const categoricalKeys = getCategoricalKeys(data);
  
  if (numericKeys.length === 0 || categoricalKeys.length === 0) return [];
  
  const colors = getColors(customization, data.length);
  const stackedBarSettings = customization?.stackedBar;
  
  // 누적 타입 설정 (기본값: 일반 누적)
  const stackMode = stackedBarSettings?.stacking?.mode || 'normal'; // 'normal' | '100percent'
  
  // X축 값들 (첫 번째 범주 컬럼)
  const xValues = [...new Set(data.map(row => row[categoricalKeys[0]]))];
  
  // 범례 값들 (두 번째 범주 컬럼이 있으면 사용, 없으면 첫 번째 수치 컬럼명 사용)
  const legendValues = categoricalKeys.length > 1 
    ? [...new Set(data.map(row => row[categoricalKeys[1]]))]
    : numericKeys;
  
  // 100% 누적을 위한 데이터 정규화
  let normalizedData = data;
  if (stackMode === '100percent') {
    // 각 X축 값별로 총합을 계산하고 비율로 변환
    const totals = xValues.map(x => {
      const rows = data.filter(r => r[categoricalKeys[0]] === x);
      return rows.reduce((sum, row) => sum + (row[numericKeys[0]] as number), 0);
    });
    
    normalizedData = data.map((row) => {
      const xIndex = xValues.indexOf(row[categoricalKeys[0]] as string);
      const total = totals[xIndex];
      const percentage = total > 0 ? ((row[numericKeys[0]] as number) / total) * 100 : 0;
      return { ...row, [numericKeys[0]]: percentage };
    });
  }
  
  // 각 범례별로 시리즈 생성
  return legendValues.map((legendValue, index) => {
    const seriesData = xValues.map(x => {
      const row = normalizedData.find(r => 
        categoricalKeys.length > 1 
          ? r[categoricalKeys[0]] === x && r[categoricalKeys[1]] === legendValue
          : r[categoricalKeys[0]] === x
      );
      return row ? row[numericKeys[0]] : 0;
    });
    
    return {
      x: xValues,
      y: seriesData,
      type: 'bar',
      name: String(legendValue),
      marker: {
        color: colors[index % colors.length],
        opacity: 0.8
      },
      stackgroup: 'one', // 누적 그룹 설정
      // 100% 누적일 때 Y축 범위 설정
      ...(stackMode === '100percent' && {
        yaxis: 'y',
        yhoverformat: '.1f%'
      })
    };
  });
};

// 트리맵 차트 데이터 생성
const createTreemapChartData = (data: ChartData[], customization: ChartCustomization | undefined) => {
  const categoricalKeys = getCategoricalKeys(data);
  const numericKeys = getNumericKeys(data);
  
  if (categoricalKeys.length === 0 || numericKeys.length === 0) return [];
  
  const colors = getColors(customization, data.length);
  
  return [{
    type: 'treemap',
    labels: data.map(row => row[categoricalKeys[0]]),
    parents: data.map(() => ''), // 최상위 레벨
    values: data.map(row => row[numericKeys[0]]),
    textinfo: 'label+value',
    marker: {
      colors: data.map((_, index) => colors[index % colors.length])
    }
  }];
};

// 선버스트 차트 데이터 생성
const createSunburstChartData = (data: ChartData[], customization: ChartCustomization | undefined) => {
  const categoricalKeys = getCategoricalKeys(data);
  const numericKeys = getNumericKeys(data);
  
  if (categoricalKeys.length === 0 || numericKeys.length === 0) return [];
  
  const colors = getColors(customization, data.length);
  
  // 디버깅을 위한 로그
  console.log('Sunburst Chart Debug:', {
    categoricalKeys,
    numericKeys,
    dataLength: data.length,
    colorsLength: colors.length,
    sampleData: data.slice(0, 2)
  });
  
  // 계층 구조 데이터 변환
  const buildHierarchy = () => {
    const hierarchy: any = {};
    
    // 1단계: 리프 노드 값 설정
    data.forEach(row => {
      const level1 = row[categoricalKeys[0]] as string;
      const level2 = categoricalKeys.length > 1 ? row[categoricalKeys[1]] as string : '';
      const level3 = categoricalKeys.length > 2 ? row[categoricalKeys[2]] as string : '';
      const value = row[numericKeys[0]] as number;
      
      if (!hierarchy[level1]) {
        hierarchy[level1] = { children: {}, value: 0 };
      }
      
      if (level2) {
        if (!hierarchy[level1].children[level2]) {
          hierarchy[level1].children[level2] = { children: {}, value: 0 };
        }
        
        if (level3) {
          if (!hierarchy[level1].children[level2].children[level3]) {
            hierarchy[level1].children[level2].children[level3] = { value: 0 };
          }
          hierarchy[level1].children[level2].children[level3].value += value;
        } else {
          hierarchy[level1].children[level2].value += value;
        }
      } else {
        hierarchy[level1].value += value;
      }
    });
    
    // 2단계: 부모 노드 값을 자식들의 합으로 업데이트
    const updateParentValues = (node: any) => {
      if (node.children && Object.keys(node.children).length > 0) {
        let totalValue = 0;
        Object.values(node.children).forEach((child: any) => {
          updateParentValues(child);
          totalValue += child.value;
        });
        node.value = totalValue;
      }
    };
    
    Object.values(hierarchy).forEach(updateParentValues);
    
    return hierarchy;
  };
  
  const hierarchy = buildHierarchy();
  
  // Plotly sunburst 형식으로 변환
  const labels: string[] = [];
  const parents: string[] = [];
  const values: number[] = [];
  
  Object.entries(hierarchy).forEach(([level1, level1Data]: [string, any]) => {
    labels.push(level1);
    parents.push('');
    values.push(level1Data.value);
    
    if (level1Data.children) {
      Object.entries(level1Data.children).forEach(([level2, level2Data]: [string, any]) => {
        labels.push(level2);
        parents.push(level1);
        values.push(level2Data.value);
        
        if (level2Data.children) {
          Object.entries(level2Data.children).forEach(([level3, level3Data]: [string, any]) => {
            labels.push(level3);
            parents.push(level2);
            values.push(level3Data.value);
          });
        }
      });
    }
  });
  
  // 색상 배열을 labels 길이에 맞게 확장
  const extendedColors = [];
  for (let i = 0; i < labels.length; i++) {
    extendedColors.push(colors[i % colors.length]);
  }
  
  const chartData = {
    type: 'sunburst',
    labels,
    parents,
    values,
    textinfo: 'label+value',
    marker: {
      colors: extendedColors
    },
    branchvalues: 'total'
  };
  
  // 디버깅을 위한 로그
  console.log('Sunburst Chart Data:', {
    labels,
    parents,
    values,
    colors: extendedColors,
    chartData
  });
  
  return [chartData];
};

// 박스플롯 차트 데이터 생성
const createBoxplotChartData = (data: ChartData[], customization: ChartCustomization | undefined) => {
  const categoricalKeys = getCategoricalKeys(data);
  const numericKeys = getNumericKeys(data);
  
  if (categoricalKeys.length === 0 || numericKeys.length === 0) return [];
  
  const colors = getColors(customization, data.length);
  const groups = [...new Set(data.map(row => row[categoricalKeys[0]]))];
  
  return groups.map((group, index) => ({
    type: 'box',
    y: data
      .filter(row => row[categoricalKeys[0]] === group)
      .map(row => row[numericKeys[0]]),
    name: group,
    marker: {
      color: colors[index % colors.length]
    },
    boxpoints: 'outliers'
  }));
};

// 파넬 차트 데이터 생성 (동적 분석 기반)
const createPanelChartData = (data: ChartData[], customization: ChartCustomization | undefined) => {
  const numericKeys = getNumericKeys(data);
  const categoricalKeys = getCategoricalKeys(data);
  
  if (numericKeys.length === 0 || categoricalKeys.length === 0) return [];
  
  // 🔍 데이터 구조 자동 분석
  const columnAnalysis = analyzeDataStructure(data);
  
  // 차트 분할 기준 컬럼 (가장 많은 고유값을 가진 컬럼)
  const splitColumn = columnAnalysis.splitColumn;
  const splitValues = columnAnalysis.splitValues;
  
  // X축 컬럼 (차트 분할 기준이 아닌 범주 컬럼)
  const xAxisColumn = columnAnalysis.xAxisColumn;
  const xAxisValues = columnAnalysis.xAxisValues;
  
  // Y축 컬럼 (수치 컬럼)
  const yAxisColumn = columnAnalysis.yAxisColumn;
  
     // 커스터마이징된 색상 팔레트 적용
   const colors = getColors(customization, splitValues.length);
  
  // 각 분할 값별로 차트 생성
  return splitValues.map((splitValue, index) => {
    const filteredData = data.filter(row => row[splitColumn] === splitValue);
    
    // X축 값에 따른 Y축 값 매핑
    const yValues = xAxisValues.map(xValue => {
      const row = filteredData.find(r => r[xAxisColumn] === xValue);
      return row ? row[yAxisColumn] : 0;
    });
    
    return {
      x: xAxisValues,
      y: yValues,
      type: 'scatter',
      mode: 'lines+markers',
      name: String(splitValue), // 분할 값명을 시리즈명으로
      line: {
        color: colors[index % colors.length],
        width: 2,
        shape: 'spline'
      },
      marker: {
        size: 4,
        color: colors[index % colors.length]
      },
      xaxis: `x${index + 1}`,
      yaxis: `y${index + 1}`
    };
  });
};

// 🔍 데이터 구조 자동 분석 함수
const analyzeDataStructure = (data: ChartData[]) => {
  const categoricalKeys = getCategoricalKeys(data);
  const numericKeys = getNumericKeys(data);
  
  // 각 범주 컬럼의 고유값 개수 분석
  const columnUniqueCounts = categoricalKeys.map(key => ({
    key,
    uniqueCount: new Set(data.map(row => row[key])).size,
    values: [...new Set(data.map(row => row[key]))]
  }));
  
  // 🔄 수정: 고유값이 적은 컬럼을 차트 분할 기준으로 선택 (권역별 차트)
  const splitColumnInfo = columnUniqueCounts.reduce((min, current) => 
    current.uniqueCount < min.uniqueCount ? current : min
  );
  
  // 차트 분할 기준이 아닌 범주 컬럼을 X축으로 선택 (월별)
  const xAxisColumnInfo = columnUniqueCounts.find(col => col.key !== splitColumnInfo.key);
  
  // 수치 컬럼을 Y축으로 선택
  const yAxisColumn = numericKeys[0];
  
  return {
    splitColumn: splitColumnInfo.key,           // 차트 분할 기준 컬럼 (권역)
    splitValues: splitColumnInfo.values,        // 분할 기준 값들 (4개 권역)
    xAxisColumn: xAxisColumnInfo?.key || '',   // X축 컬럼 (월)
    xAxisValues: xAxisColumnInfo?.values || [], // X축 값들 (12개 월)
    yAxisColumn,                               // Y축 컬럼 (건수)
    totalCharts: splitColumnInfo.uniqueCount   // 총 차트 개수 (4개)
  };
};

// Plotly 차트 레이아웃 생성
export const createPlotlyLayout = (
  chartType: ChartType, 
  customization: ChartCustomization | undefined,
  dataStructure: any,
  chartData?: any
) => {
  // customization이 undefined인 경우 기본값 사용
  const safeCustomization = customization || { common: { title: { text: '' } } };
  
  // 범례 위치 설정
  const getLegendPosition = () => {
    const position = (safeCustomization as any).common?.legend?.position || 'bottom';
    switch (position) {
      case 'top':
        return { x: 0.5, y: 1.1, xanchor: 'center', yanchor: 'bottom', orientation: 'h' };
      case 'bottom':
        return { x: 0.5, y: -0.2, xanchor: 'center', yanchor: 'top', orientation: 'h' };
      case 'left':
        return { x: -0.1, y: 0.5, xanchor: 'right', yanchor: 'middle', orientation: 'v' };
      case 'right':
        return { x: 1.1, y: 0.5, xanchor: 'left', yanchor: 'middle', orientation: 'v' };
      default:
        return { x: 0.5, y: -0.2, xanchor: 'center', yanchor: 'top', orientation: 'h' };
    }
  };
  
  const baseLayout = {
    title: {
      text: (safeCustomization as any).common?.title?.text || '',
      font: { 
        size: (safeCustomization as any).common?.title?.fontSize || 18, 
        color: (safeCustomization as any).common?.title?.color || '#333' 
      }
    },
    font: { family: 'system-ui, sans-serif' },
    margin: { 
      // 적절한 margin 설정 (패널 간 겹침 방지)
      l: 50,
      r: 50, 
      t: 50,
      b: 50
    },
    showlegend: (safeCustomization as any).common?.legend?.position !== 'none',
    legend: getLegendPosition(),
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    // 모드바 완전 숨김
    modebar: {
      remove: true
    }
  };

  // 차트 유형별 특별한 레이아웃 설정
  switch (chartType) {
    case 'line':
      return {
        ...baseLayout,
        xaxis: {
          title: (safeCustomization as any).axisLabels?.x,
          type: 'category', // 카테고리 타입으로 설정
          showgrid: true,
          gridcolor: '#f0f0f0'
        },
        yaxis: {
          title: (safeCustomization as any).axisLabels?.y,
          showgrid: true,
          gridcolor: '#f0f0f0'
        }
      };
    
    case 'area':
      return {
        ...baseLayout,
        xaxis: {
          title: (safeCustomization as any).axisLabels?.x,
          type: 'category', // 카테고리 타입으로 설정
          showgrid: true,
          gridcolor: '#f0f0f0'
        },
        yaxis: {
          title: (safeCustomization as any).axisLabels?.y,
          showgrid: true,
          gridcolor: '#f0f0f0'
        }
      };
    
    case 'bar':
      const barDirection = (safeCustomization as any).bar?.bars?.direction || 'vertical';
      const isHorizontalBar = barDirection === 'horizontal';
      
      return {
        ...baseLayout,
        // 수평 막대 그래프일 때 마진 조정 (y축 텍스트가 잘리지 않도록)
        margin: isHorizontalBar ? { 
          l: 120,  // 왼쪽 마진 증가 (y축 제목 + 카테고리 텍스트 공간)
          r: 50, 
          t: 50,
          b: 50
        } : baseLayout.margin,
        xaxis: {
          title: isHorizontalBar ? (safeCustomization as any).axisLabels?.y : (safeCustomization as any).axisLabels?.x,
          type: isHorizontalBar ? 'value' : 'category', // 수평일 때 x축은 수치형
          showgrid: true,
          gridcolor: '#f0f0f0'
        },
        yaxis: {
          title: isHorizontalBar ? (safeCustomization as any).axisLabels?.x : (safeCustomization as any).axisLabels?.y,
          type: isHorizontalBar ? 'category' : 'value', // 수평일 때 y축은 카테고리형
          showgrid: true,
          gridcolor: '#f0f0f0',
          // 수평 막대 그래프일 때 y축 텍스트가 잘리지 않도록 설정
          ...(isHorizontalBar && {
            tickmode: 'auto',
            nticks: 'auto',
            tickangle: 0,  // 텍스트 회전 없음
            tickfont: {
              size: 12
            }
          })
        },
        bargap: ((safeCustomization as any).bar?.bars?.barSpacing || 10) / 100,
        bargroupgap: ((safeCustomization as any).bar?.bars?.attachBars ? 0 : ((safeCustomization as any).bar?.bars?.groupSpacing || 20)) / 100
      };
    
    case 'stackedBar':
      // 누적 타입에 따른 Y축 설정
      const stackMode = (safeCustomization as any).stackedBar?.stacking?.mode || 'normal';
      const yAxisConfig = stackMode === '100percent' 
        ? {
            title: (safeCustomization as any).axisLabels?.y || '', // Y축 제목 제거
            range: [0, 100],
            tickformat: '0%', // 20%, 40%, 60%, 80%, 100% 형식으로 표시
            tickmode: 'array',
            tickvals: [0, 20, 40, 60, 80, 100], // 명시적 기준값 설정
            ticktext: ['0%', '20%', '40%', '60%', '80%', '100%'], // 표시할 텍스트
            showgrid: true,
            gridcolor: '#f0f0f0'
          }
        : {
            title: (safeCustomization as any).axisLabels?.y,
            showgrid: true,
            gridcolor: '#f0f0f0'
          };
      
      return {
        ...baseLayout,
        xaxis: {
          title: (safeCustomization as any).axisLabels?.x,
          showgrid: true,
          gridcolor: '#f0f0f0'
        },
        yaxis: yAxisConfig,
        barmode: 'stack',
        bargap: ((safeCustomization as any).stackedBar?.bars?.barSpacing || 10) / 100,
        bargroupgap: ((safeCustomization as any).stackedBar?.bars?.groupSpacing || 20) / 100
      };
    
    case 'radar':
      // 레이더 차트 커스터마이징 설정 가져오기
      const radarSettings = customization?.radar || {};
      const axesSettings = (radarSettings as any).axes || {};
      
      console.log('🔍 레이더 차트 레이아웃 설정:', radarSettings);
      
      // 첫 번째 범주 컬럼의 값들을 가져와서 축 레이블로 사용
      const categoricalKeys = getCategoricalKeys(dataStructure.data || []);
      const indicators = categoricalKeys.length > 0 
        ? [...new Set((dataStructure.data || []).map((row: any) => row[categoricalKeys[0]]))]
        : [];
      
      // 실제 데이터의 지표 개수에 맞춰 동적으로 설정
      const actualIndicatorsCount = indicators.length;
      
      // 각도 계산 (360도를 지표 개수로 나누기)
      const tickvals = indicators.map((_, index) => (index * 360) / actualIndicatorsCount);
      
      return {
        ...baseLayout,
        polar: {
          radialaxis: {
            visible: true,
            range: [0, axesSettings.normalize ? 100 : Math.max(...getNumericKeys(dataStructure.data || []).map(key => 
              Math.max(...(dataStructure.data || []).map((row: any) => row[key] as number))
            ))],
            // 정규화가 활성화된 경우 0-100 범위로 설정
            ...(axesSettings.normalize && { range: [0, 100] })
          },
          // 동적으로 지표 개수에 맞춰 설정
          angularaxis: {
            visible: true,
            tickvals: tickvals,
            ticktext: indicators
          }
        },
        showlegend: true,
        legend: {
          ...getLegendPosition(),
          orientation: 'h',
          y: -0.3
        }
      };
    
    case 'gauge':
      return {
        ...baseLayout,
        showlegend: false,
        margin: {
          l: 60,
          r: 60,
          t: 80,
          b: 60
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
      };
    
    case 'pie':
    case 'donut':
      // 파이 차트와 도넛 차트의 중앙 텍스트 설정
      const donutSettings = (safeCustomization as any).donut;
      
      // 중앙 텍스트 설정을 위한 annotations 배열 생성
      const annotations = [];
      if (chartType === 'donut' && donutSettings?.center?.customText) {
        annotations.push({
          text: donutSettings.center.customText,
          font: {
            size: donutSettings.center.fontSize || 24,
            color: donutSettings.center.color || '#333'
          },
          showarrow: false,
          x: 0.5,
          y: 0.5,
          xref: 'paper',
          yref: 'paper'
        });
      }
      
      return {
        ...baseLayout,
        annotations: annotations.length > 0 ? annotations : undefined
      };
    
    case 'combo':
      return {
        ...baseLayout,
        yaxis: {
          title: (safeCustomization as any).axisLabels?.x,
          showgrid: true,
          gridcolor: '#f0f0f0'
        },
        yaxis2: {
          title: ((safeCustomization as any).axisLabels?.y || '') + ' (보조)',
          overlaying: 'y',
          side: 'right',
          showgrid: false
        }
      };
    
    case 'timeline': {
      const layout = {
        ...baseLayout,
        xaxis: {
          title: (safeCustomization as any).axisLabels?.x || '시간',
          type: 'date',
          showgrid: true,
          gridcolor: '#f0f0f0',
          tickformat: '%Y-%m-%d',
          // 월 단위로 명확하게 구분
          dtick: 'M1',
          tickmode: 'auto',
          nticks: 12
        },
        yaxis: {
          title: (safeCustomization as any).axisLabels?.y || '작업',
          showgrid: false,
          zeroline: false,
          // 작업 순서 유지 (위에서 아래로)
          autorange: 'reversed'
        },
        barmode: 'overlay',
        // 상단 여백을 늘려서 annotation 공간 확보
        margin: {
          ...baseLayout.margin,
          t: 120
        }
      };
      
      // 타임라인 차트 데이터에서 annotation 추가
      if (chartData && (chartData as any).annotations) {
        (layout as any).annotations = (chartData as any).annotations;
      }
      
      return layout;
    }
    
    case 'panel':
      // 파넬 차트의 경우 동적 그리드 레이아웃 설정
      const panelAnalysis = analyzeDataStructure(dataStructure.data || []);
      const totalCharts = panelAnalysis.totalCharts;
      
      // 차트 개수에 따른 그리드 크기 자동 계산
      const gridCols = Math.ceil(Math.sqrt(totalCharts));
      const gridRows = Math.ceil(totalCharts / gridCols);
      
      return {
        ...baseLayout,
        showlegend: false,
        grid: {
          rows: gridRows,
          columns: gridCols,
          pattern: 'independent',
          // 🚨 grid 여백으로 패널 간 간격 확보
          xgap: 0.1,  // 좌우 패널 간 10% 여백
          ygap: 0.1   // 상하 패널 간 10% 여백
        },
                // 각 패널별 X축 설정 (제목 없음)
                ...Object.fromEntries(Array.from({ length: totalCharts }, (_, index) => {
                  const col = (index % gridCols) + 1;
                  return [
                    `xaxis${index + 1}`, {
                      title: '', // X축 제목 제거
                      showgrid: true,
                      gridcolor: '#f0f0f0',
                      domain: [
                        (col - 1) / gridCols + 0.05,  // 🚨 domain 여백: +0.05
                        col / gridCols - 0.05          // 🚨 domain 여백: -0.05
                      ],
                      position: 0.5,
                      // 🚨 여기에 추가: X축 라벨을 가로로 표시
                      tickangle: 0,  // 0도 = 가로
                      tickmode: 'auto',
                      nticks: 'auto',  // 자동으로 적절한 개수 결정
                      tickfont: {
                        size: 10     // 글자 크기 조정
                      }
                    }
                  ];
                })),
        // 각 패널별 Y축 설정 (제목 없음)
        ...Object.fromEntries(Array.from({ length: totalCharts }, (_, index) => {
          const row = Math.floor(index / gridCols) + 1;
          return [
            `yaxis${index + 1}`, {
              title: '', // Y축 제목 제거
              showgrid: true,
              gridcolor: '#f0f0f0',
              domain: [
                1 - row / gridRows + 0.05,     // 🚨 domain 여백: +0.05
                1 - (row - 1) / gridRows - 0.05  // 🚨 domain 여백: -0.05
              ],
              position: 0.5
            }
          ];
        }))
      };
    
    case 'heatmap':
      // 히트맵 차트 커스터마이징 설정 가져오기
      const heatmapSettings = customization?.heatmap || {};
      const legendSettings = (heatmapSettings as any).legend || {};
      
      console.log('🔍 히트맵 레이아웃 설정:', heatmapSettings);
      
      return {
        ...baseLayout,
        // 히트맵 전용 마진 설정 (범례 공간 확보)
        margin: {
          ...baseLayout.margin,
          r: legendSettings.position === 'right' ? 120 : baseLayout.margin.r,
          b: legendSettings.position === 'bottom' ? 120 : baseLayout.margin.b
        },
        // 히트맵 축 설정
        xaxis: {
          title: (safeCustomization as any).axisLabels?.x,
          showgrid: true,
          gridcolor: '#f0f0f0',
          // x축 텍스트 회전 없음 (항상 수평)
          tickangle: 0
        },
        yaxis: {
          title: (safeCustomization as any).axisLabels?.y,
          showgrid: true,
          gridcolor: '#f0f0f0'
        }
      };
    
    default:
      return {
        ...baseLayout,
        xaxis: {
          title: (safeCustomization as any).axisLabels?.x,
          showgrid: true,
          gridcolor: '#f0f0f0'
        },
        yaxis: {
          title: (safeCustomization as any).axisLabels?.y,
          showgrid: true,
          gridcolor: '#f0f0f0'
        }
      };
  }
};

// Plotly 차트 설정 생성
export const createPlotlyConfig = () => ({
  displayModeBar: false, // 전체 모드바 숨김
  displaylogo: false,
  modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d', 'autoScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian', 'resetScale2d', 'zoomIn2d', 'zoomOut2d'],
  responsive: true,
  showTips: false, // 툴팁 힌트 숨김
  showLink: false, // Plotly 링크 숨김
  staticPlot: false // 정적 플롯은 유지 (상호작용 가능)
});

// 타임라인 차트 데이터 생성
const createTimelineChartData = (data: ChartData[], customization: ChartCustomization | undefined) => {
  console.log('Timeline Chart Debug - Input data:', data);
  
  const categoricalKeys = getCategoricalKeys(data);
  const numericKeys = getNumericKeys(data);
  
  console.log('Timeline Chart Debug - Keys:', { categoricalKeys, numericKeys });
  
  if (categoricalKeys.length === 0) {
    console.log('Timeline Chart Debug - No categorical keys found');
    return [];
  }
  
  const colors = getColors(customization, data.length);
  
  // 날짜 컬럼 찾기 (시작일, 종료일)
  const dateKeys = Object.keys(data[0]).filter(key => {
    const value = data[0][key];
    const isDate = (value as any) instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)));
    console.log(`Timeline Chart Debug - Key ${key}:`, { value, isDate });
    return isDate;
  });
  
  console.log('Timeline Chart Debug - Date keys found:', dateKeys);
  
  if (dateKeys.length < 2) {
    console.log('Timeline Chart Debug - Not enough date keys (need 2, found', dateKeys.length, ')');
    return [];
  }
  
  const startKey = dateKeys[0];
  const endKey = dateKeys[1];
  const nameKey = categoricalKeys[0];
  
  console.log('Timeline Chart Debug - Selected keys:', { startKey, endKey, nameKey });
  
  // 전체 기간 계산
  const allDates = data.flatMap(row => [
    new Date(row[startKey] as string),
    new Date(row[endKey] as string)
  ]).filter(date => !isNaN(date.getTime()));
  
  if (allDates.length === 0) {
    console.log('Timeline Chart Debug - No valid dates found');
    return [];
  }
  
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
  
  console.log('Timeline Chart Debug - Date range:', { minDate, maxDate });
  
  // 엑셀 순서대로 정렬 (데이터 순서 유지)
  const sortedData = [...data];
  
  // 각 작업에 대한 Gantt 차트 트레이스 생성
  const traces = sortedData.map((row, index) => {
    const start = new Date(row[startKey] as string);
    const end = new Date(row[endKey] as string);
    
    // 유효한 날짜인지 확인
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.log(`Timeline Chart Debug - Invalid date for row ${index}:`, row);
      return null;
    }
    
    console.log(`Timeline Chart Debug - Row ${index}:`, { 
      name: row[nameKey], 
      start: start.toISOString(), 
      end: end.toISOString() 
    });
    
    // Gantt 차트 스타일의 트레이스
    return {
      type: 'bar' as const,
      x: [start, end],
      y: [String(row[nameKey]), String(row[nameKey])],
      name: String(row[nameKey]),
      orientation: 'h' as const,
      marker: {
        color: colors[index % colors.length],
        line: {
          color: '#333',
          width: 1
        }
      },
      hovertemplate: `
        <b>${row[nameKey]}</b><br>
        시작: %{x[0]|%Y-%m-%d}<br>
        종료: %{x[1]|%Y-%m-%d}<br>
        기간: ${Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))}일<br>
        <extra></extra>
      `,
      showlegend: false,
      width: 0.8 // 막대 두께 조정
    };
  }).filter(Boolean);
  
  console.log('Timeline Chart Debug - Generated traces:', traces);
  
  // 전체 기간 표시를 위한 annotation 추가
  const totalDuration = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    traces,
    annotations: [{
      text: `전체 기간: ${minDate.toLocaleDateString('ko-KR')} ~ ${maxDate.toLocaleDateString('ko-KR')} (${totalDuration}일)`,
      x: 0.5,
      y: 1.02,
      xref: 'paper',
      yref: 'paper',
      showarrow: false,
      font: {
        size: 16,
        color: '#333'
      },
      bgcolor: 'rgba(255, 255, 255, 0.8)',
      bordercolor: '#ccc',
      borderwidth: 1
    }]
  };
};

// 유틸리티 함수들


// 다중 색상 그라데이션 생성 함수
const generateMultiColorGradient = (colors: string[], steps: number, direction: 'vertical' | 'horizontal' | 'diagonal'): string[] => {
  if (colors.length < 2) return colors;
  
  console.log('🔍 다중 색상 그라데이션 시작:', { colors, steps, direction });
  
  const result: string[] = [];
  const colorsPerSegment = Math.ceil(steps / (colors.length - 1));
  
  console.log('🔍 세그먼트별 단계 수:', colorsPerSegment);
  
  for (let i = 0; i < colors.length - 1; i++) {
    const startColor = colors[i];
    const endColor = colors[i + 1];
    const segmentSteps = i === colors.length - 2 ? 
      steps - (colors.length - 2) * colorsPerSegment : 
      colorsPerSegment;
    
    console.log(`🔍 세그먼트 ${i}: ${startColor} → ${endColor}, 단계: ${segmentSteps}`);
    
    const segmentColors = generateGradientColors(startColor, endColor, segmentSteps, direction);
    result.push(...segmentColors);
    
    console.log(`🔍 세그먼트 ${i} 결과:`, segmentColors);
  }
  
  // 정확한 단계 수에 맞춰 조정
  if (result.length > steps) {
    result.splice(steps);
    console.log('🔍 단계 수 초과로 자름:', result.length);
  } else if (result.length < steps) {
    // 부족한 경우 마지막 색상으로 채움
    while (result.length < steps) {
      result.push(colors[colors.length - 1]);
    }
    console.log('🔍 부족한 단계를 마지막 색상으로 채움:', result.length);
  }
  
  console.log('🔍 최종 다중 색상 그라데이션:', result);
  return result;
};

// 그라데이션 색상 생성 함수
const generateGradientColors = (startColor: string, endColor: string, steps: number, direction: 'vertical' | 'horizontal' | 'diagonal'): string[] => {
  // HEX 색상을 RGB로 변환
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  };
  
  // RGB를 HEX로 변환
  const rgbToHex = (r: number, g: number, b: number): string => {
    const toHex = (n: number) => {
      const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };
  
  // 두 색상 사이의 보간
  const interpolate = (start: number, end: number, factor: number): number => {
    return start + (end - start) * factor;
  };
  
  const startRgb = hexToRgb(startColor);
  const endRgb = hexToRgb(endColor);
  
  const colors: string[] = [];
  for (let i = 0; i < steps; i++) {
    const factor = i / (steps - 1);
    
    // 그라데이션 방향에 따른 색상 변화
    let adjustedFactor = factor;
    if (direction === 'diagonal') {
      // 대각선 방향: 더 극적인 색상 변화
      adjustedFactor = Math.pow(factor, 0.7);
    } else if (direction === 'horizontal') {
      // 수평 방향: 중간에서 더 빠른 변화
      adjustedFactor = factor < 0.5 ? factor * 1.5 : 0.5 + (factor - 0.5) * 0.5;
    }
    // 수직 방향: 선형 변화
    
    const r = interpolate(startRgb[0], endRgb[0], adjustedFactor);
    const g = interpolate(startRgb[1], endRgb[1], adjustedFactor);
    const b = interpolate(startRgb[2], endRgb[2], adjustedFactor);
    
    colors.push(rgbToHex(r, g, b));
  }
  
  return colors;
}; 
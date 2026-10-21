// 차트 커스터마이징 타입 정의
import { ChartType } from './index';

// 공통 설정
export interface CommonChartSettings {
  // 제목
  title: {
    text: string;
    fontSize: number;
    fontWeight: 'normal' | 'bold';
    color: string;
  };
  
  // 캔버스 여백
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  
  // 범례
  legend: {
    position: 'right' | 'bottom' | 'left' | 'none';
    maxItemsPerRow?: number;
  };
  
  // 색상
  colors: {
    palette: 'brand' | 'rainbow' | 'reference18' | 'custom';
    customColors?: string[];
    seriesColors?: Record<string, string>;
  };
  
  // 라벨
  labels: {
    show: boolean;
    format: 'number' | 'percentage' | 'currency' | 'custom';
    decimals: number;
    thousandsSeparator: boolean;
    unit: string;
    position: 'inside' | 'outside' | 'end';
  };
  
  // 축
  axes: {
    x: AxisSettings;
    y: AxisSettings;
    secondaryY?: AxisSettings;
  };
  
  // 기준선 및 밴드
  referenceLines: {
    horizontal: ReferenceLine[];
    vertical: ReferenceLine[];
    bands: ThresholdBand[];
  };
  
  // 정렬
  sorting: {
    type: 'value' | 'name' | 'custom' | 'office' | 'district';
    direction: 'asc' | 'desc';
    customOrder?: string[];
  };
  
  // 상호작용
  interaction: {
    tooltip: boolean;
    highlight: boolean;
    brush: boolean;
    zoom: boolean;
    pan: boolean;
    drillDown: boolean;
    crossFilter: boolean;
  };
  
  // 다운로드
  download: {
    formats: ('png' | 'svg' | 'pdf')[];
  };
}

// 축 설정
export interface AxisSettings {
  name: string;
  unit: string;
  tickInterval: 'auto' | number;
  format: string;
  min?: number;
  max?: number;
  reverse: boolean;
  gridLines: boolean;
}

// 기준선
export interface ReferenceLine {
  value: number;
  color: string;
  style: 'solid' | 'dashed' | 'dotted';
  width: number;
  label?: string;
  showLabel: boolean;
}

// 임계값 밴드
export interface ThresholdBand {
  min: number;
  max: number;
  color: string;
  opacity: number;
  label: string;
}

// 선형 그래프 설정
export interface LineChartSettings extends CommonChartSettings {
  lines: {
    color: string;
    thickness: number;
    style: 'solid' | 'dashed' | 'longDashed';
    curveInterpolation: 'linear' | 'smooth';
    missingDataHandling: 'break' | 'interpolate';
  };
  
  markers: {
    shape: 'circle' | 'square' | 'diamond';
    size: number;
    fill: 'filled' | 'hollow' | 'style2';
    borderColor: string;
    borderWidth: number;
  };
  
  trendAnalysis: {
    movingAverage: {
      enabled: boolean;
      windowSize: number;
      type: 'simple' | 'exponential';
    };
    regressionLine: {
      enabled: boolean;
      type: 'linear' | 'polynomial';
      degree?: number;
    };
    confidenceInterval: {
      enabled: boolean;
      sigma: number;
    };
  };
  
  seriesOrder: {
    fixed: boolean;
    order: string[];
  };
}

// 누적 영역 그래프 설정
export interface AreaChartSettings extends CommonChartSettings {
  stacking: {
    mode: 'sum' | 'percentage';
    normalizeTo100: boolean;
  };
  
  area: {
    opacity: number;
    gradient: boolean;
    showBoundary: boolean;
    boundaryColor: string;
  };
  
  baseline: {
    value: number;
    showLine: boolean;
  };
  
  seriesOrder: {
    fixed: boolean;
    order: string[];
    cumulativeOrder: 'topToBottom' | 'custom';
  };
}

// 막대 그래프 설정
export interface BarChartSettings extends CommonChartSettings {
  bars: {
    direction: 'vertical' | 'horizontal';
    barSpacing: number;
    groupSpacing: number;
    borderRadius: number;
    stackType?: 'normal' | '100percent'; // 누적 막대 그래프용: 일반 누적 또는 100% 누적
    attachBars: boolean; // 그룹 내 막대를 서로 붙이기
  };
  
  labels: {
    show: boolean;
    format: 'number' | 'percentage' | 'currency' | 'custom';
    decimals: number;
    thousandsSeparator: boolean;
    unit: string;
    position: 'inside' | 'outside' | 'end';
    rotation: number;
    showValue: boolean;
    showPercentage: boolean;
  };
  
  sorting: {
    type: 'value' | 'name' | 'custom' | 'office' | 'district';
    direction: 'asc' | 'desc';
    fixedOrder: boolean;
  };
  
  runningTotal: {
    enabled: boolean;
    lineColor: string;
    lineWidth: number;
    showValues: boolean;
  };
}

// 누적 막대 그래프 설정
export interface StackedBarChartSettings extends BarChartSettings {
  stacking: {
    mode: 'normal' | '100percent';
    normalizeTo100: boolean;
  };
  
  segments: {
    fixedOrder: boolean;
    order: string[];
  };
  
  grouping: {
    enabled: boolean;
    groupBy: string;
    groupSpacing: number;
  };
}

// 원형 차트 설정
export interface PieChartSettings extends CommonChartSettings {
  layout: {
    startAngle: number;
    clockwise: boolean;
    donutRatio: number; // 0 = 원형, >0 = 도넛
  };
  
  labels: {
    show: boolean;
    format: 'number' | 'percentage' | 'currency' | 'custom';
    decimals: number;
    thousandsSeparator: boolean;
    unit: string;
    position: 'inside' | 'outside';
    labelType: 'percentage' | 'value' | 'name' | 'all';
    smartLabels: boolean;
    avoidOverlap: boolean;
    fontSize: number;
    colorMode: 'legend' | 'custom';
    customColor: string;
  };
  
  grouping: {
    topN: number;
    groupOthers: boolean;
    othersLabel: string;
  };
  
  legendOrder: {
    fixed: boolean;
    order: string[];
  };
}

// 도넛 차트 설정
export interface DonutChartSettings extends PieChartSettings {
  center: {
    showTotal: boolean;
    customText?: string;
    fontSize: number;
    color: string;
  };
  
  segments: {
    gap: number;
    highlight: string[];
    highlightScale: number;
  };
}

// 선버스트 차트 설정
export interface SunburstChartSettings extends CommonChartSettings {
  hierarchy: {
    path: string[];
    fieldMapping: Record<string, string>;
  };
  
  rings: {
    thickness: number;
    minRatio: number;
    showLabels: boolean;
  };
  
  interaction: {
    tooltip: boolean;
    highlight: boolean;
    brush: boolean;
    zoom: boolean;
    pan: boolean;
    drillDown: boolean;
    crossFilter: boolean;
    drillUp: boolean;
    sameLevelSort: 'fixed' | 'value';
  };
}

// 트리맵 설정
export interface TreemapChartSettings extends CommonChartSettings {
  layout: {
    algorithm: 'squarify' | 'slice' | 'dice';
    padding: number;
  };
  
  colors: {
    palette: 'custom' | 'brand' | 'rainbow' | 'reference18';
    customColors?: string[];
    seriesColors?: Record<string, string>;
    scale: 'categorical' | 'continuous';
    field: string;
    borderWidth: number;
    borderRadius: number;
  };
  
  filtering: {
    minArea: number;
    maxDepth: number;
  };
  
  sorting: {
    type: 'value' | 'name' | 'custom' | 'office' | 'district';
    direction: 'asc' | 'desc';
    customOrder?: string[];
    field: string;
  };
}

// 산점도 설정
export interface ScatterChartSettings extends CommonChartSettings {
  points: {
    shape: 'circle' | 'square' | 'diamond' | 'triangle';
    sizeMapping: string;
    sizeRange: [number, number];
    opacity: number;
    jitter: number;
  };
  
  analysis: {
    regressionLine: boolean;
    correlationCoefficient: boolean;
    quadrants: {
      enabled: boolean;
      xThreshold: number;
      yThreshold: number;
      colors: string[];
    };
  };
  
  colorLegend: {
    fixed: boolean;
    categories: string[];
  };
}

// 버블 차트 설정
export interface BubbleChartSettings extends ScatterChartSettings {
  bubbles: {
    sizeScale: 'linear' | 'sqrt' | 'log';
    minSize: number;
    maxSize: number;
    collisionAvoidance: boolean;
  };
  
  labels: {
    show: boolean;
    format: 'number' | 'percentage' | 'currency' | 'custom';
    decimals: number;
    thousandsSeparator: boolean;
    unit: string;
    position: 'inside' | 'outside' | 'end';
    placement: 'auto' | 'manual';
    fontSize: number;
  };
  
  colorMapping: {
    field: string;
    palette: string[];
  };
}

// 히스토그램 설정
export interface HistogramChartSettings extends CommonChartSettings {
  bins: {
    count: 'auto' | number;
    width: number;
    alignment: 'left' | 'center' | 'right';
  };
  
  display: {
    type: 'count' | 'density' | 'percentage';
    cumulative: boolean;
    kde: boolean;
  };
  
  multipleSeries: {
    overlap: boolean;
    opacity: number;
    panelSplit: boolean;
    splitBy: string;
  };
  
  colors: {
    palette: 'brand' | 'rainbow' | 'reference18' | 'custom';
    customColors?: string[];
  };
  
  bars: {
    opacity: number;
    borderWidth: number;
    borderColor: string;
  };
  
  gradient: {
    enabled: boolean;
    direction: 'vertical' | 'horizontal' | 'diagonal';
    intensity: number;
  };
}

// 박스플롯 설정
export interface BoxplotChartSettings extends CommonChartSettings {
  statistics: {
    iqrMultiplier: number;
    outlierShape: 'circle' | 'diamond';
    outlierSize: number;
  };
  
  categories: {
    sortBy: 'fixed' | 'value' | 'name';
    fixedOrder: string[];
  };
  
  overlays: {
    violin: boolean;
    swarm: boolean;
    opacity: number;
  };
}

// 레이더 차트 설정
export interface RadarChartSettings extends CommonChartSettings {
  axes: {
    x: AxisSettings;
    y: AxisSettings;
    secondaryY?: AxisSettings;
    radarOrder: string[];
    normalize: boolean;
    gridType: 'polar' | 'spider';
  };
  

  
  legend: {
    position: 'right' | 'bottom' | 'left' | 'none';
    maxItemsPerRow?: number;
    fixedOrder: boolean;
    order: string[];
  };
}

// 타임라인 설정
export interface TimelineChartSettings extends CommonChartSettings {
  lanes: {
    order: string[];
    height: number;
    spacing: number;
  };
  
  bars: {
    height: number;
    cornerRadius: number;
    showProgress: boolean;
  };
  
  status: {
    colors: Record<string, string>;
    labels: Record<string, string>;
  };
  
  dependencies: {
    showLinks: boolean;
    linkColor: string;
    linkStyle: 'solid' | 'dashed';
  };
  
  currentDate: {
    show: boolean;
    color: string;
    style: 'line' | 'marker';
  };
}

// 게이지 차트 설정
export interface GaugeChartSettings extends CommonChartSettings {
  // 게이지 차트 용도 설정
  purpose: {
    type: 'normal' | 'high' | 'low'; // 'normal': 일반 게이지, 'high': 고지향, 'low': 저지향
    description: string; // 용도 설명
  };
  
  // 게이지 바 설정
  bar: {
    color: string; // 팔레트 1번 색상 (일반 게이지에서 사용)
    thickness: number; // 바 두께 (0.1 ~ 1.0)
    style: 'solid' | 'gradient'; // 바 스타일
  };
  
  // 배경 설정
  background: {
    color: string; // 회색 바탕색
  };
  
  // 임계값 설정 (고지향/저지향에서만 사용)
  thresholds: {
    low: number; // 낮은 임계값 (0-100)
    medium: number; // 중간 임계값 (0-100)
    high: number; // 높은 임계값 (0-100)
  };
  
  // 단위 설정
  units: {
    show: boolean; // 단위 표시 여부
    text: string; // 단위 텍스트 (예: '%')
    position: 'top' | 'bottom' | 'center'; // 단위 위치
  };
}

// 워드클라우드 설정
export interface WordCloudChartSettings extends CommonChartSettings {
  words: {
    maxCount: number;
    minLength: number;
    maxLength: number;
  };
  
  scaling: {
    type: 'linear' | 'sqrt' | 'log';
    minSize: number;
    maxSize: number;
  };
  
  layout: {
    angle: '0' | '30' | '-30' | 'random';
    shape: 'rectangle' | 'circle' | 'custom';
    padding: number;
  };
  
  filtering: {
    stopWords: string[];
    bannedWords: string[];
    minWeight: number;
  };
}

// 히트맵 설정
  export interface HeatmapChartSettings extends CommonChartSettings {
    colors: {
      palette: 'brand' | 'rainbow' | 'reference18' | 'custom';
      customColors?: string[];
      seriesColors?: Record<string, string>;
      heatmapPalette: 'viridis' | 'plasma' | 'inferno' | 'magma' | 'cividis' | 'coolwarm' | 'rdylbu' | 'spectral';
      missingValueColor: string;
    };
    
    legend: {
      type: 'continuous' | 'discrete';
      position: 'right' | 'bottom';
      orientation: 'horizontal' | 'vertical';
      maxItemsPerRow?: number;
    };
    
    cells: {
      border: boolean;
      borderColor: string;
      gap: number;
    };
  
  sorting: {
    type: 'value' | 'name' | 'custom' | 'office' | 'district';
    direction: 'asc' | 'desc';
    customOrder?: string[];
    rows: 'fixed' | 'value' | 'cluster';
    columns: 'fixed' | 'value' | 'cluster';
    fixedOrder: {
      rows: string[];
      columns: string[];
    };
  };
  
  labels: {
    show: boolean;
    format: 'number' | 'custom' | 'percentage' | 'currency';
    decimals: number;
    thousandsSeparator: boolean;
    unit: string;
    position: 'inside' | 'outside' | 'end';
    fontSize: number;
    rotation: number;
  };
}

// 워터폴 차트 설정
export interface WaterfallChartSettings extends CommonChartSettings {
  steps: {
    types: Record<string, 'start' | 'increase' | 'decrease' | 'total'>;
    colors: Record<string, string>;
  };
  
  labels: {
    show: boolean;
    format: 'number' | 'percentage' | 'currency' | 'custom';
    decimals: number;
    thousandsSeparator: boolean;
    unit: string;
    position: 'inside' | 'outside' | 'end';
    waterfallPosition: 'inside' | 'above' | 'below';
    showValues: boolean;
    showChanges: boolean;
  };
  
  connections: {
    showBridges: boolean;
    bridgeColor: string;
    bridgeStyle: 'solid' | 'dashed';
  };
}

// 콤보 차트 설정
export interface ComboChartSettings extends CommonChartSettings {
  series: {
    types: Record<string, 'bar' | 'line' | 'area'>;
    secondaryAxis: Record<string, 'left' | 'right'>;
  };
  
  stacking: {
    enabled: boolean;
    mode: 'sum' | 'percentage';
  };
  
  order: {
    fixed: boolean;
    sequence: string[];
  };
}

// 파넬 차트 설정
export interface PanelChartSettings extends CommonChartSettings {
  panels: {
    splitBy: string;
    order: string[];
    fixedOrder: boolean;
  };
  
  layout: {
    rows: number;
    columns: number;
    spacing: number;
  };
  
  axes: {
    x: AxisSettings;
    y: AxisSettings;
    secondaryY?: AxisSettings;
    commonX: boolean;
    commonY: boolean;
    syncScales: boolean;
  };
}

// 지도 시각화 설정
export interface MapChartSettings extends CommonChartSettings {
  basemap: {
    type: 'default' | 'simplified' | 'dark' | 'grayscale';
    provider: 'openstreetmap' | 'cartodb' | 'custom';
    showLabels: boolean;
  };
  
  markers: {
    type: 'circle' | 'icon';
    minSize: number;
    maxSize: number;
    cluster: boolean;
    heatmap: boolean;
  };
  
  colors: {
    palette: 'custom' | 'brand' | 'rainbow' | 'reference18';
    customColors?: string[];
    seriesColors?: Record<string, string>;
    mapping: 'continuous' | 'discrete';
    scale: 'equal' | 'quantile' | 'natural';
    mapPalette: string[];
  };
  
  legend: {
    position: 'right' | 'bottom' | 'left' | 'none';
    maxItemsPerRow?: number;
    mapPosition: 'top-right' | 'bottom-left' | 'bottom-right';
    order: 'asc' | 'desc' | 'fixed';
  };
  
  tooltip: {
    template: string;
    showDetails: boolean;
  };
  
  interaction: {
    tooltip: boolean;
    highlight: boolean;
    brush: boolean;
    zoom: boolean;
    pan: boolean;
    drillDown: boolean;
    crossFilter: boolean;
    mapZoom: {
      enabled: boolean;
      minLevel: number;
      maxLevel: number;
    };
    mapDrillDown: {
      enabled: boolean;
      levels: string[];
    };
  };
}

// 통합 차트 커스터마이징 설정
export interface ChartCustomization {
  // 공통 커스터마이징 속성
  colorPalette?: string[];
  opacity?: number;
  chartTitle?: string;
  titleSize?: number;
  titleColor?: string;
  plotBackgroundColor?: string;
  paperBackgroundColor?: string;
  
  // TimelineChart 전용 커스터마이징
  monthHeaderColor?: string;
  monthTextColor?: string;
  monthGridColor?: string;
  monthHeaderTitle?: string;
  monthLabelSize?: number;
  laneLabelSize?: number;
  barGap?: number;
  
  common: CommonChartSettings;
  line?: LineChartSettings;
  area?: AreaChartSettings;
  bar?: BarChartSettings;
  stackedBar?: StackedBarChartSettings;
  pie?: PieChartSettings;
  donut?: DonutChartSettings;
  sunburst?: SunburstChartSettings;
  treemap?: TreemapChartSettings;
  scatter?: ScatterChartSettings;
  bubble?: BubbleChartSettings;
  histogram?: HistogramChartSettings;
  boxplot?: BoxplotChartSettings;
  radar?: RadarChartSettings;
  timeline?: TimelineChartSettings;
  gauge?: GaugeChartSettings;
  wordcloud?: WordCloudChartSettings;
  heatmap?: HeatmapChartSettings;
  waterfall?: WaterfallChartSettings;
  combo?: ComboChartSettings;
  panel?: PanelChartSettings;
  map?: MapChartSettings;
}

// 기본 설정값
export const defaultCommonSettings: CommonChartSettings = {
  title: {
    text: '',
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
    position: 'bottom'
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
      name: '',
      unit: '',
      tickInterval: 'auto',
      format: '',
      reverse: false,
      gridLines: true
    },
    y: {
      name: '',
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
    formats: ['png']
  }
};

// 차트별 기본 설정값 생성 함수
export const getDefaultChartSettings = (chartType: ChartType): Partial<ChartCustomization> => {
  switch (chartType) {
    case 'line':
      return {
        line: {
          title: {
            text: '선형 그래프',
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
            position: 'bottom'
          },
          colors: {
            palette: 'brand',
            customColors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
            seriesColors: {}
          },
          labels: {
            show: true,
            format: 'number',
            decimals: 0,
            thousandsSeparator: false,
            unit: '',
            position: 'inside'
          },
          axes: {
            x: {
              name: 'X축',
              unit: '',
              tickInterval: 'auto',
              format: '',
              reverse: false,
              gridLines: true
            },
            y: {
              name: 'Y축',
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
            direction: 'asc',
            customOrder: []
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
            formats: ['png', 'svg', 'pdf']
          },
          lines: {
            color: '#FF6B6B',
            thickness: 2,
            style: 'solid',
            curveInterpolation: 'linear',
            missingDataHandling: 'break'
          },
          markers: {
            shape: 'circle',
            size: 6,
            fill: 'filled',
            borderColor: '#FFFFFF',
            borderWidth: 2
          },
          trendAnalysis: {
            movingAverage: {
              enabled: false,
              windowSize: 5,
              type: 'simple'
            },
            regressionLine: {
              enabled: false,
              type: 'linear'
            },
            confidenceInterval: {
              enabled: false,
              sigma: 1
            }
          },
          seriesOrder: {
            fixed: false,
            order: []
          }
        }
      };
    case 'bar':
      return {
        bar: {
          title: {
            text: '막대 그래프',
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
            palette: 'brand',
            customColors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
            seriesColors: {}
          },
          labels: {
            show: true,
            format: 'number',
            decimals: 0,
            thousandsSeparator: true,
            unit: '',
            position: 'outside',
            rotation: 0,
            showValue: true,
            showPercentage: false
          },
          axes: {
            x: {
              name: 'X축',
              unit: '',
              tickInterval: 'auto',
              format: '',
              reverse: false,
              gridLines: true
            },
            y: {
              name: 'Y축',
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
            direction: 'desc',
            fixedOrder: false
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
            formats: ['png', 'svg', 'pdf']
          },
          bars: {
            direction: 'vertical',
            barSpacing: 10,
            groupSpacing: 20,
            borderRadius: 0,
            stackType: 'normal',
            attachBars: false
          },
          runningTotal: {
            enabled: false,
            lineColor: '#FF6B6B',
            lineWidth: 2,
            showValues: false
          }
        }
      };
    case 'pie':
      return {
        pie: {
          title: {
            text: '원형 차트',
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
            palette: 'brand',
            customColors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
            seriesColors: {}
          },
          labels: {
            show: true,
            format: 'number',
            decimals: 0,
            thousandsSeparator: true,
            unit: '',
            position: 'outside',
            labelType: 'value',
            smartLabels: true,
            avoidOverlap: true,
            fontSize: 12,
            colorMode: 'legend',
            customColor: '#333333'
          },
          axes: {
            x: {
              name: '',
              unit: '',
              tickInterval: 'auto',
              format: '',
              reverse: false,
              gridLines: false
            },
            y: {
              name: '',
              unit: '',
              tickInterval: 'auto',
              format: '',
              reverse: false,
              gridLines: false
            }
          },
          referenceLines: {
            horizontal: [],
            vertical: [],
            bands: []
          },
          sorting: {
            type: 'value',
            direction: 'desc',
            customOrder: []
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
            formats: ['png', 'svg', 'pdf'],
            includeData: true,
            includeConfig: true
          },
          layout: {
            startAngle: 0,
            clockwise: false,
            donutRatio: 0
          },
          grouping: {
            topN: 5,
            groupOthers: true,
            othersLabel: '기타'
          },
          legendOrder: {
            fixed: false,
            order: []
          }
        }
      };
    case 'donut':
      return {
        donut: {
          title: {
            text: '도넛 차트',
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
            palette: 'brand',
            customColors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
            seriesColors: {}
          },
          labels: {
            show: true,
            format: 'number',
            decimals: 0,
            thousandsSeparator: true,
            unit: '',
            position: 'outside',
            labelType: 'value',
            smartLabels: true,
            avoidOverlap: true,
            fontSize: 12,
            colorMode: 'legend',
            customColor: '#333333'
          },
          axes: {
            x: {
              name: '',
              unit: '',
              tickInterval: 'auto',
              format: '',
              reverse: false,
              gridLines: false
            },
            y: {
              name: '',
              unit: '',
              tickInterval: 'auto',
              format: '',
              reverse: false,
              gridLines: false
            }
          },
          referenceLines: {
            horizontal: [],
            vertical: [],
            bands: []
          },
          sorting: {
            type: 'value',
            direction: 'desc',
            customOrder: []
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
            formats: ['png', 'svg', 'pdf'],
            includeData: true,
            includeConfig: true
          },
          layout: {
            startAngle: 0,
            clockwise: false,
            donutRatio: 0.5
          },
          grouping: {
            topN: 5,
            groupOthers: true,
            othersLabel: '기타'
          },
          legendOrder: {
            fixed: false,
            order: []
          },
          center: {
            showTotal: true,
            customText: '',
            fontSize: 24,
            color: '#333333'
          },
          segments: {
            gap: 0,
            highlight: [],
            highlightScale: 1.0
          }
        }
      };
    case 'stackedBar':
      return {
        stackedBar: {
          title: {
            text: '스택 바 차트',
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
            palette: 'brand',
            customColors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
            seriesColors: {}
          },
          labels: {
            show: true,
            format: 'number',
            decimals: 0,
            thousandsSeparator: true,
            unit: '',
            position: 'outside',
            rotation: 0,
            showValue: true,
            showPercentage: false
          },
          axes: {
            x: {
              name: 'X축',
              unit: '',
              tickInterval: 'auto',
              format: '',
              reverse: false,
              gridLines: true
            },
            y: {
              name: 'Y축',
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
            direction: 'desc',
            fixedOrder: false
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
            formats: ['png', 'svg', 'pdf'],
            includeData: true,
            includeConfig: true
          },
          bars: {
            direction: 'vertical',
            barSpacing: 10,
            groupSpacing: 20,
            borderRadius: 0,
            attachBars: false
          },
          stacking: {
            mode: 'normal',
            normalizeTo100: false
          },
          segments: {
            fixedOrder: false,
            order: []
          },
          grouping: {
            enabled: false,
            groupBy: '',
            groupSpacing: 10
          },
          runningTotal: {
            enabled: false,
            lineColor: '#FF6B6B',
            lineWidth: 2,
            showValues: false
          }
        }
      };
    case 'radar':
      return {
        radar: {
          title: {
            text: '레이더 차트',
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
            position: 'right',
            fixedOrder: false,
            order: []
          },
          colors: {
            palette: 'brand',
            customColors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
            seriesColors: {}
          },
          labels: {
            show: true,
            format: 'number',
            decimals: 0,
            thousandsSeparator: true,
            unit: '',
            position: 'inside'
          },

          axes: {
            x: {
              name: '',
              unit: '',
              tickInterval: 'auto',
              format: '',
              reverse: false,
              gridLines: true
            },
            y: {
              name: '',
              unit: '',
              tickInterval: 'auto',
              format: '',
              reverse: false,
              gridLines: true
            },
            secondaryY: {
              name: '',
              unit: '',
              tickInterval: 'auto',
              format: '',
              reverse: false,
              gridLines: true
            },
            radarOrder: [],
            normalize: false,
            gridType: 'polar'
          },
          referenceLines: {
            horizontal: [],
            vertical: [],
            bands: []
          },
          sorting: {
            type: 'value',
            direction: 'desc',
            customOrder: []
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
            formats: ['png', 'svg', 'pdf'],
            includeData: true,
            includeConfig: true
          }
        }
      };
    case 'map':
      return {
        map: {
          title: {
            text: '지도 차트',
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
            position: 'right',
            mapPosition: 'top-right',
            order: 'asc'
          },
          colors: {
            palette: 'custom',
            customColors: ['#000080', '#0000FF', '#00FFFF', '#FFFF00', '#FF0000'],
            seriesColors: {},
            mapping: 'continuous',
            scale: 'equal',
            mapPalette: ['#000080', '#0000FF', '#00FFFF', '#FFFF00', '#FF0000']
          },
          labels: {
            show: true,
            format: 'number',
            decimals: 0,
            thousandsSeparator: true,
            unit: '',
            position: 'inside'
          },
          tooltip: {
            template: '{{label}}: {{value}}',
            showDetails: true
          },
          axes: {
            x: {
              name: '',
              unit: '',
              tickInterval: 'auto',
              format: '',
              reverse: false,
              gridLines: false
            },
            y: {
              name: '',
              unit: '',
              tickInterval: 'auto',
              format: '',
              reverse: false,
              gridLines: false
            }
          },
          referenceLines: {
            horizontal: [],
            vertical: [],
            bands: []
          },
          sorting: {
            type: 'value',
            direction: 'desc',
            customOrder: []
          },
          interaction: {
            tooltip: true,
            highlight: true,
            brush: false,
            zoom: false,
            pan: false,
            drillDown: false,
            crossFilter: false,
            mapZoom: {
              enabled: false,
              minLevel: 1,
              maxLevel: 18
            },
            mapDrillDown: {
              enabled: false,
              levels: ['country', 'state', 'city']
            }
          },
          download: {
            formats: ['png', 'svg', 'pdf'],
            includeData: true,
            includeConfig: true
          },
          basemap: {
            type: 'default',
            provider: 'openstreetmap',
            showLabels: true
          },
          markers: {
            type: 'circle',
            minSize: 5,
            maxSize: 20,
            cluster: false,
            heatmap: false
          }
        }
      };
    case 'heatmap':
      return {
        heatmap: {
          title: {
            text: '히트맵',
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
            type: 'continuous',
            position: 'right',
            orientation: 'vertical'
          },
          colors: {
            palette: 'brand',
            customColors: ['#000080', '#0000FF', '#00FFFF', '#FFFF00', '#FF0000'],
            seriesColors: {},
            heatmapPalette: 'viridis',
            missingValueColor: '#CCCCCC'
          },
          labels: {
            show: true,
            format: 'number',
            decimals: 0,
            thousandsSeparator: false,
            unit: '',
            position: 'inside',
            fontSize: 12,
            rotation: 0
          },
          axes: {
            x: {
              name: 'X축',
              unit: '',
              tickInterval: 'auto',
              format: '',
              reverse: false,
              gridLines: true
            },
            y: {
              name: 'Y축',
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
            direction: 'desc',
            customOrder: [],
            rows: 'value',
            columns: 'value',
            fixedOrder: {
              rows: [],
              columns: []
            }
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
            formats: ['png', 'svg', 'pdf'],
            includeData: true,
            includeConfig: true
          },
          cells: {
            border: false,
            borderColor: '#FFFFFF',
            gap: 0
          }
        }
      };
    case 'gauge':
      return {
        gauge: {
          title: {
            text: '게이지',
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
            palette: 'brand',
            customColors: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'],
            seriesColors: {}
          },
          labels: {
            show: true,
            format: 'number',
            decimals: 0,
            thousandsSeparator: true,
            unit: '',
            position: 'inside'
          },
          axes: {
            x: {
              name: '',
              unit: '',
              tickInterval: 'auto',
              format: '',
              reverse: false,
              gridLines: false
            },
            y: {
              name: '',
              unit: '',
              tickInterval: 'auto',
              format: '',
              reverse: false,
              gridLines: false
            }
          },
          referenceLines: {
            horizontal: [],
            vertical: [],
            bands: []
          },
          sorting: {
            type: 'value',
            direction: 'desc',
            customOrder: []
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
            formats: ['png', 'svg', 'pdf'],
            includeData: true,
            includeConfig: true
          },
          purpose: {
            type: 'normal',
            description: '일반 게이지'
          },
          bar: {
            color: '#3b82f6',
            thickness: 0.8,
            style: 'solid'
          },
          background: {
            color: '#d9d9d9'
          },
          thresholds: {
            low: 33,
            medium: 66,
            high: 100
          },
          units: {
            show: false,
            text: '%',
            position: 'center'
          }
        }
      };
    case 'histogram':
      return {
        histogram: {
          title: {
            text: '히스토그램',
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
            palette: 'brand',
            customColors: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6']
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
              name: 'X축',
              unit: '',
              tickInterval: 'auto',
              format: '',
              reverse: false,
              gridLines: true
            },
            y: {
              name: 'Y축',
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
            direction: 'desc',
            customOrder: []
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
            formats: ['png', 'svg', 'pdf'],
            includeData: true,
            includeConfig: true
          },
          bins: {
            count: 'auto',
            width: 0,
            alignment: 'center'
          },
          display: {
            type: 'count',
            cumulative: false,
            kde: false
          },
          multipleSeries: {
            overlap: false,
            opacity: 0.7,
            panelSplit: false,
            splitBy: ''
          },
          bars: {
            opacity: 0.8,
            borderWidth: 1,
            borderColor: '#000000'
          },
          gradient: {
            enabled: true,
            direction: 'vertical',
            intensity: 0.7
          }
        }
      };
    default:
      return {};
  }
};

import React, { useState, useEffect } from 'react';
import { ChartType, ChartData, ChartCustomization } from '@/types';
import UnifiedChartRenderer from './UnifiedChartRenderer';
import { parseCSV } from '@/utils/dataParser';
import StarLoader from './StarLoader';
import { useTracking } from '../hooks/useTracking';
import GallerySatisfactionRating from './GallerySatisfactionRating';

// 샘플 시각화 갤러리 컴포넌트
const SampleVisualizationGallery: React.FC = () => {
  const [selectedChartType, setSelectedChartType] = useState<ChartType>('line');
  const [sampleData, setSampleData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { trackGalleryView, trackDataInputType } = useTracking();

  // 기본 커스터마이징 설정
  const [customization] = useState<ChartCustomization>({
    common: {
      title: { text: '', fontSize: 16, fontWeight: 'normal', color: '#1f2937' },
      margin: { top: 50, right: 50, bottom: 50, left: 50 },
      colors: { palette: 'brand' },
      legend: { position: 'bottom' },
      labels: { show: true, format: 'number', decimals: 0, thousandsSeparator: false, unit: '', position: 'outside' },
      axes: {
        x: { name: '', unit: '', tickInterval: 'auto', format: '', reverse: false, gridLines: true },
        y: { name: '', unit: '', tickInterval: 'auto', format: '', reverse: false, gridLines: true }
      },
      referenceLines: { horizontal: [], vertical: [], bands: [] },
      sorting: { type: 'value', direction: 'asc' },
      interaction: {
        tooltip: true, highlight: true, brush: false, zoom: false, pan: false, drillDown: false, crossFilter: false
      },
      download: { formats: ['png'] }
    }
  });

  // CSV 파일에서 샘플 데이터 가져오기
  const fetchSampleData = async (chartType: ChartType) => {
    setLoading(true);
    setError(null);
    
    try {
      let fileName = '';
      
      // 차트 타입별 CSV 파일명 매핑
      switch (chartType) {
        case 'line':
          fileName = 'line_chart.csv';
          break;
        case 'area':
          fileName = 'area_chart.csv';
          break;
        case 'bar':
          fileName = 'bar_chart.csv';
          break;
        case 'stackedBar':
          fileName = 'stacked_bar_chart.csv';
          break;
        case 'pie':
          fileName = 'pie_chart.csv';
          break;
        case 'donut':
          fileName = 'donut_chart.csv';
          break;
        case 'sunburst':
          fileName = 'sunburst_chart.csv';
          break;
        case 'treemap':
          fileName = 'treemap_chart.csv';
          break;
        case 'scatter':
          fileName = 'scatter_chart.csv';
          break;
        case 'bubble':
          fileName = 'bubble_chart.csv';
          break;
        case 'histogram':
          fileName = 'histogram_chart.csv';
          break;
        case 'boxplot':
          fileName = 'boxplot_chart.csv';
          break;
        case 'radar':
          fileName = 'radar_chart.csv';
          break;
        case 'gauge':
          fileName = 'gauge_chart.csv';
          break;
        case 'wordcloud':
          fileName = 'wordcloud_chart.csv';
          break;
        case 'heatmap':
          fileName = 'heatmap_chart.csv';
          break;
        case 'waterfall':
          fileName = 'waterfall_chart.csv';
          break;
        case 'combo':
          fileName = 'combo_chart.csv';
          break;
        case 'panel':
          fileName = 'panel_chart.csv';
          break;
        case 'timeline':
          fileName = 'timeline_chart.csv';
          break;
        case 'map':
          fileName = 'map.csv';
          break;
        default:
          fileName = 'line_chart.csv';
      }
      
      const response = await fetch(`/sample_data/${fileName}`);
      if (!response.ok) {
        throw new Error(`CSV 파일을 불러올 수 없습니다: ${fileName}`);
      }
      
             const csvText = await response.text();
       
       // 히스토그램 차트는 특별 처리
       let data: ChartData[];
       if (chartType === 'histogram') {
         data = parseHistogramData(csvText);
       } else {
         data = parseCSV(csvText);
       }
       
       setSampleData(data);
       
       // 샘플 데이터 사용 추적
       trackDataInputType('sample', fileName, data.length, data.length > 0 ? Object.keys(data[0]).length : 0);
    } catch (err) {
      console.error('샘플 데이터 로딩 오류:', err);
      const errorMessage = err instanceof Error ? err.message : '데이터 로딩 중 오류가 발생했습니다.';
      setError(errorMessage);
      
      // CSV 파싱 오류인 경우 더 구체적인 안내
      if (errorMessage.includes('CSV 파싱')) {
        setError(`${errorMessage} - 파일 형식을 확인해주세요.`);
      } else if (errorMessage.includes('파일을 불러올 수 없습니다')) {
        setError(`${errorMessage} - 파일이 존재하는지 확인해주세요.`);
      } else {
        setError(errorMessage);
      }
      
      // 오류 시 기본 데이터 설정
      setSampleData([{ '데이터': '샘플', '값': 100 }]);
    } finally {
      setLoading(false);
    }
  };
  
  // 히스토그램 데이터 전용 파싱 함수
  const parseHistogramData = (csvText: string): ChartData[] => {
    try {
      // 줄바꿈으로 분리하고 빈 줄 제거
      const lines = csvText.trim().split('\n').filter(line => line.trim() !== '');
      
      if (lines.length < 2) {
        throw new Error('히스토그램 데이터가 충분하지 않습니다.');
      }
      
      // 첫 번째 줄을 헤더로 사용
      const header = lines[0].trim();
      
      // 데이터 행들을 파싱
      const data: ChartData[] = [];
      for (let i = 1; i < lines.length; i++) {
        const value = lines[i].trim();
        if (value !== '') {
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            data.push({ [header]: numValue });
          }
        }
      }
      
      if (data.length === 0) {
        throw new Error('유효한 히스토그램 데이터를 찾을 수 없습니다.');
      }
      
      return data;
    } catch (error) {
      throw new Error(`히스토그램 데이터 파싱 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  // CSV 파싱은 메인의 parseCSV 함수 사용

  // 차트 타입이 변경될 때마다 데이터 가져오기
  useEffect(() => {
    fetchSampleData(selectedChartType);
  }, [selectedChartType]);

  // 컴포넌트 마운트 시 초기 데이터 로딩
  useEffect(() => {
    fetchSampleData('line');
  }, []);

  // 차트 타입별 제목 매핑
  const getChartTitle = (chartType: ChartType): string => {
    const titles: Record<ChartType, string> = {
      line: '선형 그래프 (Line)',
      area: '누적 영역 그래프 (Stacked Area)',
      bar: '막대 그래프 (Bar)',
      stackedBar: '누적 막대 그래프 (Stacked Bar)',
      pie: '원형 차트 (Pie)',
      donut: '도넛 차트 (Donut)',
      sunburst: '선버스트 차트 (Sunburst)',
      treemap: '트리맵 (Treemap)',
      scatter: '산점도 (Scatter)',
      bubble: '버블 차트 (Bubble)',
      histogram: '히스토그램 (Histogram)',
      boxplot: '박스플롯 (Boxplot)',
      radar: '레이더 차트 (Radar)',
      timeline: '타임라인 (Timeline)',
      gauge: '게이지 차트 (Gauge)',
      wordcloud: '워드클라우드 (Wordcloud)',
      heatmap: '히트맵 (Heatmap)',
      waterfall: '워터폴 차트 (Waterfall)',
      combo: '콤보 차트 (Combo: Bar + Line)',
      panel: '파넬 차트 (Panel / Small Multiples)',
      map: '지도 시각화 (Map)'
    };
    return titles[chartType] || chartType;
  };

  // 차트 타입별 설명
  const getChartDescription = (chartType: ChartType): string => {
    const descriptions: Record<ChartType, string> = {
      line: '시계열 데이터를 선형 그래프로 표현하여 추세와 변화를 시각화합니다.',
      area: '여러 시리즈의 누적 효과를 영역 차트로 표현하여 전체적인 변화를 보여줍니다.',
      bar: '카테고리별 수치를 막대 그래프로 표현하여 비교 분석을 용이하게 합니다.',
      stackedBar: '여러 시리즈를 누적하여 표시하여 전체 대비 비율을 한눈에 파악할 수 있습니다.',
      pie: '전체 대비 각 항목의 비율을 원형 차트로 표현하여 구성 비율을 직관적으로 보여줍니다.',
      donut: '중앙에 공간을 둔 도넛 형태로 비율을 표현하여 시각적 효과를 높입니다.',
      sunburst: '계층적 데이터를 동심원 형태로 표현하여 구조와 비율을 동시에 파악할 수 있습니다.',
      treemap: '계층적 데이터를 사각형 영역으로 표현하여 공간 활용도를 높입니다.',
      scatter: '두 변수 간의 관계를 점으로 표현하여 상관관계와 패턴을 분석합니다.',
      bubble: '세 변수를 x, y 좌표와 버블 크기로 표현하여 다차원 분석을 가능하게 합니다.',
      histogram: '데이터의 분포를 구간별로 표현하여 분포 형태와 특성을 파악합니다.',
      boxplot: '데이터의 분포를 사분위수와 이상치로 표현하여 통계적 특성을 요약합니다.',
      radar: '여러 차원의 데이터를 방사형으로 표현하여 종합적인 평가를 시각화합니다.',
      timeline: '시간 순서대로 작업을 표현하여 일정과 진행 상황을 관리합니다.',
      gauge: '목표 대비 현재 값을 게이지로 표현하여 달성도를 직관적으로 보여줍니다.',
      wordcloud: '텍스트의 빈도를 단어 크기로 표현하여 주요 키워드를 시각화합니다.',
      heatmap: '두 차원의 데이터를 색상 강도로 표현하여 패턴과 관계를 분석합니다.',
      waterfall: '누적 효과를 단계별로 표현하여 변화의 원인과 결과를 추적합니다.',
      combo: '여러 차트 유형을 조합하여 복합적인 분석을 가능하게 합니다.',
      panel: '여러 차트를 패널로 구성하여 비교 분석을 체계적으로 수행합니다.',
      map: '지리적 데이터를 지도에 표시하여 지역별 특성과 분포를 분석합니다.'
    };
    return descriptions[chartType] || '데이터를 시각화하여 인사이트를 도출합니다.';
  };

  // 차트 타입별 아이콘 (간단한 텍스트 기반)
  const getChartIcon = (chartType: ChartType): string => {
    const icons: Record<ChartType, string> = {
      line: '📈',
      area: '📊',
      bar: '📊',
      stackedBar: '📊',
      pie: '🥧',
      donut: '🍩',
      sunburst: '☀️',
      treemap: '🌳',
      scatter: '🔍',
      bubble: '🫧',
      histogram: '📊',
      boxplot: '📦',
      radar: '🕷️',
      timeline: '⏰',
      gauge: '⏲️',
      wordcloud: '☁️',
      heatmap: '🔥',
      waterfall: '🌊',
      combo: '🔗',
      panel: '🖼️',
      map: '🗺️'
    };
    return icons[chartType] || '📊';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            시각화 갤러리
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            다양한 차트 유형을 샘플 데이터로 직접 체험해보세요. 
            각 차트의 특징과 사용법을 이해하고 데이터 시각화의 힘을 경험하세요.
          </p>
        </div>

        {/* 차트 타입 선택 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">차트 유형 선택</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
            {([
              'line', 'area', 'bar', 'stackedBar', 'pie', 'donut', 'sunburst', 'treemap',
              'scatter', 'bubble', 'histogram', 'boxplot', 'radar', 'timeline', 'gauge', 'wordcloud',
              'heatmap', 'waterfall', 'combo', 'panel', 'map'
            ] as ChartType[]).map((chartType) => (
              <button
                key={chartType}
                onClick={() => setSelectedChartType(chartType)}
                className={`group p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  selectedChartType === chartType
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md'
                }`}
              >
                <div className="text-2xl mb-2">{getChartIcon(chartType)}</div>
                <div className="text-sm font-medium leading-tight">
                  {getChartTitle(chartType).split(' ')[0]}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 선택된 차트 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <span className="text-3xl mr-3">{getChartIcon(selectedChartType)}</span>
              <h2 className="text-3xl font-bold text-gray-900">
                {getChartTitle(selectedChartType)}
              </h2>
            </div>
            <p className="text-lg text-gray-600 text-center max-w-4xl mx-auto">
              {getChartDescription(selectedChartType)}
            </p>
          </div>

          {/* 차트 렌더링 */}
          <div className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50 flex items-center justify-center min-h-[600px]">
            {loading ? (
              <div className="text-center">
                <StarLoader size={64} speed={1.0} gap={24} />
                <p className="text-xl text-gray-600 font-medium mt-6">차트 데이터를 로딩 중입니다...</p>
              </div>
            ) : error ? (
              <div className="text-center text-red-600">
                <div className="text-6xl mb-4">⚠️</div>
                <p className="text-xl font-medium mb-4">오류: {error}</p>
                <button 
                  onClick={() => fetchSampleData(selectedChartType)}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  다시 시도
                </button>
              </div>
            ) : sampleData.length > 0 ? (
              <>
                <div className="w-full h-full flex items-center justify-center">
                  <UnifiedChartRenderer
                    type={selectedChartType}
                    data={sampleData}
                    customization={customization}
                    width={800}
                    height={500}
                    isGallery={true}
                    showSatisfactionRating={false}
                    chartId={`gallery-${selectedChartType}-${Date.now()}`}
                  />
                </div>
                {/* 갤러리 전용 만족도 평가 */}
                <div className="mt-6">
                  <GallerySatisfactionRating
                    className="max-w-md mx-auto"
                  />
                </div>
              </>
            ) : (
              <div className="text-center text-gray-600">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-xl font-medium">데이터가 없습니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* 샘플 데이터 정보 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">샘플 데이터 정보</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-2xl mr-2">📋</span>
                데이터 구조
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 text-sm">
                <pre className="whitespace-pre-wrap text-gray-700">
                  {JSON.stringify(sampleData.slice(0, 3), null, 2)}
                </pre>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-2xl mr-2">📊</span>
                데이터 통계
              </h4>
              <div className="space-y-3 text-lg">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700">총 행 수:</span>
                  <span className="font-bold text-blue-600">{sampleData.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700">컬럼 수:</span>
                  <span className="font-bold text-green-600">{Object.keys(sampleData[0] || {}).length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-gray-700">차트 유형:</span>
                  <span className="font-bold text-purple-600">{selectedChartType}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 사용법 안내 */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-6 text-center flex items-center justify-center">
            <span className="text-3xl mr-3">💡</span>
            사용법 가이드
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold mb-3">🎯 기본 사용법</h4>
              <ul className="space-y-2 text-blue-100">
                <li>• 위의 차트 타입 버튼을 클릭하여 다양한 시각화를 확인해보세요</li>
                <li>• 각 차트는 실제 샘플 데이터를 사용하여 렌더링됩니다</li>
                <li>• 차트의 상호작용 기능(확대/축소, 호버 등)을 체험해보세요</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-3">🚀 고급 활용</h4>
              <ul className="space-y-2 text-blue-100">
                <li>• 실제 프로젝트에서는 이 샘플 데이터를 참고하여 데이터를 구성하세요</li>
                <li>• 각 차트 유형의 특징과 적합한 데이터 구조를 학습하세요</li>
                <li>• 다양한 색상 팔레트와 스타일링 옵션을 실험해보세요</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SampleVisualizationGallery;

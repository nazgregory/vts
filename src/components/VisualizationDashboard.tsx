import React, { useState, useCallback, Suspense, lazy, useRef, useEffect } from 'react';
import { Download, Settings, BarChart3, FileSpreadsheet, Landmark } from 'lucide-react';
import { ChartType, ChartData } from '@/types';
import { ChartCustomization, defaultCommonSettings, getDefaultChartSettings } from '../types/chartCustomization';
import { downloadChart, downloadSampleFile } from '@/utils/dataExport';
import { useTracking } from '../hooks/useTracking';

import UnifiedChartRenderer from './UnifiedChartRenderer';
import ChartTypeSelector from './ChartTypeSelector';
import ChartCustomizationPanel from './ChartCustomizationPanel';
import StarLoader from './StarLoader';
import ChartSatisfactionRating from './ChartSatisfactionRating';

// 지연 로딩으로 컴포넌트 분리
const FileUpload = lazy(() => import('./FileUpload'));
const DataInputCard = lazy(() => import('./DataInputCard'));
const SampleVisualizationGallery = lazy(() => import('./SampleVisualizationGallery'));

// 로딩 스피너 컴포넌트
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <StarLoader size={32} speed={1.0} gap={16} />
    <span className="ml-2 text-gray-600">로딩 중...</span>
  </div>
);

// 차트 유형 이름 반환 함수
const getChartTypeName = (chartType: ChartType): string => {
  const names: Record<ChartType, string> = {
    line: '선형 그래프',
    area: '누적 영역 그래프',
    bar: '막대 그래프',
    stackedBar: '누적 막대 그래프',
    pie: '원형 차트',
    donut: '도넛 차트',
    sunburst: '선버스트 차트',
    treemap: '트리맵',
    scatter: '산점도',
    bubble: '버블 차트',
    histogram: '히스토그램',
    boxplot: '박스플롯',
    radar: '레이더 차트',
    timeline: '타임라인',
    gauge: '게이지 차트',
    wordcloud: '워드클라우드',
    heatmap: '히트맵',
    waterfall: '워터폴 차트',
    combo: '콤보 차트',
    panel: '파넬 차트',
    map: '지도 시각화'
  };
  return names[chartType] || chartType;
};

const ChartRenderer = ({ type, data, options, customization, onCustomizationToggle }: { 
  type: ChartType; 
  data: ChartData[]; 
  options?: { };
  customization: ChartCustomization;
  onCustomizationToggle: () => void;
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { trackDownload } = useTracking();

  // 다운로드 처리 함수
  const handleDownload = async () => {
    if (!chartContainerRef.current) return;
    
    const chartContainer = chartContainerRef.current.querySelector('.chart-container');
    if (!chartContainer) return;

    try {
      // 다운로드 트래킹
      trackDownload('png', type);
      
      // PNG 이미지 다운로드
      await downloadChart(chartContainer as HTMLElement, 'png', `${getChartTypeName(type)}_차트`);
    } catch (error) {
      console.error('다운로드 실패:', error);
      alert('다운로드에 실패했습니다.');
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="text-center text-gray-500">
          <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>데이터를 입력하고 차트를 생성해보세요</p>
        </div>
      </div>
    );
  }

  // 전달받은 customization을 사용하되, 제목이 없으면 기본값 설정
  const finalCustomization: ChartCustomization = {
    ...customization,
    common: {
      ...customization.common,
      title: {
        ...customization.common.title,
        text: customization.common.title?.text || getChartTypeName(type)
      }
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border p-6" ref={chartContainerRef}>
        <div className="flex justify-end items-center mb-4">
          <div className="flex gap-3">
            <button 
              onClick={onCustomizationToggle}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              title="차트 커스터마이징"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">커스터마이징</span>
            </button>
            <button 
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              title="차트 다운로드"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">다운로드</span>
            </button>
          </div>
        </div>
        <div className="chart-container flex justify-center items-center" style={{ height: '500px' }}>
          <UnifiedChartRenderer
            type={type}
            data={data}
            options={options}
            customization={finalCustomization}
            showSatisfactionRating={false}
            chartId={`chart-${type}-${Date.now()}`}
          />
        </div>
      </div>
      {/* 만족도 평가는 차트 컨테이너 밖에 별도로 배치 */}
      <div className="mt-6">
        <ChartSatisfactionRating
          chartId={`chart-${type}-${Date.now()}`}
          chartType={type}
          isCustomized={Object.keys(finalCustomization).length > 0}
          className="max-w-md mx-auto"
        />
      </div>
    </>
  );
};

const VisualizationDashboard: React.FC = () => {
  const [selectedChartType, setSelectedChartType] = useState<ChartType | ''>('');
  const [chartData, setChartData] = useState<ChartData[] | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [currentMode, setCurrentMode] = useState<'chart-creation' | 'sample-gallery'>('chart-creation');
  const [chartCustomization, setChartCustomization] = useState<ChartCustomization>({
    common: defaultCommonSettings
  });

  // 차트 커스터마이징 패널 상태
  const [isCustomizationPanelOpen, setIsCustomizationPanelOpen] = useState(false);

  // 메인 네비게이션 탭 변경 시 커스터마이징 패널 자동 닫기
  useEffect(() => {
    if (isCustomizationPanelOpen) {
      setIsCustomizationPanelOpen(false);
    }
  }, [currentMode]);

  // 차트 옵션 상태 추가
  const [chartOptions, setChartOptions] = useState<Record<ChartType, { }>>({} as Record<ChartType, { }>);
  
  // 헤더 버튼 상태 관리
  const [showSampleGallery, setShowSampleGallery] = useState(false);

  // 이벤트 핸들러들을 useCallback으로 메모이제이션
  // 데이터 제출 처리
  const handleDataSubmit = useCallback((data: ChartData[]) => {
    setChartData(data);
    setCurrentStep(3);
  }, []);

  // 차트 타입 선택 처리
  const handleChartTypeSelect = useCallback((type: ChartType) => {
    setSelectedChartType(type);
    setCurrentStep(2);
    
    // 차트 타입별 기본 커스터마이징 설정 초기화
    const defaultChartSettings = getDefaultChartSettings(type);
    setChartCustomization(prev => ({
      ...prev,
      ...defaultChartSettings
    }));
  }, []);

  const resetDashboard = useCallback(() => {
    setSelectedChartType('');
    setChartData(null);
    setCurrentStep(1);
    setCurrentMode('chart-creation');
    setIsCustomizationPanelOpen(false); // 커스터마이징 패널 닫기
    setShowSampleGallery(false); // 시각화 갤러리 닫기
    // 커스터마이징 상태 초기화
    setChartCustomization({
      common: defaultCommonSettings
    });
    // 차트 옵션 초기화
    setChartOptions({} as Record<ChartType, { }>);
  }, []);

  const onCustomizationToggle = useCallback(() => {
    setIsCustomizationPanelOpen(!isCustomizationPanelOpen);
  }, [isCustomizationPanelOpen]);

  const handleDownloadSampleData = useCallback((chartType: ChartType) => {
    try {
      // 새로운 downloadSampleFile 함수 사용 (public/sample_data/에서 직접 다운로드)
      downloadSampleFile(chartType);
    } catch (error) {
      console.error(`Error downloading sample data for ${chartType}:`, error);
      alert(`샘플 데이터 다운로드 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">데이터 시각화 도구</h1>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={resetDashboard}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                메인 페이지
              </button>
              <button
                onClick={() => {
                  resetDashboard(); // 모든 상태 초기화
                  setShowSampleGallery(true);
                  setCurrentMode('chart-creation');
                  setCurrentStep(1);
                }}
                className="px-4 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <Landmark className="w-5 h-5" />
                시각화 갤러리
              </button>
            </div>
          </div>
          
          {/* Progress Steps - 차트 생성 모드에서 표시 */}
          {currentMode === 'chart-creation' && (
            <div className="flex items-center gap-4 mt-4">
              <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>1</div>
                <span>차트 선택</span>
              </div>
              <div className="w-8 h-px bg-gray-300"></div>
              <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>2</div>
                <span>데이터 입력</span>
              </div>
              <div className="w-8 h-px bg-gray-300"></div>
              <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>3</div>
                <span>차트 생성</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 시각화 갤러리 모드 */}
        {showSampleGallery && (
          <Suspense fallback={<LoadingSpinner />}>
            <SampleVisualizationGallery />
          </Suspense>
        )}

        {/* 차트 생성 모드 */}
        {currentMode === 'chart-creation' && !showSampleGallery && (
          <>
            {currentStep === 1 && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">차트 유형을 선택하세요</h2>
                  <p className="text-gray-600">분석 목적에 맞는 차트를 선택해주세요</p>
                </div>
                <ChartTypeSelector 
                  selectedType={selectedChartType} 
                  onTypeSelect={handleChartTypeSelect}
                  handleDownloadSampleData={handleDownloadSampleData}
                />
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                {/* 상단 카드들 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {selectedChartType ? (
                    <Suspense fallback={<LoadingSpinner />}>
                      <FileUpload onDataSubmit={handleDataSubmit} selectedChartType={selectedChartType} />
                    </Suspense>
                  ) : (
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                      <div className="text-center text-gray-500">
                        <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p>차트 유형을 먼저 선택해주세요</p>
                      </div>
                    </div>
                  )}
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">선택된 차트 유형</h3>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-blue-800 font-medium">
                        {selectedChartType === 'line' && '선형 그래프'}
                        {selectedChartType === 'bar' && '막대 그래프'}
                        {selectedChartType === 'pie' && '원형 차트'}
                        {selectedChartType === 'donut' && '도넛 차트'}
                        {selectedChartType === 'area' && '누적 영역 차트'}
                        {selectedChartType === 'scatter' && '산점도'}
                        {selectedChartType === 'bubble' && '버블 차트'}
                        {selectedChartType === 'histogram' && '히스토그램'}
                        {selectedChartType === 'radar' && '레이더 차트'}
                        {selectedChartType === 'timeline' && '타임라인'}
                        {selectedChartType === 'gauge' && '게이지 차트'}
                        {selectedChartType === 'wordcloud' && '워드클라우드'}
                        {selectedChartType === 'heatmap' && '히트맵'}
                        {selectedChartType === 'waterfall' && '워터폴 차트'}
                        {selectedChartType === 'combo' && '콤보 차트'}
                        {selectedChartType === 'stackedBar' && '누적 막대 차트'}
                        {selectedChartType === 'treemap' && '트리맵'}
                        {selectedChartType === 'sunburst' && '선버스트 차트'}
                        {selectedChartType === 'boxplot' && '박스플롯'}
                        {selectedChartType === 'panel' && '파넬 차트'}
                        {selectedChartType === 'map' && '지도'}
                      </div>
                      <div className="text-blue-600 text-sm mt-1">
                        {selectedChartType 
                          ? '데이터를 입력하거나 샘플 데이터를 드래그 앤 드롭 또는 선택해서 업로드 하세요'
                          : '차트 유형을 선택하면 데이터 입력 페이지가 표시됩니다'
                        }
                      </div>
                      


                    </div>
                  </div>
                </div>

                {/* 데이터 입력 카드 */}
                {selectedChartType && (
                  <Suspense fallback={<LoadingSpinner />}>
                    <DataInputCard 
                      selectedChartType={selectedChartType} 
                      onDataSubmit={handleDataSubmit} 
                    />
                  </Suspense>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">생성 완료!</h2>
                    <p className="text-gray-600">차트가 성공적으로 생성되었습니다</p>
                  </div>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    데이터 수정
                  </button>
                </div>
                <ChartRenderer 
                  type={selectedChartType as ChartType} 
                  data={chartData!} 
                  options={chartOptions[selectedChartType as ChartType]}
                  customization={chartCustomization}
                  onCustomizationToggle={onCustomizationToggle}
                />
              </div>
            )}
          </>
        )}

        {/* 개발 정보 */}
        <div className="mt-16 mb-8 text-center text-gray-600 border-t pt-8">
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">개발</span> : 서초구청 스마트도시과 AI빅데이터팀
            </p>
            <p className="text-sm">
              <span className="font-medium">문의</span> : 02-2155-6089(irize@seocho.go.kr)
            </p>
            <p className="text-sm">
              <span className="font-medium">ⓒ 2025 AI빅데이터팀 All rights reserved</span>
            </p>
          </div>
        </div>
      </main>

      {/* 차트 커스터마이징 패널 */}
      <ChartCustomizationPanel
        chartType={selectedChartType as ChartType}
        customization={chartCustomization}
        onCustomizationChange={setChartCustomization}
        isOpen={isCustomizationPanelOpen}
        onToggle={onCustomizationToggle}
      />
    </div>
  );
};

export default VisualizationDashboard; 
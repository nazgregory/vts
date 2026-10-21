import React, { useState, useCallback, useEffect } from 'react';
import { 
  Settings, 
  Palette, 
  Type, 
  Layout, 
  BarChart3, 
  PieChart, 
  ScatterChart, 
  Map,
  EyeOff,
  RotateCcw,
  Circle,
  Target,
  Hash,
  Star,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { ChartCustomization, CommonChartSettings } from '../types/chartCustomization';
import { ChartType } from '../types';
import { defaultCommonSettings, getDefaultChartSettings } from '../types/chartCustomization';
import { useCustomizationTracking } from '../hooks/useTracking';
import { API_URL } from '../utils/apiConfig';
import { 
  getColorPalette, 
  getBrandColors, 
  getRainbowColors, 
  getPaletteDisplayName, 
  getPaletteDescription,
  validateCustomColors 
} from '../utils/colorPalettes';

interface ChartCustomizationPanelProps {
  chartType: ChartType;
  customization: ChartCustomization;
  onCustomizationChange: (customization: ChartCustomization) => void;
  isOpen: boolean;
  onToggle: () => void;
  onCustomizationSatisfactionSubmit?: (rating: CustomizationSatisfactionRating) => void;
}

export interface CustomizationSatisfactionRating {
  chartId: string;
  chartType: string;
  recommendation: 'recommend' | 'not_recommend';
  starRating: number; // 0-5, 0.5 단위
  timestamp: string;
}

const ChartCustomizationPanel: React.FC<ChartCustomizationPanelProps> = ({
  chartType,
  customization,
  onCustomizationChange,
  isOpen,
  onToggle,
  onCustomizationSatisfactionSubmit
}) => {
  const [activeTab, setActiveTab] = useState('common');
  const { startCustomization, trackChange, endCustomization } = useCustomizationTracking();
  
  // 커스터마이징 만족도 상태
  const [customizationRecommendation, setCustomizationRecommendation] = useState<'recommend' | 'not_recommend' | null>(null);
  const [customizationStarRating, setCustomizationStarRating] = useState<number>(0);
  const [isCustomizationSubmitted, setIsCustomizationSubmitted] = useState(false);
  const [isCustomizationSubmitting, setIsCustomizationSubmitting] = useState(false);

  // 차트 타입 변경 시 탭만 초기화 (패널은 열린 상태 유지)
  useEffect(() => {
    setActiveTab('common');
  }, [chartType]);

  // 패널이 닫히거나 커스터마이징이 초기화될 때 만족도 평가 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      // 패널이 닫힐 때 만족도 평가 상태 초기화
      setCustomizationRecommendation(null);
      setCustomizationStarRating(0);
      setIsCustomizationSubmitted(false);
      setIsCustomizationSubmitting(false);
    }
  }, [isOpen]);

  // 커스터마이징 만족도 핸들러
  const handleCustomizationRecommendationClick = useCallback((type: 'recommend' | 'not_recommend') => {
    setCustomizationRecommendation(type);
  }, []);

  const handleCustomizationStarClick = useCallback((rating: number) => {
    setCustomizationStarRating(rating);
  }, []);

  const handleCustomizationSatisfactionSubmit = useCallback(async () => {
    if (!customizationRecommendation || customizationStarRating === 0) {
      alert('추천 여부와 별점을 모두 선택해주세요.');
      return;
    }

    setIsCustomizationSubmitting(true);

    try {
      const rating: CustomizationSatisfactionRating = {
        chartId: `customization-${Date.now()}`,
        chartType,
        recommendation: customizationRecommendation,
        starRating: customizationStarRating,
        timestamp: new Date().toISOString()
      };

      // API 호출
      const response = await fetch(`${API_URL}/satisfaction-ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...rating,
          category: 'customization' // 커스터마이징 카테고리로 구분
        })
      });

      if (!response.ok) {
        throw new Error('커스터마이징 만족도 평가 저장 실패');
      }

      setIsCustomizationSubmitted(true);
      onCustomizationSatisfactionSubmit?.(rating);
      
      console.log('커스터마이징 만족도 평가 제출 성공:', rating);
    } catch (error) {
      console.error('커스터마이징 만족도 평가 제출 실패:', error);
      alert('커스터마이징 만족도 평가 제출에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsCustomizationSubmitting(false);
    }
  }, [customizationRecommendation, customizationStarRating, chartType, onCustomizationSatisfactionSubmit]);

  // 만족도 평가 상태 초기화
  const handleCustomizationSatisfactionReset = useCallback(() => {
    setCustomizationRecommendation(null);
    setCustomizationStarRating(0);
    setIsCustomizationSubmitted(false);
    setIsCustomizationSubmitting(false);
  }, []);

  // 패널이 열릴 때 커스터마이징 추적 시작
  useEffect(() => {
    if (isOpen) {
      startCustomization();
    } else {
      endCustomization();
    }
  }, [isOpen, startCustomization, endCustomization]);

  // 공통 설정 업데이트
  const updateCommonSettings = useCallback((updates: Partial<CommonChartSettings>) => {
    // 커스터마이징 추적
    Object.keys(updates).forEach(key => {
      trackChange(`common.${key}`);
    });
    
    onCustomizationChange({
      ...customization,
      common: {
        ...customization.common,
        ...updates
      }
    });
  }, [customization, onCustomizationChange, trackChange]);

  // 탭별 설정 업데이트
  const updateChartSpecificSettings = useCallback((chartType: ChartType, updates: any) => {
    // 커스터마이징 추적
    Object.keys(updates).forEach(key => {
      trackChange(`${chartType}.${key}`);
    });
    
    if (chartType === 'timeline') {
      // TimelineChart는 최상위 속성으로 업데이트
      onCustomizationChange({
        ...customization,
        ...updates
      });
    } else {
      // 다른 차트는 기존 방식대로 업데이트
      const currentChartSettings = customization[chartType as keyof ChartCustomization] || {};
      onCustomizationChange({
        ...customization,
        [chartType]: {
          ...currentChartSettings,
          ...updates
        }
      });
    }
  }, [customization, onCustomizationChange, trackChange]);

  // 설정 초기화
  const resetToDefaults = useCallback(() => {
    onCustomizationChange({
      common: defaultCommonSettings,
      ...getDefaultChartSettings(chartType)
    });
    
    // 만족도 평가 상태도 초기화
    setCustomizationRecommendation(null);
    setCustomizationStarRating(0);
    setIsCustomizationSubmitted(false);
    setIsCustomizationSubmitting(false);
  }, [onCustomizationChange, chartType]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl border-l border-gray-200 z-50 overflow-y-auto">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            차트 커스터마이징
          </h2>
          <div className="flex gap-2">
            <button
              onClick={resetToDefaults}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              title="기본값으로 초기화"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onToggle}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              title="패널 닫기"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* 탭 네비게이션 */}
        <div className="flex gap-1 mt-4">
          <TabButton
            label="공통"
            icon={Layout}
            active={activeTab === 'common'}
            onClick={() => setActiveTab('common')}
          />
          <TabButton
            label="차트별"
            icon={getChartIcon(chartType)}
            active={activeTab === 'chart'}
            onClick={() => setActiveTab('chart')}
          />
          <TabButton
            label="만족도"
            icon={Star}
            active={activeTab === 'satisfaction'}
            onClick={() => setActiveTab('satisfaction')}
          />
        </div>
      </div>

      {/* 탭 내용 */}
      <div className="p-4">
        {activeTab === 'common' && (
          <CommonSettingsTab
            settings={customization.common}
            onUpdate={updateCommonSettings}
          />
        )}
        
        {activeTab === 'chart' && (
          <ChartSpecificTab
            chartType={chartType}
            customization={customization}
            onUpdate={updateChartSpecificSettings}
          />
        )}

        {activeTab === 'satisfaction' && (
          <CustomizationSatisfactionTab
            recommendation={customizationRecommendation}
            starRating={customizationStarRating}
            isSubmitted={isCustomizationSubmitted}
            isSubmitting={isCustomizationSubmitting}
            onRecommendationClick={handleCustomizationRecommendationClick}
            onStarClick={handleCustomizationStarClick}
            onSubmit={handleCustomizationSatisfactionSubmit}
            onReset={handleCustomizationSatisfactionReset}
          />
        )}
      </div>
    </div>
  );
};

// 탭 버튼 컴포넌트
interface TabButtonProps {
  label: string;
  icon: React.ComponentType<any>;
  active: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, icon: Icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      active
        ? 'bg-blue-100 text-blue-700 border border-blue-200'
        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

// 차트 아이콘 반환
const getChartIcon = (chartType: ChartType) => {
  switch (chartType) {
    case 'line':
    case 'area':
      return BarChart3;
    case 'bar':
    case 'stackedBar':
      return BarChart3;
    case 'pie':
    case 'donut':
    case 'sunburst':
      return PieChart;
    case 'scatter':
    case 'bubble':
      return ScatterChart;
    case 'map':
      return Map;
    default:
      return BarChart3;
  }
};

// 공통 설정 탭
interface CommonSettingsTabProps {
  settings: CommonChartSettings;
  onUpdate: (updates: Partial<CommonChartSettings>) => void;
}

const CommonSettingsTab: React.FC<CommonSettingsTabProps> = ({ settings, onUpdate }) => {
  return (
    <div className="space-y-6">
      {/* 제목 및 부제 */}
      <SettingSection title="제목 및 부제" icon={Type}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              제목
            </label>
            <input
              type="text"
              value={settings.title.text}
              onChange={(e) => onUpdate({ title: { ...settings.title, text: e.target.value } })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="차트 제목을 입력하세요"
            />
          </div>
          

          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                글꼴 크기
              </label>
              <input
                type="number"
                value={settings.title.fontSize}
                onChange={(e) => onUpdate({ title: { ...settings.title, fontSize: Number(e.target.value) } })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="12"
                max="48"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                글꼴 굵기
              </label>
              <select
                value={settings.title.fontWeight}
                onChange={(e) => onUpdate({ title: { ...settings.title, fontWeight: e.target.value as 'normal' | 'bold' } })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="normal">보통</option>
                <option value="bold">굵게</option>
              </select>
            </div>
          </div>
        </div>
      </SettingSection>

      {/* 색상 */}
      <SettingSection title="색상" icon={Palette}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              색상 팔레트
            </label>
            <select
              value={settings.colors.palette}
              onChange={(e) => onUpdate({ colors: { ...settings.colors, palette: e.target.value as any } })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="brand">{getPaletteDisplayName('brand')}</option>
              <option value="rainbow">{getPaletteDisplayName('rainbow')}</option>
              <option value="reference18">{getPaletteDisplayName('reference18')}</option>
              <option value="custom">{getPaletteDisplayName('custom')}</option>
            </select>
            {settings.colors.palette && (
              <>
                <p className="text-xs text-gray-500 mt-1">
                  {getPaletteDescription(settings.colors.palette)}
                </p>
                <div className="mt-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    색상 미리보기
                  </label>
                  <div className="flex gap-1 flex-wrap">
                    {getCurrentPaletteColors(settings.colors.palette, settings.colors.customColors).map((color, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 rounded border border-gray-200"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          
          {settings.colors.palette === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                사용자 정의 색상
              </label>
              <div className="space-y-2">
                {settings.colors.customColors?.map((color, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => {
                        const newColors = [...(settings.colors.customColors || [])];
                        newColors[index] = e.target.value;
                        onUpdate({ colors: { ...settings.colors, customColors: newColors } });
                      }}
                      className="w-12 h-10 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => {
                        const newColors = [...(settings.colors.customColors || [])];
                        newColors[index] = e.target.value;
                        onUpdate({ colors: { ...settings.colors, customColors: newColors } });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="#FFFFFF"
                    />
                    <button
                      onClick={() => {
                        const newColors = settings.colors.customColors?.filter((_, i) => i !== index) || [];
                        onUpdate({ colors: { ...settings.colors, customColors: newColors } });
                      }}
                      className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                      title="색상 제거"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newColors = [...(settings.colors.customColors || []), '#000000'];
                    onUpdate({ colors: { ...settings.colors, customColors: newColors } });
                  }}
                  className="w-full px-3 py-2 border border-dashed border-gray-300 rounded-md text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
                >
                  + 색상 추가
                </button>
                {settings.colors.customColors && settings.colors.customColors.length > 0 && (
                  <div className="text-xs text-gray-500">
                    {validateCustomColors(settings.colors.customColors) ? (
                      <span className="text-green-600">✓ 유효한 색상 형식입니다</span>
                    ) : (
                      <span className="text-red-600">✗ 잘못된 색상 형식이 있습니다</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </SettingSection>

      {/* 범례 */}
      <SettingSection title="범례" icon={Layout}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              위치
            </label>
            <select
              value={settings.legend.position}
              onChange={(e) => onUpdate({ legend: { ...settings.legend, position: e.target.value as any } })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="right">오른쪽</option>
              <option value="bottom">하단</option>
              <option value="left">왼쪽</option>
              <option value="none">숨김</option>
            </select>
          </div>
          

        </div>
      </SettingSection>




    </div>
  );
};

// 차트별 설정 탭
interface ChartSpecificTabProps {
  chartType: ChartType;
  customization: ChartCustomization;
  onUpdate: (chartType: ChartType, updates: any) => void;
}

const ChartSpecificTab: React.FC<ChartSpecificTabProps> = ({ chartType, customization, onUpdate }) => {
  const renderChartSpecificSettings = () => {
    switch (chartType) {
      case 'line':
        return <LineChartSettings customization={customization} onUpdate={onUpdate} />;
      case 'bar':
        return <BarChartSettings customization={customization} onUpdate={onUpdate} />;
      case 'stackedBar':
        return <StackedBarChartSettings customization={customization} onUpdate={onUpdate} />;
      case 'pie':
        return <PieChartSettings customization={customization} onUpdate={onUpdate} />;
      case 'donut':
        return <DonutChartSettings customization={customization} onUpdate={onUpdate} />;
      case 'map':
        return <MapChartSettings customization={customization} onUpdate={onUpdate} />;
      case 'radar':
        return <RadarChartSettings customization={customization} onUpdate={onUpdate} />;
      case 'gauge':
        return <GaugeChartSettings customization={customization} onUpdate={onUpdate} />;
              case 'histogram':
          return <HistogramChartSettings customization={customization} onUpdate={onUpdate} />;
        case 'heatmap':
          return <HeatmapChartSettings customization={customization} onUpdate={onUpdate} />;
        case 'timeline':
          return <TimelineChartCustomization customization={customization} onUpdate={onUpdate} />;
      default:
        return (
          <div className="text-center text-gray-500 py-8">
            <p>이 차트 유형에 대한 커스터마이징 옵션이 준비 중입니다.</p>
          </div>
        );
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-800 mb-4">
        {getChartTypeName(chartType)} 설정
      </h3>
      {renderChartSpecificSettings()}
    </div>
  );
};

// 차트 유형별 설정 컴포넌트들
const LineChartSettings: React.FC<{ customization: ChartCustomization; onUpdate: (chartType: ChartType, updates: any) => void }> = ({ customization, onUpdate }) => {
  // 기본값과 현재 설정을 병합
  const defaultSettings = getDefaultChartSettings('line');
  const currentSettings = customization.line || defaultSettings.line;
  
  return (
    <div className="space-y-4">
      <SettingSection title="선 스타일" icon={BarChart3}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              선 두께
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={currentSettings?.lines?.thickness || 2}
              onChange={(e) => onUpdate('line', { 
                lines: { 
                  ...currentSettings?.lines, 
                  thickness: Number(e.target.value) 
                } 
              })}
              className="w-full"
            />
            <div className="text-xs text-gray-500 text-center">
              {currentSettings?.lines?.thickness || 2}px
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              선 스타일
            </label>
            <select
              value={currentSettings?.lines?.style || 'solid'}
              onChange={(e) => onUpdate('line', { 
                lines: { 
                  ...currentSettings?.lines, 
                  style: e.target.value as any 
                } 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="solid">실선</option>
              <option value="dashed">점선</option>
              <option value="longDashed">긴 점선</option>
            </select>
          </div>
        </div>
      </SettingSection>

      <SettingSection title="마커" icon={Circle}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              마커 크기
            </label>
            <input
              type="range"
              min="2"
              max="20"
              value={currentSettings?.markers?.size || 6}
              onChange={(e) => onUpdate('line', { 
                markers: { 
                  ...currentSettings?.markers, 
                  size: Number(e.target.value) 
                } 
              })}
              className="w-full"
            />
            <div className="text-xs text-gray-500 text-center">
              {currentSettings?.markers?.size || 6}px
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              마커 모양
            </label>
            <select
              value={currentSettings?.markers?.shape || 'circle'}
              onChange={(e) => onUpdate('line', { 
                markers: { 
                  ...currentSettings?.markers, 
                  shape: e.target.value as any 
                } 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="circle">원형</option>
              <option value="square">네모</option>
              <option value="diamond">다이아몬드</option>
            </select>
          </div>
          
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                마커 디자인
              </label>
              <select
                value={currentSettings?.markers?.fill || 'filled'}
                onChange={(e) => onUpdate('line', { 
                  markers: { 
                    ...currentSettings?.markers, 
                    fill: e.target.value as any 
                  } 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="filled">기본</option>
                <option value="hollow">스타일1</option>
                <option value="style2">스타일2</option>
              </select>
            </div>

            {/* 스타일1 (hollow)일 때만 테두리 색상과 두께 표시 */}
            {currentSettings?.markers?.fill === 'hollow' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    테두리 색상
                  </label>
                  <input
                    type="color"
                    value={currentSettings?.markers?.borderColor || '#FF6B6B'}
                    onChange={(e) => onUpdate('line', { 
                      markers: { 
                        ...currentSettings?.markers, 
                        borderColor: e.target.value 
                      } 
                    })}
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    테두리 두께
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={currentSettings?.markers?.borderWidth || 1}
                    onChange={(e) => onUpdate('line', { 
                      markers: { 
                        ...currentSettings?.markers, 
                        borderWidth: parseInt(e.target.value) 
                      } 
                    })}
                    className="w-full"
                  />
                  <span className="text-sm text-gray-500">{currentSettings?.markers?.borderWidth || 1}px</span>
                </div>
              </>
            )}

            {/* 스타일2 (style2)일 때만 바탕 색상과 테두리 두께 표시 */}
            {currentSettings?.markers?.fill === 'style2' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    바탕 색상
                  </label>
                  <input
                    type="color"
                    value={currentSettings?.markers?.borderColor || '#FFFFFF'}
                    onChange={(e) => onUpdate('line', { 
                      markers: { 
                        ...currentSettings?.markers, 
                        borderColor: e.target.value 
                      } 
                    })}
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    테두리 두께
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={currentSettings?.markers?.borderWidth || 2}
                    onChange={(e) => onUpdate('line', { 
                      markers: { 
                        ...currentSettings?.markers, 
                        borderWidth: parseInt(e.target.value) 
                      } 
                    })}
                    className="w-full"
                  />
                  <span className="text-sm text-gray-500">{currentSettings?.markers?.borderWidth || 1}px</span>
                </div>
              </>
            )}
        </div>
      </SettingSection>
    </div>
  );
};

const BarChartSettings: React.FC<{ customization: ChartCustomization; onUpdate: (chartType: ChartType, updates: any) => void }> = ({ customization, onUpdate }) => {
  // 기본값과 현재 설정을 병합
  const defaultSettings = getDefaultChartSettings('bar');
  const currentSettings = customization.bar || defaultSettings.bar;
  
  return (
    <div className="space-y-4">
      <SettingSection title="막대 스타일" icon={BarChart3}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              막대 간격
            </label>
            <input
              type="range"
              min="0"
              max="50"
              value={currentSettings?.bars?.barSpacing || 10}
              onChange={(e) => onUpdate('bar', { 
                bars: { 
                  ...currentSettings?.bars, 
                  barSpacing: Number(e.target.value) 
                } 
              })}
              className="w-full"
            />
            <div className="text-xs text-gray-500 text-center">
              {currentSettings?.bars?.barSpacing || 10}px
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              방향
            </label>
            <select
              value={currentSettings?.bars?.direction || 'vertical'}
              onChange={(e) => onUpdate('bar', { 
                bars: { 
                  ...currentSettings?.bars, 
                  direction: e.target.value as any 
                } 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="vertical">수직</option>
              <option value="horizontal">수평</option>
            </select>
          </div>
          
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={currentSettings?.bars?.attachBars || false}
                onChange={(e) => onUpdate('bar', { 
                  bars: { 
                    ...currentSettings?.bars, 
                    attachBars: e.target.checked 
                  } 
                })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">막대 붙이기</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">그룹 내 막대를 서로 간격 없이 붙입니다</p>
          </div>
        </div>
      </SettingSection>
    </div>
  );
};

const StackedBarChartSettings: React.FC<{ customization: ChartCustomization; onUpdate: (chartType: ChartType, updates: any) => void }> = ({ customization, onUpdate }) => {
  // 기본값과 현재 설정을 병합
  const defaultSettings = getDefaultChartSettings('stackedBar');
  const currentSettings = customization.stackedBar || defaultSettings.stackedBar;
  
  return (
    <div className="space-y-4">
      <SettingSection title="누적 막대 그래프 스타일" icon={BarChart3}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              누적 모드
            </label>
            <select
              value={currentSettings?.stacking?.mode || 'normal'}
              onChange={(e) => onUpdate('stackedBar', { 
                stacking: { 
                  ...currentSettings?.stacking, 
                  mode: e.target.value as 'normal' | '100percent'
                } 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="normal">일반 누적</option>
              <option value="100percent">100% 누적</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {currentSettings?.stacking?.mode === '100percent' 
                ? '각 X축 값의 총합을 100%로 정규화하여 비율로 표시합니다.'
                : '절대값 기준으로 누적하여 표시합니다.'
              }
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              막대 간격
            </label>
            <input
              type="range"
              min="0"
              max="50"
              value={currentSettings?.bars?.barSpacing || 10}
              onChange={(e) => onUpdate('stackedBar', { 
                bars: { 
                  ...currentSettings?.bars, 
                  barSpacing: Number(e.target.value) 
                } 
              })}
              className="w-full"
            />
            <div className="text-xs text-gray-500 text-center">
              {currentSettings?.bars?.barSpacing || 10}px
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              그룹 간격
            </label>
            <input
              type="range"
              min="0"
              max="50"
              value={currentSettings?.bars?.groupSpacing || 20}
              onChange={(e) => onUpdate('stackedBar', { 
                bars: { 
                  ...currentSettings?.bars, 
                  groupSpacing: Number(e.target.value) 
                } 
              })}
              className="w-full"
            />
            <div className="text-xs text-gray-500 text-center">
              {currentSettings?.bars?.groupSpacing || 20}px
            </div>
          </div>
          

        </div>
      </SettingSection>
    </div>
  );
};

const PieChartSettings: React.FC<{ customization: ChartCustomization; onUpdate: (chartType: ChartType, updates: any) => void }> = ({ customization, onUpdate }) => {
  // 기본값과 현재 설정을 병합
  const defaultSettings = getDefaultChartSettings('pie');
  const currentSettings = customization.pie || defaultSettings.pie;
  
  return (
    <div className="space-y-4">
      <SettingSection title="원형 차트 스타일" icon={PieChart}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              시작 각도
            </label>
            <input
              type="range"
              min="0"
              max="360"
              value={currentSettings?.layout?.startAngle || 0}
              onChange={(e) => onUpdate('pie', { 
                layout: { 
                  ...currentSettings?.layout, 
                  startAngle: Number(e.target.value) 
                } 
              })}
              className="w-full"
            />
            <div className="text-xs text-gray-500 text-center">
              {currentSettings?.layout?.startAngle || 0}°
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="clockwise"
              checked={currentSettings?.layout?.clockwise || false}
              onChange={(e) => onUpdate('pie', { 
                layout: { 
                  ...currentSettings?.layout, 
                  clockwise: e.target.checked 
                } 
              })}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="clockwise" className="text-sm text-gray-700">
              시계 방향
            </label>
          </div>
        </div>
      </SettingSection>

      <SettingSection title="라벨 스타일" icon={Type}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              글자 크기
            </label>
            <input
              type="range"
              min="8"
              max="24"
              value={currentSettings?.labels?.fontSize || 12}
              onChange={(e) => onUpdate('pie', { 
                labels: { 
                  ...currentSettings?.labels, 
                  fontSize: Number(e.target.value) 
                } 
              })}
              className="w-full"
            />
            <div className="text-xs text-gray-500 text-center">
              {currentSettings?.labels?.fontSize || 12}px
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              라벨 색상 모드
            </label>
            <select
              value={currentSettings?.labels?.colorMode || 'legend'}
              onChange={(e) => onUpdate('pie', {
                labels: {
                  ...currentSettings?.labels,
                  colorMode: e.target.value as 'legend' | 'custom'
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="legend">범례색과 동일</option>
              <option value="custom">지정색</option>
            </select>
          </div>

          {currentSettings?.labels?.colorMode === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                지정 색상
              </label>
              <input
                type="color"
                value={currentSettings?.labels?.customColor || '#333333'}
                onChange={(e) => onUpdate('pie', {
                  labels: {
                    ...currentSettings?.labels,
                    customColor: e.target.value
                  }
                })}
                className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>
          )}
        </div>
      </SettingSection>
    </div>
  );
};

const DonutChartSettings: React.FC<{ customization: ChartCustomization; onUpdate: (chartType: ChartType, updates: any) => void }> = ({ customization, onUpdate }) => {
  // 기본값과 현재 설정을 병합
  const defaultSettings = getDefaultChartSettings('pie');
  const currentSettings = customization.pie || defaultSettings.pie;
  const donutSettings = customization.donut || getDefaultChartSettings('donut').donut;
  
  return (
    <div className="space-y-4">
      <SettingSection title="원형 차트 스타일" icon={PieChart}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              시작 각도
            </label>
            <input
              type="range"
              min="0"
              max="360"
              value={currentSettings?.layout?.startAngle || 0}
              onChange={(e) => onUpdate('pie', { 
                layout: { 
                  ...currentSettings?.layout, 
                  startAngle: Number(e.target.value) 
                } 
              })}
              className="w-full"
            />
            <div className="text-xs text-gray-500 text-center">
              {currentSettings?.layout?.startAngle || 0}°
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="clockwise"
              checked={currentSettings?.layout?.clockwise || false}
              onChange={(e) => onUpdate('pie', { 
                layout: { 
                  ...currentSettings?.layout, 
                  clockwise: e.target.checked 
                } 
              })}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="clockwise" className="text-sm text-gray-700">
              시계 방향
            </label>
          </div>
        </div>
      </SettingSection>

      <SettingSection title="차트 디자인" icon={Layout}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              도넛 두께
            </label>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.1"
              value={currentSettings?.layout?.donutRatio || 0.5}
              onChange={(e) => onUpdate('pie', { 
                layout: { 
                  ...currentSettings?.layout, 
                  donutRatio: Number(e.target.value) 
                } 
              })}
              className="w-full"
            />
            <div className="text-xs text-gray-500 text-center">
              {(currentSettings?.layout?.donutRatio || 0.5) * 100}%
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              중앙 텍스트
            </label>
            <input
              type="text"
              value={donutSettings?.center?.customText || ''}
              onChange={(e) => onUpdate('donut', { 
                center: { 
                  ...donutSettings?.center, 
                  customText: e.target.value 
                } 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="총합, 사용자 텍스트 등"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              글자 크기
            </label>
            <input
              type="range"
              min="12"
              max="48"
              value={donutSettings?.center?.fontSize || 24}
              onChange={(e) => onUpdate('donut', { 
                center: { 
                  ...donutSettings?.center, 
                  fontSize: Number(e.target.value) 
                } 
              })}
              className="w-full"
            />
            <div className="text-xs text-gray-500 text-center">
              {donutSettings?.center?.fontSize || 24}px
            </div>
          </div>
        </div>
      </SettingSection>

      <SettingSection title="라벨 스타일" icon={Type}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              글자 크기
            </label>
            <input
              type="range"
              min="8"
              max="24"
              value={currentSettings?.labels?.fontSize || 12}
              onChange={(e) => onUpdate('pie', { 
                labels: { 
                  ...currentSettings?.labels, 
                  fontSize: Number(e.target.value) 
                } 
              })}
              className="w-full"
            />
            <div className="text-xs text-gray-500 text-center">
              {currentSettings?.labels?.fontSize || 12}px
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              라벨 색상 모드
            </label>
            <select
              value={currentSettings?.labels?.colorMode || 'legend'}
              onChange={(e) => onUpdate('pie', {
                labels: {
                  ...currentSettings?.labels,
                  colorMode: e.target.value as 'legend' | 'custom'
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="legend">범례색과 동일</option>
              <option value="custom">지정색</option>
            </select>
          </div>

          {currentSettings?.labels?.colorMode === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                지정 색상
              </label>
              <input
                type="color"
                value={currentSettings?.labels?.customColor || '#333333'}
                onChange={(e) => onUpdate('pie', {
                  labels: {
                    ...currentSettings?.labels,
                    customColor: e.target.value
                  }
                })}
                className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>
          )}
        </div>
      </SettingSection>
    </div>
  );
};

const MapChartSettings: React.FC<{ customization: ChartCustomization; onUpdate: (chartType: ChartType, updates: any) => void }> = ({ customization, onUpdate }) => {
  // 기본값과 현재 설정을 병합
  const defaultSettings = getDefaultChartSettings('map');
  const currentSettings = customization.map || defaultSettings.map;
  
  return (
    <div className="space-y-4">
      <SettingSection title="지도 스타일" icon={Map}>
        <div className="space-y-3">
          <div>
            <select
              value={currentSettings?.basemap?.type || 'default'}
              onChange={(e) => onUpdate('map', { 
                basemap: { 
                  ...currentSettings?.basemap, 
                  type: e.target.value as 'default' | 'simplified'
                } 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="default">기본 지도 (OpenStreetMap)</option>
              <option value="simplified">간소화 지도 (CartoDB)</option>
            </select>
          </div>
          

        </div>
      </SettingSection>
    </div>
  );
};

const RadarChartSettings: React.FC<{ customization: ChartCustomization; onUpdate: (chartType: ChartType, updates: any) => void }> = ({ customization, onUpdate }) => {
  // 기본값과 현재 설정을 병합
  const defaultSettings = getDefaultChartSettings('radar');
  const currentSettings = customization.radar || defaultSettings.radar;
  
  return (
    <div className="space-y-4">
      <SettingSection title="축 설정" icon={Layout}>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="normalize"
              checked={currentSettings?.axes?.normalize || false}
              onChange={(e) => onUpdate('radar', { 
                axes: { 
                  ...currentSettings?.axes, 
                  normalize: e.target.checked 
                } 
              })}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="normalize" className="text-sm text-gray-700">
              값 정규화 (0-100%)
            </label>
          </div>
          <p className="text-xs text-gray-500">
            입력된 데이터의 최대값을 기준으로 자동 설정됩니다.
          </p>
        </div>
      </SettingSection>


    </div>
  );
};

// 설정 섹션 컴포넌트
interface SettingSectionProps {
  title: string;
  icon: React.ComponentType<any>;
  children: React.ReactNode;
}

const SettingSection: React.FC<SettingSectionProps> = ({ title, icon: Icon, children }) => (
  <div className="border border-gray-200 rounded-lg p-4">
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-blue-600" />
      <h4 className="font-medium text-gray-800">{title}</h4>
    </div>
    {children}
  </div>
);

// 현재 색상 팔레트 색상 가져오기
const getCurrentPaletteColors = (paletteName: string, customColors?: string[]): string[] => {
  switch (paletteName) {
    case 'brand':
      return getBrandColors();
    case 'rainbow':
      return getRainbowColors();
    case 'reference18':
      return getColorPalette('18_colors');
    case 'custom':
      return customColors || [];
    default:
      return getBrandColors();
  }
};

// 차트 유형 이름 반환
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

// 히스토그램 차트 설정 컴포넌트
const HistogramChartSettings: React.FC<{ customization: ChartCustomization; onUpdate: (chartType: ChartType, updates: any) => void }> = ({ customization, onUpdate }) => {
  // 기본값과 현재 설정을 병합
  const defaultSettings = getDefaultChartSettings('histogram');
  const currentSettings = customization.histogram || defaultSettings.histogram;
  
  return (
    <div className="space-y-4">
      {/* 🌈 색상 팔레트 설정 */}
      <SettingSection title="색상 팔레트" icon={Palette}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              색상 팔레트
            </label>
            <select
              value={currentSettings?.colors?.palette || 'brand'}
              onChange={(e) => onUpdate('histogram', { 
                colors: { 
                  ...currentSettings?.colors, 
                  palette: e.target.value as any 
                } 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="brand">{getPaletteDisplayName('brand')}</option>
              <option value="rainbow">{getPaletteDisplayName('rainbow')}</option>
              <option value="reference18">{getPaletteDisplayName('reference18')}</option>
              <option value="custom">{getPaletteDisplayName('custom')}</option>
            </select>
            {currentSettings?.colors?.palette && (
              <>
                <p className="text-xs text-gray-500 mt-1">
                  {getPaletteDescription(currentSettings.colors.palette)}
                </p>
                <div className="mt-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    색상 미리보기
                  </label>
                  <div className="flex gap-1 flex-wrap">
                    {getCurrentPaletteColors(currentSettings.colors.palette, currentSettings.colors.customColors).map((color, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 rounded border border-gray-200"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          
          {currentSettings?.colors?.palette === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                사용자 정의 색상
              </label>
              <div className="space-y-2">
                {(currentSettings.colors.customColors || ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6']).map((color, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => {
                        const newColors = [...(currentSettings.colors.customColors || ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'])];
                        newColors[index] = e.target.value;
                        onUpdate('histogram', {
                          colors: {
                            ...currentSettings.colors,
                            customColors: newColors
                          }
                        });
                      }}
                      className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                    />
                    <span className="text-xs text-gray-600">색상 {index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SettingSection>

      {/* 📊 막대 스타일 설정 */}
      <SettingSection title="막대 스타일" icon={BarChart3}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              막대 투명도
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={currentSettings?.bars?.opacity || 0.8}
              onChange={(e) => onUpdate('histogram', { 
                bars: { 
                  ...currentSettings?.bars, 
                  opacity: Number(e.target.value) 
                } 
              })}
              className="w-full"
            />
            <div className="text-xs text-gray-500 text-center">
              {(currentSettings?.bars?.opacity || 0.8).toFixed(1)}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              막대 테두리 두께
            </label>
            <input
              type="range"
              min="0"
              max="5"
              value={currentSettings?.bars?.borderWidth || 1}
              onChange={(e) => onUpdate('histogram', { 
                bars: { 
                  ...currentSettings?.bars, 
                  borderWidth: Number(e.target.value) 
                } 
              })}
              className="w-full"
            />
            <div className="text-xs text-gray-500 text-center">
              {currentSettings?.bars?.borderWidth || 1}px
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              막대 테두리 색상
            </label>
            <input
              type="color"
              value={currentSettings?.bars?.borderColor || '#000000'}
              onChange={(e) => onUpdate('histogram', { 
                bars: { 
                  ...currentSettings?.bars, 
                  borderColor: e.target.value 
                } 
              })}
              className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
            />
          </div>
        </div>
      </SettingSection>

      {/* 📈 그라데이션 설정 */}
      <SettingSection title="그라데이션 효과" icon={Palette}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              그라데이션 적용
            </label>
            <select
              value={currentSettings?.gradient?.enabled ? 'true' : 'false'}
              onChange={(e) => onUpdate('histogram', { 
                gradient: { 
                  ...currentSettings?.gradient, 
                  enabled: e.target.value === 'true' 
                } 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="false">비활성화</option>
              <option value="true">활성화</option>
            </select>
          </div>
          
          {currentSettings?.gradient?.enabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  그라데이션 방향
                </label>
                <select
                  value={currentSettings?.gradient?.direction || 'vertical'}
                  onChange={(e) => onUpdate('histogram', { 
                    gradient: { 
                      ...currentSettings?.gradient, 
                      direction: e.target.value as 'vertical' | 'horizontal' | 'diagonal' 
                    } 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="vertical">수직 (위→아래)</option>
                  <option value="horizontal">수평 (왼쪽→오른쪽)</option>
                  <option value="diagonal">대각선 (왼쪽 위→오른쪽 아래)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  그라데이션 강도
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={currentSettings?.gradient?.intensity || 0.7}
                  onChange={(e) => onUpdate('histogram', { 
                    gradient: { 
                      ...currentSettings?.gradient, 
                      intensity: Number(e.target.value) 
                    } 
                  })}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 text-center">
                  {(currentSettings?.gradient?.intensity || 0.7).toFixed(1)}
                </div>
              </div>
            </>
          )}
        </div>
      </SettingSection>
    </div>
  );
};

// 히트맵 차트 설정 컴포넌트
const HeatmapChartSettings: React.FC<{ customization: ChartCustomization; onUpdate: (chartType: ChartType, updates: any) => void }> = ({ customization, onUpdate }) => {
  // 기본값과 현재 설정을 병합
  const defaultSettings = getDefaultChartSettings('heatmap');
  const currentSettings = customization.heatmap || defaultSettings.heatmap;
  
  return (
    <div className="space-y-4">


      {/* 🌈 색상 팔레트 설정 */}
      <SettingSection title="색상 팔레트" icon={Palette}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              색상 팔레트
            </label>
            <select
              value={currentSettings?.colors?.palette || 'viridis'}
              onChange={(e) => onUpdate('heatmap', { 
                colors: { 
                  ...currentSettings?.colors, 
                  palette: e.target.value as 'viridis' | 'plasma' | 'inferno' | 'magma' | 'rdbu' | 'blues' | 'coolwarm' | 'greens' | 'oranges' | 'reds' | 'purples' | 'ylorbr' | 'custom'
                } 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="viridis">Viridis</option>
              <option value="plasma">Plasma</option>
              <option value="inferno">Inferno</option>
              <option value="magma">Magma</option>
              <option value="rdbu">RdBu</option>
              <option value="blues">Blues</option>
              <option value="coolwarm">Cool-Warm</option>
              <option value="greens">Greens</option>
              <option value="oranges">Oranges</option>
              <option value="reds">Reds</option>
              <option value="purples">Purples</option>
              <option value="ylorbr">YlOrBr</option>
              <option value="custom">사용자 정의</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              인기 있는 히트맵 색상 조합입니다. 양극값 표현에는 RdBu가 특히 적합합니다.
            </p>
            
            {/* 사용자 정의 색상 설정 */}
            {currentSettings?.colors?.palette === 'custom' && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  사용자 정의 색상
                </label>
                <div className="space-y-2">
                  {(currentSettings.colors.customColors || ['#000080', '#0000FF', '#00FFFF', '#FFFF00', '#FF0000']).map((color, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => {
                          const newColors = [...(currentSettings.colors.customColors || ['#000080', '#0000FF', '#00FFFF', '#FFFF00', '#FF0000'])];
                          newColors[index] = e.target.value;
                          onUpdate('heatmap', {
                            colors: {
                              ...currentSettings.colors,
                              customColors: newColors
                            }
                          });
                        }}
                        className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                      />
                      <span className="text-xs text-gray-600">색상 {index + 1}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  낮은 값부터 높은 값 순서로 색상을 설정하세요. 최소 3개, 최대 5개 색상을 사용할 수 있습니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </SettingSection>

      {/* 📊 범례 스타일 설정 */}
      <SettingSection title="범례 스타일" icon={BarChart3}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              범례 위치
            </label>
            <select
              value={currentSettings?.legend?.position || 'right'}
              onChange={(e) => onUpdate('heatmap', { 
                legend: { 
                  ...currentSettings?.legend, 
                  position: e.target.value as 'right' | 'bottom'
                } 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="right">오른쪽 (수직 범례)</option>
              <option value="bottom">아래쪽 (수평 범례)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              범례 유형은 연속형으로 고정되며, 방향은 위치에 따라 자동 설정됩니다.
            </p>
          </div>
        </div>
      </SettingSection>

      {/* 🎨 셀 스타일 설정 */}
      <SettingSection title="셀 스타일" icon={Layout}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              셀 테두리
            </label>
            <select
              value={currentSettings?.cells?.border ? 'true' : 'false'}
              onChange={(e) => onUpdate('heatmap', { 
                cells: { 
                  ...currentSettings?.cells, 
                  border: e.target.value === 'true' 
                } 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="false">숨김</option>
              <option value="true">표시</option>
            </select>
          </div>
          
          {currentSettings?.cells?.border && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                테두리 색상
              </label>
              <input
                type="color"
                value={currentSettings?.cells?.borderColor || '#FFFFFF'}
                onChange={(e) => onUpdate('heatmap', { 
                  cells: { 
                    ...currentSettings?.cells, 
                    borderColor: e.target.value 
                  } 
                })}
                className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              셀 간격
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={currentSettings?.cells?.gap || 0}
              onChange={(e) => onUpdate('heatmap', { 
                cells: { 
                  ...currentSettings?.cells, 
                  gap: Number(e.target.value) 
                } 
              })}
              className="w-full"
            />
            <div className="text-xs text-gray-500 text-center">
              {currentSettings?.cells?.gap || 0}px
            </div>
          </div>
        </div>
      </SettingSection>
    </div>
  );
};

// 게이지 차트 설정 컴포넌트
const GaugeChartSettings: React.FC<{ customization: ChartCustomization; onUpdate: (chartType: ChartType, updates: any) => void }> = ({ customization, onUpdate }) => {
  // 기본값과 현재 설정을 병합
  const defaultSettings = getDefaultChartSettings('gauge');
  const currentSettings = customization.gauge || defaultSettings.gauge;
  
  return (
    <div className="space-y-4">
      {/* 🎯 용도별 게이지 설정 */}
      <SettingSection title="용도별 게이지" icon={Target}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              게이지 용도
            </label>
            <select
              value={currentSettings?.purpose?.type || 'normal'}
              onChange={(e) => onUpdate('gauge', { 
                purpose: { 
                  ...currentSettings?.purpose, 
                  type: e.target.value as 'normal' | 'high' | 'low',
                  description: e.target.value === 'normal' ? '일반 게이지' : 
                              e.target.value === 'high' ? '고지향: 값이 높을수록 좋음' : 
                              '저지향: 값이 낮을수록 좋음'
                } 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="normal">일반 게이지</option>
              <option value="high">고지향 게이지</option>
              <option value="low">저지향 게이지</option>
            </select>
            <div className="text-xs text-gray-500 mt-1">
              {currentSettings?.purpose?.type === 'normal' 
                ? '일반 게이지: 회색 배경에 파란색 게이지로 수치만큼 채우기' 
                : currentSettings?.purpose?.type === 'high'
                ? '고지향: 값이 높을수록 좋은 지표 (예: 만족도, 달성률)' 
                : '저지향: 값이 낮을수록 좋은 지표 (예: 오류율, 지연시간)'}
            </div>
          </div>
        </div>
      </SettingSection>

      {/* 🎨 게이지 바 설정 */}
      <SettingSection title="게이지 바" icon={BarChart3}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              기본 바 색상
            </label>
            <input
              type="color"
              value={currentSettings?.bar?.color || '#3b82f6'}
              onChange={(e) => onUpdate('gauge', { 
                bar: { 
                  ...currentSettings?.bar, 
                  color: e.target.value 
                } 
              })}
              className="w-full h-10 border border-gray-300 rounded-md"
            />
            <div className="text-xs text-gray-500 mt-1">
              팔레트 1번 색상 (일반 게이지에서 사용)
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              바 두께
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={currentSettings?.bar?.thickness || 0.8}
              onChange={(e) => onUpdate('gauge', { 
                bar: { 
                  ...currentSettings?.bar, 
                  thickness: Number(e.target.value) 
                } 
              })}
              className="w-full"
            />
            <div className="text-xs text-gray-500 text-center">
              {(currentSettings?.bar?.thickness || 0.8) * 100}%
            </div>
          </div>
        </div>
      </SettingSection>

      {/* 🌈 배경 설정 */}
      <SettingSection title="배경 설정" icon={Palette}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              배경색
            </label>
            <input
              type="color"
              value={currentSettings?.background?.color || '#d9d9d9'}
              onChange={(e) => onUpdate('gauge', { 
                background: { 
                  ...currentSettings?.background, 
                  color: e.target.value 
                } 
              })}
              className="w-full h-10 border border-gray-300 rounded-md"
            />
            <div className="text-xs text-gray-500 mt-1">
              게이지 차트 배경색 (기본: RGB 240, 240, 240)
            </div>
          </div>
        </div>
      </SettingSection>

      {/* 🎯 임계값 설정 (고지향/저지향일 때만 표시) */}
      {(currentSettings?.purpose?.type === 'high' || currentSettings?.purpose?.type === 'low') && (
        <SettingSection title="임계값 설정" icon={Hash}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                낮은 임계값 (빨강/초록)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={currentSettings?.thresholds?.low || 33}
                onChange={(e) => onUpdate('gauge', { 
                  thresholds: { 
                    ...currentSettings?.thresholds, 
                    low: Number(e.target.value) 
                  } 
                })}
                className="w-full"
              />
              <div className="text-xs text-gray-500 text-center">
                {currentSettings?.thresholds?.low || 33}%
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                중간 임계값 (주황)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={currentSettings?.thresholds?.medium || 66}
                onChange={(e) => onUpdate('gauge', { 
                  thresholds: { 
                    ...currentSettings?.thresholds, 
                    medium: Number(e.target.value) 
                  } 
                })}
                className="w-full"
              />
              <div className="text-xs text-gray-500 text-center">
                {currentSettings?.thresholds?.medium || 66}%
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                높은 임계값 (초록/빨강)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={currentSettings?.thresholds?.high || 100}
                onChange={(e) => onUpdate('gauge', { 
                  thresholds: { 
                    ...currentSettings?.thresholds, 
                    high: Number(e.target.value) 
                  } 
                })}
                className="w-full"
              />
              <div className="text-xs text-gray-500 text-center">
                {currentSettings?.thresholds?.high || 100}%
              </div>
            </div>
          </div>
        </SettingSection>
      )}

      {/* 🔢 단위 설정 */}
      <SettingSection title="단위 설정" icon={Hash}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              단위 표시
            </label>
            <select
              value={currentSettings?.units?.show ? 'true' : 'false'}
              onChange={(e) => onUpdate('gauge', { 
                units: { 
                  ...currentSettings?.units, 
                  show: e.target.value === 'true' 
                } 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="false">숨김</option>
              <option value="true">표시</option>
            </select>
          </div>
          
          {currentSettings?.units?.show && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                단위 텍스트
              </label>
              <input
                type="text"
                value={currentSettings?.units?.text || '%'}
                onChange={(e) => onUpdate('gauge', { 
                  units: { 
                    ...currentSettings?.units, 
                    text: e.target.value 
                  } 
                })}
                placeholder="%"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
      </SettingSection>
    </div>
  );
};

// TimelineChart 커스터마이징 섹션
const TimelineChartCustomization: React.FC<{
  customization: ChartCustomization;
  onUpdate: (chartType: ChartType, updates: any) => void;
}> = ({ customization, onUpdate }) => {
  const currentSettings = customization;

  return (
    <>
      {/* 📊 차트 제목 설정 */}
      <SettingSection title="차트 제목 설정" icon={Type}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              차트 제목
            </label>
            <input
              type="text"
              value={currentSettings?.chartTitle || '타임라인(공정표)'}
              onChange={(e) => onUpdate('timeline', { chartTitle: e.target.value })}
              placeholder="타임라인(공정표)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              제목 크기
            </label>
            <input
              type="range"
              min="12"
              max="32"
              value={currentSettings?.titleSize || 20}
              onChange={(e) => onUpdate('timeline', { titleSize: Number(e.target.value) })}
              className="w-full"
            />
            <div className="text-xs text-gray-500 text-center">
              {currentSettings?.titleSize || 20}px
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              제목 색상
            </label>
            <input
              type="color"
              value={currentSettings?.titleColor || '#1f2937'}
              onChange={(e) => onUpdate('timeline', { titleColor: e.target.value })}
              className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
            />
          </div>
        </div>
      </SettingSection>

      {/* 🎨 월 헤더 설정 */}
      <SettingSection title="월 헤더 설정" icon={BarChart3}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              월 헤더 배경색
            </label>
            <input
              type="color"
              value={currentSettings?.monthHeaderColor || '#f5f5f5'}
              onChange={(e) => onUpdate('timeline', { monthHeaderColor: e.target.value })}
              className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              월 헤더 텍스트 색상
            </label>
            <input
              type="color"
              value={currentSettings?.monthTextColor || '#1f2937'}
              onChange={(e) => onUpdate('timeline', { monthTextColor: e.target.value })}
              className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              월 그리드 색상
            </label>
            <input
              type="color"
              value={currentSettings?.monthGridColor || '#e2e8f0'}
              onChange={(e) => onUpdate('timeline', { monthGridColor: e.target.value })}
              className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              월 라벨 크기
            </label>
            <input
              type="range"
              min="12"
              max="24"
              value={currentSettings?.monthLabelSize || 18}
              onChange={(e) => onUpdate('timeline', { monthLabelSize: Number(e.target.value) })}
              className="w-full"
            />
            <div className="text-xs text-gray-500 text-center">
              {currentSettings?.monthLabelSize || 18}px
            </div>
          </div>
        </div>
      </SettingSection>

      {/* 🎯 레인 설정 */}
      <SettingSection title="레인 설정" icon={Layout}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              레인 라벨 크기
            </label>
            <input
              type="range"
              min="12"
              max="24"
              value={currentSettings?.laneLabelSize || 18}
              onChange={(e) => onUpdate('timeline', { laneLabelSize: Number(e.target.value) })}
              className="w-full"
            />
            <div className="text-xs text-gray-500 text-center">
              {currentSettings?.laneLabelSize || 18}px
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              막대 간격
            </label>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.05"
              value={currentSettings?.barGap || 0.25}
              onChange={(e) => onUpdate('timeline', { barGap: Number(e.target.value) })}
              className="w-full"
            />
            <div className="text-xs text-gray-500 text-center">
              {(currentSettings?.barGap || 0.25).toFixed(2)}
            </div>
          </div>
        </div>
      </SettingSection>

             {/* 🌈 색상 및 투명도 설정 */}
       <SettingSection title="색상 및 투명도" icon={Palette}>
         <div className="space-y-3">
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              막대 투명도
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={currentSettings?.opacity || 0.8}
              onChange={(e) => onUpdate('timeline', { opacity: Number(e.target.value) })}
              className="w-full"
            />
            <div className="text-xs text-gray-500 text-center">
              {(currentSettings?.opacity || 0.8).toFixed(1)}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              차트 배경색
            </label>
            <input
              type="color"
              value={currentSettings?.plotBackgroundColor || 'white'}
              onChange={(e) => onUpdate('timeline', { plotBackgroundColor: e.target.value })}
              className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              전체 배경색
            </label>
            <input
              type="color"
              value={currentSettings?.paperBackgroundColor || 'white'}
              onChange={(e) => onUpdate('timeline', { paperBackgroundColor: e.target.value })}
              className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
            />
          </div>
        </div>
      </SettingSection>
    </>
  );
};

// 커스터마이징 만족도 탭 컴포넌트
interface CustomizationSatisfactionTabProps {
  recommendation: 'recommend' | 'not_recommend' | null;
  starRating: number;
  isSubmitted: boolean;
  isSubmitting: boolean;
  onRecommendationClick: (type: 'recommend' | 'not_recommend') => void;
  onStarClick: (rating: number) => void;
  onSubmit: () => void;
  onReset: () => void;
}

const CustomizationSatisfactionTab: React.FC<CustomizationSatisfactionTabProps> = ({
  recommendation,
  starRating,
  isSubmitted,
  isSubmitting,
  onRecommendationClick,
  onStarClick,
  onSubmit,
  onReset
}) => {
  if (isSubmitted) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <Star className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          커스터마이징 만족도 평가가 완료되었습니다!
        </h3>
        <p className="text-gray-600 mb-6">
          커스터마이징 기능에 대한 평가를 제출해주셔서 감사합니다.
        </p>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          다시 평가하기
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          커스터마이징 기능 만족도 평가
        </h3>
        <p className="text-sm text-gray-600">
          커스터마이징 기능에 대한 만족도를 평가해주세요
        </p>
      </div>

      {/* 추천 여부 */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          이 커스터마이징 기능을 추천하시나요?
        </label>
        <div className="flex space-x-4">
          <button
            onClick={() => onRecommendationClick('recommend')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
              recommendation === 'recommend'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>추천</span>
          </button>
          <button
            onClick={() => onRecommendationClick('not_recommend')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
              recommendation === 'not_recommend'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ThumbsDown className="w-4 h-4" />
            <span>비추천</span>
          </button>
        </div>
      </div>

      {/* 별점 평가 */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          별점 평가 (0.5점 단위)
        </label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((rating) => {
            const isFilled = starRating >= rating;
            const isHalfFilled = starRating >= rating - 0.5 && starRating < rating;

            return (
              <div key={rating} className="relative">
                <button
                  onClick={() => onStarClick(rating)}
                  className="relative p-1 hover:scale-110 transition-transform"
                  disabled={isSubmitting}
                  title={`${rating}점`}
                >
                  <Star
                    className={`w-6 h-6 ${
                      isFilled
                        ? 'text-yellow-400 fill-yellow-400'
                        : isHalfFilled
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
                
                {/* 반쪽 별 클릭 영역 (왼쪽 절반) */}
                <button
                  onClick={() => onStarClick(rating - 0.5)}
                  className="absolute inset-0 p-1 hover:scale-110 transition-transform"
                  disabled={isSubmitting}
                  style={{ 
                    width: '50%', 
                    left: 0,
                    background: 'transparent',
                    cursor: 'pointer'
                  }}
                  title={`${rating - 0.5}점`}
                >
                  <div className="w-full h-full"></div>
                </button>
                
                {/* 반쪽 별 시각적 표시 - 오른쪽 절반을 흰색으로 가림 */}
                {isHalfFilled && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-3 h-6 bg-white rounded-r-full ml-3"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="text-sm text-gray-500 text-center">
          {starRating > 0 ? `${starRating}/5` : '별점을 선택해주세요'}
        </div>
      </div>

      {/* 제출 버튼 */}
      <div className="pt-4">
        <button
          onClick={onSubmit}
          disabled={!recommendation || starRating === 0 || isSubmitting}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            !recommendation || starRating === 0 || isSubmitting
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? '제출 중...' : '커스터마이징 만족도 평가 제출'}
        </button>
      </div>
    </div>
  );
};

export default ChartCustomizationPanel;

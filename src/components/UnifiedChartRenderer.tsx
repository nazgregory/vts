import React, { useMemo, useEffect, useState, useRef } from 'react';
import { ChartType, ChartData, ChartCustomization } from '@/types';
import { defaultCommonSettings, getDefaultChartSettings } from '@/types/chartCustomization';

// Plotly를 전역에서 가져오기
declare global {
  interface Window {
    Plotly: any;
  }
}
import { createPlotlyChartData, createPlotlyLayout, createPlotlyConfig } from '@/utils/plotlyChartRenderer';
import WordCloudChart from './WordCloudChart';
import TimelineChart from './TimelineChart';
import MapChart from './MapChart';
import GaugeChart from './GaugeChart';
import ChartSatisfactionRating from './ChartSatisfactionRating';
import { useRenderTimer, useTracking } from '../hooks/useTracking';
import trackingSDK from '../utils/tracking';


interface UnifiedChartRendererProps {
  type: ChartType;
  data: ChartData[];
  customization: ChartCustomization;
  width?: number;
  height?: number;
  isGallery?: boolean;
  showSatisfactionRating?: boolean;
  chartId?: string;
  options?: {
  };
}

const UnifiedChartRenderer: React.FC<UnifiedChartRendererProps> = ({
  type,
  data,
  customization,
  width = 800,
  height = 500,
  isGallery = false,
  showSatisfactionRating = false,
  chartId = `chart-${Date.now()}`,
  options
}) => {
  // customization 변경 시 차트 재렌더링을 위한 상태
  const [renderKey, setRenderKey] = useState(0);
  
  // 렌더링 시간 측정을 위한 훅
  const { start: startRenderTimer, end: endRenderTimer } = useRenderTimer();
  const { trackGalleryView } = useTracking();
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // 커스터마이징 여부 판단 (기본값과 다른지 확인)
  const isCustomized = useMemo(() => {
    // 공통 설정이 기본값과 다른지 확인
    const commonCustomized = Object.keys(customization.common || {}).some(key => {
      const currentValue = customization.common[key as keyof typeof customization.common];
      const defaultValue = defaultCommonSettings[key as keyof typeof defaultCommonSettings];
      return currentValue !== defaultValue;
    });

    // 차트별 설정이 기본값과 다른지 확인
    const chartCustomized = Object.keys(customization).some(key => {
      if (key === 'common') return false;
      const chartType = key as ChartType;
      const currentSettings = customization[chartType];
      const defaultSettings = getDefaultChartSettings(chartType);
      
      if (!currentSettings || !defaultSettings) return false;
      
      return Object.keys(currentSettings).some(settingKey => {
        const currentValue = currentSettings[settingKey];
        const defaultValue = defaultSettings[settingKey];
        return currentValue !== defaultValue;
      });
    });

    return commonCustomized || chartCustomized;
  }, [customization]);

  // customization이 변경될 때마다 차트 재렌더링
  useEffect(() => {
    setRenderKey(prev => prev + 1);
  }, [customization]);

  // 차트 렌더링 완료 시 트래킹
  useEffect(() => {
    if (data && data.length > 0) {
      startRenderTimer();
      
      // 렌더링 완료를 감지하기 위한 타이머
      const timer = setTimeout(() => {
        const renderMs = endRenderTimer();
        
        // 트래킹 이벤트 전송 (갤러리 모드에 따라 구분)
        if (isGallery) {
          trackGalleryView(
            type,
            'plotly', // 대부분의 차트는 Plotly 사용
            renderMs,
            data.length,
            data[0] ? Object.keys(data[0]).length : 0,
            true
          );
        } else {
          trackingSDK.trackChartRender(
            type,
            'plotly', // 대부분의 차트는 Plotly 사용
            renderMs,
            data.length,
            data[0] ? Object.keys(data[0]).length : 0,
            true
          );
        }
      }, 100); // 100ms 후 렌더링 완료로 간주

      return () => clearTimeout(timer);
    }
  }, [type, data, renderKey, startRenderTimer, endRenderTimer]);

  // 데이터 처리
  const sortedData = useMemo(() => {
    return data;
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="space-y-4">
        <div className="chart-container bg-gray-50 rounded-lg p-8 text-center flex items-center justify-center">
          <div className="text-gray-500">
            <p>데이터가 없습니다.</p>
          </div>
        </div>
        {showSatisfactionRating && (
          <ChartSatisfactionRating
            chartId={chartId}
            chartType={type}
            isCustomized={Object.keys(customization).length > 0}
            className="max-w-md mx-auto"
          />
        )}
      </div>
    );
  }

  // 차트 유형별 렌더링
  switch (type) {
    case 'wordcloud':
      return (
        <>
          <WordCloudChart
            data={sortedData}
            customization={customization}
            width={width}
            height={height}
          />
          {showSatisfactionRating && (
            <div className="satisfaction-rating-container mt-6">
              <ChartSatisfactionRating
                chartId={chartId}
                chartType={type}
                isCustomized={isCustomized}
                className="max-w-md mx-auto"
              />
            </div>
          )}
        </>
      );

    case 'timeline':
      return (
        <>
          <TimelineChart
            data={sortedData}
            customization={customization}
            width={width}
            height={height}
          />
          {showSatisfactionRating && (
            <div className="satisfaction-rating-container mt-6">
              <ChartSatisfactionRating
                chartId={chartId}
                chartType={type}
                isCustomized={isCustomized}
                className="max-w-md mx-auto"
              />
            </div>
          )}
        </>
      );

    case 'gauge':
      return (
        <>
          <GaugeChart
            data={sortedData}
            customization={customization}
            width={width}
            height={height}
          />
          {showSatisfactionRating && (
            <div className="satisfaction-rating-container mt-6">
              <ChartSatisfactionRating
                chartId={chartId}
                chartType={type}
                isCustomized={isCustomized}
                className="max-w-md mx-auto"
              />
            </div>
          )}
        </>
      );

    case 'map':
      return (
        <>
          <MapChart
            data={sortedData}
            customization={customization}
            width={width}
            height={height}
          />
          {showSatisfactionRating && (
            <div className="satisfaction-rating-container mt-6">
              <ChartSatisfactionRating
                chartId={chartId}
                chartType={type}
                isCustomized={isCustomized}
                className="max-w-md mx-auto"
              />
            </div>
          )}
        </>
      );

    default:
      // Plotly 기반 차트들
      const plotlyData = createPlotlyChartData(sortedData, type, customization);
      const layout = createPlotlyLayout(type, customization, { data: sortedData });
      const config = createPlotlyConfig();
      
      return (
        <>
          <div className="chart-container flex items-center justify-center">
            <div
              key={renderKey}
              id={`chart-${renderKey}`}
              style={{ width: '100%', height: '100%' }}
              ref={(el) => {
                if (el && window.Plotly) {
                  // 기존 차트 완전 삭제
                  window.Plotly.purge(el);
                  
                  // 새로운 차트 렌더링
                  window.Plotly.newPlot(el, plotlyData, {
                    ...layout,
                    width,
                    height,
                    autosize: true
                  }, config).then(() => {
                    // 차트 렌더링 완료
                  }).catch((error: any) => {
                    console.error('차트 렌더링 오류:', error);
                  });
                }
              }}
            />
          </div>
          {showSatisfactionRating && (
            <div className="satisfaction-rating-container mt-6">
              <ChartSatisfactionRating
                chartId={chartId}
                chartType={type}
                isCustomized={isCustomized}
                className="max-w-md mx-auto"
              />
            </div>
          )}
        </>
      );
  }
};

export default UnifiedChartRenderer; 
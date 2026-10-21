import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import trackingSDK from '../utils/tracking';

/**
 * 트래킹 훅
 * React 컴포넌트에서 트래킹 기능을 쉽게 사용할 수 있도록 하는 훅
 */
export const useTracking = () => {
  const location = useLocation();
  const renderStartTime = useRef<number>(0);

  // 브라우저 해상도 수집 (메인 페이지 첫 접속 시에만)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.screen && location.pathname === '/') {
      // 이미 해상도가 수집되었는지 확인
      const resolutionKey = `resolution_collected_${window.screen.width}x${window.screen.height}`;
      if (!sessionStorage.getItem(resolutionKey)) {
        trackingSDK.trackBrowserResolution(window.screen.width, window.screen.height);
        sessionStorage.setItem(resolutionKey, 'true');
      }
    }
  }, [location.pathname]); // location.pathname을 의존성에 추가하여 메인 페이지에서만 실행

  // 페이지 뷰 자동 추적
  useEffect(() => {
    trackingSDK.trackPageView(location.pathname, document.referrer);
  }, [location.pathname]);

  // 차트 렌더링 시간 측정 시작
  const startRenderTimer = useCallback(() => {
    renderStartTime.current = Date.now();
  }, []);

  // 차트 렌더링 시간 측정 종료 및 이벤트 전송
  const endRenderTimer = useCallback((
    chartType: string, 
    library: string, 
    dataRows: number, 
    dataCols: number, 
    success: boolean = true
  ) => {
    const renderMs = Date.now() - renderStartTime.current;
    trackingSDK.trackChartRender(chartType, library, renderMs, dataRows, dataCols, success);
  }, []);

  // 파일 업로드 추적
  const trackFileUpload = useCallback((
    filename: string, 
    bytes: number, 
    rows: number, 
    cols: number, 
    mime?: string
  ) => {
    trackingSDK.trackFileUpload(filename, bytes, rows, cols, mime);
  }, []);

  // 데이터 입력 유형 추적
  const trackDataInputType = useCallback((
    inputType: 'sample' | 'upload' | 'manual',
    filename?: string,
    dataRows?: number,
    dataCols?: number
  ) => {
    trackingSDK.trackDataInputType(inputType, filename, dataRows, dataCols);
  }, []);

  // 차트 커스터마이징 추적
  const trackCustomization = useCallback((
    changedKeys: string[], 
    previewTime: number
  ) => {
    trackingSDK.trackCustomization(changedKeys, previewTime);
  }, []);

  // 다운로드 추적
  const trackDownload = useCallback((
    format: string, 
    chartType?: string
  ) => {
    trackingSDK.trackDownload(format, chartType);
  }, []);

  // 오류 추적
  const trackError = useCallback((
    message: string, 
    context?: Record<string, any>
  ) => {
    trackingSDK.trackError(message, context);
  }, []);

  // 갤러리 예시 차트 조회 추적
  const trackGalleryView = useCallback((
    chartType: string,
    library: string,
    renderMs: number,
    dataRows: number,
    dataCols: number,
    success: boolean = true
  ) => {
    trackingSDK.trackGalleryView(chartType, library, renderMs, dataRows, dataCols, success);
  }, []);

  // 커스텀 이벤트 추적
  const trackEvent = useCallback((
    category: 'page' | 'upload' | 'chart' | 'gallery' | 'customize' | 'download' | 'error' | 'satisfaction',
    name: string,
    payload?: Record<string, any>,
    success?: boolean,
    duration?: number
  ) => {
    trackingSDK.track({
      category,
      name,
      payload,
      success,
      duration_ms: duration
    });
  }, []);

  // 만족도 평가 추적
  const trackSatisfactionRating = useCallback((rating: any) => {
    trackingSDK.track({
      category: 'satisfaction',
      name: 'rating_submitted',
      payload: {
        chart_id: rating.chartId,
        chart_type: rating.chartType,
        is_customized: rating.isCustomized,
        recommendation: rating.recommendation,
        star_rating: rating.starRating,
        timestamp: rating.timestamp,
        category: rating.category || 'visualization'
      }
    });
  }, []);

  return {
    startRenderTimer,
    endRenderTimer,
    trackFileUpload,
    trackDataInputType,
    trackCustomization,
    trackDownload,
    trackError,
    trackGalleryView,
    trackEvent,
    trackSatisfactionRating,
    trackCurrentPageDwellTime: trackingSDK.trackCurrentPageDwellTime,
    startPeriodicDwellTimeTracking: trackingSDK.startPeriodicDwellTimeTracking,
    stopPeriodicDwellTimeTracking: trackingSDK.stopPeriodicDwellTimeTracking,
    getSessionInfo: trackingSDK.getSessionInfo,
    getQueueLength: trackingSDK.getQueueLength
  };
};

/**
 * 차트 렌더링 성능 측정을 위한 훅
 */
export const useRenderTimer = () => {
  const startTime = useRef<number>(0);

  const start = useCallback(() => {
    startTime.current = Date.now();
  }, []);

  const end = useCallback(() => {
    return Date.now() - startTime.current;
  }, []);

  return { start, end };
};

/**
 * 파일 업로드 추적을 위한 훅
 */
export const useFileUploadTracking = () => {
  const trackUpload = useCallback((
    file: File,
    parsedData: any[],
    success: boolean = true
  ) => {
    if (success && parsedData.length > 0) {
      // 객체 배열인 경우 첫 번째 객체의 키 개수를 컬럼 수로 사용
      const columnCount = Array.isArray(parsedData[0]) 
        ? parsedData[0].length 
        : Object.keys(parsedData[0] || {}).length;
      
      // 디버깅을 위한 로그 추가
      console.log('📊 파일 업로드 추적:', {
        filename: file.name,
        fileSize: file.size,
        dataRows: parsedData.length,
        dataCols: columnCount,
        firstRow: parsedData[0],
        fileType: file.type,
        isArray: Array.isArray(parsedData[0])
      });
      
      trackingSDK.trackFileUpload(
        file.name,
        file.size,
        parsedData.length, // 전체 행 수 (헤더 포함)
        columnCount, // 컬럼 수
        file.type
      );
    } else {
      trackingSDK.trackError('파일 업로드 실패', {
        filename: file.name,
        size: file.size,
        type: file.type
      });
    }
  }, []);

  return { trackUpload };
};

/**
 * 차트 커스터마이징 추적을 위한 훅
 */
export const useCustomizationTracking = () => {
  const customizationStartTime = useRef<number>(0);
  const changedKeys = useRef<Set<string>>(new Set());
  const hasTrackedFirstChange = useRef<boolean>(false);

  const startCustomization = useCallback(() => {
    customizationStartTime.current = Date.now();
    changedKeys.current.clear();
    hasTrackedFirstChange.current = false;
  }, []);

  const trackChange = useCallback((key: string) => {
    changedKeys.current.add(key);
    
    // 첫 번째 변경사항이면 즉시 이벤트 전송
    if (!hasTrackedFirstChange.current) {
      const previewTime = Date.now() - customizationStartTime.current;
      const changedKeysArray = Array.from(changedKeys.current);
      
      trackingSDK.trackCustomization(changedKeysArray, previewTime);
      hasTrackedFirstChange.current = true;
    }
  }, []);

  const endCustomization = useCallback(() => {
    // 이미 첫 번째 변경에서 이벤트를 전송했으므로 추가 전송하지 않음
    // 패널을 닫을 때는 단순히 상태만 초기화
    changedKeys.current.clear();
    hasTrackedFirstChange.current = false;
  }, []);

  return {
    startCustomization,
    trackChange,
    endCustomization
  };
};

export default useTracking;

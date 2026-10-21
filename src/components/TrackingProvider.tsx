import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import trackingSDK from '../utils/tracking';

interface TrackingContextType {
  trackPageView: (pagePath: string, referrer?: string) => void;
  trackFileUpload: (filename: string, bytes: number, rows: number, cols: number, mime?: string) => void;
  trackChartRender: (chartType: string, library: string, renderMs: number, dataRows: number, dataCols: number, success?: boolean) => void;
  trackCustomization: (changedKeys: string[], previewTime: number) => void;
  trackDownload: (format: string, chartType?: string) => void;
  trackError: (message: string, context?: Record<string, any>) => void;
  getSessionInfo: () => { sid: string; startTime: number } | null;
  getQueueLength: () => number;
}

const TrackingContext = createContext<TrackingContextType | null>(null);

interface TrackingProviderProps {
  children: ReactNode;
}

/**
 * 트래킹 컨텍스트 프로바이더
 * 앱 전체에서 트래킹 기능을 사용할 수 있도록 하는 컨텍스트
 */
export const TrackingProvider: React.FC<TrackingProviderProps> = ({ children }) => {
  useEffect(() => {
    // 컴포넌트 마운트 시 트래킹 SDK 초기화 확인
    const checkInitialization = () => {
      if (!trackingSDK.getSessionInfo()) {
        console.warn('트래킹 SDK가 초기화되지 않았습니다');
      }
    };

    // 약간의 지연 후 초기화 상태 확인
    const timer = setTimeout(checkInitialization, 1000);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const contextValue: TrackingContextType = {
    trackPageView: (pagePath: string, referrer?: string) => {
      trackingSDK.trackPageView(pagePath, referrer);
    },
    trackFileUpload: (filename: string, bytes: number, rows: number, cols: number, mime?: string) => {
      trackingSDK.trackFileUpload(filename, bytes, rows, cols, mime);
    },
    trackChartRender: (chartType: string, library: string, renderMs: number, dataRows: number, dataCols: number, success: boolean = true) => {
      trackingSDK.trackChartRender(chartType, library, renderMs, dataRows, dataCols, success);
    },
    trackCustomization: (changedKeys: string[], previewTime: number) => {
      trackingSDK.trackCustomization(changedKeys, previewTime);
    },
    trackDownload: (format: string, chartType?: string) => {
      trackingSDK.trackDownload(format, chartType);
    },
    trackError: (message: string, context?: Record<string, any>) => {
      trackingSDK.trackError(message, context);
    },
    getSessionInfo: () => trackingSDK.getSessionInfo(),
    getQueueLength: () => trackingSDK.getQueueLength()
  };

  return (
    <TrackingContext.Provider value={contextValue}>
      {children}
    </TrackingContext.Provider>
  );
};

/**
 * 트래킹 컨텍스트 훅
 * 컴포넌트에서 트래킹 기능을 사용할 수 있도록 하는 훅
 */
export const useTrackingContext = (): TrackingContextType => {
  const context = useContext(TrackingContext);
  
  if (!context) {
    throw new Error('useTrackingContext는 TrackingProvider 내에서 사용되어야 합니다');
  }
  
  return context;
};

export default TrackingProvider;

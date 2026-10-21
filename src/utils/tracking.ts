/**
 * 데이터 시각화 도구 트래킹 SDK
 * IP 기반 사용자 행동 추적 및 이벤트 수집
 */

import { getApiServerConfig } from './apiConfig';

export interface TrackingEvent {
  category: 'page' | 'upload' | 'chart' | 'gallery' | 'customize' | 'download' | 'error' | 'satisfaction';
  name: string;
  page_path?: string;
  referrer?: string;
  duration_ms?: number;
  success?: boolean;
  payload?: Record<string, any>;
  client_time: string;
}

export interface TrackingConfig {
  apiBaseUrl: string;
  batchSize: number;
  flushInterval: number;
  enableDebug: boolean;
}

export interface SessionInfo {
  sid: string;
  startTime: number;
}

class TrackingSDK {
  private config: TrackingConfig;
  private sessionInfo: SessionInfo | null = null;
  private eventQueue: TrackingEvent[] = [];
  private flushTimer: number | null = null;
  private isInitialized = false;
  private pageStartTime: number = 0;
  private currentPagePath: string = '';
  private dwellTimeInterval: number | null = null;
  private sessionWarningShown = false; // 세션 경고 메시지 중복 방지

  constructor(config: Partial<TrackingConfig> = {}) {
    // 중앙 집중식 API 서버 설정 사용
    const { apiUrl: defaultApiUrl } = getApiServerConfig();
    
    // 환경변수가 있으면 사용, 없으면 중앙 집중식 설정 사용
    const finalApiUrl = config.apiBaseUrl || (import.meta as any).env?.VITE_TRACKING_API_URL || defaultApiUrl;
    
    this.config = {
      apiBaseUrl: finalApiUrl,
      batchSize: config.batchSize || 20,
      flushInterval: config.flushInterval || 10000, // 10초
      enableDebug: config.enableDebug ?? false
    };

    this.debug('🔍 [TrackingSDK] 초기화 시작:', {
      ...this.config,
      configApiUrl: config.apiBaseUrl,
      envApiUrl: (import.meta as any).env?.VITE_TRACKING_API_URL,
      defaultApiUrl: defaultApiUrl,
      finalApiUrl: this.config.apiBaseUrl
    });
    this.initialize();
  }

  /**
   * SDK 초기화
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // 기존 세션 ID 확인
      const existingSid = localStorage.getItem('tracking_sid');
      
      // 잘못된 형식의 세션 ID가 있으면 제거
      if (existingSid && !this.isValidUUID(existingSid)) {
        localStorage.removeItem('tracking_sid');
        this.debug('잘못된 세션 ID 제거:', existingSid);
      }
      
      const validSid = localStorage.getItem('tracking_sid');
      if (validSid) {
        // 기존 세션 유효성 검증
        const isValid = await this.validateSession(validSid);
        if (isValid) {
          this.sessionInfo = {
            sid: validSid,
            startTime: Date.now()
          };
          // 기존 세션 복원 시 경고 플래그 리셋
          this.sessionWarningShown = false;
          this.debug('기존 세션 복원:', validSid);
        } else {
          this.debug('기존 세션이 유효하지 않음, 새 세션 시작:', validSid);
          localStorage.removeItem('tracking_sid');
          await this.startSession();
        }
      } else {
        // 새 세션 시작
        await this.startSession();
      }

      // 이벤트 큐 초기화
      this.startFlushTimer();
      
      // 페이지 언로드 시 플러시
      this.setupUnloadHandlers();

      // 첫 페이지 시작 시간 설정
      this.pageStartTime = Date.now();
      this.currentPagePath = window.location.pathname;

      // 주기적 체류시간 추적 시작
      this.startPeriodicDwellTimeTracking();

      this.isInitialized = true;
      this.debug('트래킹 SDK 초기화 완료');
    } catch (error) {
      console.error('트래킹 SDK 초기화 실패:', error);
    }
  }

  /**
   * 세션 유효성 검증
   */
  private async validateSession(sessionId: string): Promise<boolean> {
    try {
      this.debug('🔍 [TrackingSDK] 세션 유효성 검증:', sessionId);
      
      const response = await fetch(`${this.config.apiBaseUrl}/session/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sid: sessionId
        })
      });

      this.debug('📡 [TrackingSDK] 세션 유효성 검증 응답:', response.status, response.statusText);

      if (!response.ok) {
        this.debug('❌ [TrackingSDK] 세션 유효성 검증 실패:', response.status);
        return false;
      }

      const data = await response.json();
      this.debug('✅ [TrackingSDK] 세션 유효성 검증 성공:', data);
      
      return data.valid === true;
    } catch (error) {
      console.error('❌ [TrackingSDK] 세션 유효성 검증 오류:', error);
      return false;
    }
  }

  /**
   * 새 세션 시작
   */
  private async startSession(): Promise<void> {
    try {
      const requestData = {
        ip_hmac: '', // IP 해시는 서버에서 처리
        ua: navigator.userAgent,
        client_time: new Date().toISOString(),
        screen_resolution: `${screen.width}x${screen.height}`
      };
      
      this.debug('🚀 [TrackingSDK] 세션 시작 요청:', `${this.config.apiBaseUrl}/session/start`);
      this.debug('📤 [TrackingSDK] 요청 데이터:', {
        ...requestData,
        ua_length: requestData.ua.length,
        client_time_type: typeof requestData.client_time,
        client_time_value: requestData.client_time
      });
      
      const response = await fetch(`${this.config.apiBaseUrl}/session/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      this.debug('📡 [TrackingSDK] 세션 시작 응답:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [TrackingSDK] 세션 시작 실패:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
          url: `${this.config.apiBaseUrl}/session/start`,
          headers: Object.fromEntries(response.headers.entries())
        });
        throw new Error(`세션 시작 실패: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      this.debug('✅ [TrackingSDK] 세션 시작 성공:', data);
      
      this.sessionInfo = {
        sid: data.sid,
        startTime: Date.now()
      };

      // 세션 초기화 완료 시 경고 플래그 리셋
      this.sessionWarningShown = false;

      // 세션 ID 저장
      localStorage.setItem('tracking_sid', data.sid);
      this.debug('새 세션 시작:', data.sid);
    } catch (error) {
      console.error('❌ [TrackingSDK] 세션 시작 실패:', error);
      // 세션 시작 실패 시 fallback 세션 ID 생성
      this.createFallbackSession();
    }
  }

  /**
   * Fallback 세션 생성 (세션 시작 실패 시)
   */
  private createFallbackSession(): void {
    const fallbackSid = this.generateFallbackSessionId();
    this.sessionInfo = {
      sid: fallbackSid,
      startTime: Date.now()
    };
    localStorage.setItem('tracking_sid', fallbackSid);
    this.debug('Fallback 세션 생성:', fallbackSid);
  }

  /**
   * UUID 유효성 검사
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Fallback 세션 ID 생성 (UUID v4 형식)
   */
  private generateFallbackSessionId(): string {
    if (typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
    bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
    const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  /**
   * 이벤트 추적
   */
  public track(event: Omit<TrackingEvent, 'client_time'>): void {
    if (!this.sessionInfo) {
      if (!this.sessionWarningShown) {
        console.warn('⚠️ [TrackingSDK] 세션이 초기화되지 않았습니다');
        this.sessionWarningShown = true;
      }
      return;
    }

    const trackingEvent: TrackingEvent = {
      ...event,
      client_time: new Date().toISOString()
    };

    this.eventQueue.push(trackingEvent);
    this.debug('📝 [TrackingSDK] 이벤트 추가:', {
      event: trackingEvent,
      queueSize: this.eventQueue.length
    });
    this.debug('이벤트 추가:', trackingEvent);

    // 배치 크기 초과 시 즉시 전송
    if (this.eventQueue.length >= this.config.batchSize) {
      this.debug('🚀 [TrackingSDK] 배치 크기 도달, 즉시 전송:', this.eventQueue.length);
      this.flush();
    }
  }

  /**
   * 페이지 뷰 이벤트 (체류 시간 포함)
   */
  public trackPageView(pagePath: string, referrer?: string): void {
    const now = Date.now();
    
    // 이전 페이지의 체류 시간 계산 및 전송
    if (this.currentPagePath && this.pageStartTime > 0) {
      const duration = now - this.pageStartTime;
      this.debug(`🕐 [TrackingSDK] 페이지 체류시간 계산: ${this.currentPagePath} -> ${duration}ms`);
      this.track({
        category: 'page',
        name: 'page_view',
        page_path: this.currentPagePath,
        referrer: referrer || document.referrer,
        duration_ms: duration,
        success: true
      });
    } else {
      this.debug(`🕐 [TrackingSDK] 첫 페이지 또는 체류시간 없음: ${pagePath}`);
    }
    
    // 새 페이지 시작 시간 기록
    this.pageStartTime = now;
    this.currentPagePath = pagePath;
    
    // 새 페이지 뷰 이벤트 (체류 시간 없음, 현재 페이지의 시작을 알림)
    this.track({
      category: 'page',
      name: 'page_view',
      page_path: pagePath,
      referrer: referrer || document.referrer,
      success: true
    });
  }

  /**
   * 페이지 체류시간을 주기적으로 기록 (10초마다)
   */
  public startPeriodicDwellTimeTracking(): void {
    if (this.dwellTimeInterval) {
      clearInterval(this.dwellTimeInterval);
    }
    
    this.dwellTimeInterval = window.setInterval(() => {
      if (this.currentPagePath && this.pageStartTime > 0) {
        const duration = Date.now() - this.pageStartTime;
        // 최소 5초 이상 체류한 경우만 기록
        if (duration >= 5000) {
          this.debug(`🕐 [TrackingSDK] 주기적 체류시간 기록: ${this.currentPagePath} -> ${duration}ms (${Math.round(duration/1000)}초)`);
          this.track({
            category: 'page',
            name: 'page_dwell_time',
            page_path: this.currentPagePath,
            referrer: document.referrer,
            duration_ms: duration,
            success: true
          });
          // 체류시간 기록 후 시작 시간 리셋
          this.pageStartTime = Date.now();
        } else {
          this.debug(`🕐 [TrackingSDK] 체류시간이 너무 짧음: ${this.currentPagePath} -> ${duration}ms (${Math.round(duration/1000)}초)`);
        }
      }
    }, 30000); // 30초마다
  }

  /**
   * 주기적 체류시간 추적 중지
   */
  public stopPeriodicDwellTimeTracking(): void {
    if (this.dwellTimeInterval) {
      clearInterval(this.dwellTimeInterval);
      this.dwellTimeInterval = null;
    }
  }

  /**
   * 현재 페이지의 체류 시간을 즉시 기록 (테스트용)
   */
  public trackCurrentPageDwellTime(): void {
    if (this.currentPagePath && this.pageStartTime > 0) {
      const duration = Date.now() - this.pageStartTime;
      this.debug(`🕐 [TrackingSDK] 현재 페이지 체류시간 기록: ${this.currentPagePath} -> ${duration}ms`);
      this.track({
        category: 'page',
        name: 'page_view',
        page_path: this.currentPagePath,
        referrer: document.referrer,
        duration_ms: duration,
        success: true
      });
    }
  }

  /**
   * 파일 업로드 이벤트
   */
  public trackFileUpload(filename: string, bytes: number, rows: number, cols: number, mime?: string): void {
    this.track({
      category: 'upload',
      name: 'file_uploaded',
      success: true,
      payload: {
        filename,
        bytes,
        rows,
        cols,
        mime
      }
    });
  }

  /**
   * 브라우저 해상도 수집
   */
  public trackBrowserResolution(width: number, height: number): void {
    this.track({
      category: 'page',
      name: 'browser_resolution',
      success: true,
      payload: {
        width,
        height,
        resolution: `${width}x${height}`
      }
    });
  }

  /**
   * 데이터 입력 유형 추적
   */
  public trackDataInputType(inputType: 'sample' | 'upload' | 'manual', filename?: string, dataRows?: number, dataCols?: number): void {
    this.track({
      category: 'upload',
      name: 'data_input_type',
      success: true,
      payload: {
        input_type: inputType,
        filename,
        data_rows: dataRows,
        data_cols: dataCols
      }
    });
  }

  /**
   * 차트 렌더링 이벤트 (실제 사용자 생성)
   */
  public trackChartRender(chartType: string, library: string, renderMs: number, dataRows: number, dataCols: number, success: boolean = true): void {
    this.track({
      category: 'chart',
      name: 'chart_rendered',
      duration_ms: renderMs,
      success,
      payload: {
        chart_type: chartType,
        library,
        data_rows: dataRows,
        data_cols: dataCols,
        source: 'user_created'
      }
    });
  }

  /**
   * 갤러리 예시 차트 조회 이벤트
   */
  public trackGalleryView(chartType: string, library: string, renderMs: number, dataRows: number, dataCols: number, success: boolean = true): void {
    this.track({
      category: 'gallery',
      name: 'gallery_chart_viewed',
      duration_ms: renderMs,
      success,
      payload: {
        chart_type: chartType,
        library,
        data_rows: dataRows,
        data_cols: dataCols,
        source: 'gallery_example'
      }
    });
  }

  /**
   * 차트 커스터마이징 이벤트
   */
  public trackCustomization(changedKeys: string[], previewTime: number): void {
    this.track({
      category: 'customize',
      name: 'customize_changed',
      duration_ms: previewTime,
      success: true,
      payload: {
        changed_keys: changedKeys,
        change_count: changedKeys.length
      }
    });
  }

  /**
   * 다운로드 이벤트
   */
  public trackDownload(format: string, chartType?: string): void {
    this.track({
      category: 'download',
      name: 'download_clicked',
      success: true,
      payload: {
        format,
        chart_type: chartType
      }
    });
  }

  /**
   * 오류 이벤트
   */
  public trackError(message: string, context?: Record<string, any>): void {
    this.track({
      category: 'error',
      name: 'error_raised',
      success: false,
      payload: {
        message: message.substring(0, 200), // 메시지 길이 제한
        context
      }
    });
  }

  /**
   * 플러시 타이머 시작
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = window.setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.flush();
      }
    }, this.config.flushInterval);
  }

  /**
   * 이벤트 큐 플러시
   */
  private async flush(): Promise<void> {
    if (!this.sessionInfo || this.eventQueue.length === 0) {
      this.debug('⏭️ [TrackingSDK] 플러시 스킵 - 세션 없음 또는 큐 비어있음');
      return;
    }

    // 배치 크기 제한 (200개)
    const batchSize = 200;
    const eventsToSend = this.eventQueue.splice(0, batchSize);

    this.debug('📤 [TrackingSDK] 이벤트 전송 시작:', {
      sessionId: this.sessionInfo.sid,
      eventCount: eventsToSend.length,
      remainingInQueue: this.eventQueue.length
    });

    await this.sendEventsWithRetry(eventsToSend, 3);
  }

  private async sendEventsWithRetry(events: any[], maxRetries: number): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(`${this.config.apiBaseUrl}/collect`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sid: this.sessionInfo?.sid,
            events: events
          })
        });

        this.debug('📡 [TrackingSDK] 이벤트 전송 응답:', response.status, response.statusText);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ [TrackingSDK] 이벤트 전송 실패 (시도 ${attempt}/${maxRetries}):`, {
            status: response.status,
            statusText: response.statusText,
            errorText,
            url: `${this.config.apiBaseUrl}/collect`,
            sessionId: this.sessionInfo?.sid,
            eventCount: events.length
          });

          // 400 에러는 재시도하지 않음 (잘못된 데이터)
          if (response.status === 400) {
            console.error('❌ [TrackingSDK] 데이터 검증 실패로 재시도 중단');
            return;
          }

          // 마지막 시도가 아니면 잠시 대기 후 재시도
          if (attempt < maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // 지수 백오프, 최대 5초
            this.debug(`⏳ [TrackingSDK] ${delay}ms 후 재시도...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }

          throw new Error(`이벤트 전송 실패: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        this.debug('✅ [TrackingSDK] 이벤트 전송 성공:', result);
        this.debug('이벤트 전송 완료:', events.length);
        return; // 성공 시 함수 종료

      } catch (error) {
        console.error(`❌ [TrackingSDK] 이벤트 전송 실패 (시도 ${attempt}/${maxRetries}):`, error);
        
        // 마지막 시도가 아니면 재시도
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          this.debug(`⏳ [TrackingSDK] ${delay}ms 후 재시도...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // 모든 재시도 실패 시 큐에 다시 추가 (최대 500개)
        if (this.eventQueue.length < 500) {
          this.eventQueue.unshift(...events);
          this.debug(`🔄 [TrackingSDK] ${events.length}개 이벤트를 큐에 다시 추가 (총 ${this.eventQueue.length}개)`);
        } else {
          console.error('❌ [TrackingSDK] 큐가 가득 차서 이벤트를 버림:', events.length);
        }
      }
    }
  }

  /**
   * 페이지 언로드 핸들러 설정
   */
  private setupUnloadHandlers(): void {
    // beforeunload 이벤트 - 마지막 페이지 체류 시간 기록
    window.addEventListener('beforeunload', () => {
      if (this.currentPagePath && this.pageStartTime > 0) {
        const duration = Date.now() - this.pageStartTime;
        this.track({
          category: 'page',
          name: 'page_view',
          page_path: this.currentPagePath,
          referrer: document.referrer,
          duration_ms: duration,
          success: true
        });
      }
      this.flush();
    });

    // visibilitychange 이벤트 (탭 전환 시)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush();
      }
    });

    // sendBeacon 사용 (지원하는 경우)
    if (navigator.sendBeacon) {
      window.addEventListener('beforeunload', () => {
        if (this.eventQueue.length > 0 && this.sessionInfo) {
          const data = JSON.stringify({
            sid: this.sessionInfo.sid,
            events: this.eventQueue
          });
          
          navigator.sendBeacon(
            `${this.config.apiBaseUrl}/collect`,
            new Blob([data], { type: 'application/json' })
          );
        }
      });
    }
  }

  /**
   * 디버그 로그
   */
  private debug(message: string, ...data: unknown[]): void {
    if (this.config.enableDebug) {
      console.log(`[TrackingSDK] ${message}`, ...data);
    }
  }

  /**
   * SDK 정리
   */
  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    this.flush();
    this.isInitialized = false;
  }

  /**
   * 현재 세션 정보 조회
   */
  public getSessionInfo(): SessionInfo | null {
    return this.sessionInfo;
  }

  /**
   * 대기 중인 이벤트 수 조회
   */
  public getQueueLength(): number {
    return this.eventQueue.length;
  }
}

// 싱글톤 인스턴스 생성 - constructor에서 동적 URL 설정
export const trackingSDK = new TrackingSDK({
  enableDebug: (import.meta as any).env?.DEV
});

// 전역 오류 핸들러 등록
window.addEventListener('error', (event) => {
  trackingSDK.trackError(event.error?.message || 'Unknown error', {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

window.addEventListener('unhandledrejection', (event) => {
  trackingSDK.trackError(event.reason?.message || 'Unhandled promise rejection', {
    reason: event.reason
  });
});

export default trackingSDK;

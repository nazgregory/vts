import { PrismaClient } from '@prisma/client';
import { trackingLogger } from '../utils/logger.js';
import { calculateTimeOffset, normalizeTime } from '../utils/security.js';
import type { CollectRequest } from '../types/index.js';

export class EventService {
  constructor(private prisma: PrismaClient) {}

  /**
   * 이벤트 배치 수집 처리
   * @param request 수집 요청
   * @returns 처리된 이벤트 수
   */
  async collectEvents(request: CollectRequest): Promise<number> {
    const { sid, events } = request;
    
    try {
      // 세션 유효성 검증
      const session = await this.prisma.session.findUnique({
        where: { id: sid }
      });

      if (!session) {
        throw new Error('유효하지 않은 세션 ID입니다');
      }

      // 서버 시간 기준으로 시간 정규화
      const serverTime = new Date();
      const timeOffset = events.length > 0 ? 
        calculateTimeOffset(events[0]?.client_time || '0', serverTime) : 0;

      // 이벤트 데이터 준비
      const eventData = events.map(event => ({
        sessionId: sid,
        occurredAt: normalizeTime(event.client_time, timeOffset),
        category: event.category,
        name: event.name,
        pagePath: event.page_path || null,
        referrer: event.referrer || null,
        durationMs: event.duration_ms || null,
        success: event.success || null,
        payload: event.payload
      }));

      // 배치 삽입
      const result = await this.prisma.event.createMany({
        data: eventData,
        skipDuplicates: true
      });

      // 세션의 lastSeenAt 업데이트
      await this.prisma.session.update({
        where: { id: sid },
        data: { lastSeenAt: new Date() }
      });

      trackingLogger.info({ 
        sessionId: sid, 
        eventCount: result.count,
        timeOffset 
      }, '이벤트 배치 수집 완료');

      return result.count;
    } catch (error) {
      trackingLogger.error({ 
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        sessionId: sid,
        eventCount: events.length 
      }, '이벤트 수집 실패');
      throw error;
    }
  }

  /**
   * 파일 메타데이터 저장
   * @param sessionId 세션 ID
   * @param fileData 파일 메타데이터
   */
  async saveFileMetadata(sessionId: string, fileData: {
    filename?: string;
    bytes?: number;
    rows?: number;
    cols?: number;
    mime?: string;
  }) {
    try {
      await this.prisma.file.create({
        data: {
          sessionId,
          ...fileData
        }
      });

      trackingLogger.info({ 
        sessionId, 
        filename: fileData.filename,
        rows: fileData.rows,
        cols: fileData.cols 
      }, '파일 메타데이터 저장됨');
    } catch (error) {
      trackingLogger.error({ 
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        sessionId 
      }, '파일 메타데이터 저장 실패');
    }
  }

  /**
   * 차트 메타데이터 저장
   * @param sessionId 세션 ID
   * @param chartData 차트 메타데이터
   */
  async saveChartMetadata(sessionId: string, chartData: {
    chartType: string;
    library?: string;
    renderMs?: number;
    settings?: any;
    success?: boolean;
  }) {
    try {
      await this.prisma.chart.create({
        data: {
          sessionId,
          ...chartData
        }
      });

      trackingLogger.info({ 
        sessionId, 
        chartType: chartData.chartType,
        library: chartData.library,
        renderMs: chartData.renderMs 
      }, '차트 메타데이터 저장됨');
    } catch (error) {
      trackingLogger.error({ 
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        sessionId 
      }, '차트 메타데이터 저장 실패');
    }
  }

  /**
   * 다운로드 이벤트 저장
   * @param sessionId 세션 ID
   * @param chartId 차트 ID (선택사항)
   * @param format 다운로드 형식
   */
  async saveDownloadEvent(sessionId: string, chartId?: string, format?: string) {
    try {
      await this.prisma.download.create({
        data: {
          sessionId,
          chartId: chartId || null,
          format: format || null
        }
      });

      trackingLogger.info({ 
        sessionId, 
        chartId,
        format 
      }, '다운로드 이벤트 저장됨');
    } catch (error) {
      trackingLogger.error({ 
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        sessionId 
      }, '다운로드 이벤트 저장 실패');
    }
  }

  /**
   * 오류 이벤트 저장
   * @param sessionId 세션 ID
   * @param errorData 오류 정보
   */
  async saveErrorEvent(sessionId: string, errorData: {
    message?: string;
    stack?: string;
    context?: any;
  }) {
    try {
      await this.prisma.error.create({
        data: {
          sessionId,
          ...errorData
        }
      });

      trackingLogger.error({ 
        sessionId, 
        message: errorData.message 
      }, '오류 이벤트 저장됨');
    } catch (error) {
      trackingLogger.error({ 
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        sessionId 
      }, '오류 이벤트 저장 실패');
    }
  }
}

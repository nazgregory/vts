import { PrismaClient } from '@prisma/client';
import { hashIP, extractNetworkBucket, estimateGeoLocation, isBotUserAgent } from '../utils/security.js';
import { trackingLogger } from '../utils/logger.js';
import type { SessionStartRequest, SessionStartResponse } from '../types/index.js';

export class SessionService {
  constructor(private prisma: PrismaClient) {}

  /**
   * 세션 시작 처리
   * @param request 세션 시작 요청
   * @param clientIP 클라이언트 IP 주소
   * @returns 세션 ID
   */
  async startSession(request: SessionStartRequest, clientIP: string): Promise<SessionStartResponse> {
    const ipSalt = process.env['IP_SALT'];
    if (!ipSalt) {
      throw new Error('IP_SALT 환경변수가 설정되지 않았습니다');
    }

    // 봇 필터링
    if (isBotUserAgent(request.ua)) {
      trackingLogger.warn({ ip: clientIP, ua: request.ua }, '봇 사용자 감지됨');
      throw new Error('봇 사용자는 접근할 수 없습니다');
    }

    // IP 해시 생성
    const ipHash = hashIP(clientIP, ipSalt);
    const networkBucket = extractNetworkBucket(clientIP);
    const approxGeo = estimateGeoLocation(clientIP);

    try {
      // 기존 세션 확인 (최근 24시간 내)
      const existingSession = await this.prisma.session.findFirst({
        where: {
          ipHash,
          lastSeenAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24시간 전
          }
        },
        orderBy: {
          lastSeenAt: 'desc'
        }
      });

      if (existingSession) {
        // 기존 세션 업데이트
        const updatedSession = await this.prisma.session.update({
          where: { id: existingSession.id },
          data: {
            lastSeenAt: new Date(),
            userAgent: request.ua,
            networkBucket,
            approxGeo,
            attrs: request.screen_resolution ? {
              screenResolution: request.screen_resolution
            } : undefined as any
          }
        });

        trackingLogger.info({ 
          sessionId: updatedSession.id, 
          ipHash, 
          networkBucket 
        }, '기존 세션 업데이트됨');

        return { sid: updatedSession.id };
      }

      // 새 세션 생성
      const newSession = await this.prisma.session.create({
        data: {
          ipHash,
          userAgent: request.ua,
          networkBucket,
          approxGeo,
          firstSeenAt: new Date(),
          lastSeenAt: new Date(),
          attrs: request.screen_resolution ? {
            screenResolution: request.screen_resolution
          } : undefined as any
        }
      });

      trackingLogger.info({ 
        sessionId: newSession.id, 
        ipHash, 
        networkBucket 
      }, '새 세션 생성됨');

      return { sid: newSession.id };
    } catch (error) {
      trackingLogger.error({ 
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        ipHash,
        networkBucket 
      }, '세션 생성/업데이트 실패');
      throw error;
    }
  }

  /**
   * 세션 유효성 검증
   * @param sessionId 세션 ID
   * @returns 세션 존재 여부
   */
  async validateSession(sessionId: string): Promise<boolean> {
    try {
      const session = await this.prisma.session.findUnique({
        where: { id: sessionId }
      });

      if (!session) {
        return false;
      }

      // 세션이 너무 오래된 경우 (30일)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      if (session.firstSeenAt < thirtyDaysAgo) {
        trackingLogger.warn({ sessionId }, '만료된 세션 접근 시도');
        return false;
      }

      return true;
    } catch (error) {
      trackingLogger.error({ 
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        sessionId 
      }, '세션 검증 실패');
      return false;
    }
  }

  /**
   * 세션 정보 조회
   * @param sessionId 세션 ID
   * @returns 세션 정보
   */
  async getSession(sessionId: string) {
    try {
      return await this.prisma.session.findUnique({
        where: { id: sessionId },
        include: {
          events: {
            orderBy: { occurredAt: 'desc' },
            take: 10
          }
        }
      });
    } catch (error) {
      trackingLogger.error({ 
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        sessionId 
      }, '세션 조회 실패');
      throw error;
    }
  }
}

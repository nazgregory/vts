import { Router } from 'express';
import { SessionService } from '../services/sessionService.js';
import { SessionStartSchema } from '../types/index.js';
import { trackingLogger } from '../utils/logger.js';
import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';

export function createSessionRouter(sessionService: SessionService) {
  const router = Router();

  /**
   * POST /api/session/start
   * 세션 시작 처리
   */
  router.post('/start', async (req: Request, res: Response) => {
    try {
      console.log('🚀 [Backend] 세션 시작 요청 받음:', {
        body: req.body,
        headers: req.headers,
        ip: req.ip,
        clientIP: (req as any).clientIP
      });
      
      // 클라이언트 IP 추출
      const clientIP = (req as any).clientIP || req.ip || 
        req.connection.remoteAddress || 
        req.socket.remoteAddress || 
        (req.connection as any)?.socket?.remoteAddress ||
        '127.0.0.1';

      console.log('🌐 [Backend] 클라이언트 IP 정보:', {
        clientIP,
        reqIP: req.ip,
        remoteAddress: req.connection.remoteAddress,
        socketRemoteAddress: req.socket.remoteAddress,
        forwardedFor: req.headers['x-forwarded-for'],
        realIP: req.headers['x-real-ip']
      });

      // 요청 데이터 검증
      console.log('🔍 [Backend] 요청 데이터 검증 전:', {
        body: req.body,
        bodyType: typeof req.body,
        bodyKeys: Object.keys(req.body || {}),
        contentType: req.headers['content-type']
      });
      
      const validatedData = SessionStartSchema.parse(req.body);
      console.log('✅ [Backend] 세션 시작 데이터 검증 성공:', validatedData);

      // 세션 시작 처리
      console.log('🔄 [Backend] 세션 시작 처리 중...');
      
      // 데이터베이스 연결 확인
      if (!process.env['DATABASE_URL']) {
        console.warn('⚠️ [Backend] DATABASE_URL이 설정되지 않음, 임시 세션 ID 생성');
        const tempSessionId = randomUUID();
        return res.json({ sid: tempSessionId });
      }
      
      const result = await sessionService.startSession(validatedData, clientIP);
      console.log('✅ [Backend] 세션 시작 성공:', result);

      trackingLogger.info({ 
        sessionId: result.sid, 
        clientIP: clientIP.substring(0, 8) + '...' // IP 일부만 로깅
      }, '세션 시작 성공');

      return res.json(result);
    } catch (error) {
      console.error('❌ [Backend] 세션 시작 실패:', error);
      trackingLogger.error({ 
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        clientIP: ((req as any).clientIP || req.ip)?.substring(0, 8) + '...'
      }, '세션 시작 실패');

      if (error instanceof Error && error.message.includes('봇 사용자')) {
        return res.status(403).json({ 
          error: '봇 사용자는 접근할 수 없습니다' 
        });
      }

      if (error instanceof Error && error.message.includes('IP_SALT')) {
        return res.status(500).json({ 
          error: '서버 설정 오류' 
        });
      }

      // 구체적인 오류 메시지 제공
      let errorMessage = '잘못된 요청입니다';
      if (error instanceof Error) {
        if (error.message.includes('유효한 날짜 형식이 아닙니다')) {
          errorMessage = '날짜 형식이 올바르지 않습니다';
        } else if (error.message.includes('Required')) {
          errorMessage = '필수 필드가 누락되었습니다';
        } else if (error.message.includes('Invalid')) {
          errorMessage = '유효하지 않은 데이터입니다';
        } else {
          errorMessage = `검증 오류: ${error.message}`;
        }
      }
      
      return res.status(400).json({ 
        error: errorMessage,
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  });

  /**
   * POST /api/session/validate
   * 세션 유효성 검증
   */
  router.post('/validate', async (req: Request, res: Response) => {
    try {
      console.log('🔍 [Backend] 세션 유효성 검증 요청 받음:', req.body);
      
      const { sid } = req.body;
      
      if (!sid) {
        return res.status(400).json({ 
          error: '세션 ID가 필요합니다',
          valid: false 
        });
      }

      // 세션 유효성 검증
      const isValid = await sessionService.validateSession(sid);
      console.log('✅ [Backend] 세션 유효성 검증 결과:', { sessionId: sid, isValid });

      return res.json({ 
        valid: isValid,
        sessionId: sid 
      });
    } catch (error) {
      console.error('❌ [Backend] 세션 유효성 검증 실패:', error);
      trackingLogger.error({ 
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        sessionId: req.body?.sid 
      }, '세션 유효성 검증 실패');

      return res.status(500).json({ 
        error: '서버 오류가 발생했습니다',
        valid: false 
      });
    }
  });

  return router;
}

import { Router } from 'express';
import { EventService } from '../services/eventService.js';
import { SessionService } from '../services/sessionService.js';
import { CollectRequestSchema } from '../types/index.js';
import { trackingLogger } from '../utils/logger.js';
import type { Request, Response } from 'express';

export function createCollectRouter(eventService: EventService, sessionService: SessionService) {
  const router = Router();

  /**
   * POST /api/collect
   * 이벤트 배치 수집 처리
   */
  router.post('/', async (req: Request, res: Response) => {
    try {
      console.log('📥 [Backend] 이벤트 수집 요청 받음:', {
        sessionId: req.body?.sid,
        eventCount: req.body?.events?.length,
        clientIP: (req as any).clientIP || req.ip,
        origin: req.headers.origin,
        userAgent: req.headers['user-agent']
      });

      // 요청 데이터 검증
      const validatedData = CollectRequestSchema.parse(req.body);
      console.log('✅ [Backend] 요청 데이터 검증 성공:', {
        sessionId: validatedData.sid,
        eventCount: validatedData.events.length
      });

      // 세션 유효성 검증
      const isValidSession = await sessionService.validateSession(validatedData.sid);
      console.log('🔍 [Backend] 세션 유효성 검증:', { sessionId: validatedData.sid, isValid: isValidSession });
      
      if (!isValidSession) {
        console.log('❌ [Backend] 유효하지 않은 세션:', validatedData.sid);
        return res.status(401).json({ error: '유효하지 않은 세션입니다' });
      }

      // 이벤트 수집 처리
      console.log('🔄 [Backend] 이벤트 수집 처리 시작...');
      const processedCount = await eventService.collectEvents(validatedData);
      console.log('✅ [Backend] 이벤트 수집 처리 완료:', { processedCount, requestedCount: validatedData.events.length });

      trackingLogger.info({ 
        sessionId: validatedData.sid, 
        requestedCount: validatedData.events.length,
        processedCount 
      }, '이벤트 수집 완료');

      return res.json({ 
        success: true, 
        processed: processedCount,
        requested: validatedData.events.length
      });
    } catch (error) {
      console.error('❌ [Backend] 이벤트 수집 실패:', error);
      
      // Zod 검증 에러 처리
      if (error instanceof Error && error.name === 'ZodError') {
        console.error('❌ [Backend] 데이터 검증 실패:', error.message);
        trackingLogger.error({ 
          error: error.message,
          sessionId: req.body?.sid,
          eventCount: req.body?.events?.length
        }, '이벤트 데이터 검증 실패');
        
        return res.status(400).json({ 
          error: '데이터 검증 실패',
          details: error.message
        });
      }

      // 세션 관련 에러 처리
      if (error instanceof Error && error.message.includes('유효하지 않은 세션')) {
        return res.status(401).json({ error: '유효하지 않은 세션입니다' });
      }

      // 기타 에러 처리
      trackingLogger.error({ 
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        sessionId: req.body?.sid,
        eventCount: req.body?.events?.length
      }, '이벤트 수집 실패');

      res.status(500).json({ 
        error: '서버 내부 오류가 발생했습니다' 
      });
      return;
    }
  });

  return router;
}

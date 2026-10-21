import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { securityLogger } from '../utils/logger.js';

/**
 * 요청 데이터 검증 미들웨어
 * @param schema Zod 스키마
 * @param target 검증할 대상 ('body', 'query', 'params')
 */
export const validateRequest = (
  schema: z.ZodSchema,
  target: 'body' | 'query' | 'params' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[target];
      const validatedData = schema.parse(data);
      
      // 검증된 데이터를 원본 위치에 다시 할당
      req[target] = validatedData;
      
      next();
      return;
    } catch (error) {
      if (error instanceof z.ZodError) {
        securityLogger.warn({
          error: error.errors,
          target,
          path: req.path,
          method: req.method,
          ip: req.ip
        }, '요청 데이터 검증 실패');

        return res.status(400).json({
          error: '잘못된 요청 데이터입니다',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }

      securityLogger.error({
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        target,
        path: req.path,
        method: req.method,
        ip: req.ip
      }, '요청 데이터 검증 중 오류 발생');

      return res.status(500).json({
        error: '서버 내부 오류가 발생했습니다'
      });
    }
  };
};

/**
 * IP 주소 화이트리스트 검증 미들웨어
 * @param allowedIPs 허용된 IP 주소 목록
 */
export const validateIPWhitelist = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || 'unknown';
    
    if (!allowedIPs.includes(clientIP)) {
      securityLogger.warn({
        clientIP,
        allowedIPs,
        path: req.path,
        method: req.method
      }, '화이트리스트에 없는 IP 접근 시도');

      return res.status(403).json({
        error: '접근이 허용되지 않은 IP 주소입니다'
      });
    }

    next();
    return;
  };
};

/**
 * 요청 크기 제한 미들웨어
 * @param maxSize 최대 크기 (바이트)
 */
export const validateRequestSize = (maxSize: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.get('Content-Length') || '0', 10);
    
    if (contentLength > maxSize) {
      securityLogger.warn({
        contentLength,
        maxSize,
        path: req.path,
        method: req.method,
        ip: req.ip
      }, '요청 크기 초과');

      return res.status(413).json({
        error: '요청 크기가 너무 큽니다',
        maxSize: `${Math.round(maxSize / 1024)}KB`
      });
    }

    next();
    return;
  };
};

/**
 * User Agent 검증 미들웨어
 * @param blockedPatterns 차단할 User Agent 패턴
 */
export const validateUserAgent = (blockedPatterns: RegExp[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userAgent = req.get('User-Agent') || '';
    
    const isBlocked = blockedPatterns.some(pattern => pattern.test(userAgent));
    
    if (isBlocked) {
      securityLogger.warn({
        userAgent,
        path: req.path,
        method: req.method,
        ip: req.ip
      }, '차단된 User Agent 접근 시도');

      return res.status(403).json({
        error: '접근이 차단된 클라이언트입니다'
      });
    }

    next();
    return;
  };
};

/**
 * 요청 빈도 제한 미들웨어 (간단한 구현)
 */
export const validateRequestFrequency = (maxRequests: number, windowMs: number) => {
  const requestCounts = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || 'unknown';
    const now = Date.now();
    
    const clientData = requestCounts.get(clientIP);
    
    if (!clientData || now > clientData.resetTime) {
      // 새로운 윈도우 시작
      requestCounts.set(clientIP, {
        count: 1,
        resetTime: now + windowMs
      });
      next();
      return;
    }

    if (clientData.count >= maxRequests) {
      securityLogger.warn({
        clientIP,
        count: clientData.count,
        maxRequests,
        windowMs,
        path: req.path,
        method: req.method
      }, '요청 빈도 제한 초과');

      return res.status(429).json({
        error: '요청 빈도가 너무 높습니다',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      });
    }

    clientData.count++;
    next();
    return;
  };
};

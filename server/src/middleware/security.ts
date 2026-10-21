import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import compression from 'compression';
import type { CorsOptions } from 'cors';
import { securityLogger } from '../utils/logger.js';

/**
 * IP 기반 속도 제한 미들웨어
 */
export const createRateLimit = (windowMs: number = 15 * 60 * 1000, max: number = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      securityLogger.warn({
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method
      }, '속도 제한 초과');
      
      res.status(429).json({
        error: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.'
      });
    }
  });
};

/**
 * 세션 시작 전용 속도 제한 (내부망 환경에 맞게 완화)
 */
export const sessionRateLimit = createRateLimit(15 * 60 * 1000, 100); // 15분에 100회

/**
 * 이벤트 수집 전용 속도 제한 (내부망 환경에 맞게 완화)
 */
export const collectRateLimit = createRateLimit(1 * 60 * 1000, 200); // 1분에 200회

/**
 * 보안 헤더 설정
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

/**
 * 압축 미들웨어
 */
export const compressionMiddleware = compression({
  filter: (req: Request, res: Response) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024
});

/**
 * ALLOWED_ORIGINS에 적힌 출처만 브라우저 호출을 허용한다.
 * Origin 헤더가 없는 요청(서버 간 호출)은 그대로 통과시킨다.
 */
function readAllowedOrigins(): string[] {
  const configured = process.env['ALLOWED_ORIGINS'] || 'http://localhost:3000';
  return configured
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || readAllowedOrigins().includes(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

/**
 * 요청 로깅 미들웨어
 */
export const requestLogging = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      contentLength: res.get('Content-Length')
    };

    if (res.statusCode >= 400) {
      securityLogger.warn(logData, 'HTTP 요청 오류');
    } else {
      securityLogger.info(logData, 'HTTP 요청');
    }
  });

  next();
};

/**
 * IP 추출 미들웨어 (프록시 환경 대응)
 */
export const ipExtraction = (req: Request, _res: Response, next: NextFunction) => {
  // trust proxy가 loopback일 때만 req.ip가 프록시 헤더를 반영한다.
  const address = req.ip || req.socket.remoteAddress || '127.0.0.1';
  (req as any).clientIP = address.replace(/^::ffff:/, '');
  next();
};

/**
 * 요청 크기 제한
 */
export const requestSizeLimit = (limit: string = '1mb') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.get('Content-Length') || '0', 10);
    const limitBytes = parseSizeLimit(limit);

    if (contentLength > limitBytes) {
      securityLogger.warn({
        ip: req.ip,
        contentLength,
        limit: limitBytes,
        path: req.path
      }, '요청 크기 초과');

      return res.status(413).json({
        error: '요청 크기가 너무 큽니다'
      });
    }

    next();
    return;
  };
};

/**
 * 크기 제한 문자열을 바이트로 변환
 */
function parseSizeLimit(limit: string): number {
  const units: { [key: string]: number } = {
    'b': 1,
    'kb': 1024,
    'mb': 1024 * 1024,
    'gb': 1024 * 1024 * 1024
  };

  const match = limit.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/);
  if (!match) {
    return 1024 * 1024; // 기본 1MB
  }

  const value = parseFloat(match[1] || '0');
  const unit = match[2] || 'b';
  
  return Math.floor(value * (units[unit] || 1));
}

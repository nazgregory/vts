import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// 한국 시간대 설정 (UTC+9)
process.env.TZ = 'Asia/Seoul';

// 서비스 임포트
import { SessionService } from './services/sessionService.js';
import { EventService } from './services/eventService.js';
import { createSessionRouter } from './routes/session.js';
import { createCollectRouter } from './routes/collect.js';
import satisfactionRouter from './routes/satisfaction.js';

// 미들웨어 임포트
import { 
  securityHeaders, 
  compressionMiddleware, 
  corsOptions, 
  requestLogging, 
  ipExtraction,
  sessionRateLimit,
  collectRateLimit
} from './middleware/security.js';

import logger from './utils/logger.js';

// 환경변수 로드
dotenv.config();

// 환경변수 디버깅 (민감한 정보는 마스킹)
const databaseUrl = process.env['DATABASE_URL'];
if (databaseUrl) {
  logger.info({
    hasDatabaseUrl: true
  }, '🔍 [Config] 데이터베이스 설정 확인');
} else {
  logger.error('❌ [Config] DATABASE_URL 환경변수가 설정되지 않았습니다');
}

// Express 앱 생성
const app = express();
const port = parseInt(process.env['PORT'] || '3001', 10);

// Nginx가 같은 서버의 루프백에서 프록시할 때만 X-Forwarded-For를 신뢰한다.
app.set('trust proxy', 'loopback');

// Prisma 클라이언트 초기화
const prisma = new PrismaClient({
  log: process.env['NODE_ENV'] === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  datasources: {
    db: {
      url: process.env['DATABASE_URL'] || ''
    }
  }
});

// 데이터베이스 연결 테스트 및 재시도 로직
async function initializeDatabase(): Promise<boolean> {
  const maxRetries = 3;
  const retryDelay = 1000; // 1초로 단축
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`🔍 [DB Init] 데이터베이스 연결 시도 ${attempt}/${maxRetries}`);
      
      // 간단한 쿼리로 연결 테스트 (타임아웃 설정)
      const result = await Promise.race([
        prisma.$queryRaw`SELECT 1 as test, NOW() as current_time`,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), 5000)
        )
      ]);
      
      logger.info('✅ [DB Init] 데이터베이스 연결 성공', { result });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorType = error instanceof Error ? error.constructor.name : typeof error;
      
      logger.warn({
        attempt,
        maxRetries,
        error: errorMessage,
        errorType
      }, `❌ [DB Init] 데이터베이스 연결 실패 (시도 ${attempt}/${maxRetries})`);
      
      if (attempt === maxRetries) {
        logger.error({ error }, '❌ [DB Init] 최대 재시도 횟수 초과. 서버를 종료합니다.');
        throw error;
      }
      
      // 재시도 전 대기 (지수적 백오프)
      const delay = retryDelay * Math.pow(2, attempt - 1);
      logger.info(`⏳ [DB Init] ${delay}ms 후 재시도...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // 이 코드는 도달하지 않지만 TypeScript를 위해 추가
  return false;
}

// 서비스 초기화
const sessionService = new SessionService(prisma);
const eventService = new EventService(prisma);


// 미들웨어 설정
app.use(securityHeaders);
app.use(compressionMiddleware);
app.use(cors(corsOptions));
app.use(ipExtraction);
app.use(requestLogging);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 기본 라우트
app.get('/', (_req, res) => {
  res.json({
    name: 'Visualization Tracking Server',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// 헬스 체크
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// API 라우트 설정
app.use('/api/session', sessionRateLimit, createSessionRouter(sessionService));
app.use('/api/collect', collectRateLimit, createCollectRouter(eventService, sessionService));
app.use('/api/satisfaction-ratings', satisfactionRouter);

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    error: '요청한 리소스를 찾을 수 없습니다',
    path: req.originalUrl,
    method: req.method
  });
});

// 전역 오류 핸들러
app.use((error: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  }, '서버 오류 발생');

  res.status(500).json({
    error: '서버 내부 오류가 발생했습니다',
    timestamp: new Date().toISOString()
  });
});

// 서버 시작 함수
async function startServer() {
  try {
    // 메모리 사용량 로깅
    const memUsage = process.memoryUsage();
    logger.info({
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
    }, '🔍 [Server] 시작 시 메모리 사용량');
    
    // 데이터베이스 연결 초기화
    await initializeDatabase();
    
    // 서버 시작 - 모든 IP에서 접근 가능하도록 설정
    const server = app.listen(port, '0.0.0.0', () => {
      logger.info({
        port,
        host: '0.0.0.0',
        environment: process.env['NODE_ENV'] || 'development',
        nodeVersion: process.version,
        memory: {
          rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
        }
      }, '서버가 시작되었습니다');
    });
    
    return server;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logger.error({ 
      error: errorMessage,
      stack: errorStack,
      memory: process.memoryUsage()
    }, '❌ [Server] 서버 시작 실패');
    process.exit(1);
  }
}

// 서버 시작
const server = await startServer();

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  logger.info({ signal }, '서버 종료 신호 수신');
  
  server.close(async () => {
    logger.info('HTTP 서버가 종료되었습니다');
    
    try {
      await prisma.$disconnect();
      logger.info('데이터베이스 연결이 종료되었습니다');
      process.exit(0);
    } catch (error) {
      logger.error({ error }, '데이터베이스 연결 종료 중 오류 발생');
      process.exit(1);
    }
  });
};

// 종료 신호 처리
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 처리되지 않은 예외 처리
process.on('uncaughtException', (error) => {
  logger.error({ error }, '처리되지 않은 예외 발생');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, '처리되지 않은 Promise 거부');
  process.exit(1);
});

export default app;

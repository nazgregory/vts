import pino from 'pino';

// 로거 설정 - 한글 로그를 위해 간단한 설정 사용
const logger = pino({
  level: process.env['LOG_LEVEL'] || 'info',
  transport: process.env['NODE_ENV'] === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: false, // 색상 비활성화로 한글 깨짐 방지
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
      messageFormat: '{msg}',
      singleLine: true // 한 줄로 출력하여 가독성 향상
    }
  } : undefined as any,
  formatters: {
    level: (label) => {
      return { level: label };
    }
  },
  timestamp: pino.stdTimeFunctions.isoTime
});

export default logger;

// 특정 목적별 로거
export const trackingLogger = logger.child({ module: 'tracking' });
export const securityLogger = logger.child({ module: 'security' });
export const errorLogger = logger.child({ module: 'error' });

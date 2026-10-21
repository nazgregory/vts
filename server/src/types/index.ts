import { z } from 'zod';

// 세션 시작 요청 스키마
export const SessionStartSchema = z.object({
  ip_hmac: z.string().optional(),
  ua: z.string(),
  client_time: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "유효한 날짜 형식이 아닙니다"
  }),
  screen_resolution: z.string().optional()
});

export type SessionStartRequest = z.infer<typeof SessionStartSchema>;

// 세션 시작 응답 스키마
export const SessionStartResponseSchema = z.object({
  sid: z.string().uuid()
});

export type SessionStartResponse = z.infer<typeof SessionStartResponseSchema>;

// 이벤트 스키마
export const EventSchema = z.object({
  category: z.enum(['page', 'upload', 'chart', 'gallery', 'customize', 'download', 'error', 'satisfaction']),
  name: z.string(),
  page_path: z.string().optional(),
  referrer: z.string().optional(),
  duration_ms: z.number().int().min(0).optional(),
  success: z.boolean().optional(),
  payload: z.record(z.any()).optional().default({}),
  client_time: z.string().datetime()
});

export type Event = z.infer<typeof EventSchema>;

// 배치 수집 요청 스키마
export const CollectRequestSchema = z.object({
  sid: z.string().uuid(),
  events: z.array(EventSchema).min(1).max(200)
});

export type CollectRequest = z.infer<typeof CollectRequestSchema>;

// IP 해시 생성 함수 타입
export type IPHashFunction = (ip: string, salt: string) => string;

// 네트워크 버킷 추출 함수 타입
export type NetworkBucketFunction = (ip: string) => string;

// 지리적 위치 추정 함수 타입
export type GeoLocationFunction = (ip: string) => string;

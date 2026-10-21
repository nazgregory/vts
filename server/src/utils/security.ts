import crypto from 'crypto';
import { IPHashFunction, NetworkBucketFunction, GeoLocationFunction } from '../types/index.js';

/**
 * IP 주소를 해시화하여 개인정보 보호
 * @param ip 원본 IP 주소
 * @param salt 해시 솔트
 * @returns 해시된 IP 주소
 */
export const hashIP: IPHashFunction = (ip: string, salt: string): string => {
  return crypto.createHash('sha256').update(ip + salt).digest('hex');
};

/**
 * IP 주소에서 네트워크 버킷 추출 (예: 10.10.0.0/16)
 * @param ip IP 주소
 * @returns 네트워크 버킷 문자열
 */
export const extractNetworkBucket: NetworkBucketFunction = (ip: string): string => {
  try {
    // IPv4 주소 처리
    if (ip.includes('.')) {
      const parts = ip.split('.');
      if (parts.length === 4) {
        // 내부망 IP 범위 확인
        const firstOctet = parseInt(parts[0] || '0', 10);
        if (firstOctet === 10) {
          return '10.0.0.0/8';
        } else if (firstOctet === 172) {
          const secondOctet = parseInt(parts[1] || '0', 10);
          if (secondOctet >= 16 && secondOctet <= 31) {
            return '172.16.0.0/12';
          }
        } else if (firstOctet === 192 && parseInt(parts[1] || '0', 10) === 168) {
          return '192.168.0.0/16';
        }
        // 공용 IP의 경우 /24 서브넷으로 마스킹
        return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
      }
    }
    
    // IPv6 주소 처리
    if (ip.includes(':')) {
      const parts = ip.split(':');
      if (parts.length >= 4) {
        return `${parts[0]}:${parts[1]}:${parts[2]}:${parts[3]}::/64`;
      }
    }
    
    return 'unknown';
  } catch (error) {
    console.error('네트워크 버킷 추출 실패:', error);
    return 'unknown';
  }
};

/**
 * IP 주소에서 대략적인 지리적 위치 추정
 * @param ip IP 주소
 * @returns 지리적 위치 라벨
 */
export const estimateGeoLocation: GeoLocationFunction = (ip: string): string => {
  try {
    // 내부망 IP 확인
    if (ip.startsWith('127.') || ip.startsWith('192.168.') || 
        ip.startsWith('10.') || ip.startsWith('172.')) {
      return 'intranet';
    }
    
    // IPv6 로컬 주소
    if (ip === '::1' || ip.startsWith('fe80:')) {
      return 'intranet';
    }
    
    // 공용 IP의 경우 기본값
    return 'external';
  } catch (error) {
    console.error('지리적 위치 추정 실패:', error);
    return 'unknown';
  }
};

/**
 * User Agent에서 봇/크롤러 패턴 감지
 * @param userAgent User Agent 문자열
 * @returns 봇 여부
 */
export const isBotUserAgent = (userAgent: string): boolean => {
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /go-http/i,
    /okhttp/i,
    /postman/i,
    /insomnia/i
  ];
  
  return botPatterns.some(pattern => pattern.test(userAgent));
};

/**
 * IP 주소 유효성 검증
 * @param ip IP 주소
 * @returns 유효성 여부
 */
export const isValidIP = (ip: string): boolean => {
  // IPv4 검증
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (ipv4Regex.test(ip)) {
    return true;
  }
  
  // IPv6 검증 (간단한 형태)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  if (ipv6Regex.test(ip)) {
    return true;
  }
  
  // 압축된 IPv6 검증
  const compressedIPv6Regex = /^::1$|^::$|^(?:[0-9a-fA-F]{1,4}:)*::(?:[0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$/;
  if (compressedIPv6Regex.test(ip)) {
    return true;
  }
  
  return false;
};

/**
 * 클라이언트 시간과 서버 시간의 차이 계산
 * @param clientTime 클라이언트 시간 (ISO 문자열)
 * @param serverTime 서버 시간 (Date 객체)
 * @returns 시간 차이 (밀리초)
 */
export const calculateTimeOffset = (clientTime: string, serverTime: Date): number => {
  try {
    const client = new Date(clientTime);
    const server = serverTime;
    return client.getTime() - server.getTime();
  } catch (error) {
    console.error('시간 차이 계산 실패:', error);
    return 0;
  }
};

/**
 * 시간 정규화 (클라이언트 시간을 서버 시간 기준으로 보정)
 * @param clientTime 클라이언트 시간 (ISO 문자열)
 * @param timeOffset 시간 차이 (밀리초)
 * @returns 정규화된 시간
 */
export const normalizeTime = (clientTime: string, timeOffset: number): Date => {
  try {
    const client = new Date(clientTime);
    return new Date(client.getTime() - timeOffset);
  } catch (error) {
    console.error('시간 정규화 실패:', error);
    return new Date();
  }
};

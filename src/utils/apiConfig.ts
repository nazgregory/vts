/**
 * 중앙 집중식 API 서버 설정
 * 모든 API 호출이 이 설정을 사용하도록 통일
 */

export const getApiServerConfig = () => {
  // 환경변수에서 API 서버 설정 가져오기. 미설정 시 로컬 백엔드를 사용한다.
  let host = import.meta.env.VITE_API_SERVER_HOST || 'localhost';
  const port = import.meta.env.VITE_API_SERVER_PORT || '3001';
  const protocol = import.meta.env.VITE_API_PROTOCOL || 'http';

  if (!import.meta.env.VITE_API_SERVER_HOST) {
    console.warn('⚠️ [API Config] VITE_API_SERVER_HOST 환경변수가 설정되지 않았습니다. localhost를 사용합니다.');
  }

  if (host.startsWith('https://')) {
    host = host.replace('https://', '');
  }
  if (host.startsWith('http://')) {
    host = host.replace('http://', '');
  }

  const portSuffix = (protocol === 'https' && port === '443') || (protocol === 'http' && port === '80')
    ? ''
    : `:${port}`;
  
  const baseUrl = `${protocol}://${host}${portSuffix}`;
  const apiUrl = `${protocol}://${host}${portSuffix}/api`;
  
  console.log('🔍 [API Config] Final baseUrl:', baseUrl);
  console.log('🔍 [API Config] Final apiUrl:', apiUrl);
  
  return {
    host,
    port,
    baseUrl,
    apiUrl
  };
};

// 편의를 위한 개별 export
export const { host: API_HOST, port: API_PORT, baseUrl: API_BASE_URL, apiUrl: API_URL } = getApiServerConfig();

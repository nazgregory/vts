/**
 * 환경변수가 설정됐는지만 확인한다.
 * 호스트, 사용자, 비밀번호, 데이터베이스 이름은 출력하지 않는다.
 */

import dotenv from 'dotenv';

// 환경변수 로드
dotenv.config();

console.log('🔍 [Debug] 환경변수 디버깅 시작...');
console.log('🔍 [Debug] NODE_ENV:', process.env['NODE_ENV']);
console.log('🔍 [Debug] PORT:', process.env['PORT']);

const databaseUrl = process.env['DATABASE_URL'];
if (databaseUrl) {
  let passwordSet = false;
  try {
    passwordSet = new URL(databaseUrl).password.length > 0;
  } catch {
    passwordSet = false;
  }
  console.log('🔍 [Debug] DATABASE_URL: 설정됨');
  console.log('🔍 [Debug] 비밀번호:', passwordSet ? '설정됨' : '설정되지 않음');
} else {
  console.error('❌ [Debug] DATABASE_URL이 설정되지 않았습니다');
}

// 기타 환경변수 확인
console.log('🔍 [Debug] IP_SALT:', process.env['IP_SALT'] ? '설정됨' : '설정되지 않음');
console.log('🔍 [Debug] BATCH_MAX:', process.env['BATCH_MAX']);
console.log('🔍 [Debug] LOG_LEVEL:', process.env['LOG_LEVEL']);

console.log('🔍 [Debug] 환경변수 디버깅 완료');

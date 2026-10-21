/**
 * PM2 설정. 비밀은 이 파일에 넣지 않는다.
 * 백엔드는 server/.env 를 읽으므로 cwd 를 server 로 둔다.
 *
 * 사용:
 *   cd <프로젝트 루트>
 *   pm2 start deploy/pm2.config.cjs
 */
const path = require('path');

module.exports = {
  apps: [
    {
      name: 'visualization-backend',
      cwd: path.join(__dirname, '..', 'server'),
      script: 'dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
};

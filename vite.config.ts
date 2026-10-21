import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// 중앙 집중식 API 서버 설정
const API_HOST = process.env.VITE_API_SERVER_HOST || 'localhost';
const API_PORT = process.env.VITE_API_SERVER_PORT || '3001';

export default defineConfig({
  plugins: [react()],
  base: '/', // 상대 경로로 설정
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'buffer'],
    exclude: ['@types/d3', '@types/d3-cloud', 'core-js'],
  },
  server: {
    port: 3000,
    strictPort: true,
    open: true,
    host: '0.0.0.0',
    hmr: {
      overlay: false,
    },
    proxy: {
      '/api': {
        target: `http://${API_HOST}:${API_PORT}`,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['d3', 'd3-cloud'],
          utils: ['papaparse', 'html2canvas', 'dom-to-image'],
        },
      },
      onwarn(warning, warn) {
        // core-js 관련 경고 무시
        if (warning.code === 'CIRCULAR_DEPENDENCY') return;
        if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
        if (warning.message.includes('define-globalThis-property')) return;
        if (warning.message.includes('core-js')) return;
        warn(warning);
      },
    },
    chunkSizeWarningLimit: 1000,
    // CommonJS 호환성 개선
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
      ignore: ['core-js'],
    },
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 提前注入 Buffer，保证 gray-matter 在任何代码拆分场景下都可用
import { Buffer as PolyBuffer } from 'buffer';
if (typeof globalThis.Buffer === 'undefined') {
  // @ts-ignore
  globalThis.Buffer = PolyBuffer;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore gray-matter types installed at runtime
import matter from 'gray-matter';

export interface BlogPost { /* ... */ }

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['buffer']
  },
  define: {
    global: 'globalThis',
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4000'
    },
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  },
  resolve: {
    alias: {
      buffer: 'buffer',
    }
  }
});

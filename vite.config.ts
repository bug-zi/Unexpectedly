import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  plugins: [
    react(),
    // /landing 路径直接返回静态 landing 页面，绕过 SPA fallback
    {
      name: 'serve-landing',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/landing' || req.url === '/landing/') {
            const html = fs.readFileSync(
              path.resolve(__dirname, 'public/landing/index.html'),
              'utf-8'
            );
            res.setHeader('Content-Type', 'text/html');
            res.end(html);
            return;
          }
          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
  },
  server: {
    port: 5173,
    host: '127.0.0.1',  // 使用 IPv4 避免 IPv6 权限问题
    open: true,
  },
});

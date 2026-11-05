import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const backendTarget = process.env.VITE_BACKEND_TARGET || 'http://localhost:3000';

const handleApiProxyError = (_err, _req, res) => {
  if (!res || res.destroyed) return;
  if (!res.headersSent) {
    res.writeHead(503, { 'Content-Type': 'application/json' });
  }
  res.end(JSON.stringify({
    success: false,
    message: `Backend API is not running on ${backendTarget}. Start the backend or set VITE_BACKEND_TARGET to the production API before using API features.`,
  }));
};

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', handleApiProxyError);
        },
      },
      '/socket.io': { target: backendTarget, ws: true, changeOrigin: true },
    },
  },
});

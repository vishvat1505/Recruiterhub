import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import os from 'os';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Store Vite's dependency cache outside the OneDrive-synced project folder.
  // OneDrive locks files inside node_modules/.vite, which causes EPERM errors
  // ("operation not permitted, rmdir") when Vite re-optimizes dependencies.
  cacheDir: path.join(os.tmpdir(), 'vite-recruithub'),
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5100/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // Proxy the Socket.IO websocket connection to the backend
      '/socket.io': {
        target: 'http://localhost:5100',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});

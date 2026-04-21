import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/src': path.resolve(__dirname, './src'),
      '@frontend-watch-dog/web-sdk': path.resolve(__dirname, '../packages/web-sdk/src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});

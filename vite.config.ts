
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      // This allows the app to access process.env.API_KEY at build time
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    build: {
      rollupOptions: {
        input: {
          main: 'index.html',
          sw: 'sw.js'
        },
        output: {
          entryFileNames: (assetInfo) => {
            return assetInfo.name === 'sw' ? 'sw.js' : 'assets/[name]-[hash].js';
          }
        }
      }
    }
  };
});

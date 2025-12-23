
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  const activeKey = env.API_KEY;

  return {
    plugins: [react()],
    define: {
      // This injects the key into the code at build time.
      'process.env.API_KEY': JSON.stringify(activeKey)
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

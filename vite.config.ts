
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  // Use the environment variable if present, otherwise use the provided key
  const activeKey = env.API_KEY || "AlzaSyDLsepx_g1fBCHhbg43WiKdlAoZkM5npVY";

  return {
    plugins: [react()],
    define: {
      // This injects the key into the code at build time, making it work on Netlify/Vercel
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

import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const explicitProxyBase = (env.PROXY_BASE_URL || '').trim();
    const devApiProxyTarget = (env.DEV_API_PROXY_TARGET || 'http://127.0.0.1:8787').trim();
    const shouldEnableDevApiProxy = mode === 'development' && !explicitProxyBase;
    return {
      base: '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: shouldEnableDevApiProxy
          ? {
              '/api': {
                target: devApiProxyTarget,
                changeOrigin: true,
                secure: false,
              }
            }
          : undefined
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.OPENAI_API_KEY': JSON.stringify(env.OPENAI_API_KEY),
        'process.env.SOCRATA_APP_TOKEN': JSON.stringify(env.SOCRATA_APP_TOKEN),
        'process.env.ARCGIS_API_KEY': JSON.stringify(env.ARCGIS_API_KEY),
        'process.env.GEOCODING_CONTACT_EMAIL': JSON.stringify(env.GEOCODING_CONTACT_EMAIL),
        'process.env.LLM_PROVIDER': JSON.stringify(env.LLM_PROVIDER),
        'process.env.OPENAI_MODEL_FAST': JSON.stringify(env.OPENAI_MODEL_FAST),
        'process.env.OPENAI_MODEL_REASONING': JSON.stringify(env.OPENAI_MODEL_REASONING),
        'process.env.MIN_AGENT_COUNT': JSON.stringify(env.MIN_AGENT_COUNT),
        'process.env.MAX_AGENT_COUNT': JSON.stringify(env.MAX_AGENT_COUNT),
        'process.env.MAX_METHOD_AGENTS': JSON.stringify(env.MAX_METHOD_AGENTS),
        'process.env.ADMIN_PASSWORD': JSON.stringify(env.ADMIN_PASSWORD),
        'process.env.PROXY_BASE_URL': JSON.stringify(env.PROXY_BASE_URL)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const inferredProxyBaseUrl = env.PROXY_BASE_URL || (mode === 'production' ? 'https://api.deepsearches.app' : '');
    return {
      base: '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.OPENAI_API_KEY': JSON.stringify(env.OPENAI_API_KEY),
        'process.env.LLM_PROVIDER': JSON.stringify(env.LLM_PROVIDER),
        'process.env.OPENAI_MODEL_FAST': JSON.stringify(env.OPENAI_MODEL_FAST),
        'process.env.OPENAI_MODEL_REASONING': JSON.stringify(env.OPENAI_MODEL_REASONING),
        'process.env.MIN_AGENT_COUNT': JSON.stringify(env.MIN_AGENT_COUNT),
        'process.env.MAX_AGENT_COUNT': JSON.stringify(env.MAX_AGENT_COUNT),
        'process.env.MAX_METHOD_AGENTS': JSON.stringify(env.MAX_METHOD_AGENTS),
        'process.env.ADMIN_PASSWORD': JSON.stringify(env.ADMIN_PASSWORD),
        'process.env.PROXY_BASE_URL': JSON.stringify(inferredProxyBaseUrl)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

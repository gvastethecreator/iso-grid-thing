import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

function normalizeBasePath(basePath: string | undefined): string {
  if (!basePath) {
    return '/';
  }

  const trimmed = basePath.trim();
  if (trimmed === '/' || trimmed === './') {
    return trimmed;
  }

  return `/${trimmed.replace(/^\/+|\/+$/g, '')}/`;
}

export default defineConfig({
  base: normalizeBasePath(process.env.BASE_PATH),
  plugins: [react(), tailwindcss()],
  server: {
    host: 'localhost',
    port: 5173,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
});

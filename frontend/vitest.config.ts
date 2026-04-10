import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // Why? Para usar describe/it sin importar
    environment: 'jsdom', // Why?模拟浏览器环境 para React
    setupFiles: ['./src/test/setup.ts'], // Setup de testing
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        '**/coverage/**',
        '**/src/test/**',
      ],
    },
  },
});
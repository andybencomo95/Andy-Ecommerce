import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // Why? Para no importar describe/it en cada archivo
    environment: 'node', // Why? Nuestro backend corre en Node
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/coverage/**',
      ],
    },
  },
});
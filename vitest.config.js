import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // DOM-oriented modules (action-bus, list-filter) need a document/window.
    environment: 'jsdom',
    include: ['test/unit/**/*.test.js'],
    globals: false
  }
});

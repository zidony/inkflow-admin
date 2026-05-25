import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

// Dynamically discover all HTML files in the src directory
function getHtmlEntries() {
  const entries = {};
  const srcPath = resolve(__dirname, 'src');
  if (!fs.existsSync(srcPath)) {
    return { main: resolve(__dirname, 'index.html') };
  }
  const files = fs.readdirSync(srcPath);
  files.forEach(file => {
    if (file.endsWith('.html')) {
      const name = file.replace(/\.html$/, '');
      entries[name] = resolve(__dirname, 'src', file);
    }
  });
  return entries;
}

export default defineConfig({
  root: 'src',
  base: './', // Use relative paths for static hosting compatibility
  esbuild: {
    drop: ['console', 'debugger']
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    minify: 'esbuild',
    rollupOptions: {
      input: getHtmlEntries(),
      output: {
        entryFileNames: 'assets/js/[name].js',
        chunkFileNames: 'assets/js/[name].js',
        assetFileNames: 'assets/[ext]/[name].[ext]'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});

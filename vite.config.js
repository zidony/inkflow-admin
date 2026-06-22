import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';
import handlebars from 'vite-plugin-handlebars';

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
  plugins: [
    handlebars({
      partialDirectory: resolve(__dirname, 'src/partials'),
    }),
  ],
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
        // The dashboard chart is the only dynamic import; it pulls in Chart.js,
        // so emit that single lazy chunk under a stable, descriptive name.
        chunkFileNames(chunkInfo) {
          if (chunkInfo.name === 'chart') return 'assets/js/inkflow-chart.js';
          return 'assets/js/[name].js';
        },
        assetFileNames: (assetInfo) => {
          let ext = assetInfo.name.split('.').pop();
          let folder = ext;
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            folder = 'fonts';
          } else if (/png|jpe?g|svg|gif|webp|ico/i.test(ext)) {
            folder = 'images';
          }
          return `assets/${folder}/[name].[ext]`;
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});

import path from 'node:path';
import { lineNumberFor, listFiles, readText, relativeToRoot, rootDir } from './lib/files.mjs';

const srcDir = path.join(rootDir, 'src');
const failures = [];

for (const filePath of listFiles(srcDir, file => file.endsWith('.html'))) {
  const source = readText(filePath);
  const relativePath = relativeToRoot(filePath);

  for (const match of source.matchAll(/\sstyle\s*=/gi)) {
    failures.push(`${relativePath}:${lineNumberFor(source, match.index)} inline style attribute found`);
  }

  for (const match of source.matchAll(/<style\b/gi)) {
    failures.push(`${relativePath}:${lineNumberFor(source, match.index)} inline <style> block found`);
  }
}

if (failures.length > 0) {
  console.error('Inline style check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Inline style check passed.');

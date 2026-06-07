import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'src');
const failures = [];

function listHtmlFiles(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return listHtmlFiles(fullPath);
      return entry.isFile() && entry.name.endsWith('.html') ? [fullPath] : [];
    })
    .sort();
}

function lineNumberFor(source, index) {
  return source.slice(0, index).split(/\r?\n/).length;
}

for (const filePath of listHtmlFiles(srcDir)) {
  const source = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(rootDir, filePath);

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

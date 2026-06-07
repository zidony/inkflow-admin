import fs from 'node:fs';
import path from 'node:path';

export const rootDir = process.cwd();

export function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

export function listFiles(dir, predicate) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap(entry => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return listFiles(fullPath, predicate);
      return entry.isFile() && predicate(fullPath) ? [fullPath] : [];
    })
    .sort();
}

export function lineNumberFor(source, index) {
  return source.slice(0, index).split(/\r?\n/).length;
}

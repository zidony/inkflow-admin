import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import path from 'node:path';

export const rootDir = path.resolve(import.meta.dirname, '..', '..');

export function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

export async function readTextAsync(filePath) {
  return fsPromises.readFile(filePath, 'utf8');
}

export async function fileExistsAsync(filePath) {
  try {
    await fsPromises.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
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

export async function listFilesAsync(dir, predicate) {
  const files = [];
  const dirents = await fsPromises.readdir(dir, { withFileTypes: true });

  for (const dirent of dirents) {
    const fullPath = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      files.push(...(await listFilesAsync(fullPath, predicate)));
    } else if (dirent.isFile() && predicate(fullPath)) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

export function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

export function relativeToRoot(filePath) {
  return toPosixPath(path.relative(rootDir, filePath));
}

export function lineNumberFor(source, index) {
  return source.slice(0, index).split(/\r?\n/).length;
}

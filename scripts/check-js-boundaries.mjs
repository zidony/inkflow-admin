import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const jsDir = path.join(rootDir, 'src', 'assets', 'js');
const failures = [];
const bannedPatterns = [
  {
    pattern: /\bcallWindowHandler\b/,
    message: 'legacy callWindowHandler bridge should not be reintroduced'
  },
  {
    pattern: /\bwindow\.(?:togglePwd|doLogin|clearPreview|filterByType)\b/,
    message: 'page behavior should stay inside modules instead of window globals'
  }
];

function listJsFiles(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap(entry => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return listJsFiles(fullPath);
      return entry.isFile() && entry.name.endsWith('.js') ? [fullPath] : [];
    })
    .sort();
}

function lineNumberFor(source, index) {
  return source.slice(0, index).split(/\r?\n/).length;
}

for (const filePath of listJsFiles(jsDir)) {
  const source = fs.readFileSync(filePath, 'utf8');

  for (const { pattern, message } of bannedPatterns) {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(source))) {
      failures.push(
        `${path.relative(rootDir, filePath)}:${lineNumberFor(source, match.index)} ${message}`
      );
    }
  }
}

if (failures.length) {
  console.error('JS boundary check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('JS boundary check passed.');

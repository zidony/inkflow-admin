import path from 'node:path';
import { lineNumberFor, listFiles, readText, relativeToRoot, rootDir } from './lib/files.mjs';

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

for (const filePath of listFiles(jsDir, file => file.endsWith('.js'))) {
  const source = readText(filePath);

  for (const { pattern, message } of bannedPatterns) {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(source))) {
      failures.push(
        `${relativeToRoot(filePath)}:${lineNumberFor(source, match.index)} ${message}`
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

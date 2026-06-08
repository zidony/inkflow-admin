import path from 'node:path';
import { lineNumberFor, listFiles, readText, relativeToRoot, rootDir } from './lib/files.mjs';

const jsDir = path.join(rootDir, 'src', 'assets', 'js');
const srcDir = path.join(rootDir, 'src');
const failures = [];
const bannedPatterns = [
  {
    pattern: /\bcallWindowHandler\b/,
    message: 'legacy callWindowHandler bridge should not be reintroduced'
  },
  {
    pattern: /\bwindow\.(?:togglePwd|doLogin|clearPreview|filterByType)\b/,
    message: 'page behavior should stay inside modules instead of window globals'
  },
  {
    pattern: /from\s+['"]bootstrap['"]|import\s+.*['"]bootstrap['"]/,
    message: 'Bootstrap JS should stay external via CDN instead of being bundled'
  }
];

const jsFiles = listFiles(jsDir, file => file.endsWith('.js'));
const jsSource = jsFiles.map(filePath => readText(filePath)).join('\n');

for (const filePath of jsFiles) {
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

const actionPattern = /\sdata-action\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s"'=<>`]+))/gi;
const actions = new Set();
for (const filePath of listFiles(srcDir, file => file.endsWith('.html'))) {
  const source = readText(filePath);
  let match;

  while ((match = actionPattern.exec(source))) {
    actions.add(match[1] ?? match[2] ?? match[3]);
  }
}

for (const action of actions) {
  const escapedAction = action.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const actionReferencePattern = new RegExp(`(?:["']${escapedAction}["']|\\b${escapedAction}\\s*:)`);
  if (!actionReferencePattern.test(jsSource)) {
    failures.push(`data-action "${action}" is used in templates but not referenced by runtime JS`);
  }
}

if (failures.length) {
  console.error('JS boundary check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('JS boundary check passed.');

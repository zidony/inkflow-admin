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
  },
  {
    pattern: /\b(?:innerHTML|outerHTML|insertAdjacentHTML|document\.write)\b/,
    message: 'DOM updates should avoid HTML string injection APIs'
  },
  {
    pattern: /\b(?:eval|Function)\s*\(/,
    message: 'dynamic code execution should not be used in runtime modules'
  }
];

const jsFiles = listFiles(jsDir, file => file.endsWith('.js'));
const jsSource = jsFiles.map(filePath => readText(filePath)).join('\n');
const bulkModulePath = path.join(jsDir, 'modules', 'bulk.js');
const bulkModule = readText(bulkModulePath);
const delegationModulePath = path.join(jsDir, 'modules', 'delegation.js');
const delegationModule = readText(delegationModulePath);

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

if (!/dispatchEvent\(new CustomEvent\(['"]inkflow:rows-changed['"]\)\)/.test(bulkModule)) {
  failures.push(`${relativeToRoot(bulkModulePath)} bulk deletion needs to broadcast row changes.`);
}

if (/\bblocked\b/.test(delegationModule)) {
  failures.push(
    `${relativeToRoot(delegationModulePath)} user status toggles must use the template filter value "banned", not "blocked".`
  );
}

if (!/row\.dataset\.status\s*=\s*nextBanned\s*\?\s*['"]banned['"]\s*:\s*['"]active['"]/.test(delegationModule)) {
  failures.push(
    `${relativeToRoot(delegationModulePath)} user status toggles must keep row data-status aligned with user-list filters.`
  );
}

if (failures.length) {
  console.error('JS boundary check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('JS boundary check passed.');

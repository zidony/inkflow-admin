import path from 'node:path';
import { lineNumberFor, listFiles, readText, rootDir } from './lib/files.mjs';

const modulesDir = path.join(rootDir, 'src', 'assets', 'js', 'modules');
const failures = [];
const userFacingCallPattern =
  /\b(?:showToast|setButtonContent|setLoadingContent|setSpinnerText|setIconText)\s*\(([^;\n]*)/g;
const stringLiteralPattern = /(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
const cjkPattern = /[\u3400-\u9fff]/;
const ignoredFiles = new Set(['i18n.js']);

for (const filePath of listFiles(modulesDir, file => file.endsWith('.js'))) {
  if (ignoredFiles.has(path.basename(filePath))) continue;

  const source = readText(filePath);
  let callMatch;

  while ((callMatch = userFacingCallPattern.exec(source))) {
    const args = callMatch[1];
    let literalMatch;

    while ((literalMatch = stringLiteralPattern.exec(args))) {
      const literalValue = literalMatch[2];
      if (!cjkPattern.test(literalValue)) continue;

      failures.push(
        `${path.relative(rootDir, filePath)}:${lineNumberFor(
          source,
          callMatch.index
        )} move user-facing runtime text "${literalValue}" to i18n.js`
      );
    }
  }
}

if (failures.length) {
  console.error('i18n check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('i18n runtime text check passed.');

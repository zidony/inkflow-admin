import fs from 'node:fs/promises';
import path from 'node:path';
import { rootDir } from './lib/files.mjs';

const cssDir = path.join(rootDir, 'src/assets/css');
const tokenSourceFile = '_variables.css';
const disallowedColorValues = [
  '#ffffff',
  '#f8fafc',
  '#e2e8f0',
  'rgba(0, 0, 0, 0.06)'
];
const disallowedRadiusValues = ['8px', '10px', '12px', '20px', '50%', '99px'];

async function listCssFiles() {
  const entries = await fs.readdir(cssDir, { withFileTypes: true });
  return entries
    .filter(entry => entry.isFile() && entry.name.endsWith('.css') && entry.name !== tokenSourceFile)
    .map(entry => entry.name);
}

function lineNumberFor(content, index) {
  return content.slice(0, index).split(/\r?\n/).length;
}

function checkHardcodedValues(fileName, content) {
  const errors = [];

  for (const value of disallowedColorValues) {
    let index = content.indexOf(value);
    while (index !== -1) {
      errors.push(`${fileName}:${lineNumberFor(content, index)} should use a design token instead of ${value}`);
      index = content.indexOf(value, index + value.length);
    }
  }

  const radiusPattern = /border-radius\s*:\s*([^;]+);/g;
  let radiusMatch;
  while ((radiusMatch = radiusPattern.exec(content))) {
    const rawValue = radiusMatch[1].trim();
    if (disallowedRadiusValues.includes(rawValue)) {
      errors.push(
        `${fileName}:${lineNumberFor(content, radiusMatch.index)} should use an --ink-radius token instead of ${rawValue}`
      );
    }
  }

  return errors;
}

async function checkTokens() {
  const errors = [];
  const cssFiles = await listCssFiles();

  for (const fileName of cssFiles) {
    const content = await fs.readFile(path.join(cssDir, fileName), 'utf8');
    errors.push(...checkHardcodedValues(fileName, content));
  }

  if (errors.length) {
    throw new Error(`Design token check failed:\n${errors.join('\n')}`);
  }

  console.log(`Design token check passed for ${cssFiles.length} CSS files.`);
}

checkTokens().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});

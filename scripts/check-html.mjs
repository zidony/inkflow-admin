import fs from 'node:fs/promises';
import path from 'node:path';

const rootDir = path.resolve(import.meta.dirname, '..');
const templateDirs = [path.join(rootDir, 'src')];
const voidTags = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
]);

async function collectHtmlFiles(dir) {
  const files = [];
  const dirents = await fs.readdir(dir, { withFileTypes: true });

  for (const dirent of dirents) {
    const absolutePath = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      files.push(...(await collectHtmlFiles(absolutePath)));
    } else if (dirent.isFile() && dirent.name.endsWith('.html')) {
      files.push(absolutePath);
    }
  }

  return files;
}

function stripIgnoredContent(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')
    .replace(/{{[\s\S]*?}}/g, '');
}

function lineNumberForIndex(content, index) {
  return content.slice(0, index).split('\n').length;
}

function checkHtmlBalance(filePath, html) {
  const content = stripIgnoredContent(html);
  const stack = [];
  const errors = [];
  const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9:-]*)(?:\s[^<>]*)?>/g;
  let match;

  while ((match = tagPattern.exec(content))) {
    const rawTag = match[0];
    const tagName = match[1].toLowerCase();

    if (rawTag.startsWith('<!') || voidTags.has(tagName) || rawTag.endsWith('/>')) {
      continue;
    }

    const line = lineNumberForIndex(content, match.index);

    if (!rawTag.startsWith('</')) {
      stack.push({ tagName, line });
      continue;
    }

    const last = stack.pop();
    if (!last) {
      errors.push(`Unexpected closing </${tagName}> at ${filePath}:${line}`);
      continue;
    }

    if (last.tagName !== tagName) {
      errors.push(
        `Mismatched closing </${tagName}> at ${filePath}:${line}; expected </${last.tagName}> from line ${last.line}`
      );
    }
  }

  for (const openTag of stack.reverse()) {
    errors.push(`Unclosed <${openTag.tagName}> opened at ${filePath}:${openTag.line}`);
  }

  return errors;
}

async function checkHtml() {
  const files = (await Promise.all(templateDirs.map(collectHtmlFiles))).flat();
  const allErrors = [];

  for (const file of files) {
    const relativePath = path.relative(rootDir, file).split(path.sep).join('/');
    const html = await fs.readFile(file, 'utf8');
    allErrors.push(...checkHtmlBalance(relativePath, html));
  }

  if (allErrors.length) {
    throw new Error(`HTML structure check failed:\n${allErrors.join('\n')}`);
  }

  console.log(`HTML structure check passed for ${files.length} templates.`);
}

checkHtml().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});

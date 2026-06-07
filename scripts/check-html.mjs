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
const allowedDataActions = new Set([
  'apply-avatar-crop',
  'clear-preview',
  'delete',
  'delete-notif',
  'do-login',
  'filter-type',
  'navigate',
  'permanent-delete',
  'read-all',
  'read-one',
  'save-notification-pref',
  'switch-settings',
  'toast',
  'toggle-mail-pref',
  'toggle-pwd',
  'toggle-theme',
  'trigger'
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

function checkDuplicateAttributes(filePath, html) {
  const content = stripIgnoredContent(html);
  const errors = [];
  const tagPattern = /<([a-zA-Z][a-zA-Z0-9:-]*)(\s[^<>]*?)?>/g;
  let match;

  while ((match = tagPattern.exec(content))) {
    const rawTag = match[0];

    if (rawTag.startsWith('</') || rawTag.startsWith('<!')) {
      continue;
    }

    const line = lineNumberForIndex(content, match.index);
    const attributes = match[2] ?? '';
    const seen = new Set();
    const duplicateNames = new Set();
    const attributePattern = /(?:^|\s)([^\s"'<>/=]+)(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?/g;
    let attributeMatch;

    while ((attributeMatch = attributePattern.exec(attributes))) {
      const attributeName = attributeMatch[1].toLowerCase();

      if (seen.has(attributeName)) {
        duplicateNames.add(attributeName);
        continue;
      }

      seen.add(attributeName);
    }

    for (const attributeName of duplicateNames) {
      errors.push(`Duplicate attribute "${attributeName}" on <${match[1]}> at ${filePath}:${line}`);
    }
  }

  return errors;
}

function checkDuplicateIds(filePath, html) {
  const content = stripIgnoredContent(html);
  const errors = [];
  const ids = new Map();
  const idPattern = /\sid\s*=\s*(?:"([^"]+)"|'([^']+)')/gi;
  let match;

  while ((match = idPattern.exec(content))) {
    const idValue = match[1] ?? match[2];
    const line = lineNumberForIndex(content, match.index);

    if (!ids.has(idValue)) {
      ids.set(idValue, [line]);
      continue;
    }

    ids.get(idValue).push(line);
  }

  for (const [idValue, lines] of ids) {
    if (lines.length > 1) {
      errors.push(`Duplicate id "${idValue}" at ${filePath}:${lines.join(', ')}`);
    }
  }

  return errors;
}

function checkDataActions(filePath, html) {
  const content = stripIgnoredContent(html);
  const errors = [];
  const actionPattern = /\sdata-action\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s"'=<>`]+))/gi;
  let match;

  while ((match = actionPattern.exec(content))) {
    const action = match[1] ?? match[2] ?? match[3];

    if (allowedDataActions.has(action)) {
      continue;
    }

    const line = lineNumberForIndex(content, match.index);
    errors.push(`Unknown data-action "${action}" at ${filePath}:${line}`);
  }

  return errors;
}

function checkSuspiciousPlaceholderText(filePath, html) {
  const content = stripIgnoredContent(html);
  const errors = [];
  const placeholderPattern = /\?{3,}/g;
  let match;

  while ((match = placeholderPattern.exec(content))) {
    const line = lineNumberForIndex(content, match.index);
    errors.push(`Suspicious placeholder text "${match[0]}" at ${filePath}:${line}`);
  }

  return errors;
}

function checkPageHeaderPartialUsage(filePath, html) {
  if (filePath === 'src/partials/page_header.html') {
    return [];
  }

  if (!html.includes('<div class="page-header">')) {
    return [];
  }

  return [`Use {{#> page_header}} partial instead of raw page-header markup at ${filePath}`];
}

function checkBreadcrumbPartialUsage(filePath, html) {
  if (filePath === 'src/partials/breadcrumb.html') {
    return [];
  }

  const errors = [];

  if (html.includes('aria-label="breadcrumb"')) {
    errors.push(`Use {{#> breadcrumb}} partial instead of raw breadcrumb nav at ${filePath}`);
  }

  const topbarBlockPattern = /{{#>\s*topbar\s*}}([\s\S]*?){{\/topbar}}/g;
  let match;

  while ((match = topbarBlockPattern.exec(html))) {
    if (match[1].includes('{{#> breadcrumb')) {
      continue;
    }

    const line = lineNumberForIndex(html, match.index);
    errors.push(`Wrap topbar breadcrumb content with {{#> breadcrumb}} at ${filePath}:${line}`);
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
    allErrors.push(...checkDuplicateAttributes(relativePath, html));
    allErrors.push(...checkDuplicateIds(relativePath, html));
    allErrors.push(...checkDataActions(relativePath, html));
    allErrors.push(...checkSuspiciousPlaceholderText(relativePath, html));
    allErrors.push(...checkPageHeaderPartialUsage(relativePath, html));
    allErrors.push(...checkBreadcrumbPartialUsage(relativePath, html));
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

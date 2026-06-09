import path from 'node:path';
import { lineNumberFor, listFilesAsync, readTextAsync, relativeToRoot, rootDir } from './lib/files.mjs';

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
  'bulk-delete',
  'clear-read-notifs',
  'clear-preview',
  'copy-field',
  'delete',
  'delete-notif',
  'do-login',
  'email-user',
  'filter-type',
  'focus-image-crop',
  'navigate',
  'permanent-delete',
  'preview-image',
  'read-all',
  'read-one',
  'save-notification-pref',
  'switch-settings',
  'toast',
  'toggle-comment-status',
  'toggle-mail-pref',
  'toggle-pwd',
  'toggle-post-status',
  'toggle-theme',
  'toggle-user-status',
  'trigger'
]);
const requiredCdnAssets = [
  {
    filePath: 'src/partials/head_assets.html',
    url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css',
    integrity: 'sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB'
  },
  {
    filePath: 'src/partials/head_assets.html',
    url: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css',
    integrity: 'sha384-CK2SzKma4jA5H/MXDUU7i1TqZlCFaD4T01vtyDFvPlD97JQyS+IsSh1nI2EFbpyk'
  },
  {
    filePath: 'src/partials/scripts.html',
    url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js',
    integrity: 'sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI'
  }
];

function stripIgnoredContent(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')
    .replace(/{{[\s\S]*?}}/g, '');
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

    const line = lineNumberFor(content, match.index);

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

    const line = lineNumberFor(content, match.index);
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
    const line = lineNumberFor(content, match.index);

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

function collectIds(html) {
  const content = stripIgnoredContent(html);
  const ids = new Set();
  const idPattern = /\sid\s*=\s*(?:"([^"]+)"|'([^']+)')/gi;
  let match;

  while ((match = idPattern.exec(content))) {
    ids.add(match[1] ?? match[2]);
  }

  return ids;
}

function getAttribute(tag, name) {
  const escapedName = name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const pattern = new RegExp(`\\s${escapedName}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'=<>` + '`' + `]+))`, 'i');
  const match = tag.match(pattern);
  return match ? (match[1] ?? match[2] ?? match[3] ?? '') : '';
}

function validateIdReferences(filePath, html, knownIds) {
  const content = stripIgnoredContent(html);
  const errors = [];
  const tagPattern = /<([a-zA-Z][a-zA-Z0-9:-]*)(?:\s[^<>]*?)?>/g;
  let match;

  while ((match = tagPattern.exec(content))) {
    const tag = match[0];
    const line = lineNumberFor(content, match.index);
    const location = `${filePath}:${line}`;
    const ariaControls = getAttribute(tag, 'aria-controls');

    for (const id of ariaControls.split(/\s+/).filter(Boolean)) {
      if (!knownIds.has(id)) {
        errors.push(`${location} aria-controls references missing id "${id}".`);
      }
    }

    const ariaLabelledBy = getAttribute(tag, 'aria-labelledby');
    for (const id of ariaLabelledBy.split(/\s+/).filter(Boolean)) {
      if (!knownIds.has(id)) {
        errors.push(`${location} aria-labelledby references missing id "${id}".`);
      }
    }

    const dataTarget = getAttribute(tag, 'data-target');
    const shouldTargetId =
      getAttribute(tag, 'data-action') === 'trigger' || getAttribute(tag, 'data-toggle') === 'submenu';

    if (shouldTargetId && !dataTarget) {
      errors.push(`${location} action target needs data-target.`);
    } else if (shouldTargetId && !knownIds.has(dataTarget)) {
      errors.push(`${location} data-target references missing id "${dataTarget}".`);
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

    const line = lineNumberFor(content, match.index);
    errors.push(`Unknown data-action "${action}" at ${filePath}:${line}`);
  }

  return errors;
}

function checkButtonTypes(filePath, html) {
  const content = stripIgnoredContent(html);
  const errors = [];
  const buttonPattern = /<button\b[^>]*>/gi;
  let match;

  while ((match = buttonPattern.exec(content))) {
    const tag = match[0];
    if (/\stype\s*=/.test(tag)) {
      continue;
    }

    const line = lineNumberFor(content, match.index);
    errors.push(`Button needs an explicit type at ${filePath}:${line}`);
  }

  return errors;
}

function checkPlaceholderLinks(filePath, html) {
  const content = stripIgnoredContent(html);
  const errors = [];
  const placeholderLinkPattern = /<a\b[^>]*\shref\s*=\s*(["'])#\1[^>]*>/gi;
  let match;

  while ((match = placeholderLinkPattern.exec(content))) {
    const line = lineNumberFor(content, match.index);
    errors.push(`Avoid placeholder href="#" links at ${filePath}:${line}`);
  }

  return errors;
}

function checkSuspiciousPlaceholderText(filePath, html) {
  const content = stripIgnoredContent(html);
  const errors = [];
  const placeholderPattern = /\?{3,}/g;
  let match;

  while ((match = placeholderPattern.exec(content))) {
    const line = lineNumberFor(content, match.index);
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

    const line = lineNumberFor(html, match.index);
    errors.push(`Wrap topbar breadcrumb content with {{#> breadcrumb}} at ${filePath}:${line}`);
  }

  return errors;
}

function checkBulkActionBarPartialUsage(filePath, html) {
  if (filePath === 'src/partials/bulk_action_bar.html') {
    return [];
  }

  if (!html.includes('<div class="ink-bulk-bar"')) {
    return [];
  }

  return [`Use {{> bulk_action_bar }} partial instead of raw bulk action bar markup at ${filePath}`];
}

function checkListTableCardPartialUsage(filePath, html) {
  if (filePath === 'src/partials/list_table_card.html') {
    return [];
  }

  if (!/^src\/[^/]+-list\.html$/.test(filePath) || !html.includes('class="ink-table"')) {
    return [];
  }

  const errors = [];

  if (!html.includes('{{#> list_table_card')) {
    errors.push(`Use {{#> list_table_card}} partial for list table card chrome at ${filePath}`);
  }

  if (html.includes('<div class="card ink-card mt-3">')) {
    errors.push(`Do not duplicate raw list table card markup at ${filePath}`);
  }

  return errors;
}

function hasHandlebarsParam(partialTag, paramName) {
  return new RegExp(`\\s${paramName}=`).test(partialTag);
}

function checkPaginationLabels(filePath, html) {
  const errors = [];
  const partialPattern = /{{#?>\s*(pagination|list_table_card)\b[^}]*}}/g;
  let match;

  while ((match = partialPattern.exec(html))) {
    const tag = match[0];
    const line = lineNumberFor(html, match.index);

    for (const paramName of ['ariaLabel', 'prevLabel', 'nextLabel']) {
      if (!hasHandlebarsParam(tag, paramName)) {
        errors.push(`${filePath}:${line} ${match[1]} partial needs ${paramName}.`);
      }
    }
  }

  return errors;
}

function checkCdnAssetIntegrity(filePath, html) {
  const errors = [];
  const requiredAssets = requiredCdnAssets.filter(asset => asset.filePath === filePath);

  for (const asset of requiredAssets) {
    const urlIndex = html.indexOf(asset.url);
    if (urlIndex === -1) {
      errors.push(`${filePath} is missing CDN asset ${asset.url}`);
      continue;
    }

    const tagStart = html.lastIndexOf('<', urlIndex);
    const tagEnd = html.indexOf('>', urlIndex);
    const tag = tagStart === -1 || tagEnd === -1 ? '' : html.slice(tagStart, tagEnd + 1);

    if (!tag.includes(`integrity="${asset.integrity}"`)) {
      errors.push(`${filePath}:${lineNumberFor(html, urlIndex)} CDN asset needs expected SRI integrity.`);
    }
    if (!tag.includes('crossorigin="anonymous"')) {
      errors.push(`${filePath}:${lineNumberFor(html, urlIndex)} CDN asset needs crossorigin="anonymous".`);
    }
  }

  return errors;
}

async function checkHtml() {
  const isHtmlFile = file => file.endsWith('.html');
  const files = (await Promise.all(templateDirs.map(dir => listFilesAsync(dir, isHtmlFile)))).flat();
  const allErrors = [];
  const htmlByFile = new Map();
  const idsByFile = new Map();
  const partialIds = new Set();

  for (const file of files) {
    const relativePath = relativeToRoot(file);
    const html = await readTextAsync(file);
    const ids = collectIds(html);
    htmlByFile.set(relativePath, html);
    idsByFile.set(relativePath, ids);

    if (relativePath.startsWith('src/partials/')) {
      for (const id of ids) {
        partialIds.add(id);
      }
    }
  }

  for (const [relativePath, html] of htmlByFile) {
    const knownIds = new Set(idsByFile.get(relativePath));
    for (const id of partialIds) {
      knownIds.add(id);
    }

    allErrors.push(...checkHtmlBalance(relativePath, html));
    allErrors.push(...checkDuplicateAttributes(relativePath, html));
    allErrors.push(...checkDuplicateIds(relativePath, html));
    allErrors.push(...validateIdReferences(relativePath, html, knownIds));
    allErrors.push(...checkDataActions(relativePath, html));
    allErrors.push(...checkButtonTypes(relativePath, html));
    allErrors.push(...checkPlaceholderLinks(relativePath, html));
    allErrors.push(...checkSuspiciousPlaceholderText(relativePath, html));
    allErrors.push(...checkPageHeaderPartialUsage(relativePath, html));
    allErrors.push(...checkBreadcrumbPartialUsage(relativePath, html));
    allErrors.push(...checkBulkActionBarPartialUsage(relativePath, html));
    allErrors.push(...checkListTableCardPartialUsage(relativePath, html));
    allErrors.push(...checkPaginationLabels(relativePath, html));
    allErrors.push(...checkCdnAssetIntegrity(relativePath, html));
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

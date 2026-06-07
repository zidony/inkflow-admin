import path from 'node:path';
import { lineNumberFor, listFilesAsync, readTextAsync, relativeToRoot, rootDir } from './lib/files.mjs';

const srcDir = path.join(rootDir, 'src');

function getAttribute(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}=(["'])(.*?)\\1`, 'i'));
  return match ? match[2] : '';
}

function hasAttribute(tag, name) {
  return new RegExp(`\\s${name}(?:=|\\s|>|$)`, 'i').test(tag);
}

function hasClass(tag, className) {
  return getAttribute(tag, 'class')
    .split(/\s+/)
    .includes(className);
}

function getClasses(tag) {
  return getAttribute(tag, 'class').split(/\s+/).filter(Boolean);
}

function hasAccessibleName(tag) {
  return hasAttribute(tag, 'aria-label') || hasAttribute(tag, 'aria-labelledby');
}

function isCompactSelect(tag) {
  const classes = getClasses(tag);
  return (
    classes.includes('ink-toolbar-select') ||
    classes.includes('form-select-sm-custom') ||
    classes.some(className => /^wh-\d+(?:-\d+)?$/.test(className)) ||
    (classes.some(className => /^w-\d+px$/.test(className)) &&
      classes.some(className => /^h-\d+px$/.test(className)))
  );
}

function isTableCheckBox(tag) {
  return getAttribute(tag, 'type') === 'checkbox' && hasClass(tag, 'table-check-box');
}

function checkFile(relativePath, html) {
  const errors = [];
  const tagPattern = /<(button|a)\b[^>]*>/gi;
  let match;

  while ((match = tagPattern.exec(html))) {
    const tag = match[0];
    const line = lineNumberFor(html, match.index);
    const location = `${relativePath}:${line}`;
    const isIconControl = hasClass(tag, 'btn-icon') || hasClass(tag, 'ink-toolbar-btn');

    if (isIconControl && !hasAttribute(tag, 'aria-label')) {
      errors.push(`${location} icon control needs aria-label.`);
    }

    if (match[1].toLowerCase() === 'a' && getAttribute(tag, 'target') === '_blank') {
      const relTokens = getAttribute(tag, 'rel').split(/\s+/);
      if (!relTokens.includes('noopener') || !relTokens.includes('noreferrer')) {
        errors.push(`${location} target="_blank" link needs rel="noopener noreferrer".`);
      }
    }

    if (getAttribute(tag, 'data-bs-toggle') === 'dropdown' && !hasAttribute(tag, 'aria-expanded')) {
      errors.push(`${location} dropdown trigger needs aria-expanded.`);
    }

    if (getAttribute(tag, 'data-action') === 'toggle-theme' && !hasAttribute(tag, 'aria-pressed')) {
      errors.push(`${location} theme toggle needs aria-pressed.`);
    }

    if (getAttribute(tag, 'data-toggle') === 'submenu') {
      if (!hasAttribute(tag, 'aria-expanded')) {
        errors.push(`${location} submenu toggle needs aria-expanded.`);
      }
      if (!hasAttribute(tag, 'aria-controls')) {
        errors.push(`${location} submenu toggle needs aria-controls.`);
      }
    }
  }

  const selectPattern = /<select\b[^>]*>/gi;
  while ((match = selectPattern.exec(html))) {
    const tag = match[0];
    if (!isCompactSelect(tag) || hasAccessibleName(tag)) {
      continue;
    }

    const line = lineNumberFor(html, match.index);
    errors.push(`${relativePath}:${line} compact select needs aria-label or aria-labelledby.`);
  }

  const inputPattern = /<input\b[^>]*>/gi;
  while ((match = inputPattern.exec(html))) {
    const tag = match[0];
    if (!isTableCheckBox(tag) || hasAccessibleName(tag)) {
      continue;
    }

    const line = lineNumberFor(html, match.index);
    errors.push(`${relativePath}:${line} table checkbox needs aria-label or aria-labelledby.`);
  }

  return errors;
}

async function checkA11y() {
  const files = await listFilesAsync(srcDir, file => file.endsWith('.html'));
  const errors = [];

  for (const file of files) {
    const relativePath = relativeToRoot(file);
    const html = await readTextAsync(file);
    errors.push(...checkFile(relativePath, html));
  }

  if (errors.length) {
    throw new Error(`Accessibility check failed:\n${errors.join('\n')}`);
  }

  console.log(`Accessibility check passed for ${files.length} templates.`);
}

checkA11y().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});

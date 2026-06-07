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

function checkFile(relativePath, html) {
  const errors = [];
  const tagPattern = /<(button|a)\b[^>]*>/gi;
  let match;

  while ((match = tagPattern.exec(html))) {
    const tag = match[0];
    const line = lineNumberFor(html, match.index);
    const location = `${relativePath}:${line}`;
    const isIconControl = hasClass(tag, 'btn-icon') || hasClass(tag, 'ink-toolbar-btn');

    if (isIconControl && !hasAttribute(tag, 'aria-label') && !hasAttribute(tag, 'title')) {
      errors.push(`${location} icon control needs title or aria-label.`);
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

import path from 'node:path';
import { lineNumberFor, listFilesAsync, readTextAsync, relativeToRoot, rootDir } from './lib/files.mjs';

const srcDir = path.join(rootDir, 'src');

function getAttribute(tag, name) {
  return parseAttributes(tag).get(name.toLowerCase()) ?? '';
}

function hasAttribute(tag, name) {
  return parseAttributes(tag).has(name.toLowerCase());
}

function parseAttributes(tag) {
  const attributes = new Map();
  const source = tag.replace(/^<\/?[a-zA-Z][a-zA-Z0-9:-]*/, '').replace(/\/?>$/, '');
  let index = 0;

  while (index < source.length) {
    while (/\s/.test(source[index] ?? '')) index += 1;
    if (index >= source.length) break;

    const nameStart = index;
    while (index < source.length && !/[\s=]/.test(source[index])) index += 1;
    const attrName = source.slice(nameStart, index).toLowerCase();
    if (!attrName) break;

    while (/\s/.test(source[index] ?? '')) index += 1;
    if (source[index] !== '=') {
      attributes.set(attrName, '');
      continue;
    }

    index += 1;
    while (/\s/.test(source[index] ?? '')) index += 1;

    const quote = source[index];
    if (quote === '"' || quote === "'") {
      index += 1;
      const valueStart = index;
      while (index < source.length && source[index] !== quote) index += 1;
      attributes.set(attrName, source.slice(valueStart, index));
      index += 1;
      continue;
    }

    const valueStart = index;
    while (index < source.length && !/\s/.test(source[index])) index += 1;
    attributes.set(attrName, source.slice(valueStart, index));
  }

  return attributes;
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

function hasAssociatedLabel(html, tag) {
  const id = getAttribute(tag, 'id');
  return id ? new RegExp(`<label\\b[^>]*\\sfor=(["'])${id}\\1`, 'i').test(html) : false;
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

function isNamedLoginInput(tag) {
  return ['login-user', 'login-pass'].includes(getAttribute(tag, 'id'));
}

function isNotificationPreferenceInput(tag) {
  return ['save-notification-pref', 'toggle-mail-pref'].includes(getAttribute(tag, 'data-action'));
}

function isCheckableInput(tag) {
  return ['checkbox', 'radio'].includes(getAttribute(tag, 'type'));
}

function isTabButton(tag) {
  return hasClass(tag, 'ink-filter-tab') || hasClass(tag, 'ink-settings-nav-item');
}

function isTabList(tag) {
  return hasClass(tag, 'ink-filter-tabs') || hasClass(tag, 'ink-settings-nav');
}

function isSettingsTabButton(tag) {
  return hasClass(tag, 'ink-settings-nav-item');
}

function isSettingsPanel(tag) {
  return /^section-[a-z-]+$/.test(getAttribute(tag, 'id'));
}

function isStandardFormControl(tag) {
  const classes = getClasses(tag);
  return classes.includes('form-control') || classes.includes('form-select');
}

function isSkippedStandardFormControl(tag) {
  return ['file', 'hidden'].includes(getAttribute(tag, 'type'));
}

function shouldCheckEditFormControl(relativePath, tag) {
  return (
    [
      'src/category-edit.html',
      'src/image-edit.html',
      'src/link-edit.html',
      'src/post-edit.html',
      'src/settings.html',
      'src/tag-edit.html',
      'src/user-edit.html'
    ].includes(relativePath) &&
    isStandardFormControl(tag) &&
    !isSkippedStandardFormControl(tag)
  );
}

function checkFile(relativePath, html) {
  const errors = [];
  const divPattern = /<div\b[^>]*>/gi;
  let divMatch;

  while ((divMatch = divPattern.exec(html))) {
    const tag = divMatch[0];
    if (!isTabList(tag) || getAttribute(tag, 'role') === 'tablist') {
      continue;
    }

    const line = lineNumberFor(html, divMatch.index);
    errors.push(`${relativePath}:${line} tab list needs role="tablist".`);
  }

  const panelPattern = /<div\b[^>]*>/gi;
  let panelMatch;

  while ((panelMatch = panelPattern.exec(html))) {
    const tag = panelMatch[0];
    if (!isSettingsPanel(tag)) {
      continue;
    }

    const line = lineNumberFor(html, panelMatch.index);
    const location = `${relativePath}:${line}`;

    if (getAttribute(tag, 'role') !== 'tabpanel') {
      errors.push(`${location} settings section needs role="tabpanel".`);
    }
    if (!hasAttribute(tag, 'aria-labelledby')) {
      errors.push(`${location} settings section needs aria-labelledby.`);
    }
    if (!hasAttribute(tag, 'tabindex')) {
      errors.push(`${location} settings section needs tabindex.`);
    }
    if (hasClass(tag, 'd-none') && !hasAttribute(tag, 'hidden')) {
      errors.push(`${location} hidden settings section needs hidden.`);
    }
  }

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

    if (hasClass(tag, 'ink-toolbar-btn') && hasClass(tag, 'active') && !hasAttribute(tag, 'aria-pressed')) {
      errors.push(`${location} active toolbar button needs aria-pressed.`);
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

    if (getAttribute(tag, 'data-action') === 'toggle-pwd' && !hasAccessibleName(tag)) {
      errors.push(`${location} password toggle needs aria-label or aria-labelledby.`);
    }

    if (isTabButton(tag)) {
      if (getAttribute(tag, 'role') !== 'tab') {
        errors.push(`${location} tab button needs role="tab".`);
      }
      if (!hasAttribute(tag, 'aria-selected')) {
        errors.push(`${location} tab button needs aria-selected.`);
      }
      if (isSettingsTabButton(tag) && !hasAttribute(tag, 'aria-controls')) {
        errors.push(`${location} settings tab button needs aria-controls.`);
      }
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

  const standardControlPattern = /<(input|select|textarea)\b[^>]*>/gi;
  while ((match = standardControlPattern.exec(html))) {
    const tag = match[0];
    if (
      shouldCheckEditFormControl(relativePath, tag) &&
      !hasAccessibleName(tag) &&
      !hasAssociatedLabel(html, tag)
    ) {
      const line = lineNumberFor(html, match.index);
      errors.push(`${relativePath}:${line} edit form control needs an associated label or aria-label.`);
    }
  }

  const inputPattern = /<input\b[^>]*>/gi;
  while ((match = inputPattern.exec(html))) {
    const tag = match[0];
    const line = lineNumberFor(html, match.index);

    if (isTableCheckBox(tag) && !hasAccessibleName(tag)) {
      errors.push(`${relativePath}:${line} table checkbox needs aria-label or aria-labelledby.`);
    }

    if (isCheckableInput(tag) && !hasAccessibleName(tag) && !hasAssociatedLabel(html, tag)) {
      errors.push(`${relativePath}:${line} checkbox or radio needs an accessible name.`);
    }

    if (isNamedLoginInput(tag) && !hasAccessibleName(tag)) {
      errors.push(`${relativePath}:${line} login input needs aria-label or aria-labelledby.`);
    }

    if (isNotificationPreferenceInput(tag) && !hasAccessibleName(tag)) {
      errors.push(`${relativePath}:${line} notification preference input needs aria-label or aria-labelledby.`);
    }
  }

  const imagePattern = /<img\b[^>]*>/gi;
  while ((match = imagePattern.exec(html))) {
    const tag = match[0];
    const line = lineNumberFor(html, match.index);
    const location = `${relativePath}:${line}`;

    if (!hasAttribute(tag, 'alt')) {
      errors.push(`${location} image needs an alt attribute.`);
    }
    if (!hasAttribute(tag, 'width') || !hasAttribute(tag, 'height')) {
      errors.push(`${location} image needs explicit width and height attributes.`);
    }
    if (getAttribute(tag, 'loading') !== 'lazy') {
      errors.push(`${location} image needs loading="lazy".`);
    }
    if (getAttribute(tag, 'decoding') !== 'async') {
      errors.push(`${location} image needs decoding="async".`);
    }
  }

  const bootstrapIconPattern = /<i\b[^>]*\bclass=(["'])[^"']*\bbi\b[^"']*\1[^>]*>/gi;
  while ((match = bootstrapIconPattern.exec(html))) {
    const tag = match[0];
    if (getAttribute(tag, 'aria-hidden') === 'true') {
      continue;
    }

    const line = lineNumberFor(html, match.index);
    errors.push(`${relativePath}:${line} bootstrap icon needs aria-hidden="true".`);
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

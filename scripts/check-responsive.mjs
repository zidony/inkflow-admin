import path from 'node:path';
import { lineNumberFor, listFiles, readText, relativeToRoot, rootDir } from './lib/files.mjs';

const srcDir = path.join(rootDir, 'src');
const cssDir = path.join(srcDir, 'assets', 'css');

const failures = [];
const mobileViewportWidths = [320, 360, 390, 414, 480, 560, 768];

function hasNearbyResponsiveWrapper(source, tableIndex) {
  const beforeTable = source.slice(0, tableIndex);
  const wrapperIndex = Math.max(
    beforeTable.lastIndexOf('class="table-responsive"'),
    beforeTable.lastIndexOf("class='table-responsive'"),
    beforeTable.lastIndexOf('class="ink-table-wrap"'),
    beforeTable.lastIndexOf("class='ink-table-wrap'")
  );

  if (wrapperIndex === -1) return false;

  const lastWrapperClose = beforeTable.lastIndexOf('</div>');
  return lastWrapperClose < wrapperIndex;
}

function isInsideCardHeader(source, index) {
  const before = source.slice(0, index);
  const headerIndex = before.lastIndexOf('card-header');
  if (headerIndex === -1) return false;

  const lastClosingDiv = before.lastIndexOf('</div>');
  return lastClosingDiv < headerIndex;
}

function hasCardHeaderFlexWrap(source, index) {
  const before = source.slice(0, index);
  const headerIndex = before.lastIndexOf('card-header');
  if (headerIndex === -1) return false;

  const headerSource = source.slice(headerIndex, index);
  return /\bflex-wrap\b/.test(headerSource);
}

function indexOfPattern(source, pattern) {
  const match = pattern.exec(source);
  return match ? match.index : -1;
}

const htmlFiles = listFiles(srcDir, (filePath) => filePath.endsWith('.html'));
for (const filePath of htmlFiles) {
  const source = readText(filePath);
  const tablePattern = /<table\b[^>]*class=["'][^"']*\bink-table\b[^"']*["'][^>]*>/g;
  for (const match of source.matchAll(tablePattern)) {
    if (!hasNearbyResponsiveWrapper(source, match.index)) {
      failures.push(
        `${relativeToRoot(filePath)}:${lineNumberFor(source, match.index)} .ink-table is missing a table-responsive or ink-table-wrap container`
      );
    }
  }

  const fixedWidthSelectPattern =
    /<(?:select|input)\b[^>]*class=["'][^"']*\bform-(?:select|control)\b[^"']*\b(?:w-\d+px|wh-\d+(?:-\d+)?|min-w-\d+px)\b[^"']*["'][^>]*>/g;
  for (const match of source.matchAll(fixedWidthSelectPattern)) {
    if (isInsideCardHeader(source, match.index) && !hasCardHeaderFlexWrap(source, match.index)) {
      failures.push(
        `${relativeToRoot(filePath)}:${lineNumberFor(source, match.index)} fixed-width form control in card-header needs a flex-wrap container`
      );
    }
  }
}

const layoutCss = readText(path.join(cssDir, '_layout.css'));
const componentsCss = readText(path.join(cssDir, '_components.css'));

const requiredCssGuards = [
  ['_layout.css', layoutCss, /#main-wrapper\s*{[^}]*min-width:\s*0;/s],
  ['_layout.css', layoutCss, /\.topbar-actions\s*{[^}]*margin-left:\s*auto;/s],
  ['_layout.css', layoutCss, /\.ink-card\s*>\s*\.card-body\.p-0\s*{[^}]*padding:\s*0\s*!important;/s],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*991\.98px\)[\s\S]*#main-wrapper\s*{[^}]*max-width:\s*100vw;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*767\.98px\)[\s\S]*#topbar\s*{[^}]*width:\s*100%;[^}]*min-width:\s*0;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*767\.98px\)[\s\S]*\.page-header\s*>\s*\.d-flex\s*{[^}]*width:\s*100%;[^}]*flex-wrap:\s*wrap;[^}]*margin-left:\s*0\s*!important;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*767\.98px\)[\s\S]*\.page-header\s*>\s*\.d-flex\s*>\s*\.btn[\s\S]*flex:\s*1\s+1\s+140px;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*767\.98px\)[\s\S]*\.ink-editor-sticky-bar\s*{[^}]*margin:\s*0\s+0\s+12px;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*767\.98px\)[\s\S]*\.ink-sticky-inner\s*>\s*div:last-child\s*{[^}]*flex-wrap:\s*wrap;[^}]*justify-content:\s*flex-end;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*767\.98px\)[\s\S]*\.ink-sticky-inner\s*>\s*div:last-child\s+\.btn\s*{[^}]*flex:\s*1\s+1\s+88px;[^}]*min-width:\s*0;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*767\.98px\)[\s\S]*\.table-responsive\s*{[^}]*overflow-x:\s*auto;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*767\.98px\)[\s\S]*\.table-responsive\s*>\s*\.ink-table[\s\S]*min-width:\s*720px;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*767\.98px\)[\s\S]*\.ink-card\s*>\s*\.card-header\s*{[^}]*flex-wrap:\s*wrap;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*767\.98px\)[\s\S]*\.ink-card\s*>\s*\.card-header\s+\.ink-card-title\s*{[^}]*min-width:\s*0;[^}]*overflow-wrap:\s*anywhere;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*767\.98px\)[\s\S]*\.ink-card\s*>\s*\.card-header\s*>\s*\.btn[\s\S]*max-width:\s*100%;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*767\.98px\)[\s\S]*\.ink-card\s*>\s*\.card-body\.p-0\s*{[^}]*overflow-x:\s*clip;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*767\.98px\)[\s\S]*\.ink-card\s*>\s*\.card-header\s+\.ms-auto\s*{[^}]*margin-left:\s*0\s*!important;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*767\.98px\)[\s\S]*\.ink-card\s*>\s*\.card-header\s+\.form-select\s*{[^}]*flex:\s*1\s+1\s+110px;[^}]*width:\s*auto\s*!important;[^}]*min-width:\s*0;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*767\.98px\)[\s\S]*\.input-group\s*{[^}]*min-width:\s*0;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*767\.98px\)[\s\S]*\.ink-filter-tabs\s*{[^}]*flex-wrap:\s*wrap;[^}]*min-width:\s*0;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*767\.98px\)[\s\S]*\.ink-dashboard-quick-card\s+\.card-body\s*>\s*\.d-flex\s*{[^}]*flex-wrap:\s*wrap;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*767\.98px\)[\s\S]*\.ink-settings-nav\s*{[^}]*flex-direction:\s*row;[^}]*min-width:\s*max-content;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*767px\)[\s\S]*\.ink-settings-layout\s*{[^}]*grid-template-columns:\s*1fr;[^}]*min-width:\s*0;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*767px\)[\s\S]*\.ink-settings-layout\s*>\s*\*\s*{[^}]*min-width:\s*0;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*767\.98px\)[\s\S]*\.ink-notif-desc\s*{[^}]*white-space:\s*normal;[^}]*overflow:\s*visible;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*767\.98px\)[\s\S]*\.ink-notif-content\s*{[^}]*min-width:\s*0;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*767\.98px\)[\s\S]*\.ink-notif-meta\s*{[^}]*align-items:\s*flex-start;[^}]*flex-wrap:\s*wrap;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*767\.98px\)[\s\S]*\.ink-notif-more\s*{[^}]*opacity:\s*1;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*767\.98px\)[\s\S]*\.ink-editor-sidebar\s*{[^}]*position:\s*static;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*767\.98px\)[\s\S]*\.ink-post-permalink\s*{[^}]*flex-basis:\s*100%;[^}]*min-width:\s*0;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*767\.98px\)[\s\S]*\.ink-post-slug-preview\s*{[^}]*overflow-wrap:\s*anywhere;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*767\.98px\)[\s\S]*\.ink-avatar-crop-wrap\s*{[^}]*width:\s*min\(240px,\s*calc\(100vw\s*-\s*72px\)\);/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*560px\)[\s\S]*\.topbar-create-btn\s*{[^}]*width:\s*36px;[^}]*height:\s*36px;[^}]*font-size:\s*0;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*560px\)[\s\S]*\.topbar-create-btn\s+i\s*{[^}]*font-size:\s*1rem;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*479\.98px\)[\s\S]*\.topbar-actions\s*{[^}]*justify-content:\s*flex-end;[^}]*margin-left:\s*auto;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*479\.98px\)[\s\S]*\.ink-notif-dropdown\s*{[^}]*min-width:\s*calc\(100vw\s*-\s*20px\);[^}]*max-width:\s*calc\(100vw\s*-\s*20px\);/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*479\.98px\)[\s\S]*\.ink-notif-row-inner\s*{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*36px\s+minmax\(0,\s*1fr\)\s+auto;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*479\.98px\)[\s\S]*\.ink-notif-actions\s*{[^}]*grid-column:\s*3;[^}]*grid-row:\s*1;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*479\.98px\)[\s\S]*\.ink-dashboard-quick-card\s+\.ink-quick-btn-sm[\s\S]*min-width:\s*100%;/],
];

for (const [fileName, source, pattern] of requiredCssGuards) {
  if (!pattern.test(source)) {
    failures.push(`${path.join('src/assets/css', fileName)} is missing a required mobile layout guard`);
  }
}

const forbiddenMobileCss = [
  [
    /@media\s*\(max-width:\s*479\.98px\)[\s\S]*\.topbar-actions\s*{[^}]*justify-content:\s*flex-start;/,
    'topbar actions must stay right-aligned on small mobile widths',
  ],
  [
    /@media\s*\(max-width:\s*479\.98px\)[\s\S]*\.ink-notif-dropdown\s*{[^}]*(?:min-width|max-width):\s*(?:340px|360px);/,
    'notification dropdown must not keep desktop fixed widths on small mobile widths',
  ],
];

for (const [pattern, message] of forbiddenMobileCss) {
  if (pattern.test(componentsCss)) failures.push(`${path.join('src/assets/css', '_components.css')} ${message}`);
}

const notifBaseRowIndex = indexOfPattern(componentsCss, /\.ink-notif-row-inner\s*{[^}]*display:\s*flex;/);
const notifMobileGridIndex = componentsCss.lastIndexOf('.ink-notif-row-inner {\n    display: grid;');
if (notifBaseRowIndex !== -1 && notifMobileGridIndex !== -1 && notifMobileGridIndex < notifBaseRowIndex) {
  failures.push(
    `${path.join('src/assets/css', '_components.css')} mobile notification row grid guard must follow the base notification row display rule`
  );
}

if (failures.length > 0) {
  console.error('Responsive check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Responsive check passed for ${htmlFiles.length} templates across ${mobileViewportWidths.length} viewport targets: ${mobileViewportWidths.join(', ')}px.`
);

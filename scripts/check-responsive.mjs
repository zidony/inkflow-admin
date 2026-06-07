import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'src');
const cssDir = path.join(srcDir, 'assets', 'css');

const failures = [];

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function listFiles(dir, predicate) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return listFiles(fullPath, predicate);
      return predicate(fullPath) ? [fullPath] : [];
    })
    .sort();
}

function lineNumberFor(source, index) {
  return source.slice(0, index).split(/\r?\n/).length;
}

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

const htmlFiles = listFiles(srcDir, (filePath) => filePath.endsWith('.html'));
for (const filePath of htmlFiles) {
  const source = readText(filePath);
  const tablePattern = /<table\b[^>]*class=["'][^"']*\bink-table\b[^"']*["'][^>]*>/g;
  for (const match of source.matchAll(tablePattern)) {
    if (!hasNearbyResponsiveWrapper(source, match.index)) {
      failures.push(
        `${path.relative(rootDir, filePath)}:${lineNumberFor(source, match.index)} .ink-table is missing a table-responsive or ink-table-wrap container`
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
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*767\.98px\)[\s\S]*\.page-header\s*>\s*\.d-flex\s*{[^}]*width:\s*100%;[^}]*flex-wrap:\s*wrap;[^}]*margin-left:\s*0\s*!important;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*767\.98px\)[\s\S]*\.page-header\s*>\s*\.d-flex\s*>\s*\.btn[\s\S]*flex:\s*1\s+1\s+140px;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*767\.98px\)[\s\S]*\.table-responsive\s*{[^}]*overflow-x:\s*auto;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*767\.98px\)[\s\S]*\.table-responsive\s*>\s*\.ink-table[\s\S]*min-width:\s*720px;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*767\.98px\)[\s\S]*\.ink-card\s*>\s*\.card-header\s*{[^}]*flex-wrap:\s*wrap;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*767\.98px\)[\s\S]*\.ink-card\s*>\s*\.card-header\s+\.ms-auto\s*{[^}]*margin-left:\s*0\s*!important;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*767\.98px\)[\s\S]*\.ink-filter-tabs\s*{[^}]*flex-wrap:\s*wrap;[^}]*min-width:\s*0;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*767\.98px\)[\s\S]*\.ink-dashboard-quick-card\s+\.card-body\s*>\s*\.d-flex\s*{[^}]*flex-wrap:\s*wrap;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*767\.98px\)[\s\S]*\.ink-activity-item\s*{[^}]*flex-wrap:\s*wrap;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*479\.98px\)[\s\S]*\.topbar-create-btn\s*{/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*479\.98px\)[\s\S]*\.topbar-actions\s*{[^}]*justify-content:\s*flex-end;[^}]*margin-left:\s*auto;/],
  ['_components.css', componentsCss, /@media\s*\(max-width:\s*479\.98px\)[\s\S]*\.ink-dashboard-quick-card\s+\.ink-quick-btn-sm[\s\S]*min-width:\s*100%;/],
];

for (const [fileName, source, pattern] of requiredCssGuards) {
  if (!pattern.test(source)) {
    failures.push(`${path.join('src/assets/css', fileName)} is missing a required mobile layout guard`);
  }
}

if (failures.length > 0) {
  console.error('Responsive check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Responsive check passed for ${htmlFiles.length} templates.`);

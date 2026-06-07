import fs from 'node:fs/promises';
import path from 'node:path';
import { fileExistsAsync, listFilesAsync, readTextAsync, rootDir } from './lib/files.mjs';

const distDir = path.join(rootDir, 'dist');
const releaseDir = path.join(rootDir, 'releases');
const blockedPathSegments = ['/node_modules/', '/src/', '/temp/', '/.git/'];
const blockedExtensions = ['.py'];
const allowedExternalResourceFiles = new Set(['README.md', 'README.en.md', 'INSTALL.md']);
const textFileExtensions = new Set([
  '.css',
  '.html',
  '.js',
  '.json',
  '.md',
  '.svg',
  '.txt',
  '.xml'
]);
const externalResourcePatterns = [
  /\b(?:src|href|poster|action)\s*=\s*["'](?:https?:)?\/\//i,
  /url\(\s*["']?(?:https?:)?\/\//i,
  /\b(?:src|href|poster|action)\s*=\s*["']https?:\/\/[^"']*cdn\./i
];

async function collectFiles(rootPath) {
  if (!(await fileExistsAsync(rootPath))) return [];
  return listFilesAsync(rootPath, () => true);
}

function normalizeZipPath(filePath) {
  return filePath.split(path.sep).join('/');
}

function isProjectWoffFont(fileName) {
  const lowerName = path.posix.basename(fileName.toLowerCase());
  return (
    fileName.toLowerCase().endsWith('.woff') &&
    (lowerName.startsWith('plus-jakarta-sans') || lowerName.startsWith('jetbrains-mono'))
  );
}

function isBlockedPackageEntry(fileName) {
  const lowerFile = `/${fileName.toLowerCase()}`;
  return (
    blockedExtensions.some(extension => lowerFile.endsWith(extension)) ||
    blockedPathSegments.some(segment => lowerFile.includes(segment)) ||
    isProjectWoffFont(lowerFile)
  );
}

function isTextFile(filePath) {
  return textFileExtensions.has(path.extname(filePath).toLowerCase());
}

function hasExternalResourceReference(content) {
  return externalResourcePatterns.some(pattern => pattern.test(content));
}

function readUInt16(buffer, offset) {
  return buffer.readUInt16LE(offset);
}

function readUInt32(buffer, offset) {
  return buffer.readUInt32LE(offset);
}

function readZipEntries(buffer) {
  const endSignature = 0x06054b50;
  let endOffset = -1;

  for (let i = buffer.length - 22; i >= 0; i -= 1) {
    if (readUInt32(buffer, i) === endSignature) {
      endOffset = i;
      break;
    }
  }

  if (endOffset === -1) {
    throw new Error('Could not find ZIP central directory.');
  }

  const entryCount = readUInt16(buffer, endOffset + 10);
  let cursor = readUInt32(buffer, endOffset + 16);
  const entries = [];

  for (let i = 0; i < entryCount; i += 1) {
    if (readUInt32(buffer, cursor) !== 0x02014b50) {
      throw new Error('Invalid ZIP central directory entry.');
    }

    const fileNameLength = readUInt16(buffer, cursor + 28);
    const extraLength = readUInt16(buffer, cursor + 30);
    const commentLength = readUInt16(buffer, cursor + 32);
    const nameStart = cursor + 46;
    const nameEnd = nameStart + fileNameLength;

    entries.push(buffer.subarray(nameStart, nameEnd).toString('utf8'));
    cursor = nameEnd + extraLength + commentLength;
  }

  return entries;
}

async function assertVersionConsistency() {
  const packageJson = JSON.parse(await readTextAsync(path.join(rootDir, 'package.json')));
  const packageLock = JSON.parse(await readTextAsync(path.join(rootDir, 'package-lock.json')));
  const packageVersion = packageJson.version;
  const lockVersion = packageLock.version;
  const lockRootVersion = packageLock.packages?.['']?.version;

  if (!packageVersion) {
    throw new Error('package.json is missing a version.');
  }

  if (lockVersion !== packageVersion || lockRootVersion !== packageVersion) {
    throw new Error(
      `Version mismatch: package.json=${packageVersion}, package-lock.json=${lockVersion}, package-lock root=${lockRootVersion}`
    );
  }

  for (const readme of ['README.md', 'README.en.md']) {
    const content = await readTextAsync(path.join(rootDir, readme));
    if (!content.includes(`**v${packageVersion}**`)) {
      throw new Error(`${readme} does not contain the latest version entry **v${packageVersion}**.`);
    }
  }

  return packageJson;
}

async function assertDistContents() {
  const files = await collectFiles(distDir);
  if (!files.length) {
    throw new Error("'dist/' directory does not exist or is empty. Run 'npm run build' first.");
  }

  const blockedFiles = [];
  const externalFiles = [];

  for (const file of files) {
    const relativePath = normalizeZipPath(path.relative(distDir, file));
    if (isBlockedPackageEntry(relativePath)) {
      blockedFiles.push(relativePath);
    }

    if (!isTextFile(file)) continue;

    const content = await readTextAsync(file);
    if (hasExternalResourceReference(content)) {
      externalFiles.push(relativePath);
    }
  }

  if (blockedFiles.length) {
    throw new Error(`dist/ contains blocked files: ${blockedFiles.join(', ')}`);
  }

  if (externalFiles.length) {
    throw new Error(`dist/ contains external resource references: ${externalFiles.join(', ')}`);
  }
}

async function assertZipContents(packageJson) {
  const zipPath = path.join(releaseDir, `${packageJson.name}-v${packageJson.version}.zip`);
  if (!(await fileExistsAsync(zipPath))) {
    console.log('Release ZIP not found; skipped ZIP content checks.');
    return;
  }

  const entries = readZipEntries(await fs.readFile(zipPath));
  const blockedEntries = entries.filter(isBlockedPackageEntry);
  const requiredEntries = [
    `${packageJson.name}-v${packageJson.version}/index.html`,
    `${packageJson.name}-v${packageJson.version}/assets/css/inkflow-admin.css`,
    `${packageJson.name}-v${packageJson.version}/assets/js/inkflow-admin.js`,
    `${packageJson.name}-v${packageJson.version}/README.md`,
    `${packageJson.name}-v${packageJson.version}/README.en.md`,
    `${packageJson.name}-v${packageJson.version}/INSTALL.md`
  ];
  const missingEntries = requiredEntries.filter(entry => !entries.includes(entry));

  if (missingEntries.length) {
    throw new Error(`Release ZIP is missing required files: ${missingEntries.join(', ')}`);
  }

  if (blockedEntries.length) {
    throw new Error(`Release ZIP contains blocked files: ${blockedEntries.join(', ')}`);
  }
}

async function assertRootExternalReferences() {
  const files = await collectFiles(rootDir);
  const scopedFiles = files.filter(file => {
    const relativePath = normalizeZipPath(path.relative(rootDir, file));
    if (relativePath.startsWith('node_modules/') || relativePath.startsWith('.git/')) return false;
    if (allowedExternalResourceFiles.has(relativePath)) return false;
    return relativePath.startsWith('src/') || relativePath.startsWith('dist/');
  });
  const externalFiles = [];

  for (const file of scopedFiles) {
    if (!isTextFile(file)) continue;

    const content = await readTextAsync(file);
    if (hasExternalResourceReference(content)) {
      externalFiles.push(normalizeZipPath(path.relative(rootDir, file)));
    }
  }

  if (externalFiles.length) {
    throw new Error(`Source/build files contain external resource references: ${externalFiles.join(', ')}`);
  }
}

async function checkRelease() {
  console.log('=== Running release checks ===');
  const packageJson = await assertVersionConsistency();
  await assertDistContents();
  await assertZipContents(packageJson);
  await assertRootExternalReferences();
  console.log('Release checks passed.');
}

checkRelease().catch(error => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});

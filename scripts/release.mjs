import { constants } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { deflateRawSync } from 'node:zlib';

const textEncoder = new TextEncoder();

function dosDateTime(date = new Date()) {
  const year = Math.max(date.getFullYear(), 1980);
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { dosDate, dosTime };
}

function makeCrcTable() {
  const table = new Uint32Array(256);

  for (let i = 0; i < 256; i += 1) {
    let crc = i;
    for (let j = 0; j < 8; j += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
    table[i] = crc >>> 0;
  }

  return table;
}

const crcTable = makeCrcTable();

function crc32(buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function uint16(value) {
  const buffer = Buffer.allocUnsafe(2);
  buffer.writeUInt16LE(value);
  return buffer;
}

function uint32(value) {
  const buffer = Buffer.allocUnsafe(4);
  buffer.writeUInt32LE(value >>> 0);
  return buffer;
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function collectFiles(rootDir) {
  const entries = [];

  async function walk(currentDir) {
    const dirents = await fs.readdir(currentDir, { withFileTypes: true });

    for (const dirent of dirents) {
      const absolutePath = path.join(currentDir, dirent.name);

      if (dirent.isDirectory()) {
        await walk(absolutePath);
        continue;
      }

      if (dirent.isFile()) {
        entries.push(absolutePath);
      }
    }
  }

  await walk(rootDir);
  entries.sort((a, b) => a.localeCompare(b));
  return entries;
}

function toZipPath(filePath) {
  return filePath.split(path.sep).join('/');
}

function assertReleaseEntries(entries, folderName) {
  const archiveNames = new Set(entries.map(entry => entry.archiveName));
  const requiredFiles = [
    `${folderName}/index.html`,
    `${folderName}/assets/css/inkflow-admin.css`,
    `${folderName}/assets/js/inkflow-admin.js`,
    `${folderName}/README.md`,
    `${folderName}/README.en.md`,
    `${folderName}/INSTALL.md`
  ];
  const missingFiles = requiredFiles.filter(file => !archiveNames.has(file));

  if (missingFiles.length) {
    throw new Error(`Release package is missing required files: ${missingFiles.join(', ')}`);
  }

  const blockedFiles = [...archiveNames].filter(file => {
    const lowerFile = file.toLowerCase();
    const fileName = path.posix.basename(lowerFile);
    const isProjectFontWoff =
      lowerFile.endsWith('.woff') &&
      (fileName.startsWith('plus-jakarta-sans') || fileName.startsWith('jetbrains-mono'));

    return (
      lowerFile.endsWith('.py') ||
      lowerFile.includes('/node_modules/') ||
      lowerFile.includes('/src/') ||
      lowerFile.includes('/temp/') ||
      lowerFile.includes('/.git/') ||
      isProjectFontWoff
    );
  });

  if (blockedFiles.length) {
    throw new Error(`Release package contains blocked files: ${blockedFiles.join(', ')}`);
  }
}

function createLocalFileHeader({ nameBuffer, crc, compressedSize, uncompressedSize, dosDate, dosTime }) {
  return Buffer.concat([
    uint32(0x04034b50),
    uint16(20),
    uint16(0x0800),
    uint16(8),
    uint16(dosTime),
    uint16(dosDate),
    uint32(crc),
    uint32(compressedSize),
    uint32(uncompressedSize),
    uint16(nameBuffer.length),
    uint16(0),
    nameBuffer
  ]);
}

function createCentralDirectoryHeader({
  nameBuffer,
  crc,
  compressedSize,
  uncompressedSize,
  dosDate,
  dosTime,
  offset
}) {
  return Buffer.concat([
    uint32(0x02014b50),
    uint16(20),
    uint16(20),
    uint16(0x0800),
    uint16(8),
    uint16(dosTime),
    uint16(dosDate),
    uint32(crc),
    uint32(compressedSize),
    uint32(uncompressedSize),
    uint16(nameBuffer.length),
    uint16(0),
    uint16(0),
    uint16(0),
    uint16(0),
    uint32(0),
    uint32(offset),
    nameBuffer
  ]);
}

function createEndOfCentralDirectory({ entryCount, centralDirectorySize, centralDirectoryOffset }) {
  return Buffer.concat([
    uint32(0x06054b50),
    uint16(0),
    uint16(0),
    uint16(entryCount),
    uint16(entryCount),
    uint32(centralDirectorySize),
    uint32(centralDirectoryOffset),
    uint16(0)
  ]);
}

async function createZip(zipPath, entries) {
  const chunks = [];
  const centralDirectory = [];
  let offset = 0;

  for (const entry of entries) {
    const data = await fs.readFile(entry.absolutePath);
    const compressed = deflateRawSync(data, { level: 9 });
    const nameBuffer = Buffer.from(textEncoder.encode(entry.archiveName));
    const stats = await fs.stat(entry.absolutePath);
    const { dosDate, dosTime } = dosDateTime(stats.mtime);
    const metadata = {
      nameBuffer,
      crc: crc32(data),
      compressedSize: compressed.length,
      uncompressedSize: data.length,
      dosDate,
      dosTime,
      offset
    };

    const localHeader = createLocalFileHeader(metadata);
    chunks.push(localHeader, compressed);
    centralDirectory.push(createCentralDirectoryHeader(metadata));
    offset += localHeader.length + compressed.length;
  }

  const centralDirectoryOffset = offset;
  const centralDirectoryBuffer = Buffer.concat(centralDirectory);
  const endRecord = createEndOfCentralDirectory({
    entryCount: entries.length,
    centralDirectorySize: centralDirectoryBuffer.length,
    centralDirectoryOffset
  });

  await fs.mkdir(path.dirname(zipPath), { recursive: true });
  await fs.writeFile(zipPath, Buffer.concat([...chunks, centralDirectoryBuffer, endRecord]));
}

async function release() {
  console.log('=== Starting inkflow-admin automated release packaging ===');

  const rootDir = path.resolve(import.meta.dirname, '..');
  const distDir = path.join(rootDir, 'dist');
  const releaseDir = path.join(rootDir, 'releases');
  const packageJsonPath = path.join(rootDir, 'package.json');

  if (!(await fileExists(distDir))) {
    throw new Error("'dist/' directory does not exist. Please run 'npm run build' first.");
  }

  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
  const version = packageJson.version || '1.0.0';
  const name = packageJson.name || 'inkflow-admin';
  const folderName = `${name}-v${version}`;
  const zipFilename = `${folderName}.zip`;
  const zipPath = path.join(releaseDir, zipFilename);

  if (await fileExists(zipPath)) {
    await fs.rm(zipPath, { force: true });
    console.log(`Removed old package: ${zipFilename}`);
  }

  const entries = [];
  const distFiles = await collectFiles(distDir);

  for (const absolutePath of distFiles) {
    const relativePath = path.relative(distDir, absolutePath);
    entries.push({
      absolutePath,
      archiveName: toZipPath(path.join(folderName, relativePath))
    });
  }

  const readmeFiles = (await fs.readdir(rootDir))
    .filter(file => {
      const lowerFile = file.toLowerCase();
      return (lowerFile.startsWith('readme') || lowerFile === 'install.md') && lowerFile.endsWith('.md');
    })
    .sort((a, b) => a.localeCompare(b));

  for (const file of readmeFiles) {
    entries.push({
      absolutePath: path.join(rootDir, file),
      archiveName: toZipPath(path.join(folderName, file))
    });
    console.log(`Added to ZIP: ${file}`);
  }

  assertReleaseEntries(entries, folderName);

  console.log(`Creating ZIP archive: releases/${zipFilename}...`);
  await createZip(zipPath, entries);

  const size = (await fs.stat(zipPath)).size / 1024;
  console.log(`=== Success! Package created: releases/${zipFilename} ===`);
  console.log(`File size: ${size.toFixed(2)} KB`);
}

release().catch(error => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});

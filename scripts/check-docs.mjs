import path from 'node:path';
import { readTextAsync, rootDir } from './lib/files.mjs';

const docs = [
  {
    file: 'README.md',
    requiredText: [
      'npm run quality',
      'npm run check:i18n',
      'npm run check:js-boundaries',
      'npm run check:tokens',
      'npm run check:docs',
      'npm run release:check',
      'npm run check:release',
      '`bulk-delete`',
      '`copy-field`',
      '`preview-image`',
      '`toggle-comment-status`',
      '`toggle-post-status`',
      '`toggle-user-status`'
    ]
  },
  {
    file: 'README.en.md',
    requiredText: [
      'npm run quality',
      'npm run check:i18n',
      'npm run check:js-boundaries',
      'npm run check:tokens',
      'npm run check:docs',
      'npm run release:check',
      'npm run check:release',
      '`bulk-delete`',
      '`copy-field`',
      '`preview-image`',
      '`toggle-comment-status`',
      '`toggle-post-status`',
      '`toggle-user-status`'
    ]
  },
  {
    file: 'INSTALL.md',
    requiredText: [
      'npm run build',
      'npm run quality',
      'npm run check:tokens',
      'npm run check:docs',
      'npm run release:check',
      'npm run check:release',
      'crossorigin="anonymous"',
      'SRI'
    ]
  }
];

async function checkDocs() {
  const errors = [];

  for (const doc of docs) {
    const content = await readTextAsync(path.join(rootDir, doc.file));
    const missingText = doc.requiredText.filter(text => !content.includes(text));

    if (missingText.length) {
      errors.push(`${doc.file} is missing required release/check documentation: ${missingText.join(', ')}`);
    }
  }

  if (errors.length) {
    throw new Error(`Documentation check failed:\n${errors.join('\n')}`);
  }

  console.log(`Documentation check passed for ${docs.length} files.`);
}

checkDocs().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});

// Copies the above-the-fold faces out of node_modules into public/fonts/ so we
// can <link rel="preload"> stable, un-hashed URLs.
// Runs on predev/prebuild. Safe to run repeatedly; skips if a source is missing.
import { mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'node_modules', '@fontsource', 'akatab', 'files');
const outDir = join(root, 'public', 'fonts');

// 400 = body copy, 600 = display/headings. Both render above the fold.
const faces = [
  'akatab-latin-400-normal.woff2',
  'akatab-latin-600-normal.woff2',
];

if (!existsSync(srcDir)) {
  console.warn('[copy-fonts] font package not installed yet; skipping preload copy.');
  process.exit(0);
}

mkdirSync(outDir, { recursive: true });

const copied = [];
for (const name of faces) {
  const from = join(srcDir, name);
  if (existsSync(from)) {
    copyFileSync(from, join(outDir, name));
    copied.push(name);
  } else {
    console.warn(`[copy-fonts] missing expected face: ${name}`);
  }
}

console.log(`[copy-fonts] copied ${copied.length} face(s) -> public/fonts/`);

// Astro emits the full-size original of every image imported through a content
// collection's `image()` helper into dist/_astro, even when only generated derivatives
// are ever referenced (https://github.com/withastro/astro/issues/11887). Those
// originals are dead weight in the deploy: no built file links to them, so nothing
// downloads them, but they still get uploaded and stored.
//
// This removes any image in dist/_astro that no built file mentions. It is deliberately
// limited to image files inside _astro — CSS and JS chunks are left alone, since Vite
// can reference those in ways a text scan would not catch.

import { existsSync, readdirSync, readFileSync, statSync, unlinkSync } from 'node:fs';
import path from 'node:path';

const DIST = 'dist';
const ASSET_DIR = path.join(DIST, '_astro');
const IMAGE_EXT = /\.(?:jpe?g|png|webp|avif|gif|svg)$/i;
const TEXT_EXT = /\.(?:html|css|js|mjs|json|xml|txt)$/i;
const IMAGE_REF = /[\w.-]+\.(?:jpe?g|png|webp|avif|gif|svg)/gi;

if (!existsSync(ASSET_DIR)) {
  console.log('[prune] no dist/_astro directory, nothing to do');
  process.exit(0);
}

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });

const allFiles = walk(DIST);

// Collect every image filename mentioned anywhere in the output — including inside
// CSS url() and JS chunks, not just HTML src attributes.
const referenced = new Set();
for (const file of allFiles) {
  if (!TEXT_EXT.test(file)) continue;
  for (const match of readFileSync(file, 'utf8').matchAll(IMAGE_REF)) {
    referenced.add(match[0]);
  }
}

let removed = 0;
let bytes = 0;
for (const file of allFiles) {
  if (!file.startsWith(ASSET_DIR) || !IMAGE_EXT.test(file)) continue;
  if (referenced.has(path.basename(file))) continue;
  bytes += statSync(file).size;
  unlinkSync(file);
  removed += 1;
}

console.log(
  removed
    ? `[prune] removed ${removed} unreferenced image(s) from _astro, ${(bytes / 1048576).toFixed(1)}MB freed`
    : '[prune] no unreferenced images in _astro'
);

#!/usr/bin/env node
// Copies shared HTML blocks from a source page into its location pages, so
// sizes, dimensions and tonnage are only ever edited in one place.
//
//   node scripts/sync-shared.mjs          update every location page
//   node scripts/sync-shared.mjs --check  exit 1 if any page has drifted (run before deploy)
//
// A block is everything between <!-- SHARED:<name>:start ... --> and
// <!-- SHARED:<name>:end -->. Edit it in the source page only.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// One entry per shared block. Targets are matched by file name.
const BLOCKS = [
  { name: 'bin-types', source: 'bin-rentals.html', targets: /^bin-rentals-[a-z-]+\.html$/ },
];

const check = process.argv.includes('--check');

function blockPattern(name) {
  return new RegExp(
    `(<!-- SHARED:${name}:start[^>]*-->)([\\s\\S]*?)(<!-- SHARED:${name}:end -->)`
  );
}

let drifted = 0;
let updated = 0;

for (const block of BLOCKS) {
  const pattern = blockPattern(block.name);
  const sourceHtml = readFileSync(join(ROOT, block.source), 'utf8');
  const sourceMatch = sourceHtml.match(pattern);
  if (!sourceMatch) {
    console.error(`✗ ${block.source}: no SHARED:${block.name} markers found`);
    process.exit(1);
  }
  const body = sourceMatch[2];

  const targets = readdirSync(ROOT).filter((f) => block.targets.test(f));
  for (const file of targets) {
    const path = join(ROOT, file);
    const html = readFileSync(path, 'utf8');
    const match = html.match(pattern);
    if (!match) {
      console.error(`✗ ${file}: missing SHARED:${block.name} markers`);
      drifted++;
      continue;
    }
    if (match[2] === body) {
      console.log(`✓ ${file}: ${block.name} in sync`);
      continue;
    }
    if (check) {
      console.error(`✗ ${file}: ${block.name} differs from ${block.source}`);
      drifted++;
    } else {
      writeFileSync(path, html.replace(pattern, (_, start, _old, end) => start + body + end));
      console.log(`↻ ${file}: ${block.name} updated from ${block.source}`);
      updated++;
    }
  }
}

if (check && drifted) {
  console.error(`\n${drifted} block(s) out of sync. Run: node scripts/sync-shared.mjs`);
  process.exit(1);
}
if (!check) console.log(`\nDone. ${updated} file(s) updated.`);

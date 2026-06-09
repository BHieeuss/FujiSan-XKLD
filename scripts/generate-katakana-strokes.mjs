import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const glyphs = Array.from(
  'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン' +
    'ガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポャュョ',
);

const sourceBase = 'https://raw.githubusercontent.com/parsimonhi/animCJK/master';
const outputPath = path.resolve('src/app/pages/katakana/stroke-data.generated.ts');

function parseStart(pathData) {
  const match = pathData.match(/M\s*(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)/i);
  return match ? { x: Number(match[1]), y: Number(match[2]) } : undefined;
}

function parseSvg(glyph, svg) {
  const outlines = Array.from(
    svg.matchAll(/<path\s+id="z\d+d[^"]*"\s+d="([^"]+)"\s*\/>/g),
    (match) => match[1],
  );
  const mediansByStroke = new Map();

  for (const match of svg.matchAll(
    /<path[^>]*clip-path="url\(#z\d+c([^"]+)\)"[^>]*d="([^"]+)"\s*\/>/g,
  )) {
    const strokeMatch = match[1].match(/^(\d+)/);
    if (!strokeMatch) {
      continue;
    }

    const strokeNumber = Number(strokeMatch[1]);
    const candidates = mediansByStroke.get(strokeNumber) ?? [];
    candidates.push(match[2]);
    mediansByStroke.set(strokeNumber, candidates);
  }

  const medians = Array.from(mediansByStroke.entries())
    .sort(([a], [b]) => a - b)
    .map(
      ([, candidates]) =>
        candidates.find((candidate) => {
          const start = parseStart(candidate);
          return start && start.x >= 0 && start.x <= 1024 && start.y >= 0 && start.y <= 1024;
        }) ?? candidates[0],
    );

  if (!outlines.length || !medians.length) {
    throw new Error(`Could not parse stroke data for ${glyph}`);
  }

  return { glyph, viewBox: '0 0 1024 1024', outlines, medians };
}

async function main() {
  const entries = {};

  for (const glyph of glyphs) {
    const fileName = `${glyph.codePointAt(0)}.svg`;
    const response = await fetch(`${sourceBase}/svgsJaKana/${fileName}`);
    if (!response.ok) {
      throw new Error(`Failed to download ${glyph}: ${response.status}`);
    }
    entries[glyph] = parseSvg(glyph, await response.text());
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  const generated = `// Generated from AnimCJK kana SVG files. Do not edit by hand.
// Source: https://github.com/parsimonhi/animCJK (LGPL-3.0-or-later)

import { GlyphStrokeData } from '../hiragana/stroke-data.generated';

export const KATAKANA_STROKES: Record<string, GlyphStrokeData> = ${JSON.stringify(entries, null, 2)};
`;
  await writeFile(outputPath, generated, 'utf8');
  console.log(`Generated ${Object.keys(entries).length} glyphs at ${outputPath}`);
}

await main();

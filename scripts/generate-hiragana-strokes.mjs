import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const glyphs = Array.from(
  'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん' +
    'がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽゃゅょ',
);

const sourceBase = 'https://raw.githubusercontent.com/parsimonhi/animCJK/master';
const outputPath = path.resolve('src/app/pages/hiragana/stroke-data.generated.ts');
const licenseDirectory = path.resolve('src/assets/licenses');

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
    .map(([, candidates]) => {
      return (
        candidates.find((candidate) => {
          const start = parseStart(candidate);
          return start && start.x >= 0 && start.x <= 1024 && start.y >= 0 && start.y <= 1024;
        }) ?? candidates[0]
      );
    });

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
  await mkdir(licenseDirectory, { recursive: true });

  const generated = `// Generated from AnimCJK kana SVG files. Do not edit by hand.
// Source: https://github.com/parsimonhi/animCJK (LGPL-3.0-or-later)

export interface GlyphStrokeData {
  glyph: string;
  viewBox: string;
  outlines: string[];
  medians: string[];
}

export const HIRAGANA_STROKES: Record<string, GlyphStrokeData> = ${JSON.stringify(entries, null, 2)};
`;
  await writeFile(outputPath, generated, 'utf8');

  const licenseResponse = await fetch(`${sourceBase}/licenses/LGPL.txt`);
  if (!licenseResponse.ok) {
    throw new Error(`Failed to download AnimCJK license: ${licenseResponse.status}`);
  }
  await writeFile(
    path.join(licenseDirectory, 'animcjk-LGPL.txt'),
    await licenseResponse.text(),
    'utf8',
  );
  await writeFile(
    path.join(licenseDirectory, 'animcjk-SOURCE.txt'),
    [
      'AnimCJK kana stroke data',
      'Copyright 2016-2026 FM-SH',
      'Source: https://github.com/parsimonhi/animCJK',
      'Kana SVG files are licensed under LGPL-3.0-or-later.',
      'The generated TypeScript manifest contains outline and median SVG path data.',
      '',
    ].join('\n'),
    'utf8',
  );

  console.log(`Generated ${Object.keys(entries).length} glyphs at ${outputPath}`);
}

await main();

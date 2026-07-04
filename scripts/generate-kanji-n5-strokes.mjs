import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const sourceBase = 'https://raw.githubusercontent.com/KanjiVG/kanjivg/master';
const dataPath = path.resolve('src/app/pages/kanji-n5/kanji-n5.data.ts');
const outputPath = path.resolve('src/app/pages/kanji-n5/kanji-n5-strokes.generated.ts');
const licenseDirectory = path.resolve('src/assets/licenses');

function uniqueKanjiFromData(source) {
  return Array.from(
    new Set(
      Array.from(source.matchAll(/kanji:\s*'([^']+)'/g), (match) => match[1]).filter(
        (glyph) => Array.from(glyph).length === 1,
      ),
    ),
  );
}

function parseStart(pathData) {
  const match = pathData.match(/M\s*(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)/i);
  return match ? { x: Number(match[1]), y: Number(match[2]) } : { x: 0, y: 0 };
}

function decodeXml(value) {
  return value
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function parseSvg(glyph, svg) {
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1] ?? '0 0 109 109';
  const strokes = Array.from(svg.matchAll(/<path\b([^>]*?)\/?>/g))
    .map((match) => {
      const attributes = match[1];
      const id = attributes.match(/\bid="([^"]+)"/)?.[1] ?? '';
      const pathData = attributes.match(/\bd="([^"]+)"/)?.[1];
      return pathData && /-s\d+$/.test(id) ? decodeXml(pathData) : undefined;
    })
    .filter(Boolean)
    .map((pathData, index) => ({
      order: index + 1,
      path: pathData,
      start: parseStart(pathData),
    }));

  if (!strokes.length) {
    throw new Error(`Could not parse KanjiVG stroke data for ${glyph}`);
  }

  return { glyph, viewBox, strokes };
}

async function main() {
  const dataSource = await readFile(dataPath, 'utf8');
  const kanji = uniqueKanjiFromData(dataSource);
  const entries = {};

  for (const glyph of kanji) {
    const codePoint = glyph.codePointAt(0).toString(16).padStart(5, '0');
    const response = await fetch(`${sourceBase}/kanji/${codePoint}.svg`);
    if (!response.ok) {
      throw new Error(`Failed to download ${glyph}: ${response.status}`);
    }
    entries[glyph] = parseSvg(glyph, await response.text());
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  await mkdir(licenseDirectory, { recursive: true });

  const generated = `// Generated from KanjiVG SVG files. Do not edit by hand.
// Source: https://github.com/KanjiVG/kanjivg
// License: Creative Commons Attribution-Share Alike 3.0

export interface KanjiStrokePath {
  order: number;
  path: string;
  start: { x: number; y: number };
}

export interface KanjiStrokeData {
  glyph: string;
  viewBox: string;
  strokes: KanjiStrokePath[];
}

export const KANJI_N5_STROKES: Record<string, KanjiStrokeData> = ${JSON.stringify(entries, null, 2)};
`;
  await writeFile(outputPath, generated, 'utf8');

  const copyingResponse = await fetch(`${sourceBase}/COPYING`);
  if (copyingResponse.ok) {
    await writeFile(
      path.join(licenseDirectory, 'kanjivg-COPYING.txt'),
      await copyingResponse.text(),
      'utf8',
    );
  }

  await writeFile(
    path.join(licenseDirectory, 'kanjivg-SOURCE.txt'),
    [
      'KanjiVG N5 stroke-order data',
      'Copyright Ulrich Apel and KanjiVG contributors',
      'Source: https://github.com/KanjiVG/kanjivg',
      'License: Creative Commons Attribution-Share Alike 3.0',
      'The generated TypeScript manifest contains SVG path data for N5 Kanji stroke order.',
      '',
    ].join('\n'),
    'utf8',
  );

  console.log(`Generated ${Object.keys(entries).length} kanji at ${outputPath}`);
}

await main();


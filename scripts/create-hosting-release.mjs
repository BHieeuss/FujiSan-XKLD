import { createReadStream } from 'node:fs';
import { mkdir, readdir, rm, stat } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, '..');
const buildDirectory = join(projectRoot, 'dist', 'fujisan-website', 'browser');
const outputPath = join(projectRoot, 'deployment', 'viejap-release-20260614.zip');
const storedExtensions = new Set([
  '.aac',
  '.avi',
  '.gif',
  '.gz',
  '.ico',
  '.jpeg',
  '.jpg',
  '.m4a',
  '.mov',
  '.mp3',
  '.mp4',
  '.pdf',
  '.png',
  '.webm',
  '.webp',
  '.xlsx',
  '.zip',
]);

await assertBuildExists();
await mkdir(dirname(outputPath), { recursive: true });
await rm(outputPath, { force: true });

const zip = new JSZip();
const files = await collectFiles(buildDirectory);

for (const path of files) {
  const archivePath = relative(buildDirectory, path).split(sep).join('/');
  const extension = archivePath.slice(archivePath.lastIndexOf('.')).toLowerCase();
  zip.file(archivePath, createReadStream(path), {
    binary: true,
    compression: storedExtensions.has(extension) ? 'STORE' : 'DEFLATE',
  });
}

const stream = zip.generateNodeStream({
  type: 'nodebuffer',
  streamFiles: true,
  compression: 'DEFLATE',
  compressionOptions: { level: 9 },
});
const output = (await import('node:fs')).createWriteStream(outputPath);
stream.pipe(output);

await new Promise((resolvePromise, rejectPromise) => {
  output.on('close', resolvePromise);
  output.on('error', rejectPromise);
  stream.on('error', rejectPromise);
});

const archiveSize = (await stat(outputPath)).size;
console.log(
  `Created ${relative(projectRoot, outputPath)} with ${files.length} files (${formatBytes(archiveSize)}).`,
);

async function assertBuildExists() {
  const buildStats = await stat(buildDirectory).catch(() => undefined);
  if (!buildStats?.isDirectory()) {
    throw new Error(`Build output not found: ${buildDirectory}`);
  }
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? collectFiles(path) : [path];
    }),
  );
  return paths.flat().sort();
}

function formatBytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

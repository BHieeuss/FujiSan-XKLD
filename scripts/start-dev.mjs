import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve('.');
const angularCli = join(root, 'node_modules', '@angular', 'cli', 'bin', 'ng.js');
const adminStorage = join(root, '.local-data', 'admin');
const children = [];
let stopping = false;

mkdirSync(adminStorage, { recursive: true });

function stopAll(exitCode = 0) {
  if (stopping) {
    return;
  }
  stopping = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }

  setTimeout(() => process.exit(exitCode), 250);
}

function start(label, command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: root,
    stdio: 'inherit',
    ...options,
  });
  children.push(child);

  child.on('error', (error) => {
    console.error(`[${label}] Không thể khởi động: ${error.message}`);
    stopAll(1);
  });

  child.on('exit', (code, signal) => {
    if (stopping) {
      return;
    }

    const reason = signal ? `tín hiệu ${signal}` : `mã ${code ?? 0}`;
    console.error(`[${label}] Đã dừng với ${reason}.`);
    stopAll(code ?? 1);
  });
}

console.log('VieJap local: Angular http://localhost:4200');
console.log('VieJap local: PHP API http://127.0.0.1:8081');

start('PHP API', 'php', ['-S', '127.0.0.1:8081', '-t', join(root, 'public')], {
  env: {
    ...process.env,
    VIEJAP_ADMIN_STORAGE: adminStorage,
  },
});

start('Angular', process.execPath, [
  angularCli,
  'serve',
  ...process.argv.slice(2),
]);

process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));
process.on('exit', () => {
  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }
});

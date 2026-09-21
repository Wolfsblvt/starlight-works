import { cp, mkdir, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const pkg = new URL('../packages/starlight-works/', import.meta.url);
await rm(new URL('dist/', pkg), { recursive: true, force: true });
execFileSync(process.execPath, [fileURLToPath(new URL('../node_modules/typescript/bin/tsc', import.meta.url)), '-p', 'packages/starlight-works/tsconfig.json'], { cwd: root, stdio: 'inherit' });
await mkdir(new URL('dist/', pkg), { recursive: true });
await cp(new URL('src/components/', pkg), new URL('dist/components/', pkg), { recursive: true });
await cp(new URL('src/styles.css', pkg), new URL('dist/styles.css', pkg));
await cp(new URL('../LICENSE', import.meta.url), new URL('LICENSE', pkg));

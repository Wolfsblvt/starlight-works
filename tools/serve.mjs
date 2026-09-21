import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const mode = process.argv[2] ?? 'dev';
if (!['dev', 'preview'].includes(mode)) throw new Error('Choose dev or preview.');
let state;
try { state = JSON.parse(await readFile(new URL('../artifacts/consumer.json', import.meta.url), 'utf8')); }
catch (error) { throw new Error('Run npm run test:consumer before starting the fixture.', { cause: error }); }
const root = fileURLToPath(new URL('../', import.meta.url));
if (await readFile(path.join(state.directory, '.starlight-works-fixture'), 'utf8') !== root) throw new Error('The fixture belongs to another checkout.');
const astroDirectory = path.join(state.directory, 'node_modules', 'astro');
const manifest = JSON.parse(await readFile(path.join(astroDirectory, 'package.json'), 'utf8'));
const executable = typeof manifest.bin === 'string' ? manifest.bin : manifest.bin?.astro;
if (typeof executable !== 'string' || !executable) throw new Error('The installed Astro package does not declare its CLI entry.');
const child = spawn(process.execPath, [path.resolve(astroDirectory, executable), mode, '--host', '127.0.0.1', '--port', '4321'], {
  cwd: state.directory,
  stdio: 'inherit',
  env: { ...process.env, WORKS_PROCESSOR: state.processor, WORKS_BASE: state.base },
});
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => child.kill(signal));
child.on('error', (error) => { console.error(error); process.exitCode = 1; });
child.on('exit', (code) => { process.exitCode = code ?? 0; });

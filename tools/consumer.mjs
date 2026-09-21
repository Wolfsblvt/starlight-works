import { cp, mkdir, mkdtemp, readFile, writeFile, rm, lstat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { npm, pack } from './pack.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const artifacts = path.join(root, 'artifacts');
const stateFile = path.join(artifacts, 'consumer.json');
const marker = '.starlight-works-fixture';

async function clean() {
  let state;
  try { state = JSON.parse(await readFile(stateFile, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return; throw error; }
  const candidate = path.resolve(state.directory);
  if (path.dirname(candidate) !== path.resolve(tmpdir()) || !path.basename(candidate).startsWith('starlight-works-consumer-')) throw new Error('Refusing to remove an unowned fixture directory.');
  if (await readFile(path.join(candidate, marker), 'utf8') !== root) throw new Error('Fixture ownership marker does not match this checkout.');
  await rm(candidate, { recursive: true });
  await rm(stateFile);
}
await clean();
if (process.argv.includes('--clean')) process.exit(0);

execFileSync(process.execPath, [path.join(root, 'tools', 'build.mjs')], { cwd: root, stdio: 'inherit' });
const tarball = await pack();
const directory = await mkdtemp(path.join(tmpdir(), 'starlight-works-consumer-'));
await cp(path.join(root, 'fixtures', 'consumer'), directory, { recursive: true });
await writeFile(path.join(directory, marker), root);
const processor = process.env.WORKS_PROCESSOR || 'satteri';
if (!['satteri', 'unified'].includes(processor)) throw new Error(`Unknown fixture processor: ${processor}`);
const base = process.env.WORKS_BASE || '/manual/';
const state = { directory, processor, base, tarball };
await mkdir(artifacts, { recursive: true });
await writeFile(stateFile, JSON.stringify(state, null, 2) + '\n');
const manifestPath = path.join(directory, 'package.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
manifest.dependencies.astro = process.env.WORKS_ASTRO || '7.3.3';
manifest.dependencies['@astrojs/starlight'] = process.env.WORKS_STARLIGHT || '0.42.2';
manifest.dependencies['@wolfsblvt/starlight-works'] = `file:${tarball}`;
if (processor === 'unified') manifest.dependencies['@astrojs/markdown-remark'] = '7.3.1';
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
const env = { ...process.env, WORKS_PROCESSOR: processor, WORKS_BASE: base };
try {
  npm(['install', '--no-audit', '--no-fund'], directory, { stdio: 'inherit', env });
  const installed = path.join(directory, 'node_modules', '@wolfsblvt', 'starlight-works');
  if ((await lstat(installed)).isSymbolicLink()) throw new Error('The consumer must install a tarball, not a workspace link.');
  const versions = { node: process.version, processor, base, packages: {} };
  for (const name of ['astro', '@astrojs/starlight', '@wolfsblvt/starlight-works', '@astrojs/markdown-satteri', ...(processor === 'unified' ? ['@astrojs/markdown-remark'] : [])]) {
    const data = JSON.parse(await readFile(path.join(directory, 'node_modules', name, 'package.json'), 'utf8'));
    versions.packages[name] = { version: data.version, license: data.license };
  }
  await writeFile(path.join(artifacts, 'consumer-versions.json'), JSON.stringify(versions, null, 2) + '\n');
  console.log('Packed consumer:', JSON.stringify(versions, null, 2));
  npm(['run', 'check'], directory, { stdio: 'inherit', env });
  npm(['run', 'build'], directory, { stdio: 'inherit', env });
} finally {
  try { await cp(path.join(directory, 'package-lock.json'), path.join(artifacts, 'consumer-package-lock.json')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}

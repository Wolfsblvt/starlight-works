import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { npm } from '../tools/pack.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
test('the actual npm tarball has a complete public surface, no development tree, and reproducible bytes', async () => {
  const dirs = await Promise.all([1, 2].map(() => mkdtemp(path.join(tmpdir(), 'slw pack test '))));
  try {
    const packs = dirs.map((dir) => JSON.parse(npm(['pack', '--workspace=@wolfsblvt/starlight-works', '--ignore-scripts', '--json', '--pack-destination', dir], root))[0]);
    const files = packs[0].files.map((file) => file.path);
    for (const required of ['package.json', 'LICENSE', 'README.md', 'dist/index.js', 'dist/index.d.ts', 'dist/sidebar.js', 'dist/alerts.js', 'dist/styles.css', 'dist/components/Sidebar.astro', 'dist/components/SidebarList.astro', 'dist/components/SidebarLink.astro']) assert.ok(files.includes(required), required);
    assert.ok(files.every((file) => file.startsWith('dist/') || ['package.json', 'LICENSE', 'README.md'].includes(file)), files.join('\n'));
    const bytes = await Promise.all(packs.map((pack, index) => readFile(path.join(dirs[index], pack.filename))));
    assert.deepEqual(bytes[0], bytes[1]);
    const manifest = JSON.parse(await readFile(new URL('../packages/starlight-works/package.json', import.meta.url), 'utf8'));
    assert.equal(manifest.license, 'MIT');
    assert.equal(manifest.scripts?.postinstall, undefined);
    for (const target of [manifest.exports['.'].types, manifest.exports['.'].import, manifest.exports['./style.css']]) assert.ok(files.includes(target.slice(2)), target);
    assert.ok(packs[0].size < 25000, `Unexpectedly large package: ${packs[0].size} bytes`);
  } finally {
    await Promise.all(dirs.map((dir) => rm(dir, { recursive: true, force: true })));
  }
});

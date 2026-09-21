import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export function npm(args, cwd, options = {}) {
  return execFileSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', args, {
    cwd, encoding: 'utf8', shell: process.platform === 'win32', ...options,
  });
}
export async function pack() {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const out = path.join(root, 'artifacts', 'package');
  await mkdir(out, { recursive: true });
  const [result] = JSON.parse(npm(['pack', '--workspace=@wolfsblvt/starlight-works', '--ignore-scripts', '--json', '--pack-destination', out], root));
  const tarball = path.join(out, result.filename);
  await writeFile(path.join(out, 'pack.json'), JSON.stringify({ ...result, tarball }, null, 2) + '\n');
  return tarball;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  execFileSync(process.execPath, [fileURLToPath(new URL('./build.mjs', import.meta.url))], { stdio: 'inherit' });
  console.log(await pack());
}

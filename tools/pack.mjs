import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export function npm(args, cwd, options = {}) {
  // npm run supplies its real JavaScript entry on every supported platform.
  // Avoid a Windows cmd shell, where paths with spaces or metacharacters become commands.
  const cli = process.env.npm_execpath;
  const execution = { cwd, encoding: 'utf8', ...options, shell: false };
  if (cli) return execFileSync(process.execPath, [cli, ...args], execution);
  if (process.platform === 'win32') throw new Error('Run repository tools through their npm run command so npm can provide its CLI path.');
  return execFileSync('npm', args, execution);
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

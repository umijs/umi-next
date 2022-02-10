import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// @ts-ignore
const __dirname = dirname(fileURLToPath(import.meta.url));

export function getPkgs(opts?: { base?: string }): string[] {
  const base = opts?.base || join(__dirname, '../packages');
  return readdirSync(base).filter((dir) => {
    return !dir.startsWith('.') && existsSync(join(base, dir, 'package.json'));
  });
}

export function eachPkg(
  pkgs: string[],
  fn: (opts: { pkg: string; pkgPath: string }) => void,
  opts?: { base?: string },
) {
  const base = opts?.base || join(__dirname, '../packages');
  pkgs.forEach((pkg) => {
    fn({
      pkg,
      pkgPath: join(base, pkg),
    });
  });
}

export function assert(v: unknown, message: string) {
  if (!v) {
    console.error(message);
    process.exit(1);
  }
}

export function setExcludeFolder(opts: {
  cwd: string;
  pkg: string;
  dirName?: string;
  folders?: string[];
}) {
  const dirName = opts.dirName || 'packages';
  const folders = opts.folders || ['dist', 'compiled'];
  if (!existsSync(join(opts.cwd, '.idea'))) return;
  const configPath = join(opts.cwd, '.idea', 'umi-next.iml');
  let content = readFileSync(configPath, 'utf-8');
  for (const folder of folders) {
    const excludeContent = `<excludeFolder url='file://$MODULE_DIR$/${dirName}/${opts.pkg}/${folder}' />`;
    const replaceMatcher = `<content url="file://$MODULE_DIR$">`;
    if (!content.includes(excludeContent)) {
      content = content.replace(
        replaceMatcher,
        `${replaceMatcher}\n      ${excludeContent}`,
      );
    }
  }
  writeFileSync(configPath, content, 'utf-8');
}

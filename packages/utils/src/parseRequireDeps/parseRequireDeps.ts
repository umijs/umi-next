import resolve from 'resolve';
import { dirname } from 'path';
// @ts-ignore
import crequire from 'crequire';
import { readFileSync } from 'fs';
import winPath from '../winPath/winPath';

function parse(filePath: string): string[] {
  const content = readFileSync(filePath, 'utf-8');
  return (crequire(content) as any[])
    .map<string>(o => o.path)
    .filter(path => path.charAt(0) === '.')
    .map(path =>
      winPath(
        resolve.sync(path, {
          basedir: dirname(filePath),
          extensions: ['.tsx', '.ts', '.jsx', '.js'],
        }),
      ),
    );
}

export default function parseRequireDeps(filePath: string): string[] {
  const queue = [filePath];
  const ret = [winPath(filePath)];

  for (let curr = queue.shift(); !!curr; curr = queue.shift()) {
    const extraPaths = parse(curr);
    if (extraPaths.length) {
      queue.push(...extraPaths);
      ret.push(...extraPaths);
    }
  }

  return ret;
}

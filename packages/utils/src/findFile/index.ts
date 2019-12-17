import { join } from 'path';
import { existsSync } from 'fs';

interface Option {
  baseDir: string;
  type?: 'js' | 'css';
  extnames?: string[];
  filename?: boolean;
}

export type FindFile = (option: Option) => string | string[] | null;

const findFile: FindFile = (option) => {
  const { baseDir, type, filename, extnames = [] } = option;
  const buildInExtnames = {
    // index.js > index.jsx > index.ts > index.tsx
    js: ['.js', '.jsx', '.ts', '.tsx'],
    css: ['.css', '.less', '.scss', '.sass'],
  }
  const fileExtnames = type ? buildInExtnames[type] : extnames;

  return fileExtnames
    .map(fileExtname => filename ? join(baseDir, `${filename}${fileExtname}`) : `${baseDir}${fileExtname}`)
    .find(filePath => {
      return existsSync(filePath);
    }) || null;
}

export default findFile;

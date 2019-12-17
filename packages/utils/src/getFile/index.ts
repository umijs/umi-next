import { join, basename } from 'path';
import { existsSync } from 'fs';

interface Option {
  base: string;
  type?: 'js' | 'css';
  extnames?: string[];
  filename?: boolean;
}

export type GetFile = (option: Option) => { path: string, filename: string } | null;

const getFile: GetFile = (option) => {
  const { base, type, filename, extnames = [] } = option;
  const buildInExtnames = {
    // index.js > index.jsx > index.ts > index.tsx
    js: ['.ts', '.tsx', '.js', '.jsx'],
    css: ['.less', '.sass', '.scss', '.stylus', '.css'],
  }
  const fileExtnames = type ? buildInExtnames[type] : extnames;

  for (const ext of fileExtnames) {
    const path = filename ? join(base, `${filename}${ext}`) : join(`${base}${ext}`);
    console.log('path', path);
    if (existsSync(path)) {
      return {
        path,
        filename: basename(path),
      };
    }
  }

  return null;
}

export default getFile;

import { join } from 'path';
import getFile from './getFile';

const base = join(__dirname, 'fixtures', 'normal');

describe('getFile', () => {
  it('style file', () => {
    const findCSS = filename =>
      getFile({
        base,
        type: 'css',
        filename,
      });
    expect(findCSS('a')).toEqual({
      filename: 'a.css',
      path: join(base, 'a.css'),
    });
    expect(findCSS('b')).toEqual({
      filename: 'b.less',
      path: join(base, 'b.less'),
    });
    expect(findCSS('c')).toEqual({
      filename: 'c.sass',
      path: join(base, 'c.sass'),
    });
    expect(findCSS('d')).toEqual({
      filename: 'd.scss',
      path: join(base, 'd.scss'),
    });
    expect(findCSS('not_exist')).toEqual(null);
  });

  it('js file', () => {
    const findJS = filename =>
      getFile({
        base,
        type: 'js',
        filename,
      });
    const findJSWithoutName = base =>
      getFile({
        base,
        type: 'js',
      });
    expect(findJS('a')).toEqual({
      filename: 'a.js',
      path: join(base, 'a.js'),
    });
    expect(findJS('b')).toEqual({
      filename: 'b.jsx',
      path: join(base, 'b.jsx'),
    });
    expect(findJS('c')).toEqual({
      filename: 'c.ts',
      path: join(base, 'c.ts'),
    });
    expect(findJS('d')).toEqual({
      filename: 'd.tsx',
      path: join(base, 'd.tsx'),
    });
    expect(findJSWithoutName(`${base}/d`)).toEqual({
      filename: 'd.tsx',
      path: join(base, 'd.tsx'),
    });
  });

  it('extra file', () => {
    const findText = filename =>
      getFile({
        base,
        filename,
        extnames: ['.md', '.txt'],
      });

    expect(findText('a')).toEqual({
      filename: 'a.md',
      path: join(base, 'a.md'),
    });
    expect(findText('b')).toEqual({
      filename: 'b.txt',
      path: join(base, 'b.txt'),
    });
  });

  it('extra order file', () => {
    const findJSOrder = filename =>
      getFile({
        base,
        filename,
        extnames: ['.jsx', '.js'],
      });

    expect(findJSOrder('a')).toEqual({
      filename: 'a.jsx',
      path: join(base, 'a.jsx'),
    });
  });
});

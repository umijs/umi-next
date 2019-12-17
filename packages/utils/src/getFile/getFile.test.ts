import { relative, join } from 'path';
import getFile from './getFile';

const fixture = join(__dirname, './fixtures');

describe('getFile', () => {
  it('style file', () => {
    const findCSS = filename =>
      getFile({
        base: fixture,
        type: 'css',
        filename,
      });
    expect(findCSS('a')).toEqual({
      filename: 'a.css',
      path: join(fixture, 'a.css'),
    });
    expect(findCSS('b')).toEqual({
      filename: 'b.less',
      path: join(fixture, 'b.less'),
    });
    expect(findCSS('c')).toEqual({
      filename: 'c.sass',
      path: join(fixture, 'c.sass'),
    });
    expect(findCSS('d')).toEqual({
      filename: 'd.scss',
      path: join(fixture, 'd.scss'),
    });
    expect(findCSS('not_exist')).toEqual(null);
  });

  it('js file', () => {
    const findJS = filename =>
      getFile({
        base: fixture,
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
      path: join(fixture, 'a.js'),
    });
    expect(findJS('b')).toEqual({
      filename: 'b.jsx',
      path: join(fixture, 'b.jsx'),
    });
    expect(findJS('c')).toEqual({
      filename: 'c.ts',
      path: join(fixture, 'c.ts'),
    });
    expect(findJS('d')).toEqual({
      filename: 'd.tsx',
      path: join(fixture, 'd.tsx'),
    });
    expect(findJSWithoutName(`${fixture}/d`)).toEqual({
      filename: 'd.tsx',
      path: join(fixture, 'd.tsx'),
    });
  });

  it('extra file', () => {
    const findText = filename =>
      getFile({
        base: fixture,
        filename,
        extnames: ['.md', '.txt'],
      });

    expect(findText('a')).toEqual({
      filename: 'a.md',
      path: join(fixture, 'a.md'),
    });
    expect(findText('b')).toEqual({
      filename: 'b.txt',
      path: join(fixture, 'b.txt'),
    });
  });

  it('extra order file', () => {
    const findJSOrder = filename =>
      getFile({
        base: fixture,
        filename,
        extnames: ['.jsx', '.js'],
      });

    expect(findJSOrder('a')).toEqual({
      filename: 'a.jsx',
      path: join(fixture, 'a.jsx'),
    });
  });
});

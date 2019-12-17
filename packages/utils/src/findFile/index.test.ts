import { relative, join } from 'path';
import findFile from './';

const fixture = join(__dirname, './fixtures');

describe('findFile', () => {
  it('style file', () => {
    const findCSS = (filename) => findFile({
      baseDir: fixture,
      type: 'css',
      filename,
    })
    expect(relative(fixture, findCSS('a'))).toEqual('a.css');
    expect(relative(fixture, findCSS('b'))).toEqual('b.less');
    expect(relative(fixture, findCSS('c'))).toEqual('c.sass');
    expect(relative(fixture, findCSS('d'))).toEqual('d.scss');
    expect(findCSS('not_exist')).toEqual(null);
  })

  it('js file', () => {
    const findJS = (filename) => findFile({
      baseDir: fixture,
      type: 'js',
      filename,
    })
    const findJSWithoutName = (baseDir) => findFile({
      baseDir,
      type: 'js',
    })
    expect(relative(fixture, findJS('a'))).toEqual('a.js');
    expect(relative(fixture, findJS('b'))).toEqual('b.jsx');
    expect(relative(fixture, findJS('c'))).toEqual('c.ts');
    expect(relative(fixture, findJS('d'))).toEqual('d.tsx');
    expect(relative(fixture, findJSWithoutName(`${fixture}/d`))).toEqual('d.tsx');
  })

  it('extra file', () => {
    const findText = (filename) => findFile({
      baseDir: fixture,
      filename,
      extnames: [ '.md', '.txt' ],
    })

    expect(relative(fixture, findText('a'))).toEqual('a.md');
    expect(relative(fixture, findText('b'))).toEqual('b.txt');
  })

  it('extra order file', () => {
    const findJSOrder = (filename) => findFile({
      baseDir: fixture,
      filename,
      extnames: [ '.jsx', '.js' ],
    })

    expect(relative(fixture, findJSOrder('a'))).toEqual('a.jsx');
  })
})

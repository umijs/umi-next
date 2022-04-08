import { join } from 'path';
import type { ConsoleMessage } from 'playwright-chromium';
import { createServer, createUmi } from 'test-utils';

jest.setTimeout(35 * 1000);

let logs: string[] = [];

const onConsole = (msg: ConsoleMessage) => {
  logs.push(msg.text());
};

test('boilerplate e2e', async () => {
  try {
    page.on('console', onConsole);

    const cwd = join(__dirname, '..');

    const project = createUmi({
      cwd,
    });

    const { stdout } = await project.run('pnpm', ['build']);

    // build
    expect(stdout).toMatch('Build index.html');
    expect(project.has('dist/index.html')).toBe(true);
    expect(project.has('dist/umi.js')).toBe(true);
    expect(project.has('dist/umi.css')).toBe(true);

    const server = createServer(project.projectRoot);

    const url = await server.run();

    await page.goto(url);

    // console
    const logsStr = logs.join('');

    expect(logsStr).toMatch('head script');
    expect(logsStr).toMatch('hello world from head');
    expect(logsStr).toMatch('hello world');
    expect(logsStr).toMatch('global.ts');
    expect(logsStr).toMatch('entry code ahead');
    expect(logsStr).toMatch('entry code');
    expect(logsStr).toMatch('rerender layout');

    // html
    await expect(page).toMatchText(/Foo/);
    await expect(page).toMatchText(/dataflowProvider/);
    await expect(page).toMatchText(/innerProvider/);
    await expect(page).toMatchText(/global layout/);
    await expect(page).toMatchText(/HomePage/);

    const element = await page.$('body');
    await expect(element).toMatchComputedStyle('color', 'rgb(255, 0, 0)');
    await server.close();
  } finally {
    page.off('console', onConsole);
    logs = [];
  }
});

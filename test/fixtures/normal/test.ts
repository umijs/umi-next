import { IOption } from '../../build.e2e';

export default async function ({ page, host }: IOption) {
  await page.goto(`${host}/`, {
    waitUntil: 'networkidle2',
  });
  const { loaded, define } = await page.evaluate(
    () => ({
      loaded: document.getElementById('loaded').textContent,
      define: document.getElementById('define').textContent,
    })
  );
  expect(loaded).toEqual('true');
  expect(define).toEqual('test');
};

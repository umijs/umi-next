import { prefixes } from './logger';

test('render', () => {
  expect(prefixes.wait).toEqual('\u001B[36mwait\u001B[39m  -');
  expect(prefixes.error).toEqual('\u001B[31merror\u001B[39m -');
  expect(prefixes.warn).toEqual('\u001B[33mwarn\u001B[39m  -');
  expect(prefixes.ready).toEqual('\u001B[32mready\u001B[39m -');
  expect(prefixes.info).toEqual('\u001B[36minfo\u001B[39m  -');
  expect(prefixes.event).toEqual('\u001B[35mevent\u001B[39m -');
})

// TODO: use like logger.wait test for console log
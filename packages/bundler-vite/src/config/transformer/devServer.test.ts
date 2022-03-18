import IConfigProcessor from './devServer';

test('test transform devServer umi config', () => {
  expect(
    IConfigProcessor({ devServer: { port: 11, host: 12, https: 13 } }, {}),
  ).toEqual({
    server: {
      port: 11,
      host: 12,
      https: 13,
    },
  });
});
test('test proxy umi config', () => {
  expect(IConfigProcessor({ proxy: 'proxy' }, {})).toEqual({
    server: {
      proxy: 'proxy',
    },
  });
});

// test('old browser - config', () => {
//   const obj = target({ targets: { ie: 11 } }, {}).plugins;
//   expect(obj).toEqual(
//     expect.arrayContaining([
//       expect.arrayContaining([
//         expect.objectContaining({ name: 'vite:legacy-config' }),
//       ]),
//     ]),
//   );
// });

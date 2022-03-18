import react from "./react";

test('none config', () => {
  const obj = react({}, {}).plugins;
  expect(obj).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        include: {},

      })
    ]),
  );
});

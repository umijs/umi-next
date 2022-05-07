import { replaceDepToAbsPath } from './tplUtils';

test('replace full dep import to abs path', () => {
  const content = "import a from 'fast-deep-equal'";

  expect(replaceDepToAbsPath(content, ['fast-deep-equal'], {})).not.toContain(
    "'fast-deep-equal'",
  );
});

test('skip replace for externalized dep', () => {
  const content = "import a from 'fast-deep-equal'";

  expect(
    replaceDepToAbsPath(content, ['fast-deep-equal'], { 'fast-deep-equal': 1 }),
  ).toContain("'fast-deep-equal'");
});

test('only replace subpath for exact match externalized dep', () => {
  const content = `
import a from 'fast-deep-equal';
import b from 'fast-deep-equal/lib/index';
`;
  const result = replaceDepToAbsPath(content, ['fast-deep-equal'], {
    'fast-deep-equal$': 1,
  });

  expect(result).toContain("'fast-deep-equal'");
  expect(result).not.toContain("'fast-deep-equal/lib/index'");
});

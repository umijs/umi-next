import parseImport from './importParser';

test('import parse with all casee', () => {
  const imports = parseImport(`
import defaultExport /* the default import */ from "module-name";  // comment
import * as name from "module-name"; // intended comments 
import { export1 } from "module-name";
import { export1 as alias1 } from "module-name";
import { export1 , export2 } from "module-name";
import { export1 , export2 as alias2 } from "module-name";
import defaultExport, { export1 } from "module-name";
import defaultExport, * as name from "module-name";
import "module-name";
  `);

  expect(imports).toMatchInlineSnapshot(`
    Array [
      Object {
        "from": "module-name",
        "imports": Array [
          "default",
        ],
      },
      Object {
        "from": "module-name",
        "imports": Array [
          "*",
        ],
      },
      Object {
        "from": "module-name",
        "imports": Array [
          "export1",
        ],
      },
      Object {
        "from": "module-name",
        "imports": Array [
          "export1",
        ],
      },
      Object {
        "from": "module-name",
        "imports": Array [
          "export1",
          "export2",
        ],
      },
      Object {
        "from": "module-name",
        "imports": Array [
          "export1",
          "export2",
        ],
      },
      Object {
        "from": "module-name",
        "imports": Array [
          "default",
          "export1",
        ],
      },
      Object {
        "from": "module-name",
        "imports": Array [
          "default",
          "*",
        ],
      },
      Object {
        "from": "module-name",
        "imports": Array [],
      },
    ]
  `);
});

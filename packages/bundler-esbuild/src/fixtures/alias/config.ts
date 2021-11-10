import { join } from 'path';
export default {
  alias: {
    foo: join(__dirname, 'path', 'foo'),
    dir: join(__dirname, 'path', 'dir'),
    less$: join(__dirname, 'path', 'less'),
  },
};

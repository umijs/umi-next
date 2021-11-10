import { join, dirname } from 'path';
export default {
  alias: {
    react$: dirname(require.resolve('react/package')),
    react: join(__dirname,'react'),
    some: join(__dirname,'some'),
  },
};

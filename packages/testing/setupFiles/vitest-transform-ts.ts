import { register } from '@umijs/utils';
import esbuild from 'esbuild';

register.register({
  implementor: esbuild,
  // avoid source call `register.restore()` stop `.ts` test file transform
  revertible: false,
});

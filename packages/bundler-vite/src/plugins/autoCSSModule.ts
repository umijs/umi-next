import type { Plugin } from 'vite';

/**
 * auto CSS Module
 */
 export default function autoCSSModulePlugin(): Plugin {
  return {
    name: 'bundler-vite:auto-css-module',
    transform(code: string) {
      let result = code;
      const REG_EXP = /(import [a-z]+ from ["'].+\.[css|less|sass|scss|styl|stylus]+)(["'])/;

      if (code.match(REG_EXP)) {
        // @ts-ignore
        result = code.replace(REG_EXP, ($1, $2, $3) => {
          // add cssModule flag to match cssModuleRE. see vite/src/node/plugins/css.ts
          return `${$2}?.module.css${$3}`;
        });
      }

      return {
        code: result,
        map: null,
      };
    },
  };
}

/**
 * auto CSS Module
 */
 export default function autoCSSModulePlugin() {
  return {
    name: 'bundler-vite:auto-css-module',
    transform(code: string) {
      let result = code;
      const REG_EXP = /(import [a-z]+ from ["'].+\.[css|less|sass|scss|styl|stylus|pcss|postcss]+)(["'])/;

      if (code.match(REG_EXP)) {
        result = code.replace(REG_EXP, ($1, $2, $3) => {
          // add cssModule flag to match cssModuleRE. see vite/src/node/plugins/css.ts
          return `${$2}?.module.css${$3}`;
        });
      }

      return {
        code: result,
      };
    },
  };
}
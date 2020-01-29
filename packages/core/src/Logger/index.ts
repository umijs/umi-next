declare module NodeJS {
  interface Process {
    type: string;
    browser: boolean;
    __nwjs: any;
  }
}

if (
  typeof process === 'undefined' ||
  process.type === 'renderer' ||
  process.browser === true ||
  process.__nwjs
) {
  module.exports = require('./browser').default || require('./browser');
} else {
  module.exports = require('./node').default || require('./node');
}

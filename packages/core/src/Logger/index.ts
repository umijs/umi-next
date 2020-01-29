// @ts-ignore
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

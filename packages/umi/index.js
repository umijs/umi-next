let ex = require('./lib/cjs');
try {
  const umiExports = require('@@/umiExports');
  ex = Object.assign(ex, umiExports);
} catch (e) {}
module.exports = ex;

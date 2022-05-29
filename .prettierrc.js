module.exports = {
  printWidth: 80,
  singleQuote: true,
  trailingComma: 'all',
  proseWrap: 'never',
  plugins: [
    require.resolve('prettier-plugin-packagejson'),
    './scripts/prettier-plugin',
  ],
};

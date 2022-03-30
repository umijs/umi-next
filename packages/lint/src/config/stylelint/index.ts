/**
 * rules migrate from @umijs/fabric/dist/stylelint.js
 * @see https://github.com/umijs/fabric/blob/master/src/stylelint.ts
 */
module.exports = {
  extends: [
    require.resolve('stylelint-config-css-modules'),
    require.resolve('stylelint-config-standard'),
    require.resolve('stylelint-config-prettier'),
    require.resolve('@stylelint/postcss-css-in-js'),
    require.resolve('postcss-syntax'),
    require.resolve('stylelint-config-standard'),
  ],
  plugins: [
    require.resolve('stylelint-declaration-block-no-ignored-properties'),
  ],
  rules: {
    'no-descending-specificity': null,
    'function-url-quotes': 'always',
    'selector-attribute-quotes': 'always',
    'font-family-no-missing-generic-family-keyword': null, // iconfont
    'plugin/declaration-block-no-ignored-properties': true,
    'unit-no-unknown': [true, { ignoreUnits: ['rpx'] }],
    // webcomponent
    'selector-type-no-unknown': null,
    'value-keyword-case': ['lower', { ignoreProperties: ['composes'] }],
  },
  customSyntax: require.resolve('postcss-less'),
  ignoreFiles: ['node_modules', '**/*.js', '**/*.jsx', '**/*.tsx', '**/*.ts'],
  overrides: [
    {
      files: [
        '*.js',
        '**/*.js',
        '*.jsx',
        '**/*.jsx',
        '*.ts',
        '**/*.ts',
        '*.tsx',
        '**/*.tsx',
      ],
      customSyntax: '@stylelint/postcss-css-in-js',
    },
  ],
};

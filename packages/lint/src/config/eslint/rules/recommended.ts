/**
 * recommended enabled/disabled rules for umi project
 * @note  base on recommended rule set from loaded eslint plugins
 */
export default {
  // eslint built-in rules
  // 不需要返回就用 forEach
  'array-callback-return': 2,
  // eqeq 可能导致潜在的类型转换问题
  'eqeqeq': 2,
  // 不加 hasOwnProperty 判断会多出原型链的内容
  'guard-for-in': 2,
  'no-class-assign': 0,
  'no-compare-neg-zero': 0,
  'no-cond-assign': 0,
  'no-constant-condition': 0,
  'no-control-regex': 0,
  'no-empty': 0,
  'no-empty-character-class': 0,
  'no-empty-pattern': 0,
  // eval（）可能导致潜在的安全问题
  'no-eval': 2,
  'no-extra-boolean-cast': 0,
  'no-fallthrough': 0,
  'no-inner-declarations': 0,
  'no-irregular-whitespace': 0,
  'no-misleading-character-class': 0,
  // 没必要改 native 变量
  'no-native-reassign': 2,
  'no-octal': 0,
  // 修改对象时，会影响原对象；但是有些场景就是有目的
  'no-param-reassign': 2,
  // return 值无意义，可能会理解为 resolve
  'no-promise-executor-return': 2,
  'no-regex-spaces': 0,
  'no-self-compare': 2,
  'no-var': 2,

  // config-plugin-react rules
  // button 自带 submit 属性
  'react/button-has-type': 2,
  'react/default-props-match-prop-types': 0,
  'react/no-invalid-html-attribute': 0,

  // config-plugin-jest rules
  'jest/no-done-callback': 0,
  // 不用限制 xit 之类的用法
  'jest/no-test-prefixes': 0,
  // 短期 skip 部分测试用例可能会用到
  'jest/no-disabled-tests': 0,
  'jest/no-commented-out-tests': 0,
  'jest/expect-expect': 0,
};

/**
 * recommended enabled/disabled rules for typescript umi project
 * @note  base on recommended rule set from loaded eslint plugins
 */
export const typescript={
  // config-plugin-typescript rules
  '@typescript-eslint/no-confusing-non-null-assertion': 2,
  '@typescript-eslint/no-dupe-class-members': 2,
  '@typescript-eslint/no-invalid-this': 1,
  '@typescript-eslint/no-loop-func': 2,
  '@typescript-eslint/no-redeclare': 2,
  '@typescript-eslint/no-unused-expressions': 2,
  '@typescript-eslint/no-unused-vars': 2,
  '@typescript-eslint/no-use-before-define': 2,
  '@typescript-eslint/no-useless-constructor': 2,
};

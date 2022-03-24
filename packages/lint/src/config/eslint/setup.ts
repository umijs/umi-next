// patch eslint plugin resolve logic
require('@rushstack/eslint-patch/modern-module-resolution');

/**
 * support to disable type aware related rules, to speed up for pre-commit
 * @see https://github.com/umijs/fabric/pull/123
 */
export const TYPE_AWARE_ENABLE = process.env.DISABLE_TYPE_AWARE === undefined;

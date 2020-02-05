import { lodash } from '@umijs/utils';
import { ScriptConfig } from '@umijs/types';

// 方便测试
export const getScripts = (option: ScriptConfig): ScriptConfig => {
  if (Array.isArray(option) && option.length > 0) {
    return option
      .filter(script => !lodash.isEmpty(script))
      .map(aScript => {
        if (typeof aScript === 'string') {
          return /^(http:|https:)?\/\//.test(aScript)
            ? { src: aScript }
            : { content: aScript };
        }
        // [{ content: '', async: true, crossOrigin: true }]
        return aScript;
      });
  }
  return [];
};

import { useThemeContext } from './context';

interface useLanguageResult {
  isFromPath: boolean;
  currentLanguage: { locale: string; text: string } | undefined;
  languages: { locale: string; text: string }[];
  switchLanguage: (locale: string) => void;
  render: (key: string) => string;
}

function useLanguage(): useLanguageResult {
  const { themeConfig, location, appData } = useThemeContext()!;

  const languages = themeConfig.i18n;
  let currentLanguage: { locale: string; text: string } | undefined = undefined;
  let isFromPath: boolean;

  const s = location.pathname.split('/')[1];

  // 用户当前访问的页面是否有在路径中指定语言
  isFromPath = !!(s && s.match(/^[a-z]{2}-[A-Z]{2}$/));

  if (isFromPath)
    currentLanguage = languages?.find(
      (item) => item.locale === location.pathname.split('/')[1],
    );
  else currentLanguage = languages && languages[0] ? languages[0] : undefined;

  function switchLanguage(locale: string) {
    if (!languages || languages.length === 0) return;

    if (!languages.find((l) => l.locale === locale)) return;

    // 切换到默认语言
    if (locale === languages[0].locale && isFromPath) {
      let p = location.pathname.split('/');
      p.shift();
      p.shift();
      window.location.pathname = p.join('/');
      return;
    }

    let p = location.pathname.split('/');
    p.shift();

    // 在首页进行语言切换
    if (p.length === 1 && p[0] === '') {
      // 首页没有这个语言，回到默认语言的首页
      if (!appData.routes['README.' + locale]) {
        isFromPath && (window.location.pathname = location.pathname);
        return;
      }
      window.location.pathname = locale;
      return;
    }

    // 如果要跳转的页面没有当前语言，fallback 到默认语言
    if (!appData.routes[p.join('/') + '.' + locale]) {
      isFromPath && (window.location.pathname = location.pathname);
      return;
    }

    // 当前在默认语言，切换到其他语言
    if (!isFromPath) {
      window.location.pathname = locale + location.pathname;
      return;
    }

    p = location.pathname.split('/');
    p[1] = locale;
    window.location.pathname = p.join('/');
  }

  function render(key: string) {
    if (!currentLanguage || !themeConfig.locales) return key;
    if (!themeConfig.locales[currentLanguage.locale]) return key;
    return themeConfig.locales[currentLanguage.locale][key] || key;
  }

  return {
    isFromPath,
    currentLanguage,
    languages: languages || [],
    switchLanguage,
    render,
  };
}

export default useLanguage;

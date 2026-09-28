export const THEME_STORAGE_KEY = 'ablin-theme';

export const DEFAULT_THEMES = ['system', 'light', 'dark'] as const;
export type DefaultTheme = (typeof DEFAULT_THEMES)[number];

/**
 * Runs synchronously in <head> before first paint so the stored choice is applied with no flash. With no stored
 * choice, the admin's `settings:site.defaultTheme` applies; 'system' leaves it to prefers-color-scheme (tokens.css).
 */
export function themeInitScript(defaultTheme: DefaultTheme = 'system'): string {
  const fallback = defaultTheme === 'system' ? '' : defaultTheme;
  return `try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t!=='light'&&t!=='dark')t='${fallback}';if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}`;
}

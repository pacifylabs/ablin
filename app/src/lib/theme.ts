export const THEME_STORAGE_KEY = 'ablin-theme';

/**
 * Runs synchronously in <head> before first paint so the stored choice is applied with no flash.
 * With no stored choice the CSS falls back to prefers-color-scheme (tokens.css).
 */
export const themeInitScript = `try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}`;

import { useSyncExternalStore } from 'react';
export const themeKey = 'legends-field-theme';
const listeners = new Set();
let preference = null;
let theme = 'light';
export function resolveTheme(saved, prefersDark) { return saved === 'light' || saved === 'dark' ? saved : prefersDark ? 'dark' : 'light'; }
function apply(value) {
  theme = value;
  if (typeof document !== 'undefined') { document.documentElement.dataset.theme = value; document.documentElement.style.colorScheme = value; document.documentElement.style.backgroundColor = value === 'dark' ? '#141c17' : '#f7f6f1'; }
  listeners.forEach(listener => listener());
}
// Runs synchronously when the UI entry module is evaluated, before React's first render.
if (typeof window !== 'undefined') {
  try { preference = window.localStorage.getItem(themeKey); } catch { /* Private/storage-disabled mode still supports an in-memory choice. */ }
  const media = window.matchMedia?.('(prefers-color-scheme: dark)');
  apply(resolveTheme(preference, media?.matches));
  media?.addEventListener('change', event => { if (!['light','dark'].includes(preference)) apply(resolveTheme(null,event.matches)); });
  window.addEventListener('storage', event => { if (event.key === themeKey || event.key === null) { preference = event.newValue; apply(resolveTheme(preference,media?.matches)); } });
}
export function setTheme(value) {
  if (!['light','dark','system'].includes(value)) return;
  preference = value;
  try { window.localStorage.setItem(themeKey,value); } catch { /* Preference remains active for this tab. */ }
  apply(resolveTheme(value, window.matchMedia?.('(prefers-color-scheme: dark)')?.matches));
}
function subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); }
export function useThemePreference() { return useSyncExternalStore(subscribe, () => ['light','dark'].includes(preference) ? preference : 'system', () => 'system'); }
export function useTheme() { return useSyncExternalStore(subscribe, () => theme, () => 'light'); }

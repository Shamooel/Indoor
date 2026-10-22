import React, { useId } from 'react';
import { setTheme, useThemePreference } from '../state/theme';
export default function ThemeToggle() {
  const preference = useThemePreference();
  const id = useId();
  return <div className="theme-control"><label htmlFor={id}>Appearance</label><select id={id} className="theme-toggle" value={preference} onChange={event => setTheme(event.target.value)}><option value="light">Light</option><option value="dark">Dark</option><option value="system">Follow System</option></select></div>;
}

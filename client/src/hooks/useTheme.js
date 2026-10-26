/**
 * Hook: tema claro/oscuro. Se guarda en localStorage y en data-theme del <html>.
 */
import { useEffect, useState } from 'react';

// Tema claro/oscuro persistente.
export default function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('theme', theme); } catch (e) {}
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  return [theme, toggle];
}

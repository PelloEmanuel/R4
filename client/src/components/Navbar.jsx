/**
 * Barra de navegación fija: enlaces a cada sección, botón Admin, tema claro/oscuro y menú móvil.
 */
import { useState } from 'react';
import useActiveSection from '../hooks/useActiveSection';

// Cada enlace es [id de la sección, texto del menú].
const LINKS = [
  ['sobre-mi', 'Sobre mí'], ['habilidades', 'Habilidades'], ['trayectoria', 'Trayectoria'],
  ['logros', 'Logros'], ['proyectos', 'Proyectos'],
];
const IDS = LINKS.map(([id]) => id);

export default function Navbar({ theme, onToggleTheme }) {
  // Controla si el menú móvil está desplegado.
  const [open, setOpen] = useState(false);
  // Sección visible en pantalla, para resaltarla en el menú.
  const active = useActiveSection(IDS);

  return (
    <header className="nav">
      <a className="nav__brand" href="#inicio">R4</a>
      <nav className={`nav__links ${open ? 'is-open' : ''}`} aria-label="Principal">
        {LINKS.map(([id, label]) => (
          <a key={id} href={`#${id}`} className={active === id ? 'is-active' : ''} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}
        {/* Va a /admin, que pide contraseña antes de mostrar nada (ver AdminApp.jsx) */}
        <a href="/admin" className="nav__admin">Admin</a>
      </nav>
      <div className="nav__actions">
        <button className="icon-btn" onClick={onToggleTheme} aria-label={`Cambiar a tema ${theme === 'dark' ? 'claro' : 'oscuro'}`}>
          {theme === 'dark' ? '☀' : '☾'}
        </button>
        <button className="icon-btn nav__burger" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Abrir menú">
          {open ? '✕' : '☰'}
        </button>
      </div>
    </header>
  );
}

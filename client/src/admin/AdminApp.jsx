/**
 * Panel de administración (/admin). Sin sesión muestra el login; con sesión, pestañas por sección.
 */
import { useEffect, useState } from 'react';
import { getToken, setToken, setUnauthorizedHandler } from './api';
import AdminLogin from './AdminLogin';
import ProfileAdmin from './sections/ProfileAdmin';
import SkillsAdmin from './sections/SkillsAdmin';
import ExperienceAdmin from './sections/ExperienceAdmin';
import AchievementsAdmin from './sections/AchievementsAdmin';
import ProjectsAdmin from './sections/ProjectsAdmin';

// Cada pestaña es [clave, texto, componente que la dibuja].
const TABS = [
  ['perfil', 'Perfil', ProfileAdmin],
  ['habilidades', 'Habilidades', SkillsAdmin],
  ['trayectoria', 'Trayectoria', ExperienceAdmin],
  ['logros', 'Logros', AchievementsAdmin],
  ['proyectos', 'Proyectos', ProjectsAdmin],
];

export default function AdminApp() {
  // authed: ¿hay contraseña válida? tab: pestaña actual.
  const [authed, setAuthed] = useState(!!getToken());
  const [tab, setTab] = useState('perfil');

  // Si algún pedido recibe 401, se vuelve al login.
  useEffect(() => {
    setUnauthorizedHandler(() => setAuthed(false));
  }, []);

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />;
  }

  // Componente de la pestaña elegida.
  const ActiveSection = TABS.find(([key]) => key === tab)[2];

  return (
    <div className="admin">
      <header className="admin__header">
        <div>
          <h1>Administrar portfolio</h1>
          <a href="/" className="admin__back">← Ver portfolio</a>
        </div>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => { setToken(''); setAuthed(false); }}
        >
          Salir
        </button>
      </header>

      <nav className="admin__tabs" role="tablist">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            className={tab === key ? 'is-active' : ''}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="admin__content">
        <ActiveSection />
      </main>
    </div>
  );
}

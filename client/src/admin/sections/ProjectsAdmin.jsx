/**
 * ABM de Proyectos. Carga las habilidades para elegir con qué tecnologías se hizo cada proyecto.
 */
import { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import CrudSection from '../CrudSection';

export default function ProjectsAdmin() {
  const [skills, setSkills] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setSkills(await apiFetch('/api/admin/skills'));
      } catch (err) {
        setError(err.message);
      }
    })();
  }, []);

  // Se arma dentro del componente porque las opciones de "Tecnologías" vienen de la API.
  const fields = [
    { name: 'title', label: 'Título', type: 'text', required: true },
    { name: 'description', label: 'Descripción', type: 'textarea', required: true },
    { name: 'repo_url', label: 'Link al repositorio', type: 'text' },
    { name: 'demo_url', label: 'Link a la demo (opcional)', type: 'text' },
    {
      name: 'skill_ids',
      label: 'Tecnologías',
      type: 'multiselect',
      options: skills.map((s) => ({ value: s.id, label: s.name })),
      fromItem: (p) => p.skills.map((s) => s.id),
    },
  ];

  return (
    <CrudSection
      title="Proyectos"
      endpoint="/api/admin/projects"
      fields={fields}
      itemTitle={(p) => p.title}
      itemSubtitle={(p) => (p.skills.length ? p.skills.map((s) => s.name).join(', ') : 'Sin tecnologías asignadas')}
      emptyMessage="Todavía no cargaste proyectos."
      /* Los ids de los checkboxes llegan como texto: se convierten a número. */
      buildPayload={(v) => ({ ...v, skill_ids: v.skill_ids.map(Number) })}
      extra={error && <p className="admin-error" role="alert">{error}</p>}
    />
  );
}

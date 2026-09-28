import { useMemo, useState } from 'react';
import Section from './Section';

// Cada tarjeta completa es un link al repositorio de GitHub.
export default function Projects({ projects }) {
  const [filter, setFilter] = useState('Todos');
  const tags = useMemo(() => ['Todos', ...new Set(projects.flatMap((p) => p.skills))], [projects]);
  const visible = filter === 'Todos' ? projects : projects.filter((p) => p.skills.includes(filter));

  return (
    <Section id="proyectos" title="Proyectos">
      <div className="chips" role="group" aria-label="Filtrar por tecnología">
        {tags.map((t) => (
          <button key={t} className={filter === t ? 'is-active' : ''} aria-pressed={filter === t} onClick={() => setFilter(t)}>
            {t}
          </button>
        ))}
      </div>
      <div className="grid">
        {visible.map((p) => (
          <a key={p.id} className="card card--project" href={p.repo_url} target="_blank" rel="noreferrer">
            <h3>{p.title}</h3>
            <p>{p.description}</p>
            <ul className="tags">{p.skills.map((s) => <li key={s}>{s}</li>)}</ul>
            <span className="card__links">Ver en GitHub →</span>
          </a>
        ))}
      </div>
    </Section>
  );
}

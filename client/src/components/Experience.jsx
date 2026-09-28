import { useState } from 'react';
import Section from './Section';

const fmt = (d) => new Date(d).toLocaleDateString('es-AR', { month: 'short', year: 'numeric', timeZone: 'UTC' });
const TABS = [['educacion', 'Educación'], ['laboral', 'Experiencia']];

// Sin fechas cargadas y sin fecha de fin = todavía se está cursando.
function period(i) {
  if (!i.start_date && !i.end_date) return 'Cursando actualmente';
  return `${i.start_date ? fmt(i.start_date) : ''} – ${i.end_date ? fmt(i.end_date) : 'Actualidad'}`;
}

export default function Experience({ items }) {
  const [tab, setTab] = useState('educacion');
  const filtered = items.filter((i) => i.kind === tab);

  return (
    <Section id="trayectoria" title="Trayectoria">
      <div className="tabs" role="tablist">
        {TABS.map(([key, label]) => (
          <button key={key} role="tab" aria-selected={tab === key} className={tab === key ? 'is-active' : ''} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>
      <ol className="timeline" key={tab}>
        {filtered.length === 0 && <li>Todavía no hay registros en esta categoría.</li>}
        {filtered.map((i) => (
          <li key={i.id}>
            <time>{period(i)}</time>
            <h3>{i.role}</h3>
            <p className="muted">{i.organization}</p>
            {i.description && <p>{i.description}</p>}
          </li>
        ))}
      </ol>
    </Section>
  );
}

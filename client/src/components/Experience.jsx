import { useState } from 'react';
import Section from './Section';

const fmt = (d) => (d ? new Date(d).toLocaleDateString('es-AR', { month: 'short', year: 'numeric', timeZone: 'UTC' }) : 'Actualidad');
const TABS = [['laboral', 'Experiencia'], ['educacion', 'Educación']];

export default function Experience({ items }) {
  const [tab, setTab] = useState('laboral');
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
            <time>{fmt(i.start_date)} – {fmt(i.end_date)}</time>
            <h3>{i.role}</h3>
            <p className="muted">{i.organization}</p>
            {i.description && <p>{i.description}</p>}
          </li>
        ))}
      </ol>
    </Section>
  );
}

import { useMemo } from 'react';
import Section from './Section';
import useInView from '../hooks/useInView';

export default function Skills({ skills }) {
  const [ref, visible] = useInView();
  const groups = useMemo(() => {
    const map = {};
    skills.forEach((s) => { (map[s.category] = map[s.category] || []).push(s); });
    return Object.entries(map);
  }, [skills]);

  return (
    <Section id="habilidades" title="Habilidades">
      <div className="skills" ref={ref}>
        {groups.map(([category, items]) => (
          <div key={category} className="skills__group">
            <h3>{category}</h3>
            {items.map((s) => (
              <div key={s.id} className="bar">
                <span>{s.name}</span>
                <div className="bar__track" role="img" aria-label={`Nivel ${s.level} de 5`}>
                  <div className="bar__fill" style={{ width: visible ? `${s.level * 20}%` : 0 }} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Section>
  );
}

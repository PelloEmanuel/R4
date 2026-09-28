import Section from './Section';
import useInView from '../hooks/useInView';

// Habilidades como tarjetas simples: qué tecnología y qué hago con ella.
export default function Skills({ skills }) {
  const [ref, visible] = useInView();

  return (
    <Section id="habilidades" title="Habilidades">
      <div className={`grid skills ${visible ? 'is-visible' : ''}`} ref={ref}>
        {skills.map((s, i) => (
          <article key={s.id} className="card skill" style={{ transitionDelay: `${i * 80}ms` }}>
            <span className="skill__category">{s.category}</span>
            <h3>{s.name}</h3>
            <p>{s.description}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}

import Section from './Section';

export default function Achievements({ items }) {
  return (
    <Section id="logros" title="Logros">
      <div className="grid">
        {items.map((a) => (
          <article key={a.id} className="card">
            <time className="muted">{new Date(a.achieved_on).getUTCFullYear()}</time>
            <h3>{a.title}</h3>
            <p>{a.description}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}

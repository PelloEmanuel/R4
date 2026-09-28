// Momento animado principal: el nombre aparece letra por letra al cargar.
export default function Hero({ profile }) {
  const letters = [...profile.full_name];
  return (
    <section id="inicio" className="hero">
      <h1 className="hero__name" aria-label={profile.full_name}>
        {letters.map((ch, i) => (
          <span key={i} aria-hidden="true" style={{ animationDelay: `${i * 45}ms` }}>
            {ch === ' ' ? '\u00A0' : ch}
          </span>
        ))}
      </h1>
      <p className="hero__headline">{profile.headline}</p>
      <div className="hero__cta">
        <a className="btn" href="#proyectos">Ver proyectos</a>
        {profile.github_url && (
          <a className="btn btn--ghost" href={profile.github_url} target="_blank" rel="noreferrer">Mi GitHub</a>
        )}
      </div>
    </section>
  );
}

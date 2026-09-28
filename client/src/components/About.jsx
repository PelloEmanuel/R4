import Section from './Section';

export default function About({ profile }) {
  const links = [
    [`mailto:${profile.email}`, profile.email],
    profile.github_url && [profile.github_url, 'GitHub'],
    profile.linkedin_url && [profile.linkedin_url, 'LinkedIn'],
  ].filter(Boolean);

  return (
    <Section id="sobre-mi" title="Sobre mí">
      <div className="about">
        <p>{profile.bio}</p>
        <ul className="about__data">
          {profile.location && <li>{profile.location}</li>}
          {links.map(([href, label]) => (
            <li key={label}><a href={href} target="_blank" rel="noreferrer">{label}</a></li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

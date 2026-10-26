/**
 * Contenedor genérico de sección: ancla (id) para el menú, título y contenido.
 */
// Contenedor reutilizable de sección.
export default function Section({ id, title, children }) {
  return (
    <section id={id} className="section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

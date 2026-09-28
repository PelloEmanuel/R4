import CrudSection from '../CrudSection';

const KIND_OPTIONS = [
  { value: 'educacion', label: 'Educación' },
  { value: 'laboral', label: 'Experiencia laboral' },
];

const fields = [
  { name: 'kind', label: 'Tipo', type: 'select', required: true, options: KIND_OPTIONS },
  { name: 'role', label: 'Rol / título', type: 'text', required: true },
  { name: 'organization', label: 'Institución / empresa', type: 'text', required: true },
  { name: 'start_date', label: 'Fecha de inicio (opcional)', type: 'date', fromItem: (i) => (i.start_date ? String(i.start_date).slice(0, 10) : '') },
  { name: 'end_date', label: 'Fecha de fin (opcional, vacío si sigue en curso)', type: 'date', fromItem: (i) => (i.end_date ? String(i.end_date).slice(0, 10) : '') },
  { name: 'description', label: 'Descripción (opcional)', type: 'textarea' },
];

export default function ExperienceAdmin() {
  return (
    <CrudSection
      title="Trayectoria"
      endpoint="/api/admin/experience"
      fields={fields}
      itemTitle={(i) => i.role}
      itemSubtitle={(i) => `${i.kind === 'educacion' ? 'Educación' : 'Laboral'} — ${i.organization}`}
      emptyMessage="Todavía no cargaste trayectoria."
    />
  );
}

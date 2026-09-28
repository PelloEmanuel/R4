import CrudSection from '../CrudSection';

const fields = [
  { name: 'title', label: 'Título', type: 'text', required: true },
  {
    name: 'achieved_on',
    label: 'Fecha',
    type: 'date',
    required: true,
    fromItem: (i) => (i.achieved_on ? String(i.achieved_on).slice(0, 10) : ''),
  },
  { name: 'description', label: 'Descripción (opcional)', type: 'textarea' },
];

export default function AchievementsAdmin() {
  return (
    <CrudSection
      title="Logros"
      endpoint="/api/admin/achievements"
      fields={fields}
      itemTitle={(a) => a.title}
      itemSubtitle={(a) => String(a.achieved_on).slice(0, 10)}
      emptyMessage="Todavía no cargaste logros."
    />
  );
}

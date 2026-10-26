/**
 * ABM de Logros: define sus campos y se los pasa a CrudSection.
 */
import CrudSection from '../CrudSection';
import { formatDate } from '../../utils/dates';

// Campos del formulario. fromItem recorta la fecha a AAAA-MM-DD para el input date.
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
      itemSubtitle={(a) => formatDate(a.achieved_on)}
      emptyMessage="Todavía no cargaste logros."
    />
  );
}

import { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import CrudSection from '../CrudSection';

export default function SkillsAdmin() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [catError, setCatError] = useState('');
  const [catSaving, setCatSaving] = useState(false);

  async function loadCategories() {
    try {
      setCategories(await apiFetch('/api/admin/skill-categories'));
    } catch (err) {
      setCatError(err.message);
    }
  }

  useEffect(() => { loadCategories(); }, []);

  async function addCategory(e) {
    e.preventDefault();
    if (!newCategory.trim()) return;
    setCatSaving(true);
    setCatError('');
    try {
      await apiFetch('/api/admin/skill-categories', { method: 'POST', body: { name: newCategory.trim() } });
      setNewCategory('');
      await loadCategories();
    } catch (err) {
      setCatError(err.message);
    } finally {
      setCatSaving(false);
    }
  }

  const fields = [
    { name: 'name', label: 'Nombre (ej. React)', type: 'text', required: true },
    { name: 'description', label: 'Qué hacés con esa tecnología', type: 'textarea', required: true },
    {
      name: 'category_id',
      label: 'Categoría',
      type: 'select',
      required: true,
      options: categories.map((c) => ({ value: c.id, label: c.name })),
    },
  ];

  return (
    <CrudSection
      title="Habilidades"
      endpoint="/api/admin/skills"
      fields={fields}
      itemTitle={(s) => s.name}
      itemSubtitle={(s) => `${s.category} — ${s.description}`}
      emptyMessage="Todavía no cargaste ninguna habilidad."
      buildPayload={(v) => ({ ...v, category_id: Number(v.category_id) })}
      extra={
        <form className="admin-inline-form" onSubmit={addCategory}>
          <label htmlFor="new-category" className="muted">Nueva categoría (ej. Frontend, Backend)</label>
          <div className="admin-inline-form__row">
            <input
              id="new-category"
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Nombre de la categoría"
            />
            <button type="submit" className="btn btn--ghost" disabled={catSaving}>Agregar categoría</button>
          </div>
          {catError && <p className="admin-error" role="alert">{catError}</p>}
        </form>
      }
    />
  );
}

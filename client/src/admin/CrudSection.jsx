import { useEffect, useState } from 'react';
import { apiFetch } from './api';
import ConfirmDialog from './ConfirmDialog';

function emptyValues(fields) {
  const v = {};
  for (const f of fields) v[f.name] = f.type === 'multiselect' ? [] : '';
  return v;
}

function valuesFromItem(fields, item) {
  const v = {};
  for (const f of fields) {
    v[f.name] = f.fromItem ? f.fromItem(item) : (item[f.name] ?? (f.type === 'multiselect' ? [] : ''));
  }
  return v;
}

// title: nombre de la sección ("Habilidades", "Proyectos"...)
// endpoint: base de la API, ej. "/api/admin/skills"
// fields: [{ name, label, type: 'text'|'textarea'|'date'|'select'|'multiselect', required, options }]
// itemTitle(item) / itemSubtitle(item): qué mostrar en la lista
// buildPayload(values): transforma los valores del formulario antes de mandarlos (opcional)
// onChanged: se llama después de crear/editar/eliminar, por si otra sección depende de estos datos
export default function CrudSection({
  title,
  endpoint,
  fields,
  itemTitle,
  itemSubtitle,
  emptyMessage = 'Todavía no hay nada acá.',
  buildPayload,
  onChanged,
  extra,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [values, setValues] = useState(() => emptyValues(fields));
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    setLoadError('');
    try {
      setItems(await apiFetch(endpoint));
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [endpoint]);

  function openCreate() {
    setValues(emptyValues(fields));
    setEditingId(null);
    setFormError('');
    setShowForm(true);
  }

  function openEdit(item) {
    setValues(valuesFromItem(fields, item));
    setEditingId(item.id);
    setFormError('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setFormError('');
  }

  function updateField(name, value) {
    setValues((v) => ({ ...v, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const missing = fields.filter((f) => f.required && !values[f.name] && values[f.name] !== 0);
    if (missing.length) {
      setFormError(`Completá: ${missing.map((f) => f.label).join(', ')}`);
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      const payload = buildPayload ? buildPayload(values) : values;
      if (editingId) {
        await apiFetch(`${endpoint}/${editingId}`, { method: 'PUT', body: payload });
      } else {
        await apiFetch(endpoint, { method: 'POST', body: payload });
      }
      await load();
      onChanged?.();
      closeForm();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch(`${endpoint}/${deleteTarget.id}`, { method: 'DELETE' });
      await load();
      onChanged?.();
      setDeleteTarget(null);
    } catch (err) {
      setLoadError(err.message);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="admin-section">
      <div className="admin-section__head">
        <h2>{title}</h2>
        <button type="button" className="btn" onClick={openCreate}>+ Agregar</button>
      </div>

      {extra}

      {loading && <p className="muted">Cargando…</p>}
      {loadError && <p className="admin-error" role="alert">{loadError}</p>}

      {!loading && !loadError && (
        items.length === 0 ? (
          <p className="muted">{emptyMessage}</p>
        ) : (
          <ul className="admin-list">
            {items.map((item) => (
              <li key={item.id} className="admin-list__item">
                <div>
                  <strong>{itemTitle(item)}</strong>
                  {itemSubtitle && <div className="muted">{itemSubtitle(item)}</div>}
                </div>
                <div className="admin-list__actions">
                  <button type="button" className="btn btn--ghost" onClick={() => openEdit(item)}>Editar</button>
                  <button type="button" className="btn btn--danger-ghost" onClick={() => setDeleteTarget(item)}>Eliminar</button>
                </div>
              </li>
            ))}
          </ul>
        )
      )}

      {showForm && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <h3>{editingId ? 'Editar' : 'Nuevo'}</h3>
          {fields.map((f) => (
            <div className="admin-form__field" key={f.name}>
              <label htmlFor={`f-${f.name}`}>{f.label}{f.required && ' *'}</label>
              {f.type === 'textarea' && (
                <textarea
                  id={`f-${f.name}`}
                  rows={3}
                  value={values[f.name]}
                  onChange={(e) => updateField(f.name, e.target.value)}
                />
              )}
              {f.type === 'select' && (
                <select
                  id={`f-${f.name}`}
                  value={values[f.name]}
                  onChange={(e) => updateField(f.name, e.target.value)}
                >
                  <option value="">Elegir…</option>
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              )}
              {f.type === 'multiselect' && (
                <div className="admin-form__checks">
                  {f.options.length === 0 && <span className="muted">No hay opciones cargadas todavía.</span>}
                  {f.options.map((o) => {
                    const checked = values[f.name].includes(o.value);
                    return (
                      <label key={o.value} className="admin-form__check">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const set = new Set(values[f.name]);
                            if (e.target.checked) set.add(o.value); else set.delete(o.value);
                            updateField(f.name, [...set]);
                          }}
                        />
                        {o.label}
                      </label>
                    );
                  })}
                </div>
              )}
              {(f.type === 'text' || f.type === 'date' || !f.type) && (
                <input
                  id={`f-${f.name}`}
                  type={f.type === 'date' ? 'date' : 'text'}
                  value={values[f.name]}
                  onChange={(e) => updateField(f.name, e.target.value)}
                />
              )}
              {f.hint && <small className="muted">{f.hint}</small>}
            </div>
          ))}
          {formError && <p className="admin-error" role="alert">{formError}</p>}
          <div className="admin-form__actions">
            <button type="button" className="btn btn--ghost" onClick={closeForm}>Cancelar</button>
            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Eliminar ${deleteTarget ? itemTitle(deleteTarget) : ''}`}
        message="Esta acción no se puede deshacer. ¿Seguro que querés eliminarlo?"
        onConfirm={confirmDelete}
        onCancel={() => !deleting && setDeleteTarget(null)}
      />
    </div>
  );
}

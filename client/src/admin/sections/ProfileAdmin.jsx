import { useEffect, useState } from 'react';
import { apiFetch } from '../api';

const FIELDS = [
  ['full_name', 'Nombre completo', 'text'],
  ['headline', 'Subtítulo de portada', 'text'],
  ['bio', 'Sobre mí', 'textarea'],
  ['location', 'Ubicación (opcional)', 'text'],
  ['github_url', 'Link de GitHub (opcional)', 'text'],
];

export default function ProfileAdmin() {
  const [values, setValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const p = await apiFetch('/api/admin/profile');
        setValues(p || { full_name: '', headline: '', bio: '', location: '', github_url: '' });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const updated = await apiFetch('/api/admin/profile', { method: 'PUT', body: values });
      setValues(updated);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="muted">Cargando…</p>;
  if (!values) return <p className="admin-error">{error}</p>;

  return (
    <div className="admin-section">
      <div className="admin-section__head"><h2>Perfil</h2></div>
      <form className="admin-form admin-form--static" onSubmit={handleSubmit}>
        {FIELDS.map(([name, label, type]) => (
          <div className="admin-form__field" key={name}>
            <label htmlFor={`profile-${name}`}>{label}</label>
            {type === 'textarea' ? (
              <textarea
                id={`profile-${name}`}
                rows={4}
                value={values[name] || ''}
                onChange={(e) => setValues((v) => ({ ...v, [name]: e.target.value }))}
              />
            ) : (
              <input
                id={`profile-${name}`}
                type="text"
                value={values[name] || ''}
                onChange={(e) => setValues((v) => ({ ...v, [name]: e.target.value }))}
              />
            )}
          </div>
        ))}
        {error && <p className="admin-error" role="alert">{error}</p>}
        {saved && !error && <p className="admin-success">Guardado.</p>}
        <div className="admin-form__actions">
          <button type="submit" className="btn" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </form>
    </div>
  );
}

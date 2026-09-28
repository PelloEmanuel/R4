import { useState } from 'react';
import { apiFetch, setToken } from './api';

export default function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Guardamos primero para que apiFetch mande el header en este mismo pedido.
      setToken(password);
      await apiFetch('/api/admin/login', { method: 'POST', body: { password } });
      onSuccess();
    } catch (err) {
      setToken('');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login">
      <form className="admin-login__box" onSubmit={handleSubmit}>
        <h1>Panel de administración</h1>
        <p className="muted">Ingresá la contraseña para agregar, editar o eliminar contenido del portfolio.</p>
        <label htmlFor="admin-password">Contraseña</label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          required
        />
        {error && <p className="admin-error" role="alert">{error}</p>}
        <button className="btn" type="submit" disabled={loading || !password}>
          {loading ? 'Verificando…' : 'Entrar'}
        </button>
        <a className="admin-login__back" href="/">← Volver al portfolio</a>
      </form>
    </div>
  );
}

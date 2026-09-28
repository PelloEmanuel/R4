import { useState } from 'react';
import Section from './Section';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: 'idle', text: '' });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Ingresá tu nombre.';
    if (!EMAIL_RE.test(form.email)) e.email = 'Ingresá un email válido.';
    if (form.message.trim().length < 10) e.message = 'Escribí al menos 10 caracteres.';
    return e;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    setStatus({ type: 'loading', text: 'Enviando…' });
    try {
      const res = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setErrors(data.errors || {}); throw new Error(data.error || 'Revisá los datos ingresados.'); }
      setForm({ name: '', email: '', message: '' });
      setStatus({ type: 'ok', text: 'Mensaje enviado. Te respondo pronto.' });
    } catch (err) {
      setStatus({ type: 'error', text: err.message });
    }
  };

  const field = (name, label, props = {}) => (
    <label>
      {label}
      {props.as === 'textarea'
        ? <textarea name={name} rows="5" value={form[name]} onChange={onChange} aria-invalid={!!errors[name]} />
        : <input name={name} type={props.type || 'text'} value={form[name]} onChange={onChange} aria-invalid={!!errors[name]} />}
      {errors[name] && <small className="error">{errors[name]}</small>}
    </label>
  );

  return (
    <Section id="contacto" title="Contacto">
      <form className="form" onSubmit={onSubmit} noValidate>
        {field('name', 'Nombre')}
        {field('email', 'Email', { type: 'email' })}
        {field('message', 'Mensaje', { as: 'textarea' })}
        <button className="btn" disabled={status.type === 'loading'}>Enviar mensaje</button>
        <p className={`status status--${status.type}`} aria-live="polite">{status.text}</p>
      </form>
    </Section>
  );
}

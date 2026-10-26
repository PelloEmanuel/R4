/**
 * Campo de fecha doble: se puede ESCRIBIR (dd/mm/aaaa) o ELEGIR en un calendario propio.
 * El calendario está hecho en React (no usa el <input type="date"> del navegador), así el
 * campo de texto siempre abre el teclado numérico, en computadora y en celular.
 * Hacia afuera siempre trabaja en formato ISO (AAAA-MM-DD), que es lo que guarda la base de datos.
 * Props: id (del input), value (ISO o ''), onChange(iso) -> recibe '' si la fecha está incompleta o es inválida.
 */
import { useEffect, useState } from 'react';

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']; // la semana empieza en lunes
const pad = (n) => String(n).padStart(2, '0');

// "2025-03-07" -> "07/03/2025" (vacío si no hay fecha).
function isoToText(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}

// "07/03/2025" -> "2025-03-07". Devuelve '' si no es una fecha real (ej. 31/02/2025).
function textToIso(text) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  if (!m) return '';
  const [, d, mo, y] = m;
  const date = new Date(Date.UTC(+y, +mo - 1, +d));
  const exists =
    date.getUTCFullYear() === +y && date.getUTCMonth() === +mo - 1 && date.getUTCDate() === +d;
  return exists && +y >= 1900 ? `${y}-${mo}-${d}` : '';
}

// Deja solo números y agrega las barras solas al escribir: "07032025" -> "07/03/2025".
function maskText(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

// Calendario mensual propio. Arranca en el mes de la fecha elegida (o en el mes actual).
function Calendar({ value, onPick }) {
  const today = new Date();
  const start = /^(\d{4})-(\d{2})/.exec(value || '');
  const [year, setYear] = useState(start ? +start[1] : today.getFullYear());
  const [month, setMonth] = useState(start ? +start[2] - 1 : today.getMonth()); // 0 a 11

  // Mueve el mes mostrado (cambia de año solo al pasar de diciembre a enero y viceversa).
  function shift(delta) {
    const d = new Date(Date.UTC(year, month + delta, 1));
    setYear(d.getUTCFullYear());
    setMonth(d.getUTCMonth());
  }

  const offset = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7; // casillas vacías antes del día 1
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const todayIso = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  // Años disponibles en el selector (desde 1990 hasta 10 años a futuro).
  const years = [];
  for (let y = Math.max(today.getFullYear() + 10, year); y >= Math.min(1990, year); y--) years.push(y);

  return (
    <div className="date-cal" role="group" aria-label="Calendario">
      <div className="date-cal__head">
        <button type="button" onClick={() => shift(-1)} aria-label="Mes anterior">‹</button>
        <select value={month} onChange={(e) => setMonth(+e.target.value)} aria-label="Mes">
          {MONTHS.map((name, i) => <option key={name} value={i}>{name}</option>)}
        </select>
        <select value={year} onChange={(e) => setYear(+e.target.value)} aria-label="Año">
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <button type="button" onClick={() => shift(1)} aria-label="Mes siguiente">›</button>
      </div>
      <div className="date-cal__grid">
        {WEEKDAYS.map((w) => <span key={w} className="date-cal__dow">{w}</span>)}
        {cells.map((day, i) => {
          if (day === null) return <span key={`vacio-${i}`} />;
          const iso = `${year}-${pad(month + 1)}-${pad(day)}`;
          const cls = `date-cal__day${iso === value ? ' is-selected' : ''}${iso === todayIso ? ' is-today' : ''}`;
          return (
            <button type="button" key={day} className={cls} aria-pressed={iso === value} onClick={() => onPick(iso)}>
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DateField({ id, value, onChange }) {
  const [text, setText] = useState(isoToText(value));
  const [open, setOpen] = useState(false); // ¿calendario desplegado?

  // Si la fecha cambia desde afuera (por ejemplo, al elegirla en el calendario), se actualiza el texto.
  useEffect(() => {
    if (textToIso(text) !== (value || '')) setText(isoToText(value));
  }, [value]);

  // Con el calendario abierto, la tecla Escape lo cierra.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Al escribir: se aplica la máscara y se avisa la fecha en ISO ('' mientras esté incompleta).
  function handleText(e) {
    const masked = maskText(e.target.value);
    setText(masked);
    onChange(textToIso(masked));
  }

  // Al elegir un día: se avisa la fecha y se cierra el calendario.
  function pick(iso) {
    onChange(iso);
    setOpen(false);
  }

  // Texto completo (10 caracteres) pero que no es una fecha real.
  const invalid = text.length === 10 && !textToIso(text);

  return (
    <div className="date-field">
      {/* type="tel" + inputMode="numeric": teclado numérico en el celular y campo siempre escribible */}
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete="off"
        placeholder="dd/mm/aaaa"
        maxLength={10}
        value={text}
        onChange={handleText}
        aria-invalid={invalid}
      />
      <button
        type="button"
        className="date-field__btn"
        aria-label="Abrir calendario"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        📅
      </button>
      {invalid && <small className="admin-error">Esa fecha no existe.</small>}
      {open && <Calendar value={value} onPick={pick} />}
    </div>
  );
}

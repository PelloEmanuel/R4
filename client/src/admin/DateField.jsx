/**
 * Campo de fecha doble: se puede ESCRIBIR (dd/mm/aaaa) o ELEGIR en el calendario del navegador.
 * - Escribir: cuadro de texto con teclado numérico (type="tel") y barras automáticas.
 * - Elegir: botón 📅 que abre el calendario nativo del navegador o del celular.
 * Ambos están separados, así el cuadro de texto nunca se convierte en el selector por segmentos.
 * Hacia afuera siempre trabaja en formato ISO (AAAA-MM-DD), que es lo que guarda la base de datos.
 * Props: id (del input), value (ISO o ''), onChange(iso) -> recibe '' si la fecha está incompleta o es inválida.
 */
import { useEffect, useState } from 'react';

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

export default function DateField({ id, value, onChange }) {
  const [text, setText] = useState(isoToText(value));

  // Si la fecha cambia desde afuera (por ejemplo, al elegirla en el calendario), se actualiza el texto.
  useEffect(() => {
    if (textToIso(text) !== (value || '')) setText(isoToText(value));
  }, [value]);

  // Al escribir: se aplica la máscara y se avisa la fecha en ISO ('' mientras esté incompleta).
  function handleText(e) {
    const masked = maskText(e.target.value);
    setText(masked);
    onChange(textToIso(masked));
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
      {/* Botón del calendario: un <input type="date"> invisible que cubre SOLO el botón.
          Al tocarlo se abre el calendario nativo (en computadora y en celular). */}
      <span className="date-field__picker" title="Elegir en el calendario">
        <span aria-hidden="true">📅</span>
        <input
          type="date"
          tabIndex={-1}
          min="1900-01-01"
          max="2100-12-31"
          aria-label="Elegir fecha en el calendario"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onClick={(e) => { try { e.currentTarget.showPicker(); } catch (err) { /* sin showPicker: abre igual al tocar */ } }}
        />
      </span>
      {invalid && <small className="admin-error">Esa fecha no existe.</small>}
    </div>
  );
}

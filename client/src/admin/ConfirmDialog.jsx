import { useEffect, useRef } from 'react';

// Modal propio de confirmación. Se usa siempre antes de eliminar algo:
// nunca se llama a window.confirm().
export default function ConfirmDialog({ open, title, message, confirmLabel = 'Eliminar', onConfirm, onCancel }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="confirm-title">{title}</h3>
        <p id="confirm-message">{message}</p>
        <div className="modal__actions">
          <button type="button" className="btn btn--ghost" ref={cancelRef} onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="btn btn--danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

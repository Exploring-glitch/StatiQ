import { useEffect, useRef } from 'react';

// Reusable accessible confirmation dialog (dark theme).
// - Backdrop click cancels, Escape cancels
// - Focuses the cancel action on open so Enter/Space can't accidentally confirm
// - Locks body scroll while open
export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  destructive = false,
}) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel?.();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Focus cancel by default — safer than auto-focusing a destructive action.
    const t = setTimeout(() => cancelRef.current?.focus(), 0);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      clearTimeout(t);
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop — click to cancel */}
      <button
        aria-label="Close dialog"
        onClick={onCancel}
        className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-[2px]"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby={message ? 'confirm-dialog-desc' : undefined}
        className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-panel p-6 shadow-2xl"
      >
        <h2 id="confirm-dialog-title" className="text-lg font-bold text-white">
          {title}
        </h2>
        {message && (
          <p id="confirm-dialog-desc" className="mt-2 text-sm leading-relaxed text-neutral-400">
            {message}
          </p>
        )}
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white hover:border-white/30 hover:bg-white/5"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={
              destructive
                ? 'rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500'
                : 'rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accentHover'
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

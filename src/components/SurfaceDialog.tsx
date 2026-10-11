import { useEffect, useId, useRef, type ReactNode } from 'react';

export function SurfaceDialog({ title, children, onClose, focusTargetId, returnFocusTarget }: { title: string; children: ReactNode; onClose: () => void; focusTargetId?: string; returnFocusTarget?: () => HTMLElement | null }) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnTarget = useRef(returnFocusTarget);
  useEffect(() => { returnTarget.current = returnFocusTarget; }, [returnFocusTarget]);
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    dialog?.showModal();
    closeRef.current?.focus();
    return () => {
      dialog?.close();
      const target = returnTarget.current?.() ?? opener;
      if (target?.isConnected) target.focus();
    };
  }, []);
  useEffect(() => { (focusTargetId ? document.getElementById(focusTargetId) : closeRef.current)?.focus(); }, [title, focusTargetId]);
  return <dialog ref={dialogRef} className="terminal-dialog" aria-labelledby={titleId} onCancel={event => { event.preventDefault(); onClose(); }}>
    <header className="terminal-dialog-header">
      <h2 id={titleId}>{title}</h2>
      <button ref={closeRef} className="terminal-dialog-close" onClick={onClose} aria-label={`Cerrar ${title}`}>Cerrar</button>
    </header>
    <div className="terminal-dialog-body terminal-stack">{children}</div>
  </dialog>;
}

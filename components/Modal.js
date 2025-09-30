// components/Modal.jsx
'use client';

import { useEffect } from 'react';

export default function Modal({
  open,
  onClose,
  title,
  align = 'center', // 'center' | 'top'
  children
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  function stop(e){ e.stopPropagation(); }

  const backdropStyle = {
    position: 'fixed', inset: 0,
    background: 'rgba(3,3,8,.55)',
    display: 'flex',
    alignItems: align === 'top' ? 'flex-start' : 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 9999
  };

  const panelStyle = {
    background: 'linear-gradient(180deg, rgba(20,20,28,.92), rgba(14,14,20,.88))',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: 18,
    padding: 18,
    width: '100%', maxWidth: 420,
    color: '#e6e6f2',
    boxShadow: '0 30px 60px rgba(0,0,0,.6), 0 0 18px rgba(255,45,85,.35)',
    marginTop: align === 'top' ? 14 : 0
  };

  return (
    <div className="modal-backdrop" style={backdropStyle} onClick={onClose}>
      <div className="modal" style={panelStyle} onClick={stop}>
        {title ? <div className="title" style={{fontSize:18, marginBottom:10}}>{title}</div> : null}
        {children}
      </div>
    </div>
  );
}
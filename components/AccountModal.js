// components/AccountModal.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const THEME = {
  surface: '#121214',
  stroke: 'rgba(255,255,255,0.08)',
  strokeSoft: 'rgba(255,255,255,0.06)',
  text: '#FFFFFF',
  textMute: '#9B9BA1',
  textDim: '#CFCFD2',
  red: '#C1121F',
  red2: '#E04141',
};

const STORAGE_PROFILE = 'student-profile-v1'; // {name,birthISO,heightCm,goal,email}

export default function AccountModal({ open, onClose, username }) {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // carrega do storage quando abrir
  useEffect(() => {
    if (!open) return;
    try {
      const p = JSON.parse(localStorage.getItem(STORAGE_PROFILE) || 'null');
      if (p?.name) setName(p.name); else setName(username || '');
      if (p?.email) setEmail(p.email); else setEmail('');
    } catch {
      setName(username || '');
      setEmail('');
    }
  }, [open, username]);

  const handleSave = (e) => {
    e?.preventDefault?.();

    const safeName = (name || '').trim() || 'aluno';
    const safeEmail = (email || '').trim();

    try {
      const prev = JSON.parse(localStorage.getItem(STORAGE_PROFILE) || '{}');
      const next = { ...prev, name: safeName, email: safeEmail };
      localStorage.setItem(STORAGE_PROFILE, JSON.stringify(next));

      // login simples no client (opcional, mas útil pra gates leves)
      try { localStorage.setItem('isLogged', '1'); } catch {}

      // fecha modal e vai pra /inicio
      onClose?.();
      router.push('/inicio');
    } catch {
      // mesmo que falhe, fecha pra não travar UX
      onClose?.();
    }
  };

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)',
        display: 'grid', placeItems: 'center', padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 420,
          background: THEME.surface, color: THEME.text,
          border: `1px solid ${THEME.stroke}`, borderRadius: 16, padding: 16,
        }}
      >
        <form onSubmit={handleSave} style={{ display: 'grid', gap: 10 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 4 }}>
            <div style={{ fontSize: 18, fontWeight: 900 }}>Sua conta</div>
            <button
              type="button"
              onClick={onClose}
              style={{ background:'transparent', border:'none', color:THEME.textDim, fontSize:22, cursor:'pointer' }}
            >
              ×
            </button>
          </div>

          <div style={{ display:'grid', gap:6 }}>
            <label style={{ fontSize:12, color:THEME.textMute }}>Nome</label>
            <input
              value={name}
              onChange={(e)=>setName(e.target.value)}
              placeholder="Seu nome"
              autoComplete="name"
              style={{
                width:'100%', padding:'10px 12px', borderRadius:10,
                background:'#1a1a1d', color:THEME.text, border:`1px solid ${THEME.stroke}`,
              }}
            />
          </div>

          <div style={{ display:'grid', gap:6 }}>
            <label style={{ fontSize:12, color:THEME.textMute }}>E-mail (opcional)</label>
            <input
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              placeholder="voce@exemplo.com"
              autoComplete="email"
              style={{
                width:'100%', padding:'10px 12px', borderRadius:10,
                background:'#1a1a1d', color:THEME.text, border:`1px solid ${THEME.stroke}`,
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: 6,
              border:'none', borderRadius:12, padding:'10px 14px',
              fontWeight:900, color:'#fff', cursor:'pointer',
              background:'linear-gradient(180deg,#C1121F,#E04141)',
            }}
          >
            Salvar
          </button>

          <div style={{ fontSize:11, color:THEME.textMute }}>
            *Os dados ficam salvos só neste dispositivo (localStorage).
          </div>
        </form>
      </div>
    </div>
  );
}
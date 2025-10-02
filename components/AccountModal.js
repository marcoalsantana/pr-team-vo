'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

const THEME = {
  surface: '#121214',
  stroke: 'rgba(255,255,255,0.12)',
  text: '#FFFFFF',
  textDim: '#CFCFD2',
  textMute: '#9B9BA1',
  red: '#C1121F',
  red2: '#E04141',
};

export default function AccountModal({ open, onClose, username = 'aluno' }) {
  const router = useRouter();
  if (!open) return null;

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('loggedIn');
    } catch (e) {
      console.error(e);
    } finally {
      onClose?.();
      router.replace('/'); // sua tela de login (app/page.js)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '92%', maxWidth: 420, background: THEME.surface,
          border: `1px solid ${THEME.stroke}`, borderRadius: 16,
          boxShadow: '0 12px 28px rgba(0,0,0,0.35)', color: THEME.text, padding: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>Conta</div>
          <button
            aria-label="Fechar" onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: THEME.textDim, fontSize: 20, cursor: 'pointer' }}
          >×</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div
            style={{
              width: 46, height: 46, borderRadius: 10, background: '#17171A',
              border: `1px solid ${THEME.stroke}`, display: 'grid', placeItems: 'center'
            }}
          >👤</div>
          <div>
            <div style={{ fontWeight: 900 }}>{username}</div>
            <div style={{ fontSize: 12, color: THEME.textMute }}>Conta ativa</div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            background: `linear-gradient(180deg, ${THEME.red} 0%, ${THEME.red2} 100%)`,
            border: 'none', color: THEME.text,
            borderRadius: 12, padding: '12px 14px',
            cursor: 'pointer', textAlign: 'center', fontWeight: 900,
          }}
        >
          Sair
        </button>
      </div>
    </div>
  );
}
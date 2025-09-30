// components/AccountMenu.jsx
'use client';

import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function AccountMenu({ open, onClose, anchorRight = 12, anchorTop = 56, active }) {
  const r = useRouter();

  if (!open) return null;

  async function logout() {
    await supabase.auth.signOut();
    onClose?.();
    r.replace('/');
  }

  // backdrop click to close (só uma área "clique fora para fechar")
  const backdrop = {
    position:'fixed', inset:0, zIndex: 9998
  };

  const panel = {
    position:'fixed',
    right: anchorRight, top: anchorTop,
    zIndex: 10000,
    background:'linear-gradient(180deg, rgba(20,20,28,.95), rgba(14,14,20,.9))',
    border:'1px solid rgba(255,255,255,.08)',
    borderRadius:14, padding:14, width:220,
    boxShadow:'0 20px 40px rgba(0,0,0,.5), 0 0 18px rgba(255,45,85,.25)'
  };

  const pill = {
    display:'inline-block',
    padding:'4px 8px',
    borderRadius:999,
    fontSize:12,
    background: active ? 'rgba(44,230,164,.15)' : 'rgba(255,80,80,.15)',
    border:`1px solid ${active ? 'rgba(44,230,164,.4)' : 'rgba(255,80,80,.35)'}`,
    color: active ? '#2ce6a4' : '#ff5050'
  };

  return (
    <>
      <div style={backdrop} onClick={onClose}/>
      <div style={panel} role="menu">
        <div style={{fontSize:14, marginBottom:10}}>Sua conta</div>
        <div style={{marginBottom:12}}>
          <span style={pill}>{active ? 'Conta ativa' : 'Conta inativa'}</span>
        </div>
        <button className="btn ghost" onClick={logout}>Sair</button>
      </div>
    </>
  );
}
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomTabs from '../../components/BottomTabs';

const THEME = {
  bg: '#0E0E10',
  bgGradTop: 'rgba(193,18,31,0.08)',
  bgGradMid: 'rgba(255,255,255,0.02)',
  bgGradBot: 'rgba(0,0,0,0)',
  techLine: 'rgba(255,255,255,0.05)',
  techLine2: 'rgba(193,18,31,0.08)',
  surface: '#121214',
  stroke: 'rgba(255,255,255,0.08)',
  strokeSoft: 'rgba(255,255,255,0.06)',
  text: '#FFFFFF',
  textDim: '#CFCFD2',
  textMute: '#9B9BA1',
  red: '#C1121F',
  red2: '#E04141',
  shadow: '0 10px 22px rgba(0,0,0,0.30)',
  softShadow: '0 8px 18px rgba(0,0,0,0.22)',
};

function Modal({ open, onClose, title, children, align = 'top' }) {
  if (!open) return null;
  const alignStyle = align === 'top'
    ? { alignItems: 'flex-start', paddingTop: 20 }
    : { alignItems: 'center' };
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', justifyContent: 'center', ...alignStyle,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '94%', maxWidth: 420, background: THEME.surface,
          border: `1px solid ${THEME.stroke}`, borderRadius: 16,
          boxShadow: THEME.shadow, color: THEME.text, padding: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{title}</div>
          <button
            aria-label="Fechar" onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: THEME.textDim, fontSize: 20, cursor: 'pointer' }}
          >×</button>
        </div>
        {children}
      </div>
    </div>
  );
}


export default function MobilidadesPage() {
  const router = useRouter();
  const [openAccount, setOpenAccount] = useState(false);
  const username = 'aluno'; // depois pluga no auth real

  const go = (href) => router.push(href);

  return (
    <div
      style={{
        minHeight: '100dvh',
        color: THEME.text,
        position: 'relative',
        paddingBottom: 96,
        overflow: 'hidden',
        background: `
          linear-gradient(180deg, ${THEME.bgGradTop}, ${THEME.bgGradMid} 20%, ${THEME.bgGradBot}),
          repeating-linear-gradient(-45deg, ${THEME.techLine} 0px, ${THEME.techLine} 1px, transparent 1px, transparent 10px),
          repeating-linear-gradient(-45deg, ${THEME.techLine2} 0px, ${THEME.techLine2} 1px, transparent 1px, transparent 22px),
          ${THEME.bg}
        `,
        backgroundBlendMode: 'screen, normal, normal, normal',
      }}
    >
      {/* Header */}
      <header
        style={{
          position: 'sticky', top: 0, zIndex: 800,
          padding: '16px 18px 12px',
          borderBottom: `1px solid ${THEME.strokeSoft}`,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0))',
          backdropFilter: 'blur(2px)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: .5, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: THEME.red, boxShadow: '0 0 0 2px rgba(193,18,31,0.25)' }} />
              Mobilidades & Alongamentos
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              aria-label="Conta" onClick={() => setOpenAccount(true)}
              style={{
                width: 44, height: 44, borderRadius: 12,
                border: `1px solid ${THEME.stroke}`,
                background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0))',
                color: THEME.textDim, display: 'grid', placeItems: 'center', cursor: 'pointer',
              }}
            >👤</button>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main style={{ padding: '16px 16px 10px', maxWidth: 520, margin: '0 auto', display: 'grid', gap: 70 }}>
        {/* Card 1 — Aviso/orientação */}
        <section
  style={{
    background: `linear-gradient(90deg, rgba(193,18,31,.18), rgba(193,18,31,.07))`,
    border: `1px solid ${THEME.stroke}`,
    borderRadius: 100,
    boxShadow: THEME.softShadow,
    padding: '18px 16px',
  }}
>
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: 30, fontWeight: 900, marginBottom: 8 }}>
      Orientação Pré-Treino
    </div>
    <p style={{ margin: 0, color: THEME.text, fontSize: 15, lineHeight: 1.55 }}>
      Realize <strong>2× de 20″</strong> ou <strong>20 repetições</strong> de cada
      alongamento e mobilidade antes do seu treino.
    </p>
  </div>
</section>

        {/* Card 2 — Superiores (clicável) */}
        {/* Pré-Treino de Superiores */}
        <section
  style={{
    background: THEME.surface,
    border: `1px solid ${THEME.stroke}`,
    borderRadius: 18,
    boxShadow: THEME.shadow,
    padding: 24,
    cursor: 'pointer',
    minHeight: 140,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }}
  onClick={() => router.push('/mobilidades/superiores')}
>
  <div style={{ display: 'grid', gap: 8 }}>
    <div style={{ fontSize: 25, fontWeight: 900 }}>Pré-Treino de Superiores</div>
    <span
      style={{
        display: 'inline-block',
        fontSize: 11,
        color: THEME.textDim,
        border: `1px solid ${THEME.stroke}`,
        background: '#18181b',
        padding: '4px 10px',
        borderRadius: 999,
        width: 'fit-content',
      }}
    >
      2–5 min
    </span>
  </div>

  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <span style={{ fontSize: 13, fontWeight: 700, color: THEME.red }}>Ver mais</span>
    <span style={{ fontSize: 18, color: THEME.textMute, lineHeight: 1 }}>›</span>
  </div>
</section>

        {/* Card 3 — Inferiores (clicável) */}
       {/* Pré-Treino de Inferiores */}
       <section
  style={{
    background: THEME.surface,
    border: `1px solid ${THEME.stroke}`,
    borderRadius: 18,
    boxShadow: THEME.shadow,
    padding: 24,
    cursor: 'pointer',
    minHeight: 140,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }}
  onClick={() => router.push('/mobilidades/inferiores')}
>
  <div style={{ display: 'grid', gap: 8 }}>
    <div style={{ fontSize: 25, fontWeight: 900 }}>Pré-Treino de Inferiores</div>
    <span
      style={{
        display: 'inline-block',
        fontSize: 11,
        color: THEME.textDim,
        border: `1px solid ${THEME.stroke}`,
        background: '#18181b',
        padding: '4px 10px',
        borderRadius: 999,
        width: 'fit-content',
      }}
    >
      2–5 min
    </span>
  </div>

  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <span style={{ fontSize: 13, fontWeight: 700, color: THEME.red }}>Ver mais</span>
    <span style={{ fontSize: 18, color: THEME.textMute, lineHeight: 1 }}>›</span>
  </div>
</section>

        <div style={{ height: 8 }} />
      </main>

      {/* Modal Conta */}
      <Modal open={openAccount} onClose={() => setOpenAccount(false)} title="Conta" align="top">
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 46, height: 46, borderRadius: 10, background: '#17171A', border: `1px solid ${THEME.stroke}`, display: 'grid', placeItems: 'center' }}>👤</div>
            <div>
              <div style={{ fontWeight: 900 }}>{username}</div>
              <div style={{ fontSize: 12, color: THEME.textMute }}>Conta ativa</div>
            </div>
          </div>
          <button
            onClick={() => router.push('/')}
            style={{
              background: '#1A1A1D', border: `1px solid ${THEME.stroke}`, color: THEME.text,
              borderRadius: 12, padding: '12px 14px', cursor: 'pointer', textAlign: 'center',
            }}
          >Sair</button>
        </div>
      </Modal>

      <BottomTabs />
    </div>
  );
}
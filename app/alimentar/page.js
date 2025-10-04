// app/alimentar/page.js
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomTabs from '../../components/BottomTabs';
import AccountModal from '../../components/AccountModal';

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
  textMute: '#9B9BA1',
  red: '#C1121F',
  red2: '#E04141',
  shadow: '0 10px 22px rgba(0,0,0,0.30)',
  softShadow: '0 8px 18px rgba(0,0,0,0.22)',
};

function Card({ title, items }) {
  return (
    <section
      style={{
        background: THEME.surface,
        border: `1px solid ${THEME.stroke}`,
        borderRadius: 16,
        padding: 16,
        boxShadow: THEME.shadow,
        display: 'grid',
        gap: 10,
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 900 }}>{title}</div>
      <ul style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 4 }}>
        {items.map((it, i) => (
          <li key={i} style={{ fontSize: 14, color: THEME.textMute, lineHeight: 1.4 }}>
            {it}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function PlanoAlimentarPage() {
  const router = useRouter();
  const go = (href) => router.push(href);

  // 👇 estado do modal/usuário para o ícone do topo
  const [openAccount, setOpenAccount] = useState(false);
  const username = 'aluno';

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
              Plano Alimentar
            </div>
          </div>
          <button
            aria-label="Conta"
            onClick={() => setOpenAccount(true)}
            style={{
              width: 44, height: 44, borderRadius: 12,
              border: `1px solid ${THEME.stroke}`,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0))',
              color: THEME.textMute, display: 'grid', placeItems: 'center', cursor: 'pointer',
            }}
          >
            👤
          </button>
        </div>
      </header>

      {/* Conteúdo */}
      <main 
      style={{ padding: '16px 16px 10px', maxWidth: 520, margin: '0 auto', display: 'grid', gap: 20 }}>
        <Card title="Refeição I (Café da Manhã)" items={[
          "2 fatias de pão de forma ou 1 pão de sal ou 40g de tapioca",
          "2 ovos + 1 clara",
          "30g de requeijão light",
          "150g de abacaxi ou 200g de mamão"
        ]}/>
        <Card title="Refeição II (Lanche da Manhã)" items={[
          "200ml de leite desnatado ou 170g de iogurte desnatado",
          "1 banana média",
          "30g de whey"
        ]}/>
        <Card title="Refeição III (Almoço)" items={[
          "120g de arroz",
          "50g de feijão",
          "200g de frango/peixe ou 170g de patinho",
          "150g de vegetais variados",
          "Folhas à vontade"
        ]}/>
        <Card title="Refeição IV (Lanche da Tarde)" items={[
          "40g de tapioca",
          "2 ovos",
          "200g de mamão"
        ]}/>
        <Card title="Refeição V (Jantar)" items={[
          "120g de arroz",
          "50g de feijão",
          "200g de frango/peixe ou 170g de patinho",
          "150g de vegetais variados",
          "Folhas à vontade"
        ]}/>
        <section
          style={{
            background: `linear-gradient(90deg, rgba(193,18,31,.18), rgba(193,18,31,.07))`,
            border: `1px solid ${THEME.stroke}`,
            borderRadius: 16,
            padding: 16,
            boxShadow: THEME.shadow,
            display: 'grid',
            gap: 10,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 900 }}>Observações</div>
          <ul style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 6 }}>
            <li>BEBA 4,5L de água por dia</li>
            <li>Refrigerante apenas zero (máx. 2 copos/dia)</li>
            <li>1 refeição livre na semana, sem exagero</li>
            <li>Sucos naturais e café apenas sem açúcar (máx. 2 copos/dia)</li>
          </ul>
        </section>
      </main>

      {/* Modal de conta (logout) */}
      <AccountModal
        open={openAccount}
        onClose={() => setOpenAccount(false)}
        username={username}
      />

      <BottomTabs active="alimentar" onNavigate={go} />
    </div>
  );
}
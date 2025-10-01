'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

/* ---------- THEME ---------- */
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

/* ---------- Modal simples ---------- */
function Modal({ open, onClose, title, children, maxWidth = 520 }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)',
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth, background: THEME.surface,
          border: `1px solid ${THEME.stroke}`, borderRadius: 16,
          boxShadow: THEME.shadow, color: THEME.text, padding: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{title}</div>
          <button
            aria-label="Fechar"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: THEME.textDim, fontSize: 20, cursor: 'pointer' }}
          >×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------- Shorts -> embed ---------- */
function toEmbedUrl(url) {
  try {
    const u = new URL(url);
    if (u.pathname.startsWith('/shorts/')) {
      const id = u.pathname.split('/shorts/')[1];
      return `https://www.youtube.com/embed/${id}`;
    }
  } catch {}
  return url;
}

/* ---------- Item de exercício (checkbox fora do card) ---------- */
function ExerciseItem({ title, hint = "2x de 20'' ou 20 rep.", done, onToggle, onOpen }) {
  return (
    <div style={{ position: 'relative', paddingLeft: 22, marginLeft: 10 }}>
      {/* Checkbox flutuante, fora do card à esquerda */}
      <button
        type="button"
        aria-pressed={done}
        onClick={onToggle}
        style={{
          position: 'absolute',
          left: -6,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 28, height: 28, borderRadius: 8,
          border: `1px solid ${THEME.stroke}`,
          background: done ? `linear-gradient(180deg, ${THEME.red}, ${THEME.red2})` : '#1b1b1e',
          color: THEME.text, display: 'grid', placeItems: 'center', cursor: 'pointer',
          boxShadow: done ? '0 0 0 2px rgba(193,18,31,.22)' : 'none',
          fontSize: 14, fontWeight: 900,
        }}
        title={done ? 'Marcar como não concluído' : 'Marcar como concluído'}
      >
        {done ? '✓' : ''}
      </button>

      {/* Card mais estreito e mais alto */}
      <section
        style={{
          background: THEME.surface,
          border: `1px solid ${THEME.stroke}`,
          borderRadius: 20,
          boxShadow: THEME.shadow,
          padding: 18,
          display: 'grid',
          gap: 12,
          minHeight: 96,              // mais “comprido”
          maxWidth: 540,              // um pouco mais estreito
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>{title}</div>
            <div style={{ fontSize: 13, color: THEME.textMute, marginTop: 6 }}>{hint}</div>
          </div>

          {/* “Ver vídeo” + seta */}
          <button
            type="button"
            onClick={onOpen}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: THEME.text,
            }}
          >
            <span style={{ fontSize: 14, color: THEME.red, fontWeight: 800 }}>Ver vídeo</span>
            <div
              aria-hidden
              style={{
                width: 34, height: 34, borderRadius: 10,
                border: `1px solid ${THEME.strokeSoft}`,
                display: 'grid', placeItems: 'center', color: THEME.textDim, fontSize: 18,
              }}
            >›</div>
          </button>
        </div>
      </section>
    </div>
  );
}

/* ---------- Página: Pré-Treino de Superiores ---------- */
export default function SuperioresPage() {
  const router = useRouter();

  const items = useMemo(() => ([
    { titulo: 'Alongamento 1', url: 'https://www.youtube.com/shorts/o02Av3U2Sco' },
    { titulo: 'Alongamento 2', url: 'https://www.youtube.com/shorts/ULNWDQiL2ig' },
    { titulo: 'Alongamento 3', url: 'https://www.youtube.com/shorts/-7P9V1Nryic' },
    { titulo: 'Alongamento 4', url: 'https://www.youtube.com/shorts/KnSNeYILO24' },
    { titulo: 'Mobilidade 1', url: 'https://www.youtube.com/shorts/D9kGIvCgwQo' },
    { titulo: 'Mobilidade 2', url: 'https://www.youtube.com/shorts/IdPEM-1JMgw' },
    { titulo: 'Mobilidade 3', url: 'https://www.youtube.com/shorts/V8lhB5Ntfa8' },
  ]), []);

  const [done, setDone] = useState(() => items.map(() => false));
  const allDone = done.every(Boolean);

  const [modal, setModal] = useState({ open: false, title: '', url: '' });

  const toggleAt = (i) =>
    setDone((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

  const openVideoAt = (i) =>
    setModal({ open: true, title: items[i].titulo, url: toEmbedUrl(items[i].url) });

  return (
    <div
      style={{
        minHeight: '100dvh',
        color: THEME.text,
        position: 'relative',
        overflow: 'hidden',
        background: `
          linear-gradient(180deg, ${THEME.bgGradTop}, ${THEME.bgGradMid} 20%, ${THEME.bgGradBot}),
          repeating-linear-gradient(-45deg, ${THEME.techLine} 0px, ${THEME.techLine} 1px, transparent 1px, transparent 10px),
          repeating-linear-gradient(-45deg, ${THEME.techLine2} 0px, ${THEME.techLine2} 1px, transparent 1px, transparent 22px),
          ${THEME.bg}
        `,
        backgroundBlendMode: 'screen, normal, normal, normal',
        paddingBottom: 96,
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
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
    {/* Botão voltar */}
    <button
      aria-label="Voltar"
      onClick={() => router.push('/mobilidades')}
      style={{
        width: 40, height: 40, borderRadius: 12,
        border: `1px solid ${THEME.stroke}`,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0))',
        color: THEME.textDim, display: 'grid', placeItems: 'center', cursor: 'pointer',
      }}
    >‹</button>

    {/* Título centralizado visualmente */}
    <div style={{ fontSize: 20, fontWeight: 900, textAlign: 'center', flex: 1 }}>
      {/* Ajuste o texto conforme a página */}
      Pré-Treino de Superiores
    </div>

    {/* Espaçador para balancear o layout (mesma largura do botão) */}
    <div style={{ width: 40 }} />
  </div>
</header>

      <main style={{ padding: '18px', maxWidth: 560, margin: '0 auto', display: 'grid', gap: 22 }}>
        {/* Card Orientação (vermelho) */}
        <section
          style={{
            background: `linear-gradient(90deg, rgba(193,18,31,.18), rgba(193,18,31,.07))`,
            border: `1px solid ${THEME.stroke}`,
            borderRadius: 20,
            boxShadow: THEME.softShadow,
            padding: 22,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 25, fontWeight: 900, marginBottom: 10, color: THEME.text }}>
            Orientação
          </div>
          <div style={{ fontSize: 15, color: THEME.textMute, lineHeight: 1.55 }}>
            Realize <strong style={{ color: THEME.text }}>2x de 20''</strong> ou <strong style={{ color: THEME.text }}>20 repetições</strong> de cada exercício.
          </div>
        </section>

        {/* Lista de exercícios maiores e mais espaçados */}
        {items.map((it, i) => (
          <ExerciseItem
            key={i}
            title={it.titulo}
            done={done[i]}
            onToggle={() => toggleAt(i)}
            onOpen={() => openVideoAt(i)}
          />
        ))}
      </main>

      {/* CTA fixo de conclusão */}
      <div
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 900,
          padding: '12px 16px calc(env(safe-area-inset-bottom) + 12px)',
          background: 'linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,.6))',
          display: 'grid', justifyItems: 'center',
        }}
      >
        <button
          disabled={!allDone}
          onClick={() => router.push('/treino')}
          style={{
            width: '100%', maxWidth: 560,
            borderRadius: 12,
            padding: '16px',
            border: 'none',
            fontWeight: 900,
            fontSize: 15,
            color: '#fff',
            cursor: allDone ? 'pointer' : 'not-allowed',
            background: allDone
              ? `linear-gradient(180deg, ${THEME.red} 0%, ${THEME.red2} 100%)`
              : '#39393f',
            opacity: allDone ? 1 : .6,
            boxShadow: allDone ? THEME.softShadow : 'none',
          }}
        >
          {allDone ? '✅ Pré-treino concluído! Ir para o Treino' : 'Conclua todos os exercícios para continuar'}
        </button>
      </div>

      {/* Modal vídeo */}
      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, title: '', url: '' })}
        title={modal.title}
      >
        <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: 12, overflow: 'hidden', border: `1px solid ${THEME.stroke}` }}>
          {modal.url && (
            <iframe
              src={modal.url}
              title={modal.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0, background: '#000' }}
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
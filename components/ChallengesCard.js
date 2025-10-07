'use client';

import { useEffect, useMemo, useState } from 'react';

const THEME = {
  surface: '#121214',
  stroke: 'rgba(255,255,255,0.08)',
  strokeSoft: 'rgba(255,255,255,0.06)',
  text: '#FFFFFF',
  textMute: '#9B9BA1',
  textDim: '#CFCFD2',
  red: '#C1121F',
  red2: '#E04141',
  softShadow: '0 8px 18px rgba(0,0,0,0.22)',
  shadow: '0 10px 22px rgba(0,0,0,0.30)',
};

const LS_KEY = 'challengesCard';

const DEFAULTS = [
  { emoji: '🔥', title: '5 treinos', subtitle: 'complete cinco sessões nesta semana' },
  { emoji: '💧', title: '25 litros de água', subtitle: 'média de ~3,5 L por dia' },
  { emoji: '⏱️', title: '90min cárdio', subtitle: 'soma da semana, intensidade moderada' },
];

export default function ChallengesCard() {
  // edit mode via ?edit=1
  const isEdit = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('edit') === '1';
  }, []);

  const [items, setItems] = useState(DEFAULTS);

  // load persisted
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length === 3) setItems(parsed);
      }
    } catch {}
  }, []);

  // helpers
  const save = (data) => {
    setItems(data);
    try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch {}
  };
  const reset = () => save(DEFAULTS);

  if (isEdit) {
    // Editor simples (igual conceito do DailyNote)
    return (
      <section
        style={{
          background: THEME.surface,
          border: `1px solid ${THEME.stroke}`,
          borderRadius: 18,
          boxShadow: THEME.shadow,
          padding: 16,
          display: 'grid',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900 }}>Desafios PR TEAM (editar)</div>
            <div style={{ fontSize: 12, color: THEME.textMute, marginTop: 2 }}>modo admin rápido via <code>?edit=1</code></div>
          </div>
          <button
            onClick={reset}
            className="btn ghost"
            style={{
              borderRadius: 12, padding: '8px 10px', border: `1px solid ${THEME.stroke}`,
              background: 'transparent', color: THEME.textDim, cursor: 'pointer'
            }}
          >
            Resetar padrão
          </button>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {items.map((it, idx) => (
            <div key={idx}
              style={{
                border: `1px solid ${THEME.stroke}`, borderRadius: 12, padding: 12,
                display: 'grid', gap: 8, background: '#141417'
              }}
            >
              <div style={{ fontSize: 12, color: THEME.textMute }}>Desafio {idx + 1}</div>
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={it.emoji}
                    onChange={(e) => {
                      const v = e.target.value || '';
                      const nxt = [...items];
                      nxt[idx] = { ...nxt[idx], emoji: v.slice(0, 2) };
                      setItems(nxt);
                    }}
                    placeholder="🔥"
                    style={{ width: 64 }}
                  />
                  <input
                    value={it.title}
                    onChange={(e) => {
                      const nxt = [...items];
                      nxt[idx] = { ...nxt[idx], title: e.target.value };
                      setItems(nxt);
                    }}
                    placeholder="Título"
                    style={{ flex: 1 }}
                  />
                </div>
                <input
                  value={it.subtitle}
                  onChange={(e) => {
                    const nxt = [...items];
                    nxt[idx] = { ...nxt[idx], subtitle: e.target.value };
                    setItems(nxt);
                  }}
                  placeholder="Subtítulo"
                />
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={() => save(items)}
            className="btn primary"
            style={{
              background: `linear-gradient(180deg, ${THEME.red} 0%, ${THEME.red2} 100%)`,
              color: '#fff', borderRadius: 12, padding: '10px 14px', fontWeight: 900,
              boxShadow: '0 8px 22px rgba(193,18,31,.22)', border: 'none', cursor: 'pointer'
            }}
          >
            Salvar
          </button>
        </div>
      </section>
    );
  }

  // Visualização (persistente)
  return (
    <section
      style={{
        background: THEME.surface,
        border: `1px solid ${THEME.stroke}`,
        borderRadius: 18,
        boxShadow: THEME.shadow,
        padding: 16,
        display: 'grid',
        gap: 12,
        cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 900 }}>Desafios PR TEAM</div>
          <div style={{ fontSize: 12, color: THEME.textMute, marginTop: 2 }}>semanal • definidos pelo coach</div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        {items.map((it, idx) => (
          <div key={idx}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px',
              borderRadius: 12,
              border: `1px solid ${THEME.stroke}`,
              background: '#141417',
            }}
          >
            <div
              aria-hidden
              style={{
                width: 28, height: 28, borderRadius: 8,
                display: 'grid', placeItems: 'center',
                background: idx === 0
                  ? `linear-gradient(180deg, ${THEME.red}, ${THEME.red2})`
                  : 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
                border: idx === 0 ? 'none' : `1px solid ${THEME.stroke}`,
                color: '#fff', fontWeight: 900, fontSize: 14,
                boxShadow: idx === 0 ? '0 6px 16px rgba(193,18,31,0.25)' : 'none',
              }}
            >
              {it.emoji || '•'}
            </div>
            <div style={{ display: 'grid', gap: 2 }}>
              <div style={{ fontWeight: 800, color: THEME.text }}>{it.title || '—'}</div>
              <div style={{ fontSize: 12, color: THEME.textMute }}>{it.subtitle || '—'}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
// components/SeriesInfoCard.js
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const THEME = {
  surface: '#121214',
  stroke: 'rgba(255,255,255,0.08)',
  strokeSoft: 'rgba(255,255,255,0.06)',
  text: '#FFFFFF',
  textDim: '#CFCFD2',
  textMute: '#9B9BA1',
  red: '#C1121F',
  red2: '#E04141',
  shadow: '0 10px 22px rgba(0,0,0,0.30)',
};

const DEFAULT_SERIES = [
  {
    key: 'red',
    title: 'SÉRIES VERMELHAS',
    desc:
      'São as séries de aquecimento. Faça o número de repetições estipuladas com uma carga na qual você aguentaria fazer mais 10 repetições.',
    rest: 'Descanse 20–50s nessas séries.',
    chipBg: 'linear-gradient(180deg,#C1121F,#E04141)',
  },
  {
    key: 'green',
    title: 'SÉRIES VERDES',
    desc:
      'São as séries de ajuste de carga. Faça o número de repetições estipuladas com uma carga na qual você aguentaria fazer mais 5 repetições, apenas para alimentar a força.',
    rest: 'Descanse 60–90s nessas séries.',
    chipBg: 'linear-gradient(180deg,#27C281,#1FA86E)',
  },
  {
    key: 'blue',
    title: 'SÉRIES AZUIS',
    desc:
      'São as séries contabilizadas no volume semanal (séries válidas). Faça até não aguentar outra repetição com execução perfeita.',
    rest: 'Descanse 90s–2,5min nessas séries.',
    chipBg: 'linear-gradient(180deg,#3B82F6,#1F5FD1)',
  },
  {
    key: 'black',
    title: 'SÉRIES PRETAS',
    desc:
      'São as séries válidas até a falha. Faça o número de repetições estipuladas sem conseguir realizar mais nenhuma, mesmo com técnica do roubo.',
    rest: 'Descanse 3–4min nessas séries.',
    chipBg: 'linear-gradient(180deg,#111,#333)',
  },
];

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)',
        padding: 12,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 520, background: THEME.surface,
          border: `1px solid ${THEME.stroke}`, borderRadius: 16,
          boxShadow: THEME.shadow, color: THEME.text, padding: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 16, fontWeight: 900 }}>{title}</div>
          <button
            aria-label="Fechar"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: THEME.textDim, fontSize: 22, cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function SeriesInfoCard() {
  const search = useSearchParams();
  const isEdit = search?.get('edit') === '1';

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(DEFAULT_SERIES);

  // carrega de localStorage (persistente)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('seriesInfo');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) setItems(parsed);
      }
    } catch {}
  }, []);

  const save = () => {
    localStorage.setItem('seriesInfo', JSON.stringify(items));
  };

  const reset = () => {
    setItems(DEFAULT_SERIES);
    localStorage.removeItem('seriesInfo');
  };

  // conteúdo do modal (visualização)
  const ViewContent = useMemo(
    () => (
      <div style={{ display: 'grid', gap: 12 }}>
       

        {items.map((it) => (
          <div
            key={it.key}
            style={{
              border: `1px solid ${THEME.stroke}`, borderRadius: 14, padding: 12,
              background: '#141417', display: 'grid', gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                aria-hidden
                style={{
                  width: 26, height: 26, borderRadius: 8,
                  background: it.chipBg, boxShadow: '0 6px 16px rgba(0,0,0,.25)',
                }}
              />
              <div style={{ fontWeight: 900 }}>{it.title}</div>
            </div>
            <div style={{ color: THEME.textDim, lineHeight: 1.5 }}>{it.desc}</div>
            <div style={{ color: THEME.textMute, fontSize: 12 }}>{it.rest}</div>
          </div>
        ))}
      </div>
    ),
    [items]
  );

  // conteúdo do modal (edição com ?edit=1)
  const EditContent = useMemo(
    () => (
      <div style={{ display: 'grid', gap: 12 }}>
        {items.map((it, idx) => (
          <div
            key={it.key}
            style={{
              border: `1px solid ${THEME.stroke}`, borderRadius: 14, padding: 12,
              background: '#141417', display: 'grid', gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                aria-hidden
                style={{
                  width: 22, height: 22, borderRadius: 6, background: it.chipBg,
                }}
              />
              <input
                value={it.title}
                onChange={(e) => {
                  const cp = [...items]; cp[idx] = { ...cp[idx], title: e.target.value }; setItems(cp);
                }}
                style={{
                  flex: 1, background: 'transparent', border: `1px solid ${THEME.strokeSoft}`,
                  color: THEME.text, borderRadius: 8, padding: '6px 8px', fontWeight: 800,
                }}
              />
            </div>

            <textarea
              value={it.desc}
              onChange={(e) => {
                const cp = [...items]; cp[idx] = { ...cp[idx], desc: e.target.value }; setItems(cp);
              }}
              rows={3}
              style={{
                width: '100%', background: 'transparent', border: `1px solid ${THEME.strokeSoft}`,
                color: THEME.textDim, borderRadius: 8, padding: 8, lineHeight: 1.5, resize: 'vertical',
              }}
            />
            <input
              value={it.rest}
              onChange={(e) => {
                const cp = [...items]; cp[idx] = { ...cp[idx], rest: e.target.value }; setItems(cp);
              }}
              style={{
                background: 'transparent', border: `1px solid ${THEME.strokeSoft}`,
                color: THEME.textMute, borderRadius: 8, padding: '6px 8px', fontSize: 12,
              }}
            />
          </div>
        ))}

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={save}
            style={{
              background: `linear-gradient(180deg, ${THEME.red}, ${THEME.red2})`,
              color: '#fff', border: 'none', borderRadius: 10, padding: '10px 14px', fontWeight: 900, cursor: 'pointer',
            }}
          >
            Salvar
          </button>
          <button
            onClick={reset}
            style={{
              background: 'transparent', color: THEME.textDim, border: `1px solid ${THEME.stroke}`,
              borderRadius: 10, padding: '10px 14px', fontWeight: 700, cursor: 'pointer',
            }}
          >
            Restaurar padrão
          </button>
        </div>
        <div style={{ fontSize: 11, color: THEME.textMute }}>
          *Isso é um editor rápido via <code>?edit=1</code>. No /admin vamos puxar/guardar do banco.
        </div>
      </div>
    ),
    [items]
  );

  return (
    <>
      {/* Cardzinho clicável (pequeno, destacando que é só explicação) */}
      <section
        onClick={() => setOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 10, padding: 12,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0))',
          border: `1px dashed ${THEME.strokeSoft}`,
          borderRadius: 14,
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            aria-hidden
            style={{
              width: 30, height: 30, borderRadius: 8,
              background: `linear-gradient(180deg, ${THEME.red}, ${THEME.red2})`,
              display: 'grid', placeItems: 'center', color: '#fff', fontSize: 16, boxShadow: THEME.shadow,
            }}
          >
            ⚠️
          </div>
          <div>
            <div style={{ fontWeight: 900 }}>Explicação das séries</div>
            <div style={{ fontSize: 12, color: THEME.textMute }}>toque para ver detalhes</div>
          </div>
        </div>
        <div style={{ fontSize: 18, color: THEME.textDim }}>›</div>
      </section>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={isEdit ? 'Explicação das séries (editar)' : 'Explicação das séries'}
      >
        {isEdit ? EditContent : ViewContent}
      </Modal>
    </>
  );
}
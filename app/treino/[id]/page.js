// app/treino/[id]/page.jsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

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
};

// helpers
function ymd(d) {
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

// ====== Info por tipo de série (cores/legendas) ======
const SERIES_INFO = {
  red: {
    title: 'SÉRIES VERMELHAS (aquecimento)',
    text:
      'Faça o número de repetições estipuladas com uma carga na qual você aguentaria fazer mais 10 repetições. DESCANSAR DE 20 a 50 SEGUNDOS NESSAS SÉRIES.',
    chipBg: 'linear-gradient(180deg,#c1121f,#e04141)',
  },
  green: {
    title: 'SÉRIES VERDES (ajuste de carga)',
    text:
      'Faça o número de repetições estipuladas com uma carga na qual você aguentaria fazer mais 5 repetições, apenas para alimentar a força. DESCANSAR 60 a 90 SEGUNDOS NESSAS SÉRIES.',
    chipBg: 'linear-gradient(180deg,#1f9d55,#27c281)',
  },
  blue: {
    title: 'SÉRIES AZUIS (válidas)',
    text:
      'Séries contabilizadas no volume semanal. Faça as repetições até não aguentar mais com movimento perfeito. DESCANSAR DE 90 SEGUNDOS a 2,5 MINUTOS NESSAS SÉRIES.',
    chipBg: 'linear-gradient(180deg,#2563eb,#60a5fa)',
  },
  black: {
    title: 'SÉRIES PRETAS (falha)',
    text:
      'Séries válidas até a falha. Faça as repetições estipuladas sem conseguir realizar mais nenhuma, mesmo com técnica do roubo. DESCANSAR DE 3 a 4 MINUTOS NESSAS SÉRIES.',
    chipBg: 'linear-gradient(180deg,#111,#333)',
  },
};

// ====== Plano do Treino A (Braço) conforme seu exemplo ======
const PLANS = {
  // Você pode aproveitar o mesmo formato (4 séries) pros outros IDs depois (b, c, d, e).
  a: {
    title: 'Treino A — Braço',
    estTime: '~ 55–65 min',
    exercises: [
      {
        key: 'rosca-w',
        name: 'Rosca direta com barra W',
        video: 'https://www.youtube.com/shorts/xIBnRKQFSFA',
        hint: 'toque no "i" para ver as instruções de cada série',
        sets: [
          { repsTxt: '1×15', type: 'red' },
          { repsTxt: '1 a 3 × 3', type: 'green' },
          { repsTxt: '2 × 6 a 8', type: 'blue' },
          { repsTxt: '1 × 6 a 8', type: 'black' },
        ],
      },
      {
        key: 'triceps-corda',
        name: 'Tríceps corda',
        video: 'https://www.youtube.com/shorts/gCQCAmOpzx4',
        hint: 'toque no "i" para ver as instruções de cada série',
        sets: [
          { repsTxt: '1×15', type: 'red' },
          { repsTxt: '1 a 3 × 3', type: 'green' },
          { repsTxt: '2 × 6 a 8', type: 'blue' },
          { repsTxt: '1 × 6 a 8', type: 'black' },
        ],
      },
      {
        key: 'rosca-alternada',
        name: 'Rosca alternada com halter',
        video: 'https://www.youtube.com/shorts/3-uSpk4Opmo',
        hint: 'toque no "i" para ver as instruções de cada série',
        sets: [
          { repsTxt: '1×15', type: 'red' },
          { repsTxt: '1 a 3 × 3', type: 'green' },
          { repsTxt: '2 × 6 a 8', type: 'blue' },
          { repsTxt: '1 × 6 a 8', type: 'black' },
        ],
      },
      {
        key: 'triceps-testa',
        name: 'Tríceps testa com halter',
        video: 'https://www.youtube.com/shorts/13DBZJgUahs',
        hint: 'toque no "i" para ver as instruções de cada série',
        sets: [
          { repsTxt: '1×15', type: 'red' },
          { repsTxt: '1 a 3 × 3', type: 'green' },
          { repsTxt: '2 × 6 a 8', type: 'blue' },
          { repsTxt: '1 × 6 a 8', type: 'black' },
        ],
      },
      {
        key: 'rosca-scott',
        name: 'Rosca scott máquina',
        video: 'https://www.youtube.com/shorts/BQi7Ig3jqeE',
        hint: 'toque no "i" para ver as instruções de cada série',
        sets: [
          { repsTxt: '1×15', type: 'red' },
          { repsTxt: '1 a 3 × 3', type: 'green' },
          { repsTxt: '2 × 6 a 8', type: 'blue' },
          { repsTxt: '1 × 6 a 8', type: 'black' },
        ],
      },
      {
        key: 'triceps-frances',
        name: 'Tríceps francês com halter',
        video: 'https://www.youtube.com/shorts/GxT4z4watF4',
        hint: 'toque no "i" para ver as instruções de cada série',
        sets: [
          { repsTxt: '1×15', type: 'red' },
          { repsTxt: '1 a 3 × 3', type: 'green' },
          { repsTxt: '2 × 6 a 8', type: 'blue' },
          { repsTxt: '1 × 6 a 8', type: 'black' },
        ],
      },
    ],
  },
};

function VideoModal({ open, onClose, title, videoUrl }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)',
        display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 560, background: THEME.surface,
          border: `1px solid ${THEME.stroke}`, borderRadius: 16, padding: 12,
          boxShadow: THEME.shadow, color: THEME.text,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontWeight: 900 }}>{title}</div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: THEME.textMute, fontSize: 22, cursor: 'pointer' }}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
        <div style={{ borderRadius: 12, overflow: 'hidden', background: '#000', aspectRatio: '16 / 9' }}>
          <iframe
            width="100%" height="100%"
            src={videoUrl}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

function InfoModal({ open, onClose, infoKey }) {
  if (!open || !infoKey) return null;
  const info = SERIES_INFO[infoKey];
  if (!info) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
    >
      <div
        onClick={(e)=>e.stopPropagation()}
        style={{
          width:'94%', maxWidth:420, background:THEME.surface, color:THEME.text,
          border:`1px solid ${THEME.stroke}`, borderRadius:16, padding:14, boxShadow:THEME.shadow
        }}
      >
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <div style={{ fontWeight:900, display:'flex', alignItems:'center', gap:8 }}>
            <span style={{
              width:14, height:14, borderRadius:4, display:'inline-block',
              background: info.chipBg, border:'1px solid rgba(255,255,255,.15)'
            }}/>
            {info.title}
          </div>
          <button onClick={onClose} style={{ color:THEME.textMute, fontSize:22, background:'none', border:'none', cursor:'pointer' }}>×</button>
        </div>
        <div style={{ fontSize:13, color:THEME.textMute, lineHeight:1.5 }}>
          {info.text}
        </div>
      </div>
    </div>
  );
}

export default function WorkoutRunPage() {
  const router = useRouter();
  const { id } = useParams(); // a, b, c, d, e
  const plan = PLANS[id] || PLANS.a;

  // progresso agora é por série: progress[exKey].sets[i] = { done:boolean, weight:number }
  const storageKey = useMemo(() => `workout-progress-${id}`, [id]);
  const [progress, setProgress] = useState({});
  const [videoOpen, setVideoOpen] = useState(null);
  const [infoOpen, setInfoOpen] = useState(null); // 'red' | 'green' | 'blue' | 'black'

  // carrega progresso salvo
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setProgress(JSON.parse(raw));
    } catch {}
  }, [storageKey]);

  // salva a cada mudança
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(progress));
    } catch {}
  }, [progress, storageKey]);

  // init para exercício
  const ensureExercise = (exKey, setsLen) => {
    setProgress((p) => {
      if (p[exKey]?.sets?.length === setsLen) return p;
      const sets = Array.from({ length: setsLen }).map((_, i) => {
        const prev = p[exKey]?.sets?.[i];
        return prev ?? { done: false, weight: '' };
      });
      return { ...p, [exKey]: { sets } };
    });
  };

  // set peso por série
  const setWeight = (exKey, idx, value) => {
    setProgress((p) => {
      const ex = p[exKey]; if (!ex) return p;
      const sets = ex.sets.map((s, i) => i === idx ? { ...s, weight: value } : s);
      return { ...p, [exKey]: { ...ex, sets } };
    });
  };

  // toggle série
  const toggleSet = (exKey, idx) => {
    setProgress((p) => {
      const ex = p[exKey]; if (!ex) return p;
      const sets = ex.sets.map((s, i) => i === idx ? { ...s, done: !s.done } : s);
      return { ...p, [exKey]: { ...ex, sets } };
    });
  };

  // tudo concluído?
  const allDone = useMemo(() => {
    return plan.exercises.every((ex) => {
      const st = progress[ex.key];
      return st && st.sets && st.sets.length === ex.sets.length && st.sets.every((s) => s.done);
    });
  }, [plan.exercises, progress]);

  return (
    <div
      style={{
        minHeight: '100dvh',
        color: THEME.text,
        position: 'relative',
        paddingBottom: 24,
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
          padding: '14px 16px 10px',
          borderBottom: `1px solid ${THEME.strokeSoft}`,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0))',
          backdropFilter: 'blur(2px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <button
          onClick={() => router.back()}
          aria-label="Voltar"
          style={{
            width: 40, height: 40, borderRadius: 10,
            border: `1px solid ${THEME.stroke}`,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0))',
            color: THEME.textMute, display: 'grid', placeItems: 'center', cursor: 'pointer',
          }}
        >
          ←
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 900 }}>{plan.title}</div>
          <div style={{ fontSize: 12, color: THEME.textMute }}>{plan.estTime}</div>
        </div>
        <div style={{ width: 40 }} />
      </header>

      {/* Conteúdo */}
      <main style={{ padding: '14px 14px 80px', maxWidth: 560, margin: '0 auto', display: 'grid', gap: 12 }}>
        {plan.exercises.map((ex) => {
          // garante estrutura no primeiro render/interação
          useEffect(() => { ensureExercise(ex.key, ex.sets.length); }, []); // eslint-disable-line
          const st = progress[ex.key];

          return (
            <section
              key={ex.key}
              style={{
                background: THEME.surface,
                border: `1px solid ${THEME.stroke}`,
                borderRadius: 16,
                padding: 14,
                boxShadow: THEME.shadow,
                display: 'grid',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 900 }}>{ex.name}</div>
                  <div style={{ fontSize: 12, color: THEME.textMute }}>{ex.hint}</div>
                </div>
                <button
                  onClick={() => setVideoOpen(ex.key)}
                  style={{
                    alignSelf: 'start',
                    padding: '8px 10px', borderRadius: 10,
                    border: `1px solid ${THEME.stroke}`,
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0))',
                    color: THEME.text, fontSize: 12, fontWeight: 800,
                  }}
                >
                  Ver vídeo ›
                </button>
              </div>

              {/* Séries */}
              <div style={{ display: 'grid', gap: 8 }}>
                {ex.sets.map((s, i) => {
                  const done = st?.sets?.[i]?.done || false;
                  const weight = st?.sets?.[i]?.weight ?? '';
                  const colorInfo = SERIES_INFO[s.type];

                  return (
                    <div
                      key={i}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto auto 1fr auto',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 12,
                        border: `1px solid ${THEME.strokeSoft}`,
                        background: '#141417',
                      }}
                    >
                      {/* [Série N ⓘ] */}
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{
                          width: 12, height: 12, borderRadius: 4,
                          background: colorInfo?.chipBg || '#333',
                          border: '1px solid rgba(255,255,255,.15)'
                        }}/>
                        <div style={{ fontSize: 13, fontWeight: 800 }}>Série {i + 1}</div>
                        <button
                          onClick={() => setInfoOpen(s.type)}
                          title="Instruções da série"
                          style={{
                            border: `1px solid ${THEME.stroke}`,
                            borderRadius: 8,
                            padding: '2px 6px',
                            background: 'linear-gradient(180deg, rgba(255,255,255,.02), rgba(0,0,0,0))',
                            color: THEME.textMute,
                            fontSize: 12,
                          }}
                        >
                          i
                        </button>
                      </div>

                      {/* [REPS FIXAS] */}
                      <div style={{ fontSize: 12, color: THEME.textMute }}>
                        {s.repsTxt}
                      </div>

                      {/* [Carga: ___kg] */}
                      <div style={{ display:'flex', alignItems:'center', gap:6, justifySelf:'stretch' }}>
                        <label style={{ fontSize: 12, color: THEME.textMute }}>Carga:</label>
                        <input
                          type="number"
                          inputMode="numeric"
                          placeholder="kg"
                          value={weight}
                          onChange={(e) => setWeight(ex.key, i, e.target.value)}
                          style={{
                            width: '100%', maxWidth: 110,
                            padding: '8px 10px', borderRadius: 10,
                            background: '#1a1a1d', color: THEME.text,
                            border: `1px solid ${THEME.stroke}`,
                            textAlign: 'center',
                          }}
                        />
                      </div>

                      {/* [✓] */}
                      <button
                        onClick={() => toggleSet(ex.key, i)}
                        aria-pressed={done}
                        title={done ? 'Desmarcar série' : 'Marcar série'}
                        style={{
                          width: 30, height: 30, borderRadius: 8,
                          border: `1px solid ${THEME.stroke}`,
                          background: done ? `linear-gradient(180deg, ${THEME.red}, ${THEME.red2})` : '#1b1b1e',
                          color: '#fff', fontWeight: 900,
                          display: 'grid', placeItems: 'center',
                        }}
                      >
                        {done ? '✓' : ''}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>

      {/* CTA fixo para finalizar */}
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
          onClick={() => {
            try {
              const dateKey = ymd(new Date());
              const raw = localStorage.getItem('completedWorkouts');
              const map = raw ? JSON.parse(raw) : {};
              map[dateKey] = (id || 'a').toUpperCase(); // salva A/B/C/D/E
              localStorage.setItem('completedWorkouts', JSON.stringify(map));
            } catch {}
            router.replace('/treino'); // volta pra página que mostra a semana e já puxa o check
          }}
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
            boxShadow: allDone ? '0 8px 22px rgba(193,18,31,.22)' : 'none',
          }}
        >
          {allDone ? '✅ Finalizar treino' : 'Conclua todas as séries para finalizar'}
        </button>
      </div>

      <VideoModal
        open={!!videoOpen}
        onClose={() => setVideoOpen(null)}
        title={plan.exercises.find(e => e.key === videoOpen)?.name || 'Vídeo'}
        videoUrl={(plan.exercises.find(e => e.key === videoOpen)?.video) || ''}
      />

      <InfoModal
        open={!!infoOpen}
        onClose={() => setInfoOpen(null)}
        infoKey={infoOpen}
      />
    </div>
  );
}
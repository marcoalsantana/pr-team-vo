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
  const dt = new Date(d); dt.setHours(0,0,0,0);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

// --- MOCK DE PLANOS
const PLANS = {
  a: {
    title: 'Treino A — Peito/Tríceps',
    estTime: '~ 55 min',
    exercises: [
      { key: 'supreto', name: 'Supino reto com barra',        target: '4 x 8–10',  defaultWeight: 40, video: 'https://www.youtube.com/embed/1lAV0hWvQGE', sets: 4 },
      { key: 'supincl', name: 'Supino inclinado com halteres', target: '3 x 10–12', defaultWeight: 16, video: 'https://www.youtube.com/embed/hOxo9U6Q9uA', sets: 3 },
      { key: 'cross',   name: 'Cross-over (cabo)',             target: '3 x 12–15', defaultWeight: 12, video: 'https://www.youtube.com/embed/HiRsm4V6Wsg',  sets: 3 },
    ],
  },
  b: {
    title: 'Treino B — Pernas/Glúteo',
    estTime: '~ 60 min',
    exercises: [
      { key: 'agach',  name: 'Agachamento livre',   target: '4 x 6–8',   defaultWeight: 60,  video: 'https://www.youtube.com/embed/1oed-UmAxFs', sets: 4 },
      { key: 'leg',    name: 'Leg press',           target: '4 x 10–12', defaultWeight: 120, video: 'https://www.youtube.com/embed/uU5tFGD3qJY',   sets: 4 },
      { key: 'ext',    name: 'Cadeira extensora',   target: '3 x 12–15', defaultWeight: 25,  video: 'https://www.youtube.com/embed/Y_7aHqXeCfQ',    sets: 3 },
    ],
  },
  c: {
    title: 'Treino C — Costas/Bíceps',
    estTime: '~ 55 min',
    exercises: [
      { key: 'puxada', name: 'Puxada na frente', target: '4 x 8–10',  defaultWeight: 45, video: 'https://www.youtube.com/embed/CAwf7n6Luuc', sets: 4 },
      { key: 'remada', name: 'Remada curvada',   target: '3 x 8–10',  defaultWeight: 40, video: 'https://www.youtube.com/embed/vT2GjY_Umpw',  sets: 3 },
      { key: 'rosca',  name: 'Rosca direta',     target: '3 x 10–12', defaultWeight: 20, video: 'https://www.youtube.com/embed/ykJmrZ5v0Oo',  sets: 3 },
    ],
  },
  d: {
    title: 'Treino D — Ombros/Core',
    estTime: '~ 50 min',
    exercises: [
      { key: 'devmil', name: 'Desenvolvimento militar', target: '4 x 8–10',  defaultWeight: 30, video: 'https://www.youtube.com/embed/qEwKCR5JCog', sets: 4 },
      { key: 'elevl',  name: 'Elevação lateral',        target: '3 x 12–15', defaultWeight: 8,  video: 'https://www.youtube.com/embed/3VcKaXpzqRo', sets: 3 },
      { key: 'pranch', name: 'Prancha',                 target: '3 x 30–45s', defaultWeight: 0,  video: 'https://www.youtube.com/embed/pSHjTRCQxIw', sets: 3 },
    ],
  },
  e: {
    title: 'Treino E — Full Body',
    estTime: '~ 50 min',
    exercises: [
      { key: 'agach',  name: 'Agachamento',       target: '3 x 8–10',  defaultWeight: 50, video: 'https://www.youtube.com/embed/1oed-UmAxFs', sets: 3 },
      { key: 'supino', name: 'Supino reto',       target: '3 x 8–10',  defaultWeight: 40, video: 'https://www.youtube.com/embed/1lAV0hWvQGE', sets: 3 },
      { key: 'puxada', name: 'Puxada na frente',  target: '3 x 10–12', defaultWeight: 40, video: 'https://www.youtube.com/embed/CAwf7n6Luuc', sets: 3 },
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
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

export default function WorkoutRunPage() {
  const router = useRouter();
  const { id: rawId } = useParams(); // a, b, c, d, e
  const id = String(rawId || 'a').toLowerCase();
  const plan = PLANS[id] || PLANS.a;

  const storageKey = useMemo(() => `workout-progress-${id}`, [id]);
  const [progress, setProgress] = useState({});
  const [videoOpen, setVideoOpen] = useState(null);

  // carrega progresso salvo
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setProgress(JSON.parse(raw));
      else setProgress({});
    } catch {
      setProgress({});
    }
  }, [storageKey]);

  // salva a cada mudança
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(progress));
    } catch {}
  }, [progress, storageKey]);

  // init helpers
  const initExercise = (ex) => {
    if (progress[ex.key]) return;
    setProgress((p) => ({
      ...p,
      [ex.key]: {
        weight: ex.defaultWeight ?? 0,
        sets: Array.from({ length: ex.sets }).map(() => ({ done: false, reps: '' })),
      },
    }));
  };
  const setWeight = (exKey, value) => {
    setProgress((p) => ({
      ...p,
      [exKey]: { ...(p[exKey] || {}), weight: value },
    }));
  };
  const toggleSet = (exKey, idx) => {
    setProgress((p) => {
      const ex = p[exKey]; if (!ex) return p;
      const sets = ex.sets.map((s, i) => i === idx ? { ...s, done: !s.done } : s);
      return { ...p, [exKey]: { ...ex, sets } };
    });
  };
  const setReps = (exKey, idx, reps) => {
    setProgress((p) => {
      const ex = p[exKey]; if (!ex) return p;
      const sets = ex.sets.map((s, i) => i === idx ? { ...s, reps } : s);
      return { ...p, [exKey]: { ...ex, sets } };
    });
  };

  const allDone = useMemo(() => {
    return plan.exercises.every((ex) => {
      const st = progress[ex.key];
      return st && st.sets && st.sets.length === ex.sets && st.sets.every((s) => s.done);
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
              onMouseEnter={() => initExercise(ex)}
              onTouchStart={() => initExercise(ex)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 900 }}>{ex.name}</div>
                  <div style={{ fontSize: 12, color: THEME.textMute }}>{ex.target}</div>
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

              {/* Ajuste de carga */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <label style={{ fontSize: 12, color: THEME.textMute }}>Carga (kg)</label>
                <input
                  type="number"
                  value={st?.weight ?? ex.defaultWeight ?? 0}
                  onChange={(e) => setWeight(ex.key, Number(e.target.value || 0))}
                  style={{
                    width: 110, padding: '10px 12px', borderRadius: 12,
                    background: '#1a1a1d', color: THEME.text,
                    border: `1px solid ${THEME.stroke}`,
                  }}
                />
              </div>

              {/* Séries */}
              <div style={{ display: 'grid', gap: 8 }}>
                {Array.from({ length: ex.sets }).map((_, i) => {
                  const done = st?.sets?.[i]?.done || false;
                  const reps = st?.sets?.[i]?.reps ?? '';
                  return (
                    <div
                      key={i}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr 110px',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 12,
                        border: `1px solid ${THEME.strokeSoft}`,
                        background: '#141417',
                      }}
                    >
                      <button
                        onClick={() => toggleSet(ex.key, i)}
                        aria-pressed={done}
                        style={{
                          width: 28, height: 28, borderRadius: 8,
                          border: `1px solid ${THEME.stroke}`,
                          background: done ? `linear-gradient(180deg, ${THEME.red}, ${THEME.red2})` : '#1b1b1e',
                          color: '#fff', fontWeight: 900,
                          display: 'grid', placeItems: 'center',
                        }}
                        title={done ? 'Desmarcar série' : 'Marcar série'}
                      >
                        {done ? '✓' : ''}
                      </button>
                      <div style={{ fontSize: 13, color: done ? THEME.text : THEME.textMute }}>
                        Série {i + 1}
                      </div>
                      <input
                        placeholder="reps"
                        value={reps}
                        onChange={(e) => setReps(ex.key, i, e.target.value)}
                        style={{
                          width: '100%', padding: '8px 10px', borderRadius: 10,
                          background: '#1a1a1d', color: THEME.text,
                          border: `1px solid ${THEME.stroke}`,
                          textAlign: 'center',
                        }}
                      />
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
            // 1) grava conclusão do treino do dia
            try {
              const dateKey = ymd(new Date());
              const raw = localStorage.getItem('completedWorkouts');
              const map = raw ? JSON.parse(raw) : {};
              map[dateKey] = (id || 'a').toUpperCase(); // 'A' | 'B' | ...
              localStorage.setItem('completedWorkouts', JSON.stringify(map));
            } catch {}

            // 2) volta pro /treino (a página lê de novo o storage)
            router.replace('/treino');
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

      {/* Modal de vídeo */}
      <VideoModal
        open={!!videoOpen}
        onClose={() => setVideoOpen(null)}
        title={plan.exercises.find(e => e.key === videoOpen)?.name || 'Vídeo'}
        videoUrl={(plan.exercises.find(e => e.key === videoOpen)?.video) || ''}
      />
    </div>
  );
}
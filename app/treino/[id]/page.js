// app/treino/[id]/page.jsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import BottomTabs from '../../../components/BottomTabs';

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

// --- MOCK (trocaremos depois pra vir do /admin)
const PLANS = {
  a: {
    title: 'Treino A — Peito/Tríceps',
    estTime: '~ 55 min',
    exercises: [
      { key: 'supret', name: 'Supino reto (barra)', target: '4 x 8–10', defaultWeight: 40, video: 'https://www.youtube.com/embed/1lAV0hWvQGE', sets: 4 },
      { key: 'supinc', name: 'Supino inclinado (halteres)', target: '3 x 10–12', defaultWeight: 16, video: 'https://www.youtube.com/embed/hOxo9U6Q9uA', sets: 3 },
      { key: 'cross',  name: 'Cross-over (cabo)',        target: '3 x 12–15', defaultWeight: 12, video: 'https://www.youtube.com/embed/HiRsm4V6Wsg', sets: 3 },
      { key: 'dips',   name: 'Mergulho no banco',        target: '3 x 10–12', defaultWeight: 0,  video: 'https://www.youtube.com/embed/0326dy_-CzM', sets: 3 },
    ],
  },
  b: {
    title: 'Treino B — Pernas/Glúteo',
    estTime: '~ 60 min',
    exercises: [
      { key: 'agach', name: 'Agachamento livre', target: '4 x 6–8', defaultWeight: 60, video: 'https://www.youtube.com/embed/ultWZbUMPL8', sets: 4 },
      { key: 'legpr', name: 'Leg press',        target: '4 x 10–12', defaultWeight: 120, video: 'https://www.youtube.com/embed/IZxyjW7MPJQ', sets: 4 },
      { key: 'exten', name: 'Cadeira extensora',target: '3 x 12–15', defaultWeight: 30, video: 'https://www.youtube.com/embed/YyvSfVjQeL0', sets: 3 },
    ],
  },
  c: { title: 'Treino C — Costas/Bíceps', estTime: '~ 55 min', exercises: [] },
  d: { title: 'Treino D — Ombros/Core',   estTime: '~ 45 min', exercises: [] },
  e: { title: 'Treino E — Full Body',     estTime: '~ 50 min', exercises: [] },
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

// formata YYYY-MM-DD no fuso do usuário
function fmtDate(d = new Date()) {
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export default function WorkoutRunPage() {
  const router = useRouter();
  const { id } = useParams();        // 'a' | 'b' | ...
  const plan = PLANS[id] || PLANS.a; // fallback

  // estado do treino (persistido por localStorage)
  const storageKey = useMemo(() => `workout-progress-${id}`, [id]);
  const [progress, setProgress] = useState({});
  const [videoOpen, setVideoOpen] = useState(null); // key do exercício aberto

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

  // helpers
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
    if (!plan.exercises.length) return false;
    return plan.exercises.every((ex) => {
      const st = progress[ex.key];
      return st && st.sets && st.sets.length === ex.sets && st.sets.every((s) => s.done);
    });
  }, [plan.exercises, progress]);

  // salva conclusão do treino no dia atual
  function saveCompletion(idLetter) {
    try {
      const key = 'completedWorkouts';
      const raw = localStorage.getItem(key);
      const obj = raw ? JSON.parse(raw) : {};
      obj[fmtDate(new Date())] = String(idLetter).toUpperCase();
      localStorage.setItem(key, JSON.stringify(obj));
    } catch {}
  }

  const finalizarTreino = () => {
    saveCompletion(id);
    alert('✅ Treino concluído! Vai aparecer na sua semana.');
    router.replace('/treino');
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        color: THEME.text,
        position: 'relative',
        paddingBottom: 96,
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
      <main style={{ padding: '14px 14px 10px', maxWidth: 560, margin: '0 auto', display: 'grid', gap: 12 }}>
        {plan.exercises.length === 0 && (
          <div
            style={{
              background: THEME.surface, border: `1px solid ${THEME.stroke}`, borderRadius: 14, padding: 16,
              color: THEME.textMute, textAlign: 'center',
            }}
          >
            Este treino ainda não foi configurado. Volte e escolha outro por enquanto.
          </div>
        )}

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
          onClick={finalizarTreino}
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
          {allDone ? '✅ Finalizar treino' : 'Conclua todas as séries para finalizar'}
        </button>
      </div>

      <BottomTabs active="treino" onNavigate={(href) => router.push(href)} />

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
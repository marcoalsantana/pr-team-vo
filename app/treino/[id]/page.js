// app/treino/[id]/page.jsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';

/* ================= THEME ================= */
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

/* ================= HELPERS ================= */
function ymd(d) {
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

// transforma links do YouTube/Shorts em embed
function toEmbed(url = '') {
  try {
    if (!url) return '';
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) {
      if (u.pathname.startsWith('/watch')) {
        const id = u.searchParams.get('v');
        return id ? `https://www.youtube.com/embed/${id}` : url;
      }
      if (u.pathname.startsWith('/shorts/')) {
        const id = u.pathname.split('/')[2];
        return id ? `https://www.youtube.com/embed/${id}` : url;
      }
      if (u.pathname.startsWith('/embed/')) return url;
    }
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.replace('/', '');
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    return url;
  } catch {
    return url;
  }
}

/* ================= SÉRIES (legendas) ================= */
const SERIES_INFO = {
  red: {
    label: 'SÉRIES VERMELHAS (aquecimento)',
    hint:
      'Faça as repetições com carga que permitiria mais ~10 reps. DESCANSO: 20–50s.',
    chipBg: 'linear-gradient(180deg,#c1121f,#e04141)',
  },
  green: {
    label: 'SÉRIES VERDES (ajuste de carga)',
    hint:
      'Faça as repetições com carga que permitiria mais ~5 reps. DESCANSO: 60–90s.',
    chipBg: 'linear-gradient(180deg,#1f9d55,#27c281)',
  },
  blue: {
    label: 'SÉRIES AZUIS (válidas)',
    hint:
      'Válidas pro volume semanal. Vá até quase falhar com execução perfeita. DESCANSO: 90s–2,5min.',
    chipBg: 'linear-gradient(180deg,#2563eb,#60a5fa)',
  },
  black: {
    label: 'SÉRIES PRETAS (falha)',
    hint:
      'Até a falha total (mesmo com técnica do “roubo”). DESCANSO: 3–4min.',
    chipBg: 'linear-gradient(180deg,#111,#333)',
  },
};
const COLOR_OPTIONS = [
  { key: 'red', label: 'Vermelha (aquecimento)' },
  { key: 'green', label: 'Verde (ajuste de carga)' },
  { key: 'blue', label: 'Azul (válida)' },
  { key: 'black', label: 'Preta (falha)' },
];

/* =========== MODELO BASE (apenas fallback) =========== */
const PLANS = {
  a: {
    title: 'Treino A — Braço',
    estTime: '~ 55–65 min',
    exercises: [
      {
        key: 'rosca-w',
        name: 'Rosca direta com barra W',
        video: 'https://www.youtube.com/shorts/xIBnRKQFSFA',
        hint: 'Toque no "i" para ver as instruções de cada série',
        sets: [
          { repsTxt: '1×15', type: 'red', blocks: 1 },
          { repsTxt: '1 a 3 × 3', type: 'green', blocks: 1 },
          { repsTxt: '2 × 6 a 8', type: 'blue', blocks: 2 },
          { repsTxt: '1 × 6 a 8', type: 'black', blocks: 1 },
        ],
      },
    ],
  },
};

/* ================= Modais ================= */
function VideoModal({ open, onClose, title, videoUrl }) {
  if (!open) return null;
  const embed = toEmbed(videoUrl);
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
            src={embed}
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
            {info.label}
          </div>
          <button onClick={onClose} style={{ color:THEME.textMute, fontSize:22, background:'none', border:'none', cursor:'pointer' }}>×</button>
        </div>
        <div style={{ fontSize:13, color:THEME.textMute, lineHeight:1.5 }}>
          {info.hint}
        </div>
      </div>
    </div>
  );
}

/* =================== PÁGINA =================== */
export default function WorkoutRunPage() {
  const router = useRouter();
  const { id } = useParams(); // a, b, c, d, e
  const search = useSearchParams();
  const isEdit = search?.get('edit') === '1';

  /* ---------- Chaves de storage ---------- */
  const storageKey = useMemo(() => `workout-progress-${id}`, [id]);
  const planStorageKey = useMemo(() => `workout-plan-${id}`, [id]);

  /* ---------- Plano base + estado do plano ---------- */
  const basePlan = useMemo(() => (PLANS[id] || PLANS.a), [id]);
  const [plan, setPlan] = useState(basePlan);

  // carrega plano salvo, se houver
  useEffect(() => {
    try {
      const raw = localStorage.getItem(planStorageKey);
      if (raw) setPlan(JSON.parse(raw));
      else setPlan(basePlan);
    } catch {
      setPlan(basePlan);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planStorageKey, id]);

  /* ---------- Progresso por série/bloco ---------- */
  // progress[exKey] = { sets: [{ done: bool, weights: [ ...por bloco ] }] }
  const [progress, setProgress] = useState({});
  const [videoOpen, setVideoOpen] = useState(null);
  const [infoOpen, setInfoOpen] = useState(null);

  // carrega progresso salvo
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setProgress(JSON.parse(raw));
    } catch {}
  }, [storageKey]);

  // salva progresso
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(progress));
    } catch {}
  }, [progress, storageKey]);

  /* ---------- Garantias de forma (sem hook dentro do map) ---------- */
  useEffect(() => {
    // garante que progress tenha a mesma forma do plan (ex/sets/blocks)
    setProgress((p) => {
      const next = { ...p };
      (plan.exercises || []).forEach((ex) => {
        const exState = next[ex.key] || { sets: [] };
        const sets = (ex.sets || []).map((s, i) => {
          const prev = exState.sets[i] || { done: false, weights: [] };
          const blocks = Math.max(1, Number(s.blocks || 1));
          const weights = Array.from({ length: blocks }).map((_, bi) =>
            prev.weights && prev.weights[bi] !== undefined ? prev.weights[bi] : ''
          );
          return { done: !!prev.done, weights };
        });
        next[ex.key] = { sets };
      });
      return next;
    });
  }, [plan]);

  /* ---------- Derivado: allDone ---------- */
  const allDone = useMemo(() => {
    return (plan.exercises || []).every((ex) => {
      const st = progress[ex.key];
      if (!st?.sets || st.sets.length !== (ex.sets?.length || 0)) return false;
      return st.sets.every((s) => s.done);
    });
  }, [plan, progress]);

  /* ---------- Mutations de progresso ---------- */
  const setWeight = (exKey, setIdx, blockIdx, value) => {
    setProgress((p) => {
      const ex = p[exKey] || { sets: [] };
      const sets = ex.sets.map((s, i) => {
        if (i !== setIdx) return s;
        const blocks = s.weights.length;
        const weights = Array.from({ length: blocks }).map((_, bi) =>
          bi === blockIdx ? value : (s.weights[bi] ?? '')
        );
        return { ...s, weights };
      });
      return { ...p, [exKey]: { sets } };
    });
  };

  const toggleSet = (exKey, setIdx) => {
    setProgress((p) => {
      const ex = p[exKey] || { sets: [] };
      const sets = ex.sets.map((s, i) => (i === setIdx ? { ...s, done: !s.done } : s));
      return { ...p, [exKey]: { sets } };
    });
  };

  /* ---------- Mutations do editor (plano) ---------- */
  const [saveHint, setSaveHint] = useState('');
  const savePlan = () => {
    try {
      localStorage.setItem(planStorageKey, JSON.stringify(plan));
      setSaveHint('Salvo!');
      setTimeout(() => setSaveHint(''), 1500);
    } catch {
      setSaveHint('Falha ao salvar');
      setTimeout(() => setSaveHint(''), 2000);
    }
  };
  const resetPlan = () => {
    try { localStorage.removeItem(planStorageKey); } catch {}
    setPlan(basePlan);
    setSaveHint('Reposto');
    setTimeout(() => setSaveHint(''), 1200);
  };

  const addExercise = () => {
    setPlan((old) => {
      const key = `ex-${Math.random().toString(36).slice(2, 8)}`;
      const ex = {
        key,
        name: 'Novo exercício',
        video: '',
        hint: 'Toque no "i" para ver as instruções de cada série',
        sets: [{ repsTxt: '1×10', type: 'blue', blocks: 1 }],
      };
      return { ...old, exercises: [...(old.exercises || []), ex] };
    });
  };

  const removeExercise = (exIdx) => {
    setPlan((old) => {
      const arr = (old.exercises || []).slice();
      const removed = arr.splice(exIdx, 1)[0];
      // limpa progresso daquele exercício
      setProgress((p) => {
        const np = { ...p };
        if (removed?.key) delete np[removed.key];
        return np;
      });
      return { ...old, exercises: arr };
    });
  };

  const renameExercise = (exIdx, value) => {
    setPlan((old) => {
      const arr = old.exercises.slice();
      const ex = { ...arr[exIdx], name: value };
      arr[exIdx] = ex;
      return { ...old, exercises: arr };
    });
  };

  const setExerciseVideo = (exIdx, value) => {
    setPlan((old) => {
      const arr = old.exercises.slice();
      const ex = { ...arr[exIdx], video: value };
      arr[exIdx] = ex;
      return { ...old, exercises: arr };
    });
  };

  const addSeries = (exIdx) => {
    setPlan((old) => {
      const arr = old.exercises.slice();
      const ex = { ...arr[exIdx] };
      ex.sets = [...(ex.sets || []), { repsTxt: '1×10', type: 'blue', blocks: 1 }];
      arr[exIdx] = ex;
      return { ...old, exercises: arr };
    });
  };

  const removeSeries = (exIdx, setIdx) => {
    setPlan((old) => {
      const arr = old.exercises.slice();
      const ex = { ...arr[exIdx] };
      const st = (ex.sets || []).slice();
      st.splice(setIdx, 1);
      ex.sets = st;
      arr[exIdx] = ex;
      return { ...old, exercises: arr };
    });
  };

  const updateSeries = (exIdx, setIdx, patch) => {
    setPlan((old) => {
      const arr = old.exercises.slice();
      const ex = { ...arr[exIdx] };
      const st = (ex.sets || []).slice();
      st[setIdx] = { ...st[setIdx], ...patch };
      ex.sets = st;
      arr[exIdx] = ex;
      return { ...old, exercises: arr };
    });
  };

  const addBlock = (exIdx, setIdx) => {
    setPlan((old) => {
      const arr = old.exercises.slice();
      const ex = { ...arr[exIdx] };
      const st = (ex.sets || []).slice();
      const current = st[setIdx] || { blocks: 1 };
      const nb = Math.max(1, Number(current.blocks || 1) + 1);
      st[setIdx] = { ...current, blocks: nb };
      ex.sets = st;
      arr[exIdx] = ex;
      return { ...old, exercises: arr };
    });
  };

  const removeBlock = (exIdx, setIdx) => {
    setPlan((old) => {
      const arr = old.exercises.slice();
      const ex = { ...arr[exIdx] };
      const st = (ex.sets || []).slice();
      const current = st[setIdx] || { blocks: 1 };
      const nb = Math.max(1, Number(current.blocks || 1) - 1);
      st[setIdx] = { ...current, blocks: nb };
      ex.sets = st;
      arr[exIdx] = ex;
      return { ...old, exercises: arr };
    });
  };

  /* =============== RENDER =============== */
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
      {/* Header (igual antes) */}
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

      {/* Aviso fixo pequeno (vermelho) */}
      <div
        style={{
          position: 'sticky',
          top: 58,
          zIndex: 750,
          background: 'linear-gradient(90deg, rgba(193,18,31,0.88), rgba(224,65,65,0.88))',
          color: '#fff',
          textAlign: 'center',
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 0.3,
          padding: '6px 8px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(4px)',
          textShadow: '0 1px 3px rgba(0,0,0,0.25)',
        }}
      >
        ⚠️ A progressão de carga entre cada faixa de série é obrigatória!
      </div>

      <main style={{ padding: '14px 14px 90px', maxWidth: 560, margin: '0 auto', display: 'grid', gap: 12 }}>
        {/* Barra do editor */}
        {isEdit && (
          <div style={{
            display:'flex', justifyContent:'space-between', alignItems:'center',
            background:'#141417', border:`1px solid ${THEME.stroke}`, borderRadius:12, padding:10
          }}>
            <div style={{ display:'flex', gap:8 }}>
              <button
                onClick={savePlan}
                style={{
                  border:`1px solid ${THEME.stroke}`, borderRadius:10, padding:'8px 10px',
                  background:'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0))',
                  color:THEME.text, fontSize:12, fontWeight:800
                }}
              >
                💾 Salvar alterações
              </button>
              <button
                onClick={resetPlan}
                style={{
                  border:`1px solid ${THEME.stroke}`, borderRadius:10, padding:'8px 10px',
                  background:'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0))',
                  color:THEME.text, fontSize:12, fontWeight:800
                }}
              >
                ↺ Repor modelo
              </button>
            </div>
            <div style={{ fontSize:12, color:THEME.textMute, minWidth:60, textAlign:'right' }}>{saveHint}</div>
          </div>
        )}

        {/* Botão para adicionar exercício (editor) */}
        {isEdit && (
          <button
            onClick={addExercise}
            style={{
              border: `1px solid ${THEME.stroke}`, borderRadius: 12, padding: '12px 14px',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0))',
              color: THEME.text, fontSize: 13, fontWeight: 900, textAlign:'left'
            }}
          >
            + Adicionar exercício
          </button>
        )}

        {/* Lista de exercícios */}
        {(plan.exercises || []).map((ex, exIdx) => {
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
              {/* Cabeçalho do exercício */}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ display:'grid', gap:6, flex: 1 }}>
                  {!isEdit ? (
                    <>
                      <div style={{ fontSize: 16, fontWeight: 900 }}>{ex.name}</div>
                      <div style={{ fontSize: 12, color: THEME.textMute }}>
                        {ex.hint || 'Toque no "i" para ver as instruções de cada série'}
                      </div>
                    </>
                  ) : (
                    <>
                      <input
                        value={ex.name}
                        onChange={(e) => renameExercise(exIdx, e.target.value)}
                        placeholder="Nome do exercício"
                        style={{
                          width:'100%', padding:'10px 12px', borderRadius:10,
                          background:'#1a1a1d', color:THEME.text, border:`1px solid ${THEME.stroke}`,
                          fontWeight:900
                        }}
                      />
                      <input
                        value={ex.video || ''}
                        onChange={(e)=>setExerciseVideo(exIdx, e.target.value)}
                        placeholder="URL do vídeo (YouTube/Shorts/Embed)"
                        style={{
                          width:'100%', padding:'8px 10px', borderRadius:10,
                          background:'#1a1a1d', color:THEME.text, border:`1px solid ${THEME.stroke}`,
                          fontSize:12
                        }}
                      />
                    </>
                  )}
                </div>

                {!isEdit ? (
                  <button
                    onClick={() => setVideoOpen(ex.key)}
                    style={{
                      alignSelf: 'start',
                      padding: '8px 10px', borderRadius: 10,
                      border: `1px solid ${THEME.stroke}`,
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0))',
                      color: THEME.text, fontSize: 12, fontWeight: 800,
                      whiteSpace:'nowrap'
                    }}
                  >
                    Ver vídeo ›
                  </button>
                ) : (
                  <button
                    onClick={() => removeExercise(exIdx)}
                    style={{
                      alignSelf:'start',
                      padding:'8px 10px', borderRadius:10,
                      border:`1px solid ${THEME.stroke}`,
                      background:'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0))',
                      color:THEME.text, fontSize:12, fontWeight:800, whiteSpace:'nowrap'
                    }}
                  >
                    Excluir exercício
                  </button>
                )}
              </div>

              {/* Séries */}
              <div style={{ display: 'grid', gap: 8 }}>
                {(ex.sets || []).map((s, setIdx) => {
                  const blocks = Math.max(1, Number(s.blocks || 1));
                  const weights = st?.sets?.[setIdx]?.weights || [];
                  const done = st?.sets?.[setIdx]?.done || false;
                  const colorInfo = SERIES_INFO[s.type] || SERIES_INFO.blue;

                  return (
                    <div
                      key={setIdx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr auto',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 12,
                        border: `1px solid ${THEME.strokeSoft}`,
                        background: '#141417',
                      }}
                    >
                      {/* ESQUERDA: chip + "Série N" + (i) */}
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{
                          width: 12, height: 12, borderRadius: 4,
                          background: colorInfo.chipBg,
                          border: '1px solid rgba(255,255,255,.15)'
                        }}/>
                        <div style={{ fontSize: 13, fontWeight: 800 }}>Série {setIdx + 1}</div>
                        {!isEdit && (
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
                        )}
                      </div>

                      {/* MEIO: reps + blocos inline (lado a lado e responsivo) */}
                      <div style={{ minWidth:0 }}>
                        {!isEdit ? (
                          <div style={{ fontSize: 12, color: THEME.textMute, marginBottom: 6 }}>
                            {s.repsTxt}
                          </div>
                        ) : (
                          <div style={{ display: 'grid', gap: 10 }}>
                            {/* linha de edição da série */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 10, alignItems:'center' }}>
                              {/* seletor de cor */}
                              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                <span style={{
                                  width: 14, height: 14, borderRadius: 4,
                                  background: (SERIES_INFO[s.type]?.chipBg) || SERIES_INFO.blue.chipBg,
                                  border: '1px solid rgba(255,255,255,.15)'
                                }} />
                                <select
                                  value={s.type}
                                  onChange={(e) => updateSeries(exIdx, setIdx, { type: e.target.value })}
                                  style={{
                                    background:'#1a1a1d', color:THEME.text, border:`1px solid ${THEME.stroke}`,
                                    borderRadius:8, padding:'6px 8px', fontSize:12
                                  }}
                                >
                                  {COLOR_OPTIONS.map((c) => (
                                    <option key={c.key} value={c.key}>{c.label}</option>
                                  ))}
                                </select>
                              </div>

                              {/* reps */}
                              <input
                                value={s.repsTxt}
                                onChange={(e) => updateSeries(exIdx, setIdx, { repsTxt: e.target.value })}
                                placeholder="Repetições (ex: 2 × 6 a 8)"
                                style={{
                                  width:'100%', padding:'8px 10px', borderRadius:10,
                                  background:'#1a1a1d', color:THEME.text, border:`1px solid ${THEME.stroke}`,
                                  fontSize:12
                                }}
                              />

                              {/* excluir série */}
                              <button
                                onClick={() => removeSeries(exIdx, setIdx)}
                                style={{
                                  border: `1px solid ${THEME.stroke}`, borderRadius: 10, padding: '6px 8px',
                                  background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0))',
                                  color: THEME.text, fontSize: 12, fontWeight: 800, justifySelf:'end'
                                }}
                              >
                                Excluir
                              </button>
                            </div>
                          </div>
                        )}

                        {/* blocos de carga (sempre visíveis no mesmo subcard) */}
                        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                          {Array.from({ length: blocks }).map((_, bi) => (
                            <div key={bi} style={{ display:'flex', alignItems:'center', gap:6 }}>
                              <label style={{ fontSize: 11, color: THEME.textMute }}>Bloco {bi + 1}:</label>
                              <input
                                type="number"
                                inputMode="numeric"
                                placeholder="kg"
                                value={weights[bi] ?? ''}
                                onChange={(e)=>setWeight(ex.key, setIdx, bi, e.target.value)}
                                style={{
                                  width: 86,
                                  padding: '7px 9px', borderRadius: 10,
                                  background: '#1a1a1d', color: THEME.text,
                                  border: `1px solid ${THEME.stroke}`,
                                  textAlign: 'center',
                                }}
                              />
                            </div>
                          ))}
                        </div>

                        {/* Editor de blocks (somente no modo edit) */}
                        {isEdit && (
                          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginTop:8 }}>
                            <span style={{ fontSize:12, color:THEME.textMute }}>Blocos de carga:</span>
                            <button
                              onClick={()=>addBlock(exIdx, setIdx)}
                              style={{
                                border: `1px solid ${THEME.stroke}`, borderRadius: 10, padding: '6px 8px',
                                background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0))',
                                color: THEME.text, fontSize: 12, fontWeight: 800
                              }}
                            >
                              + bloco
                            </button>
                            <button
                              onClick={()=>removeBlock(exIdx, setIdx)}
                              style={{
                                border: `1px solid ${THEME.stroke}`, borderRadius: 10, padding: '6px 8px',
                                background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0))',
                                color: THEME.text, fontSize: 12, fontWeight: 800
                              }}
                            >
                              − bloco
                            </button>
                          </div>
                        )}
                      </div>

                      {/* DIREITA: ✓ */}
                      {!isEdit && (
                        <button
                          onClick={() => toggleSet(ex.key, setIdx)}
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
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Adicionar série (editor) */}
              {isEdit && (
                <button
                  onClick={() => addSeries(exIdx)}
                  style={{
                    border: `1px solid ${THEME.stroke}`, borderRadius: 10, padding: '8px 10px',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0))',
                    color: THEME.text, fontSize: 12, fontWeight: 800, justifySelf:'start'
                  }}
                >
                  + Adicionar série
                </button>
              )}
            </section>
          );
        })}
      </main>

            {/* CTA fixo para finalizar */}
            {!isEdit && (
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
              router.replace('/treino'); // volta pra lista (marca check em "Sua semana")
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
      )}

      {/* Modais */}
      <VideoModal
        open={!!videoOpen}
        onClose={() => setVideoOpen(null)}
        title={(plan.exercises || []).find(e => e.key === videoOpen)?.name || 'Vídeo'}
        videoUrl={(plan.exercises || []).find(e => e.key === videoOpen)?.video || ''}
      />
      <InfoModal
        open={!!infoOpen}
        onClose={() => setInfoOpen(null)}
        infoKey={infoOpen}
      />
    </div>
  );
}
// app/treino/[id]/page.js
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { WORKOUTS } from '../../_data/workouts';

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

// Histórico de cargas usado pela página /evolucao
const STORAGE_LIFTS = 'history-lifts-v1';

// Salva no histórico as cargas de cada exercício do treino finalizado
function appendLiftsHistory({ plan, progress, workoutId }) {
  try {
    const raw = localStorage.getItem(STORAGE_LIFTS);
    const arr = raw ? JSON.parse(raw) : [];
    const dateISO = new Date().toISOString();

    for (const ex of plan.exercises || []) {
      const st = progress[ex.key];
      if (!st || !Array.isArray(st.sets)) continue;

      // Extrai pesos numéricos de todas as séries/blocos marcados
      const all = [];
      st.sets.forEach((serie) => {
        (serie.weights || []).forEach((w) => {
          const num = Number(String(w).replace(',', '.'));
          if (!isNaN(num) && num > 0) all.push(num);
        });
      });
      if (!all.length) continue;

      const max = Math.max(...all);

      arr.push({
        dateISO,
        workoutId: String(workoutId || '').toUpperCase(), // A/B/C/D/E
        exerciseKey: ex.key,
        exerciseName: ex.name || 'Exercício',
        weights: all,
        max,
      });
    }

    // Mantém no máximo 1000 registros recentes
    localStorage.setItem(STORAGE_LIFTS, JSON.stringify(arr.slice(-1000)));
  } catch {}
}

/* ====== Toast (PRFIT) ====== */
function Toast({ text, visible }) {
  if (!visible) return null;
  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        bottom: '18%',
        transform: 'translateX(-50%)',
        zIndex: 1300,
        pointerEvents: 'none',
        transition: 'opacity 240ms ease',
        opacity: visible ? 1 : 0,
      }}
      aria-live="polite"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 14px',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(25,25,28,0.88)',
          backdropFilter: 'blur(6px)',
          color: '#fff',
          fontWeight: 900,
          boxShadow: '0 10px 22px rgba(0,0,0,0.35)',
        }}
      >
        <span>✅</span>
        <span style={{ fontSize: 13 }}>{text}</span>
      </div>
    </div>
  );
}

/* Tipos de série (cores + textos do “i”) */
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

const COLOR_OPTIONS = [
  { key: 'red', label: 'Vermelha (aquecimento)' },
  { key: 'green', label: 'Verde (ajuste)' },
  { key: 'blue', label: 'Azul (válida)' },
  { key: 'black', label: 'Preta (falha)' },
];

/* ============== MODAIS SIMPLES ============== */
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

/* ============== PLANO DEMO (usa registro central) ============== */
function getDefaultPlan(id) {
  const reg = WORKOUTS[id] || {};
  return {
    title: reg.title || `Treino ${String(id || 'a').toUpperCase()} — Braço`,
    estTime: reg.duration || '~ 55–65 min',
    exercises: [
      {
        key: 'rosca-w',
        name: 'Rosca direta com barra W',
        video: 'https://www.youtube.com/embed/xIBnRKQFSFA',
        hint: 'toque no "i" para ver as instruções de cada série',
        sets: [
          { repsTxt: '1×15', type: 'red', blocks: 1 },
          { repsTxt: '1 a 3 × 3', type: 'green', blocks: 1 },
          { repsTxt: '2 × 6 a 8', type: 'blue', blocks: 2 },
          { repsTxt: '1 × 6 a 8', type: 'black', blocks: 1 },
        ],
      },
    ],
  };
}

/* ============== PÁGINA ============== */
export default function WorkoutRunPage() {
  const router = useRouter();
  const { id } = useParams(); // a, b, c, d, e
  const search = useSearchParams();
  const isEdit = search?.get('edit') === '1';

  // Alterna o query param 'edit' preservando os demais (title/duration)
const buildHref = (patch) => {
  const sp = new URLSearchParams(search ? Array.from(search.entries()) : []);
  Object.entries(patch).forEach(([k, v]) => {
    if (v === null || v === undefined) sp.delete(k);
    else sp.set(k, String(v));
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
};

    // BASE: registro central + query string (prioridade para o que veio do card)
    const qpTitle = (search?.get('title') || '').trim();
    const qpDuration = (search?.get('duration') || '').trim();
  
    const reg = WORKOUTS[id] || {};
    const title = qpTitle || reg.title || `Treino ${String(id || 'a').toUpperCase()}`;
    const duration = qpDuration || reg.duration || '';

  // chaves de storage
  const storagePlanKey = useMemo(() => `workout-plan-${id}`, [id]);
  const storageProgKey = useMemo(() => `workout-progress-${id}`, [id]);

  // estado do plano (editável em ?edit=1)
  const [plan, setPlan] = useState(() => {
    const base = getDefaultPlan(id);
  
    // Se vieram overrides pela URL (do card), refletir no plano também
    if (qpTitle) base.title = qpTitle;
    if (qpDuration) base.estTime = qpDuration;
    return base;
  });

  const [toast, setToast] = useState(null); // string | null

  // chave do rascunho para este treino
  const draftKey = React.useMemo(() => `workout-plan-draft-${id}`, [id]);

  // feedback do botão
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'ok' | 'err'

  // ação de salvar manualmente (só no ?edit=1)
  const handleSaveDraft = () => {
    if (!isEdit) return;
    try {
      localStorage.setItem(draftKey, JSON.stringify(plan));
      setSaveStatus('ok');
      setTimeout(() => setSaveStatus('idle'), 1500);
    } catch {
      setSaveStatus('err');
      setTimeout(() => setSaveStatus('idle'), 1500);
    }
  };

  // progresso por exercício/série/bloco (persiste sempre)
  const [progress, setProgress] = useState({});
  // modais
  const [videoOpen, setVideoOpen] = useState(null); // ex.key
  const [infoOpen, setInfoOpen] = useState(null);   // 'red' | 'green' | 'blue' | 'black'

  /* ====== LOAD: plano (se houver snapshot no storage, usa) ====== */
useEffect(() => {
  try {
    const raw = localStorage.getItem(storagePlanKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.exercises) {
        // aplica overrides só se vieram na URL
        if (qpTitle) parsed.title = qpTitle;
        if (qpDuration) parsed.estTime = qpDuration;
        setPlan(parsed);
      } else {
        const base = getDefaultPlan(id);
        if (qpTitle) base.title = qpTitle;
        if (qpDuration) base.estTime = qpDuration;
        setPlan(base);
      }
    } else {
      const base = getDefaultPlan(id);
      if (qpTitle) base.title = qpTitle;
      if (qpDuration) base.estTime = qpDuration;
      setPlan(base);
    }
  } catch (err) {
    const base = getDefaultPlan(id);
    if (qpTitle) base.title = qpTitle;
    if (qpDuration) base.estTime = qpDuration;
    setPlan(base);
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [storagePlanKey]);

  /* ====== LOAD: progress ====== */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageProgKey);
      setProgress(raw ? JSON.parse(raw) : {});
    } catch {
      setProgress({});
    }
  }, [storageProgKey]);

  /* ====== SAVE: plano (apenas quando está em modo edição) ====== */
  useEffect(() => {
    if (!isEdit) return;
    try {
      localStorage.setItem(storagePlanKey, JSON.stringify(plan));
    } catch {}
  }, [plan, storagePlanKey, isEdit]);

  /* ====== SAVE: progress (sempre) ====== */
  useEffect(() => {
    try {
      localStorage.setItem(storageProgKey, JSON.stringify(progress));
    } catch {}
  }, [progress, storageProgKey]);

  /* ====== Ensure progress shape ====== */
  const ensureProgressShape = (p, pl) => {
    const next = { ...p };
    for (const ex of pl.exercises || []) {
      const exKey = ex.key;
      const exState = next[exKey] || { sets: [] };
      const sets = Array.from({ length: (ex.sets || []).length }).map((_, setIdx) => {
        const defBlocks = Math.max(1, Number(ex.sets[setIdx]?.blocks || 1));
        const prev = exState.sets?.[setIdx];
        const prevDone = prev?.done || false;
        const prevWeights = Array.isArray(prev?.weights) ? prev.weights.slice() : [];
        if (prevWeights.length !== defBlocks) {
          if (prevWeights.length < defBlocks) {
            while (prevWeights.length < defBlocks) prevWeights.push('');
          } else {
            prevWeights.length = defBlocks;
          }
        }
        return { done: prevDone, weights: prevWeights };
      });
      next[exKey] = { sets };
    }
    return next;
  };

  useEffect(() => {
    setProgress((p) => ensureProgressShape(p, plan));
  }, [plan]);

 /* ====== AÇÕES: editor (exercícios/séries) ====== */
 const addExercise = () => {
  setPlan((old) => {
    const key = `ex-${Math.random().toString(36).slice(2, 8)}`;
    const ex = {
      key,
      name: 'Novo exercício',
      video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      hint: 'toque no "i" para ver as instruções de cada série',
      sets: [{ repsTxt: '1×10', type: 'blue', blocks: 1 }],
    };
    return { ...old, exercises: [...(old.exercises || []), ex] };
  });
};

const removeExercise = (exIdx) => {
  const exKey = plan.exercises[exIdx]?.key;
  setPlan((old) => {
    const arr = old.exercises.slice();
    arr.splice(exIdx, 1);
    return { ...old, exercises: arr };
  });
  if (exKey) {
    setProgress((p) => {
      const copy = { ...p };
      delete copy[exKey];
      return copy;
    });
  }
};

const updateExercise = (exIdx, patch) => {
  setPlan((old) => {
    const arr = old.exercises.slice();
    arr[exIdx] = { ...arr[exIdx], ...patch };
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
    ex.sets = (ex.sets || []).slice();
    ex.sets.splice(setIdx, 1);
    arr[exIdx] = ex;
    return { ...old, exercises: arr };
  });
};

const updateSeries = (exIdx, setIdx, patch) => {
  setPlan((old) => {
    const arr = old.exercises.slice();
    const ex = { ...arr[exIdx] };
    const sets = (ex.sets || []).slice();
    sets[setIdx] = { ...sets[setIdx], ...patch };
    ex.sets = sets;
    arr[exIdx] = ex;
    return { ...old, exercises: arr };
  });
};

const addBlock = (exIdx, setIdx) => {
  const current = plan.exercises?.[exIdx]?.sets?.[setIdx]?.blocks || 1;
  updateSeries(exIdx, setIdx, { blocks: current + 1 });
};

const removeBlock = (exIdx, setIdx) => {
  const current = plan.exercises?.[exIdx]?.sets?.[setIdx]?.blocks || 1;
  updateSeries(exIdx, setIdx, { blocks: Math.max(1, current - 1) });
};

/* ====== AÇÕES: progresso ====== */
const setWeight = (exKey, setIdx, blockIdx, value) => {
  setProgress((p) => {
    const base = ensureProgressShape(p, plan); // garante shape
    const ex = base[exKey];
    if (!ex) return base;
    const sets = ex.sets.map((s, i) => {
      if (i !== setIdx) return s;
      const w = s.weights.slice();
      w[blockIdx] = value;
      return { ...s, weights: w };
    });
    return { ...base, [exKey]: { ...ex, sets } };
  });
};

const toggleSetDone = (exKey, setIdx) => {
  setProgress((p) => {
    const base = ensureProgressShape(p, plan);
    const ex = base[exKey];
    if (!ex) return base;
    const sets = ex.sets.map((s, i) => (i === setIdx ? { ...s, done: !s.done } : s));
    return { ...base, [exKey]: { ...ex, sets } };
  });
};

// quais exercícios estão recolhidos (card fechado)
const [collapsed, setCollapsed] = useState({}); // { [exKey]: true }

// qual exercício está comemorando agora
const [celebrate, setCelebrate] = useState(null); // exKey ou null

// guarda o status "concluído" anterior pra detectar a virada false -> true
const prevDoneRef = React.useRef({});

// quando progress muda, verifica se algum exercício acabou de ser concluído
useEffect(() => {
  for (const ex of plan.exercises || []) {
    const key = ex.key;
    const st = progress[key];
    const totalSets = (ex.sets || []).length;
    const doneNow =
      totalSets > 0 &&
      st &&
      Array.isArray(st.sets) &&
      st.sets.length === totalSets &&
      st.sets.every((s) => s.done);

    const donePrev = !!prevDoneRef.current[key];

    // virou concluído agora? dispara animação e recolhe
    if (!donePrev && doneNow) {
      setCelebrate(key);
      // some o banner de celebração depois de 900ms
      setTimeout(() => setCelebrate(null), 2500);
      // recolhe o card depois da celebração
      setTimeout(() => {
        setCollapsed((c) => ({ ...c, [key]: true }));
      }, 2000);
    }

    prevDoneRef.current[key] = doneNow;
  }
}, [progress, plan]);

  /* ====== All done? ====== */
  const allDone = useMemo(() => {
    const pl = plan.exercises || [];
    return pl.length > 0 && pl.every((ex) => {
      const st = progress[ex.key];
      return st && st.sets && st.sets.length === (ex.sets || []).length && st.sets.every((s) => s.done);
    });
  }, [plan, progress]);

    /* ============= RENDER ============= */
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
        {/* Header com título + duração do registro central */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 800,
            padding: '14px 16px 10px',
            borderBottom: `1px solid ${THEME.strokeSoft}`,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0))',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <button
            onClick={() => router.back()}
            aria-label="Voltar"
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              border: `1px solid ${THEME.stroke}`,
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0))',
              color: THEME.textMute,
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
            }}
          >
            ←
          </button>
  
          <div style={{ textAlign: 'center', lineHeight: 1.3 }}>
  <div
    style={{
      fontSize: 18,
      fontWeight: 900,
      color: THEME.text,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: 180,
      margin: '0 auto',
    }}
  >
    {title}
  </div>
  {duration && (
    <div
      style={{
        fontSize: 12,
        color: THEME.textMute,
        fontWeight: 600,
        marginTop: 2,
      }}
    >
      {duration}
    </div>
  )}
</div>
  
{!isEdit ? (
  <button
    onClick={() => router.replace(buildHref({ edit: '1' }))}
    style={{
      height: 40,
      padding: '0 12px',
      borderRadius: 10,
      border: `1px solid ${THEME.stroke}`,
      background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0))',
      color: THEME.text,
      fontWeight: 800,
      cursor: 'pointer',
    }}
    aria-label="Editar"
    title="Editar"
  >
    Editar
  </button>
) : (
  <div style={{ display: 'flex', gap: 8 }}>
    <button
      onClick={handleSaveDraft}
      style={{
        height: 40,
        padding: '0 12px',
        borderRadius: 10,
        border: `1px solid ${THEME.stroke}`,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0))',
        color:
          saveStatus === 'ok'
            ? '#27c281'
            : saveStatus === 'err'
            ? '#ff7b7b'
            : THEME.text,
        fontWeight: 800,
        cursor: 'pointer',
      }}
      aria-label="Salvar alterações"
      title="Salvar alterações"
    >
      {saveStatus === 'ok' ? 'Salvo ✓' : saveStatus === 'err' ? 'Erro' : 'Salvar'}
    </button>

    <button
      onClick={() => router.replace(buildHref({ edit: null }))}
      style={{
        height: 40,
        padding: '0 12px',
        borderRadius: 10,
        border: `1px solid ${THEME.stroke}`,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0))',
        color: THEME.text,
        fontWeight: 800,
        cursor: 'pointer',
      }}
      aria-label="Sair do modo edição"
      title="Sair do modo edição"
    >
      Pronto
    </button>
  </div>
)}
        </header>
  
        {/* Aviso fixo */}
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
  
        {/* Conteúdo */}
        <main style={{ padding: '14px 14px 80px', maxWidth: 560, margin: '0 auto', display: 'grid', gap: 12 }}>
  {/* EXERCÍCIOS */}
  {plan.exercises.map((ex, exIdx) => {
    const st = progress[ex.key] || { sets: [] };
    const isCollapsed = !!collapsed[ex.key];

    /* ---------- CARD RECOLHIDO (após concluir todas as séries) ---------- */
    if (isCollapsed) {
      return (
        <section
          key={ex.key}
          style={{
            background: '#131315',
            border: `1px solid ${THEME.stroke}`,
            borderRadius: 16,
            padding: 12,
            boxShadow: THEME.shadow,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div
              aria-hidden
              style={{
                width: 28, height: 28, borderRadius: 8,
                background: `linear-gradient(180deg, ${THEME.red}, ${THEME.red2})`,
                color: '#fff', display:'grid', placeItems:'center',
                fontWeight: 900, border:`1px solid ${THEME.stroke}`
              }}
            >
              ✓
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 900 }}>{ex.name}</div>
              <div style={{ fontSize: 12, color: THEME.textMute }}>Exercício concluído</div>
            </div>
          </div>

          <button
            onClick={() => setCollapsed((c) => ({ ...c, [ex.key]: false }))}
            style={{
              alignSelf:'start',
              padding:'8px 10px', borderRadius:10,
              border:`1px solid ${THEME.stroke}`,
              background:'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0))',
              color:THEME.text, fontSize:12, fontWeight:800, whiteSpace:'nowrap'
            }}
          >
            Reabrir
          </button>
        </section>
      );
    }

    /* ---------- CARD NORMAL (em execução ou não concluído) ---------- */
    return (
      <section
        key={ex.key}
        style={{
          position: 'relative', // overlay de celebração
          background: THEME.surface,
          border: `1px solid ${THEME.stroke}`,
          borderRadius: 16,
          padding: 14,
          boxShadow: THEME.shadow,
          display: 'grid',
          gap: 12,
        }}
      >
        {/* 🎉 Overlay de celebração quando concluir todas as séries */}
        <div
          aria-hidden
          style={{
            pointerEvents: 'none',
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 16,
            background:
              celebrate === ex.key
                ? 'rgba(0,0,0,0.40)'
                : 'rgba(0,0,0,0)',
            opacity: celebrate === ex.key ? 1 : 0,
            transition: 'opacity .25s ease, background-color .25s ease',
          }}
        >
          {celebrate === ex.key && (
            <div
              style={{
                background: 'linear-gradient(180deg, #1a1a1d, #111)',
                border: `1px solid ${THEME.stroke}`,
                boxShadow: THEME.shadow,
                color: THEME.text,
                padding: '10px 14px',
                borderRadius: 12,
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{ fontSize: 18 }}>🎉</span>
              Exercício concluído!
            </div>
          )}
        </div>

        {/* ===== Cabeçalho do exercício (igual ao seu) ===== */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ flex: 1 }}>
            {!isEdit ? (
              <>
                <div style={{ fontSize: 16, fontWeight: 900 }}>{ex.name}</div>
                <div style={{ fontSize: 12, color: THEME.textMute }}>{ex.hint}</div>
              </>
            ) : (
              <div style={{ display:'grid', gap:8 }}>
                <div style={{ display:'grid', gap:6 }}>
                  <label style={{ fontSize:12, color:THEME.textMute }}>Nome do exercício</label>
                  <input
                    value={ex.name}
                    onChange={(e)=>updateExercise(exIdx, { name: e.target.value })}
                    style={{
                      padding:'10px 12px', borderRadius:10, background:'#1a1a1d', color:THEME.text,
                      border:`1px solid ${THEME.stroke}`, fontWeight:800
                    }}
                  />
                </div>
                <div style={{ display:'grid', gap:6 }}>
                  <label style={{ fontSize:12, color:THEME.textMute }}>Vídeo (YouTube embed)</label>
                  <input
                    value={ex.video}
                    onChange={(e)=>updateExercise(exIdx, { video: e.target.value })}
                    placeholder="https://www.youtube.com/embed/ID"
                    style={{
                      padding:'10px 12px', borderRadius:10, background:'#1a1a1d', color:THEME.text,
                      border:`1px solid ${THEME.stroke}`
                    }}
                  />
                </div>
              </div>
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
                whiteSpace: 'nowrap'
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

        {/* ===== SÉRIES (igual ao seu, sem mudanças) ===== */}
        <div style={{ display: 'grid', gap: 8 }}>
          {(ex.sets || []).map((s, setIdx) => {
            const colorInfo = SERIES_INFO[s.type] || SERIES_INFO.blue;
            const done = st.sets?.[setIdx]?.done || false;
            const weights = st.sets?.[setIdx]?.weights || [];
            const blocks = Math.max(1, Number(s.blocks || 1));

            return (
              <div
                key={setIdx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: `1px solid ${THEME.strokeSoft}`,
                  background: '#141417',
                }}
              >
                {/* Lado esquerdo */}
                <div style={{ display:'grid', gap:8 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
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

                  <div style={{ fontSize: 12, color: THEME.textMute }}>
                    {isEdit ? (
                      <div style={{ display:'grid', gridTemplateColumns:'auto 1fr auto', gap:10, alignItems:'center' }}>
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
                    ) : (
                      s.repsTxt
                    )}
                  </div>

                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
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

                  {isEdit && (
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
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
                        – bloco
                      </button>
                      <span style={{ fontSize:12, color:THEME.textMute }}>atual: {blocks}</span>
                    </div>
                  )}
                </div>

                {/* Lado direito: check da série */}
                <div style={{ display:'grid', alignContent:'start', justifyItems:'end' }}>
                  <button
                    onClick={() => toggleSetDone(ex.key, setIdx)}
                    aria-pressed={done}
                    title={done ? 'Desmarcar série' : 'Marcar série'}
                    style={{
                      width: 34, height: 34, borderRadius: 8,
                      border: `1px solid ${THEME.stroke}`,
                      background: done
                        ? `linear-gradient(180deg, ${THEME.red}, ${THEME.red2})`
                        : '#1b1b1e',
                      color: '#fff', fontWeight: 900,
                      display: 'grid', placeItems: 'center',
                    }}
                  >
                    {done ? '✓' : ''}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Adicionar série (apenas no edit) */}
        {isEdit && (
          <button
            onClick={() => addSeries(exIdx)}
            style={{
              marginTop: 2,
              border: `1px solid ${THEME.stroke}`,
              borderRadius: 12,
              padding: '10px 12px',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0))',
              color: THEME.text, fontWeight: 800, fontSize: 12, width:'100%'
            }}
          >
            + adicionar série
          </button>
        )}
      </section>
    );
  })}

  {/* Adicionar exercício (apenas no edit) */}
  {isEdit && (
    <button
      onClick={addExercise}
      style={{
        border: `1px solid ${THEME.stroke}`,
        borderRadius: 12,
        padding: '12px',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0))',
        color: THEME.text, fontWeight: 900, fontSize: 14
      }}
    >
      + adicionar exercício
    </button>
  )}
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
            
                // grava histórico de cargas (para /evolucao)
                appendLiftsHistory({ plan, progress, workoutId: id });
            
                // TOAST bonito + pequeno delay pra UX premium
                setToast('Progresso salvo com sucesso!');
                setTimeout(() => setToast(null), 1500);
            
                // dá tempo do usuário ver o toast (ajuste fino se quiser)
                setTimeout(() => {
                  router.replace('/treino');
                }, 650);
              } catch {
                // se quiser, pode exibir um toast de erro aqui também
                router.replace('/treino');
              }
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
        title={(plan.exercises.find(e => e.key === videoOpen)?.name) || 'Vídeo'}
        videoUrl={(plan.exercises.find(e => e.key === videoOpen)?.video) || ''}
      />

      <InfoModal
        open={!!infoOpen}
        onClose={() => setInfoOpen(null)}
        infoKey={infoOpen}
      />

       <Toast text={toast} visible={!!toast} />
      
    </div>
  );
}
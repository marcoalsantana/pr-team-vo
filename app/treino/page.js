'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

/* ====== TEMA (mesmo clima da /inicio) ====== */
const THEME = {
  bg: '#0E0E10',
  surface: '#121214',
  stroke: 'rgba(255,255,255,0.08)',
  strokeSoft: 'rgba(255,255,255,0.06)',
  text: '#FFFFFF',
  textDim: '#CFCFD2',
  textMute: '#9B9BA1',
  red: '#C1121F',
  red2: '#E04141',
  green: '#27C281',
  shadow: '0 10px 22px rgba(0,0,0,0.30)',
  softShadow: '0 8px 18px rgba(0,0,0,0.22)',
};

/* ====== BARRA INFERIOR (igual à /inicio, com ícones silhouette) ====== */
function BottomTabs({ active = 'treino', onNavigate }) {
  const items = [
    { key: 'inicio', href: '/inicio', lines: ['Início'] },
    { key: 'mobilidades', href: '/mobilidades', lines: ['Mobilidades e', 'Alongamentos'] },
    { key: 'treino', href: '/treino', lines: ['Plano de', 'Treino'] },
    { key: 'alimentar', href: '/alimentar', lines: ['Plano', 'Alimentar'] },
    { key: 'evolucao', href: '/evolucao', lines: ['Sua', 'Evolução'] },
  ];

  const Icon = ({ name, active }) => {
    const stroke = active ? '#FFFFFF' : THEME.textMute;
    const fill = active ? THEME.red : 'none';
    const s = 28;

    switch (name) {
      case 'inicio':
        return (
          <svg width={s} height={s} viewBox="0 0 24 24">
            <path d="M3 10.5L12 3l9 7.5" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 10.5V20h14v-9.5" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'mobilidades':
        return (
          <svg width={s} height={s} viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="2.5" fill={stroke}/>
            <path d="M12 7.5v5" stroke={stroke} strokeWidth="2" strokeLinecap="round"/>
            <path d="M9 13c1.5-1 4.5-1 6 0" stroke={stroke} strokeWidth="2" strokeLinecap="round"/>
            <path d="M10 14l-3 5M14 14l3 5" stroke={stroke} strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case 'treino':
        return (
          <svg width={s} height={s} viewBox="0 0 24 24">
            <rect x="2" y="9" width="3" height="6" rx="1" fill={stroke}/>
            <rect x="19" y="9" width="3" height="6" rx="1" fill={stroke}/>
            <rect x="7" y="11" width="10" height="2" rx="1" fill={stroke}/>
            <rect x="10.5" y="7" width="3" height="10" rx="1.2" fill={fill} opacity={active ? 0.25 : 0}/>
          </svg>
        );
      case 'alimentar':
        return (
          <svg width={s} height={s} viewBox="0 0 24 24">
            <path d="M12 4c-3 2.5-5 5.5-5 9 0 3.5 2.5 6 5 6s5-2.5 5-6c0-3.5-2-6.5-5-9z" fill="none" stroke={stroke} strokeWidth="2"/>
          </svg>
        );
      case 'evolucao':
        return (
          <svg width={s} height={s} viewBox="0 0 24 24">
            <path d="M4 18V6M4 18h16" stroke={stroke} strokeWidth="2" strokeLinecap="round"/>
            <path d="M7 14l3-3 3 2 4-5" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="17" cy="8" r="1.5" fill={stroke}/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <nav
      style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 900,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0))',
        backdropFilter: 'blur(6px)',
        borderTop: `1px solid ${THEME.strokeSoft}`,
        display: 'flex', justifyContent: 'space-around',
        padding: '10px 8px calc(env(safe-area-inset-bottom) + 10px)',
      }}
    >
      {items.map((it) => {
        const isActive = it.key === active;
        return (
          <button
            key={it.key}
            onClick={() => onNavigate(it.href)}
            style={{
              background: 'transparent', border: 'none',
              color: isActive ? THEME.text : THEME.textMute,
              opacity: isActive ? 1 : 0.85,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 6, padding: 6, minWidth: 70, cursor: 'pointer',
              borderBottom: isActive ? `2px solid ${THEME.red}` : '2px solid transparent',
              boxShadow: isActive ? '0 6px 16px rgba(193,18,31,0.25)' : 'none',
              borderRadius: 8, transition: 'all .18s ease',
            }}
          >
            <Icon name={it.key} active={isActive} />
            <span style={{ fontSize: 11, lineHeight: 1.15, textAlign: 'center', fontWeight: isActive ? 700 : 500 }}>
              {it.lines.map((l, i) => (
                <span key={i} style={{ display: 'block' }}>{l}</span>
              ))}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

/* ====== CARD DE EXERCÍCIO ====== */
function ExerciseCard({ ex, onChangeWeight, onToggleDone }) {
  const { id, name, sets, reps, weight, done, notes } = ex;

  return (
    <div
      style={{
        background: THEME.surface,
        border: `1px solid ${THEME.stroke}`,
        borderRadius: 16,
        padding: 14,
        display: 'grid',
        gap: 10,
        boxShadow: THEME.softShadow,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 900 }}>{name}</div>
          <div style={{ fontSize: 12, color: THEME.textMute }}>{sets}x{reps} reps</div>
        </div>
        <button
          onClick={() => onToggleDone(id)}
          style={{
            background: done ? THEME.green : 'transparent',
            color: done ? '#0a0a0a' : THEME.text,
            border: `1px solid ${done ? THEME.green : THEME.stroke}`,
            borderRadius: 10,
            padding: '8px 10px',
            cursor: 'pointer',
            fontWeight: 800,
          }}
        >
          {done ? 'Concluído ✓' : 'Concluir'}
        </button>
      </div>

      {notes && (
        <div style={{ fontSize: 12, color: THEME.textDim }}>
          {notes}
        </div>
      )}

      {/* Ajuste de peso */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          alignItems: 'center',
          gap: 10,
          paddingTop: 6,
          borderTop: `1px solid ${THEME.strokeSoft}`,
        }}
      >
        <span style={{ fontSize: 12, color: THEME.textMute }}>Peso</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={() => onChangeWeight(id, Math.max(0, weight - 2.5))}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: '#19191B', color: THEME.text,
              border: `1px solid ${THEME.stroke}`, cursor: 'pointer',
            }}
            aria-label="Diminuir peso"
          >-</button>

          <div
            style={{
              minWidth: 80, textAlign: 'center',
              background: '#151517',
              border: `1px solid ${THEME.stroke}`,
              color: THEME.text,
              borderRadius: 10,
              padding: '8px 10px',
              fontWeight: 800,
            }}
          >
            {weight.toFixed(1)} kg
          </div>

          <button
            onClick={() => onChangeWeight(id, weight + 2.5)}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: '#19191B', color: THEME.text,
              border: `1px solid ${THEME.stroke}`, cursor: 'pointer',
            }}
            aria-label="Aumentar peso"
          >+</button>
        </div>
      </div>
    </div>
  );
}

/* ====== PÁGINA /treino ====== */
export default function TreinoPage() {
  const router = useRouter();

  // Mock inicial dos exercícios (depois puxaremos da base)
  const [exercises, setExercises] = useState([
    { id: 1, name: 'Supino reto', sets: 4, reps: 12, weight: 40, done: false, notes: 'Executar com controle de descida' },
    { id: 2, name: 'Crucifixo inclinado', sets: 3, reps: 12, weight: 12.5, done: false },
    { id: 3, name: 'Tríceps corda', sets: 4, reps: 12, weight: 20, done: false },
    { id: 4, name: 'Mergulho no banco', sets: 3, reps: 15, weight: 0, done: false },
  ]);

  const total = exercises.length;
  const doneCount = useMemo(() => exercises.filter(e => e.done).length, [exercises]);
  const pct = Math.round((doneCount / total) * 100);

  const changeWeight = (id, newWeight) => {
    setExercises(prev => prev.map(e => (e.id === id ? { ...e, weight: newWeight } : e)));
  };

  const toggleDone = (id) => {
    setExercises(prev => prev.map(e => (e.id === id ? { ...e, done: !e.done } : e)));
  };

  const handleStart = () => {
    // Futuro: iniciar sessão de treino (timer, etc.)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinish = () => {
    // FUTURO (Supabase): registrar treino concluído no workout_logs
    try {
      const todayKey = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
      const prev = JSON.parse(localStorage.getItem('workout_logs') || '{}');
      prev[todayKey] = { finished: true, at: Date.now() };
      localStorage.setItem('workout_logs', JSON.stringify(prev));
    } catch (e) {}

    router.push('/inicio'); // volta pra tela inicial
  };

  const go = (href) => router.push(href);

  return (
    <div
      style={{
        minHeight: '100dvh',
        color: THEME.text,
        background: THEME.bg,
        paddingBottom: 96,
      }}
    >
      {/* Header simples */}
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
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: .5, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: THEME.red, boxShadow: '0 0 0 2px rgba(193,18,31,0.25)' }} />
            PR TEAM
          </div>
          <button
            onClick={() => router.push('/inicio')}
            style={{
              background: 'transparent', border: `1px solid ${THEME.stroke}`,
              color: THEME.textDim, borderRadius: 10, padding: '8px 10px', cursor: 'pointer',
            }}
          >
            Voltar
          </button>
        </div>
      </header>

      {/* Conteúdo */}
      <main style={{ padding: '16px', maxWidth: 520, margin: '0 auto', display: 'grid', gap: 14 }}>
        {/* Resumo do treino */}
        <section
          style={{
            background: THEME.surface,
            border: `1px solid ${THEME.stroke}`,
            borderRadius: 18,
            boxShadow: THEME.shadow,
            padding: 16,
            display: 'grid',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900 }}>Ficha 1 — Peito & Tríceps</div>
              <div style={{ fontSize: 12, color: THEME.textMute }}>Duração estimada ~ 55 min</div>
            </div>
            <button
              onClick={handleStart}
              style={{
                background: `linear-gradient(180deg, ${THEME.red} 0%, ${THEME.red2} 100%)`,
                border: 'none', color: THEME.text, fontWeight: 900,
                borderRadius: 12, padding: '10px 14px', cursor: 'pointer',
              }}
            >
              Iniciar
            </button>
          </div>

          {/* Progresso */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: THEME.textMute }}>
                Progresso do treino
              </span>
              <span style={{ fontSize: 12, color: THEME.textDim }}>
                {doneCount}/{total} • {pct}%
              </span>
            </div>
            <div style={{
              height: 10, borderRadius: 999, background: '#1A1A1D',
              border: `1px solid ${THEME.strokeSoft}`, overflow: 'hidden',
            }}>
              <div style={{
                width: `${pct}%`, height: '100%',
                background: `linear-gradient(90deg, ${THEME.red}, ${THEME.red2})`,
              }} />
            </div>
          </div>
        </section>

        {/* Lista de exercícios */}
        {exercises.map((ex) => (
          <ExerciseCard
            key={ex.id}
            ex={ex}
            onChangeWeight={changeWeight}
            onToggleDone={toggleDone}
          />
        ))}

        {/* Finalizar treino */}
        <section
          style={{
            background: `linear-gradient(90deg, rgba(193,18,31,.18), rgba(193,18,31,.07))`,
            border: `1px solid ${THEME.stroke}`,
            borderRadius: 16,
            boxShadow: THEME.softShadow,
            padding: 16,
            display: 'grid',
            gap: 10,
            marginBottom: 8,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 900 }}>Tudo certo?</div>
          <div style={{ fontSize: 13, color: THEME.textMute }}>Ao concluir, seu treino será marcado como feito hoje.</div>
          <button
            onClick={handleFinish}
            style={{
              background: 'transparent',
              border: `1px solid ${THEME.stroke}`,
              color: THEME.text,
              borderRadius: 12,
              padding: '12px 14px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Finalizar treino ✓
          </button>
        </section>
      </main>

      <BottomTabs active="treino" onNavigate={go} />
    </div>
  );
}
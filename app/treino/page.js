// app/treino/page.jsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomTabs from '../../components/BottomTabs';
import AccountModal from '../../components/AccountModal';
import WeekSuggestion from '../../components/WeekSuggestion';
import SeriesInfoCard from '../../components/SeriesInfoCard';
import TrainingProgramCard from '../../components/TrainingProgramCard';

/* ----------------------- THEME ----------------------- */
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
  green: '#27C281',
  shadow: '0 10px 22px rgba(0,0,0,0.30)',
  softShadow: '0 8px 18px rgba(0,0,0,0.22)',
};

/* ----------------------- HELPERS ----------------------- */
function startOfWeek(d) {
  // Domingo como início
  const x = new Date(d);
  const day = x.getDay(); // 0..6 (0=Dom)
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - day);
  return x;
}
function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function ymd(d) {
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

/* ----------------------- SEMANA ----------------------- */
function WeekDots({ weekDates = [], doneMap = {} }) {
  const labels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
      {weekDates.map((date, idx) => {
        const key = ymd(date);
        const letter = doneMap[key]; // 'A' | 'B' | ...
        const isDone = !!letter;
        const isToday = new Date().toDateString() === date.toDateString();
        return (
          <div key={idx} style={{ textAlign: 'center', minWidth: 44 }}>
            <div
              style={{
                fontSize: 12,
                letterSpacing: 0.5,
                color: isToday ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                fontWeight: isToday ? 800 : 600,
                padding: '4px 0',
              }}
            >
              {labels[idx]}
            </div>
            <div
              aria-hidden
              style={{
                width: 18,
                height: 18,
                margin: '4px auto 2px',
                borderRadius: 999,
                border: isDone ? 'none' : '1px solid rgba(255,255,255,0.18)',
                background: isDone
                  ? 'linear-gradient(180deg,#C1121F,#E04141)'
                  : 'transparent',
                boxShadow: isDone ? '0 0 0 2px rgba(193,18,31,.22)' : 'none',
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                fontSize: 12,
                lineHeight: 1,
              }}
              title={isDone ? `Concluído: Treino ${letter}` : 'Não concluído'}
            >
              {isDone ? '✓' : ''}
            </div>
            <div style={{ fontSize: 11, color: THEME.textMute, height: 14 }}>
              {isDone ? `(${letter})` : ''}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ----------------------- MODAL: TODOS OS TREINOS ----------------------- */
function AllWorkoutsModal({ open, onClose, onSelect }) {
  if (!open) return null;
  const treinos = [
    { id: 'a', titulo: 'Treino A', desc: 'Peito / Tríceps / Core' },
    { id: 'b', titulo: 'Treino B', desc: 'Pernas / Glúteo' },
    { id: 'c', titulo: 'Treino C', desc: 'Costas / Bíceps' },
    { id: 'd', titulo: 'Treino D', desc: 'Ombros / Core' },
    { id: 'e', titulo: 'Treino E', desc: 'Full Body' },
  ];
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '94%',
          maxWidth: 420,
          background: THEME.surface,
          color: THEME.text,
          border: `1px solid ${THEME.stroke}`,
          borderRadius: 16,
          padding: 14,
          boxShadow: THEME.shadow,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <div style={{ fontWeight: 900 }}>Todos os treinos</div>
          <button
            onClick={onClose}
            style={{
              color: THEME.textMute,
              fontSize: 22,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          {treinos.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              style={{
                textAlign: 'left',
                width: '100%',
                background: '#141417',
                border: `1px solid ${THEME.stroke}`,
                color: THEME.text,
                borderRadius: 12,
                padding: 12,
                cursor: 'pointer',
              }}
            >
              <div style={{ fontWeight: 900 }}>{t.titulo}</div>
              <div style={{ fontSize: 12, color: THEME.textMute }}>{t.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ----------------------- PÁGINA ----------------------- */
export default function PlanoTreinoPage() {
  const router = useRouter();
  const [openAccount, setOpenAccount] = useState(false);
  const username = 'aluno';
  const [openAll, setOpenAll] = useState(false);

  const go = (href) => router.push(href);

  // Lê mapa de conclusões (YYYY-MM-DD -> 'A'|'B'...)
  const [doneMap, setDoneMap] = useState({});
  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem('completedWorkouts');
        setDoneMap(raw ? JSON.parse(raw) : {});
      } catch {
        setDoneMap({});
      }
    };
    load();
  
    const handleFocus = load;
    const handleStorage = (e) => {
      if (e.key === 'completedWorkouts') load();
    };
  
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorage);
  
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Semana corrente (Dom..Sáb)
  const weekDates = useMemo(() => {
    const start = startOfWeek(new Date());
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  }, []);

  // Mocks visuais
  const faseInicio = '30/09/24';
  const faseFim = '13/10/24';
  const fasePct = 45;
  const streakDias = Object.keys(doneMap).length;

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
        backgroundBlendMode: 'screen, normal, normal, normal',
      }}
    >
      {/* Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 800,
          padding: '16px 18px 12px',
          borderBottom: `1px solid ${THEME.strokeSoft}`,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0))',
          backdropFilter: 'blur(2px)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: 0.5,
                display: 'flex',
                gap: 8,
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: THEME.red,
                  boxShadow: '0 0 0 2px rgba(193,18,31,0.25)',
                }}
              />
              Plano de Treino
            </div>
          </div>

          <button
            aria-label="Conta"
            onClick={() => setOpenAccount(true)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              border: `1px solid ${THEME.stroke}`,
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0))',
              color: THEME.textDim,
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
            }}
          >
            👤
          </button>
        </div>
      </header>

      {/* Conteúdo */}
      <main
        style={{
          padding: '16px 16px 10px',
          maxWidth: 520,
          margin: '0 auto',
          display: 'grid',
          gap: 28,
        }}
      >
        {/* Pré-treino essencial */}
        <section
          style={{
            background:
              'linear-gradient(90deg, rgba(193,18,31,.18), rgba(193,18,31,.07))',
            border: `1px solid ${THEME.stroke}`,
            borderRadius: 16,
            padding: '14px 16px',
            color: THEME.text,
            boxShadow: THEME.softShadow,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 900 }}>Pré-treino essencial</div>
            <span
              style={{
                fontSize: 10,
                color: THEME.textDim,
                border: `1px solid ${THEME.stroke}`,
                padding: '4px 8px',
                borderRadius: 999,
                background: '#1a1a1d',
              }}
            >
              2–5 min
            </span>
          </div>
          <div style={{ fontSize: 12, color: THEME.textMute, marginBottom: 10 }}>
            ⚡️Não esqueça de fazer sua mobilidade e alongamento de pré-treino!
          </div>
          <button
            onClick={() => go('/mobilidades')}
            style={{
              background: 'transparent',
              border: `1px solid ${THEME.stroke}`,
              color: THEME.text,
              borderRadius: 12,
              padding: '12px 14px',
              cursor: 'pointer',
              fontWeight: 700,
              width: '100%',
            }}
          >
            Ir para mobilidades
          </button>
        </section>


        <WeekSuggestion theme={THEME} />

        
        {/* Sua semana */}
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
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <div style={{ fontSize: 17, fontWeight: 900 }}>Sua semana</div>
            <div style={{ fontSize: 12, color: THEME.textMute }}>dom → sáb</div>
          </div>
          <WeekDots weekDates={weekDates} doneMap={doneMap} />
        </section>

        <SeriesInfoCard />

        {/* Escolha seu treino (cards compactos) */}
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
          <div
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div style={{ fontSize: 17, fontWeight: 900 }}>Escolha seu treino</div>
            <span style={{ fontSize: 12, color: THEME.textMute }}>A • B • C • D • E</span>
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            {[
              { id: 'a', title: 'Treino A', desc: 'Peito / Tríceps / Core' },
              { id: 'b', title: 'Treino B', desc: 'Pernas / Glúteo' },
              { id: 'c', title: 'Treino C', desc: 'Costas / Bíceps' },
              { id: 'd', title: 'Treino D', desc: 'Ombros / Core' },
              { id: 'e', title: 'Treino E', desc: 'Full Body' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => router.push(`/treino/${t.id}`)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#141417',
                  border: `1px solid ${THEME.stroke}`,
                  color: THEME.text,
                  borderRadius: 12,
                  padding: '10px 12px',
                  cursor: 'pointer',
                }}
              >
                <div>
                  <div style={{ fontWeight: 900, fontSize: 14 }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: THEME.textMute }}>{t.desc}</div>
                </div>
                <div
                  aria-hidden
                  style={{
                    padding: '6px 10px',
                    borderRadius: 999,
                    border: `1px solid ${THEME.stroke}`,
                    background:
                      'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0))',
                    fontSize: 12,
                    color: THEME.textDim,
                  }}
                >
                  Abrir ›
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Programa + streak */}
        <TrainingProgramCard theme={THEME} />

{/* Botão de reset (apenas para debug) */}
<button
  onClick={() => {
    localStorage.removeItem('completedWorkouts');
    window.location.reload();
  }}
  style={{
    marginTop: 20,
    background: '#222',
    color: '#fff',
    border: '1px solid #444',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 12,
    cursor: 'pointer',
    opacity: 0.5,
  }}
>
  🔄 Resetar semana (debug)
</button>
</main>

      {/* Modal de Conta */}
      <AccountModal
        open={openAccount}
        onClose={() => setOpenAccount(false)}
        username={username}
      />

      <BottomTabs active="treino" onNavigate={(href) => router.push(href)} />
    </div>
  );
}
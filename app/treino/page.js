'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

/* ----------------------- THEME ----------------------- */
const THEME = {
  bg: '#0E0E10',

  // mesmos layers da /inicio
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

/* ----------------------- BASE ----------------------- */
function Modal({ open, onClose, title, children, align = 'center', maxWidth = 420 }) {
  if (!open) return null;
  const alignStyle = align === 'top' ? { alignItems: 'flex-start', paddingTop: 20 } : { alignItems: 'center' };
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', justifyContent: 'center', ...alignStyle,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '94%', maxWidth, background: THEME.surface,
          border: `1px solid ${THEME.stroke}`, borderRadius: 16,
          boxShadow: THEME.shadow, color: THEME.text, padding: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{title}</div>
          <button
            aria-label="Fechar" onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: THEME.textDim, fontSize: 20, cursor: 'pointer' }}
          >×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function BottomTabs({ active = 'treino', onNavigate }) {
  const items = [
    { key: 'inicio', labelTop: 'Início', labelBottom: '', icon: '🏠', href: '/inicio' },
    { key: 'mobilidades', labelTop: 'Mobilidades e', labelBottom: 'Alongamentos', icon: '🤸', href: '/mobilidades' },
    { key: 'treino', labelTop: 'Plano de', labelBottom: 'Treino', icon: '🏋️', href: '/treino' },
    { key: 'alimentar', labelTop: 'Plano', labelBottom: 'Alimentar', icon: '🥗', href: '/alimentar' },
    { key: 'evolucao', labelTop: 'Sua', labelBottom: 'Evolução', icon: '📈', href: '/evolucao' },
  ];
  return (
    <nav
      style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 900,
        background: '#101012', borderTop: `1px solid ${THEME.strokeSoft}`,
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
              color: isActive ? THEME.text : THEME.textMute, opacity: isActive ? 1 : 0.7,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 4, padding: 6, fontSize: 12,
              borderBottom: isActive ? `2px solid ${THEME.red}` : '2px solid transparent',
              borderRadius: 6, minWidth: 64, cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>{it.icon}</span>
            <span style={{ lineHeight: 1.1, textAlign: 'center' }}>
              {it.labelTop}{it.labelBottom ? <><br />{it.labelBottom}</> : ''}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

/* ----------------------- SEMANA: DIAS + BOLINHA COM CHECK ----------------------- */
function WeekDots({ today = new Date(), doneSet = new Set() }) {
  const labels = ['D','S','T','Q','Q','S','S']; // dom..sab
  const todayIdx = today.getDay();
  return (
    <div style={{ display:'flex', justifyContent:'space-between', gap:10 }}>
      {labels.map((lbl, idx) => {
        const isToday = idx === todayIdx;
        const isDone = doneSet.has(idx);
        return (
          <div key={idx} style={{ textAlign:'center', minWidth:44 }}>
            <div
              style={{
                fontSize: 12,
                letterSpacing: 0.5,
                color: isToday ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                fontWeight: isToday ? 800 : 600,
                padding: '6px 0',
              }}
            >
              {lbl}
            </div>
            <div
              aria-hidden
              style={{
                width: 16, height: 16, margin: '4px auto 0',
                borderRadius: 999,
                border: isDone ? 'none' : '1px solid rgba(255,255,255,0.18)',
                background: isDone 
                  ? 'linear-gradient(180deg,#C1121F,#E04141)'
                  : 'transparent',
                boxShadow: isDone ? '0 0 0 2px rgba(193,18,31,.22)' : 'none',
                display:'grid', placeItems:'center',
                color: '#fff', fontSize: 12, lineHeight: 1,
              }}
            >
              {isDone ? '✓' : ''}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ----------------------- MODAL: TODOS OS TREINOS ----------------------- */
function AllWorkoutsModal({ open, onClose, onSelect }) {
  const treinos = [
    { id: 'a', titulo: 'Treino A', desc: 'Peito / Tríceps / Core' },
    { id: 'b', titulo: 'Treino B', desc: 'Pernas / Glúteo' },
    { id: 'c', titulo: 'Treino C', desc: 'Costas / Bíceps' },
    { id: 'd', titulo: 'Treino D', desc: 'Ombros / Core' },
    { id: 'e', titulo: 'Treino E', desc: 'Full Body' },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Todos os treinos">
      <div style={{ display:'grid', gap:10 }}>
        {treinos.map(t => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            style={{
              textAlign:'left', width:'100%',
              background:'#141417', border:`1px solid ${THEME.stroke}`,
              color:THEME.text, borderRadius:12, padding:12, cursor:'pointer'
            }}
          >
            <div style={{ fontWeight:900 }}>{t.titulo}</div>
            <div style={{ fontSize:12, color:THEME.textMute }}>{t.desc}</div>
          </button>
        ))}
      </div>
    </Modal>
  );
}

/* ----------------------- PÁGINA: PLANO DE TREINO ----------------------- */
export default function PlanoTreinoPage() {
  const router = useRouter();
  const [openAll, setOpenAll] = useState(false);

  const go = (href) => router.push(href);

  // mocks para exibir data/validade e progresso da fase
  const faseInicio = '30/09/24';
  const faseFim = '13/10/24';
  const fasePct = 45; // ajuste quando ligar com dados reais

  const streakDias = 3; // mock do streak semanal

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
          position: 'sticky', top: 0, zIndex: 800,
          padding: '16px 18px 12px',
          borderBottom: `1px solid ${THEME.strokeSoft}`,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0))',
          backdropFilter: 'blur(2px)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: .5, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: THEME.red, boxShadow: '0 0 0 2px rgba(193,18,31,0.25)' }} />
              Plano de Treino
            </div>
            {/* subtítulo removido conforme pedido */}
          </div>
          <button
            aria-label="Voltar ao início"
            onClick={() => go('/inicio')}
            style={{
              width: 40, height: 40, borderRadius: 12,
              border: `1px solid ${THEME.stroke}`,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0))',
              color: THEME.textDim, display: 'grid', placeItems: 'center', cursor: 'pointer',
            }}
          >‹</button>
        </div>
      </header>

      {/* Conteúdo */}
      <main style={{ padding: '16px 16px 10px', maxWidth: 520, margin: '0 auto', display: 'grid', gap: 40 }}>

        {/* Sua semana (dias + check) */}
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
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
            <div style={{ fontSize: 17, fontWeight: 900 }}>Sua semana</div>
            <div style={{ fontSize: 12, color: THEME.textMute }}>D S T Q Q S S</div>
          </div>

          {/* indique dias concluídos no Set (0=Dom .. 6=Sab) */}
          <WeekDots doneSet={new Set([1,4])} />
        </section>

        {/* Treino do dia */}
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
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 900 }}>Treino do dia (hoje)</div>
              <div style={{ fontSize: 12, color: THEME.textMute, marginTop: 4 }}>Treino B — Pernas</div>
            </div>
            <span style={{ fontSize: 12, color: THEME.textMute }}>~ 55 min</span>
          </div>

          <div style={{ display:'flex', gap: 8, flexWrap:'wrap' }}>
            {['Agachamento', 'Leg Press', 'Cadeira Extensora', 'Core'].map((t) => (
              <span key={t} style={{
                padding: '8px 10px', borderRadius: 999, border: `1px solid ${THEME.stroke}`,
                background: '#141417', color: THEME.textDim, fontSize: 12,
              }}>{t}</span>
            ))}
          </div>

          <div style={{ display:'flex', gap:10 }}>
            <button
              onClick={() => go('/treino/b')}
              style={{
                background: `linear-gradient(180deg, ${THEME.red} 0%, ${THEME.red2} 100%)`,
                border: 'none', color: THEME.text, fontWeight: 900,
                borderRadius: 12, padding: '12px 18px', boxShadow: THEME.softShadow, cursor: 'pointer', flex:1,
              }}
            >Começar agora</button>

            <button
              onClick={() => setOpenAll(true)}
              style={{
                background: 'transparent', border: `1px solid ${THEME.stroke}`,
                color: THEME.text, borderRadius: 12, padding: '12px 14px', cursor: 'pointer', fontWeight: 700, flex:1,
              }}
            >Ver todos</button>
          </div>
        </section>

        {/* Programa de treino (validade + progresso) */}
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
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ fontSize: 17, fontWeight: 900 }}>Programa de treino</div>
            <span style={{ fontSize:12, color:THEME.textMute }}>Ficha válida</span>
          </div>

          <div
            style={{
              display:'grid', gap:10,
              background:'#141417', border:`1px solid ${THEME.stroke}`, borderRadius:12, padding:12
            }}
          >
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontWeight:800 }}>Fase atual</div>
                <div style={{ fontSize:12, color:THEME.textMute }}>
                  {faseInicio} → {faseFim}
                </div>
              </div>
              <div style={{
                padding:'6px 10px', borderRadius:999, border:`1px solid ${THEME.stroke}`,
                background:'#18181b', fontSize:12, color:THEME.textDim
              }}>
                A-B-C-D-E
              </div>
            </div>

            <div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize: 12, color: THEME.textMute }}>Progresso da fase</span>
                <span style={{ fontSize: 12, color: THEME.textDim }}>{fasePct}%</span>
              </div>
              <div style={{
                height: 10, borderRadius: 999, background: '#1A1A1D',
                border: `1px solid ${THEME.strokeSoft}`, overflow: 'hidden',
              }}>
                <div style={{
                  width: `${fasePct}%`, height: '100%',
                  background: `linear-gradient(90deg, ${THEME.red}, ${THEME.red2})`,
                }} />
              </div>
            </div>
          </div>
        </section>

        {/* Streak semanal */}
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
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ fontSize: 16, fontWeight: 900 }}>Streak semanal</div>
            <span style={{ fontSize:12, color:THEME.textMute }}>mantido com treino diário</span>
          </div>
          <div style={{
            display:'flex', alignItems:'center', gap:12,
            background:'#141417', border:`1px solid ${THEME.stroke}`, borderRadius:12, padding:12
          }}>
            <div style={{
              width:40, height:40, borderRadius:10, display:'grid', placeItems:'center',
              background:'linear-gradient(180deg, rgba(193,18,31,.25), rgba(193,18,31,.05))',
              border:`1px solid ${THEME.stroke}`
            }}>🔥</div>
            <div>
              <div style={{ fontWeight:900, fontSize:18 }}>{streakDias} dias seguidos</div>
              <div style={{ fontSize:12, color:THEME.textMute }}>rumo à consistência máxima</div>
            </div>
          </div>
        </section>

        {/* Lembrete mobilidade (repaginado) */}
        <section
          style={{
            background: `linear-gradient(90deg, rgba(193,18,31,.18), rgba(193,18,31,.07))`,
            border: `1px solid ${THEME.stroke}`,
            borderRadius: 16,
            padding: '14px 16px',
            color: THEME.text,
            boxShadow: THEME.softShadow,
            marginBottom: 10,
          }}
        >
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <div style={{ fontSize: 14, fontWeight: 900 }}>Pré-treino essencial</div>
            <span style={{
              fontSize:10, color:THEME.textDim, border:`1px solid ${THEME.stroke}`, padding:'4px 8px',
              borderRadius:999, background:'#1a1a1d'
            }}>2–5 min</span>
          </div>
          <div style={{ fontSize: 12, color: THEME.textMute, marginBottom:10 }}>
            ⚡️Não esqueça de fazer sua mobilidade e alongamento de pré-treino!
          </div>
          <button
            onClick={() => go('/mobilidades')}
            style={{
              background: 'transparent', border: `1px solid ${THEME.stroke}`,
              color: THEME.text, borderRadius: 12, padding: '12px 14px', cursor: 'pointer', fontWeight:700, width:'100%'
            }}
          >Ir para mobilidades</button>
        </section>
      </main>

      {/* Modal: ver todos os treinos */}
      <AllWorkoutsModal
        open={openAll}
        onClose={() => setOpenAll(false)}
        onSelect={(id) => {
          setOpenAll(false);
          router.push(`/treino/${id}`);
        }}
      />

      <BottomTabs active="treino" onNavigate={go} />
    </div>
  );
}
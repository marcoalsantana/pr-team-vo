'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

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

function Modal({ open, onClose, title, children, align = 'center' }) {
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
          width: '94%', maxWidth: 420, background: THEME.surface,
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

function WeekStrip({ today = new Date(), days = 5 }) {
  const doneMap = useMemo(() => ({ 0: true, 1: false, 2: true, 3: false, 4: false }), []);
  const items = useMemo(() => {
    const a = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      a.push(d);
    }
    return a.reverse(); // garante que o mais antigo fica à esquerda e hoje à direita
  }, [today, days]);

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {items.map((d, idx) => {
        const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        const isToday = idx === items.length - 1;
        const done = !!doneMap[idx];
        return (
          <div
            key={idx}
            style={{
              background: '#17171A',
              border: `1px solid ${THEME.strokeSoft}`,
              borderRadius: 14,
              minWidth: 70,
              padding: '9px 12px',
              textAlign: 'center',
              color: THEME.text,
              position: 'relative',
              boxShadow: isToday ? '0 0 0 2px #C1121F' : 'none',
            }}
          >
            <div style={{ fontSize: 11, color: THEME.textMute, marginBottom: 2 }}>
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'][d.getDay()]}
            </div>
            <div style={{ fontSize: 15, fontWeight: 900 }}>{label}</div>
            <div style={{ marginTop: 6, fontSize: 13 }}>{done ? '✅' : '—'}</div>
            <div
              style={{
                position: 'absolute', top: 4, left: 12, right: 12, height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

function GoalChips() {
  const chips = [
    { label: 'Cardio 30min', ok: true },
    { label: 'Água 2L', ok: false },
    { label: 'Alongar', ok: true },
  ];
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {chips.map((c, i) => (
        <div
          key={i}
          style={{
            padding: '8px 10px',
            borderRadius: 999,
            border: `1px solid ${THEME.stroke}`,
            background: '#141417',
            color: c.ok ? THEME.green : THEME.textDim,
            fontSize: 12,
            boxShadow: THEME.softShadow,
          }}
        >
          {c.ok ? '✓ ' : '• '}{c.label}
        </div>
      ))}
    </div>
  );
}

function BottomTabs({ active = 'inicio', onNavigate }) {
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
    const s = 28; // tamanho maior

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
              borderRadius: 8,
              transition: 'all .18s ease',
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

export default function InicioPage() {
  const router = useRouter();
  const username = 'aluno';
  const [showMethods, setShowMethods] = useState(false);
  const [showDaily, setShowDaily] = useState(false);
  const [openAccount, setOpenAccount] = useState(false);
  const [showVacumVideo, setShowVacumVideo] = useState(false);
  const go = (href) => router.push(href);

  // Exemplo de progresso mensal (mock)
  const monthlyDone = 12;
  const monthlyGoal = 20;
  const pct = Math.min(100, Math.round((monthlyDone / monthlyGoal) * 100));

  return (
    <div
      style={{
        minHeight: '100dvh',
        color: THEME.text,
        position: 'relative',
        paddingBottom: 96, // espaço para a barra
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
            <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: .5, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: THEME.red, boxShadow: '0 0 0 2px rgba(193,18,31,0.25)' }} />
              PR TEAM
            </div>
            <div style={{ fontSize: 12, color: THEME.textMute, marginTop: 2 }}>Painel do aluno</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 13, color: THEME.textDim }}>Olá, <strong>{username}</strong>!</div>
            <button
              aria-label="Conta" onClick={() => setOpenAccount(true)}
              style={{
                width: 44, height: 44, borderRadius: 12,
                border: `1px solid ${THEME.stroke}`,
                background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0))',
                color: THEME.textDim, display: 'grid', placeItems: 'center', cursor: 'pointer',
              }}
            >👤</button>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main style={{ padding: '16px 16px 10px', maxWidth: 520, margin: '0 auto', display: 'grid', gap: 16 }}>
     {/* Recado do dia (motivacional) */}
<section
  style={{
    background: `linear-gradient(90deg, rgba(193,18,31,.18), rgba(193,18,31,.07))`,
    border: `1px solid ${THEME.stroke}`,
    borderRadius: 16,
    boxShadow: THEME.softShadow,
    padding: 16,
    display: 'grid',
    gap: 10,
  }}
>
  <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>Recado do dia!</div>
  <p style={{ margin: 0, color: THEME.text, fontSize: 15, lineHeight: 1.5, fontWeight: 600 }}>
    A constância é o que separa os que tentam dos que conquistam. Vamos com tudo hoje! 💪
  </p>
</section>

        {/* Semana + Próximo treino */}
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
  {/* Título */}
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
    <div style={{ fontSize: 17, fontWeight: 900 }}>Sua semana</div>
    <div style={{ fontSize: 12, color: THEME.textMute }}>treinos planejados</div>
  </div>

  {/* Calendário */}
  <WeekStrip />

  {/* Próximo treino dentro do mesmo card */}
  <div
    style={{
      marginTop: 12,
      paddingTop: 12,
      borderTop: `1px dashed ${THEME.strokeSoft}`,
      display: 'grid',
      gap: 8,
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontSize: 17, fontWeight: 900 }}>Próximo treino</div>
      <span style={{ fontSize: 12, color: THEME.textMute }}>~ 55 min</span>
    </div>

    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {['Peito', 'Tríceps', 'Core', '8 exercícios'].map((t) => (
        <span
          key={t}
          style={{
            padding: '8px 10px',
            borderRadius: 999,
            border: `1px solid ${THEME.stroke}`,
            background: '#141417',
            color: THEME.textDim,
            fontSize: 12,
          }}
        >
          {t}
        </span>
      ))}
    </div>

    <button
      onClick={() => go('/treino')}
      style={{
        marginTop: 4,
        background: `linear-gradient(180deg, ${THEME.red} 0%, ${THEME.red2} 100%)`,
        border: 'none',
        color: THEME.text,
        fontWeight: 900,
        borderRadius: 12,
        padding: '12px 18px',
        boxShadow: THEME.softShadow,
        cursor: 'pointer',
      }}
    >
      Começar agora
    </button>
  </div>
</section>

        {/* Desafios PR TEAM */}
<section
  style={{
    background: THEME.surface,
    border: `1px solid ${THEME.stroke}`,
    borderRadius: 18,
    boxShadow: THEME.shadow,
    padding: 14,
    display: 'grid',
    gap: 10,
  }}
>
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <div style={{ fontSize: 16, fontWeight: 900 }}>Desafios PR TEAM</div>
    <div style={{ fontSize: 12, color: THEME.textMute }}>semanal</div>
  </div>

  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
    {[
      { label: '5 treinos', ok: true },
      { label: '25 litros de água', ok: false },
      { label: '90min cárdio', ok: true },
    ].map((c, i) => (
      <div
        key={i}
        style={{
          padding: '8px 10px',
          borderRadius: 999,
          border: `1px solid ${THEME.stroke}`,
          background: '#141417',
          color: c.ok ? THEME.green : THEME.textDim,
          fontSize: 12,
          boxShadow: THEME.softShadow,
        }}
      >
        {c.ok ? '✓ ' : '• '}{c.label}
      </div>
    ))}
  </div>
</section>

        {/* Resumo + Progresso mensal (ocupa mais espaço) */}
        <section
          style={{
            background: THEME.surface, border: `1px solid ${THEME.stroke}`,
            borderRadius: 18, boxShadow: THEME.shadow, padding: 16,
            display: 'grid', gap: 14,
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', gap: 12 }}>
            <div style={{ paddingRight: 12, borderRight: `1px solid ${THEME.strokeSoft}` }}>
              <div style={{ fontSize: 12, color: THEME.textMute, marginBottom: 6 }}>Treinos no mês</div>
              <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1 }}>{monthlyDone}</div>
            </div>
            <div style={{ paddingLeft: 12 }}>
              <div style={{ fontSize: 12, color: THEME.textMute, marginBottom: 6 }}>Treinos no total</div>
              <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1 }}>87</div>
            </div>
          </div>

          {/* Barra de progresso mensal */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: THEME.textMute }}>Meta mensal</span>
              <span style={{ fontSize: 12, color: THEME.textDim }}>{pct}% ({monthlyDone}/{monthlyGoal})</span>
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

        {/* Explicação dos métodos (refinado) */}
<section
  onClick={() => setShowMethods(true)}
  style={{
    background: THEME.surface,
    border: `1px solid ${THEME.stroke}`,
    borderRadius: 18,
    boxShadow: THEME.shadow,
    padding: 22,
    cursor: 'pointer',
    display: 'grid',
    gap: 12,
  }}
>
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
    <div>
      <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 6 }}>Explicação dos métodos</div>
      <div style={{ fontSize: 14, color: THEME.red, fontWeight: 700 }}>Toque para ver mais</div>
    </div>
    <div
      aria-hidden
      style={{
        width: 34, height: 34, borderRadius: 8,
        border: `1px solid ${THEME.strokeSoft}`,
        display: 'grid', placeItems: 'center',
        color: THEME.textDim, fontSize: 16,
      }}
    >›</div>
  </div>
</section>

        {/* Plano alimentar em destaque (refinado) */}
        <section
  style={{
    // container fino, só pra manter o mesmo respiro do layout
    border: `1px solid ${THEME.stroke}`,
    borderRadius: 14,
    padding: 0,
    background: 'transparent',
    boxShadow: 'none',
  }}
>
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10,
    }}
  >
    {/* Card 1 — Cardio diário */}
    <div
      style={{
        background: `linear-gradient(90deg, rgba(193,18,31,.18), rgba(193,18,31,.07))`,
        border: `1px solid ${THEME.stroke}`,
        borderRadius: 14,
        padding: '12px 14px',
        color: THEME.text,
        boxShadow: THEME.softShadow,
        minHeight: 90,
        display: 'grid',
        alignContent: 'center',
      }}
    >
      <div style={{ fontSize: 13, color: THEME.textDim, marginBottom: 4 }}>Cardio</div>
      <div style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.35 }}>
        Faça 30 minutos de cárdio todos os dias (intensidade moderada)
      </div>
    </div>

    {/* Card 2 — Vacum diário (abre modal de vídeo) */}
    <div
      onClick={() => setShowVacumVideo(true)}
      style={{
        background: `linear-gradient(90deg, rgba(193,18,31,.18), rgba(193,18,31,.07))`,
        border: `1px solid ${THEME.stroke}`,
        borderRadius: 14,
        padding: '12px 14px',
        color: THEME.text,
        boxShadow: THEME.softShadow,
        minHeight: 90,
        display: 'grid',
        alignContent: 'center',
        cursor: 'pointer',
      }}
    >
      <div style={{ fontSize: 13, color: THEME.textDim, marginBottom: 4 }}>Vacum</div>
      <div style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.35 }}>
        Faça 5 séries de vacum todos os dias em jejum
      </div>
      <div style={{ fontSize: 12, color: THEME.red, marginTop: 6 }}>
        toque para ver o vídeo
      </div>
    </div>
  </div>
</section>
      </main>

      {/* Modais */}
      <Modal open={showMethods} onClose={() => setShowMethods(false)} title="Explicação dos métodos">
        <div style={{ display: 'grid', gap: 10, color: THEME.textDim, fontSize: 14 }}>
          <div><strong style={{ color: THEME.text }}>Progressão de carga:</strong> descrição aqui…</div>
          <div><strong style={{ color: THEME.text }}>Drop set:</strong> descrição aqui…</div>
          <div><strong style={{ color: THEME.text }}>Cluster set:</strong> descrição aqui…</div>
          <div><strong style={{ color: THEME.text }}>Pico de contração:</strong> descrição aqui…</div>
          <div><strong style={{ color: THEME.text }}>Back off-set:</strong> descrição aqui…</div>
          <div><strong style={{ color: THEME.text }}>FST-7:</strong> descrição aqui…</div>
        </div>
      </Modal>

      <Modal open={showDaily} onClose={() => setShowDaily(false)} title="Recado do dia">
        <p style={{ margin: 0, color: THEME.textDim, lineHeight: 1.55 }}>
          Faça alongamentos e mobilidades como pré-treino. 30 minutos de cardio moderado.
          5 séries de vacum em jejum. Execução perfeita e controle de carga — disciplina e constância.
        </p>
      </Modal>

      <Modal open={openAccount} onClose={() => setOpenAccount(false)} title="Conta" align="top">
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 46, height: 46, borderRadius: 10, background: '#17171A', border: `1px solid ${THEME.stroke}`, display: 'grid', placeItems: 'center' }}>👤</div>
            <div>
              <div style={{ fontWeight: 900 }}>{username}</div>
              <div style={{ fontSize: 12, color: THEME.textMute }}>Conta ativa</div>
            </div>
          </div>
          <button
            onClick={() => router.push('/')}
            style={{
              background: '#1A1A1D', border: `1px solid ${THEME.stroke}`, color: THEME.text,
              borderRadius: 12, padding: '12px 14px', cursor: 'pointer', textAlign: 'center',
            }}
          >Sair</button>
        </div>
      </Modal>

      <Modal
  open={showVacumVideo}
  onClose={() => setShowVacumVideo(false)}
  title="Vacum (tutorial)"
>
  <div
    style={{
      height: 220,
      border: `1px dashed ${THEME.stroke}`,
      borderRadius: 12,
      display: 'grid',
      placeItems: 'center',
      color: THEME.textDim,
      background: '#141417',
    }}
  >
    Vídeo em breve…
  </div>
</Modal>
      <BottomTabs active="inicio" onNavigate={go} />
    </div>
  );
}
// app/inicio/page.jsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AccountModal from '../../components/AccountModal';
import DailyNote from '../../components/DailyNote';
import ChallengesCard from '../../components/ChallengesCard';

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
function ymd(d) {
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}
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
function nextFrom(letter) {
  const cycle = ['A', 'B', 'C', 'D', 'E'];
  const i = cycle.indexOf((letter || 'A').toUpperCase());
  if (i < 0) return 'A';
  return cycle[(i + 1) % cycle.length];
}

/* Mapeamento de grupos só para “chips” no card Próximo treino */
const MUSCLES = {
  A: ['Peito', 'Tríceps', 'Core'],
  B: ['Pernas', 'Glúteo'],
  C: ['Costas', 'Bíceps'],
  D: ['Ombros', 'Core'],
  E: ['Full Body'],
};

/* ----------------------- MODAL GENÉRICO ----------------------- */
function Modal({ open, onClose, title, children, align = 'center' }) {
  if (!open) return null;
  const alignStyle = align === 'top'
    ? { alignItems: 'flex-start', paddingTop: 20 }
    : { alignItems: 'center' };
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

/* ----------------------- WEEK DOTS (DOM..SÁB) ----------------------- */
function WeekDots({ weekDates = [], doneMap = {} }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 8,
      }}
    >
      {weekDates.map((date, idx) => {
        const key = ymd(date);
        const letter = doneMap[key];
        const isDone = !!letter;
        const isToday = new Date().toDateString() === date.toDateString();

        const weekday = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][date.getDay()];
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');

        return (
          <div
            key={idx}
            style={{
              width: 54,
              background: isToday ? 'rgba(193,18,31,0.08)' : '#17171A',
              border: `1px solid ${THEME.strokeSoft}`,
              borderRadius: 12,
              padding: '8px 0',
              textAlign: 'center',
              color: THEME.text,
              boxShadow: isToday ? '0 0 0 2px rgba(193,18,31,0.25)' : 'none',
            }}
          >
            <div style={{ fontSize: 11, color: THEME.textMute, marginBottom: 2 }}>
              {weekday}
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}>
              {day}/{month}
            </div>
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                margin: '0 auto 4px',
                background: isDone
                  ? 'linear-gradient(180deg,#C1121F,#E04141)'
                  : 'transparent',
                border: isDone
                  ? 'none'
                  : '1px solid rgba(255,255,255,0.18)',
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                fontSize: 12,
              }}
            >
              {isDone ? '✓' : ''}
            </div>
            <div
              style={{
                fontSize: 10,
                color: isDone ? THEME.textDim : THEME.textMute,
                height: 12,
              }}
            >
              {isDone ? `(${letter})` : ''}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ----------------------- BOTTOM TABS (mesma UI do projeto) ----------------------- */
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

/* ----------------------- PÁGINA ----------------------- */
export default function InicioPage() {
  const router = useRouter();
  const go = (href) => router.push(href);
  const username = 'aluno';

  const [openAccount, setOpenAccount] = useState(false);
  const [showMethods, setShowMethods] = useState(false);
  const [showVacumVideo, setShowVacumVideo] = useState(false);

  /* --------- completedWorkouts: ler e reagir a mudanças --------- */
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

    const onStorage = (e) => {
      if (e.key === 'completedWorkouts') load();
    };
    window.addEventListener('focus', load);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('focus', load);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  /* --------- Semana corrente (Dom..Sáb) --------- */
  const weekDates = useMemo(() => {
    const start = startOfWeek(new Date());
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  }, []);

  /* --------- Próximo treino (a partir do último concluído) --------- */
  const nextId = useMemo(() => {
    // pega a data mais recente treinada (<= hoje)
    const entries = Object.entries(doneMap)
      .map(([k, v]) => ({ date: new Date(k), letter: String(v || '').toUpperCase() }))
      .filter(e => !Number.isNaN(e.date.getTime()))
      .sort((a, b) => b.date - a.date); // mais recente primeiro

    const last = entries.find(e => e.date <= new Date());
    const lastLetter = last?.letter || null;
    return nextFrom(lastLetter).toLowerCase(); // 'a'..'e' (para exibir e montar hrefs se quiser)
  }, [doneMap]);

  /* --------- Mocks de resumo mensal --------- */
  const monthlyDone = useMemo(() => {
    // conta dias do mês atual que têm treino concluído
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-`;
    return Object.keys(doneMap).filter(k => k.startsWith(ym)).length;
  }, [doneMap]);
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
              aria-label="Conta"
              onClick={() => setOpenAccount(true)}
              style={{
                width: 44, height: 44, borderRadius: 12,
                border: `1px solid ${THEME.stroke}`,
                background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0))',
                color: THEME.textDim, display: 'grid', placeItems: 'center', cursor: 'pointer',
              }}
            >
              👤
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main style={{ padding: '16px 16px 10px', maxWidth: 520, margin: '0 auto', display: 'grid', gap: 16 }}>

        {/* Recado do dia */}
        <DailyNote />

        {/* Sua semana + Próximo treino */}
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
            <div style={{ fontSize: 12, color: THEME.textMute }}>dom → sáb</div>
          </div>

          {/* Dots semanais com check (lidos do completedWorkouts) */}
          <WeekDots weekDates={weekDates} doneMap={doneMap} />

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
              <div style={{ fontSize: 17, fontWeight: 900 }}>
                Próximo treino — <span style={{ color: THEME.red }}>Treino {nextId.toUpperCase()}</span>
              </div>
              <span style={{ fontSize: 12, color: THEME.textMute }}>~ 55 min</span>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(MUSCLES[nextId.toUpperCase()] || []).map((t) => (
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
              <span
                style={{
                  padding: '8px 10px',
                  borderRadius: 999,
                  border: `1px solid ${THEME.stroke}`,
                  background: '#141417',
                  color: THEME.textDim,
                  fontSize: 12,
                }}
              >
                {`Treino ${nextId.toUpperCase()}`}
              </span>
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

        {/* Desafios PR TEAM (informativo) */}
        <ChallengesCard />

        {/* Resumo + Progresso mensal */}
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
              <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1 }}>{Object.keys(doneMap).length}</div>
            </div>
          </div>

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

        {/* Explicação dos métodos */}
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

        {/* Plano alimentar / Vacum (atalhos) */}
        <section
          style={{
            border: `1px solid ${THEME.stroke}`,
            borderRadius: 14,
            padding: 0,
            background: 'transparent',
            boxShadow: 'none',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
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
        <div style={{ display: 'grid', gap: 12, maxHeight: '70vh', overflowY: 'auto', paddingRight: 6 }}>
          <div
            style={{
              background: THEME.red, color: '#000', borderRadius: 12, padding: 12,
              fontWeight: 900, lineHeight: 1.35, border: `1px solid ${THEME.stroke}`, boxShadow: THEME.softShadow,
            }}
          >
            COM EXCEÇÃO DA PROGRESSÃO DE CARGA (feita em todas as séries), FAÇA OS DEMAIS MÉTODOS APENAS NAS SÉRIES PRETAS
          </div>

          {[
            ['Progressão de carga', 'Progrida a carga, a repetição ou a execução em cada série do exercício. PROGREDIR O DESCANSO TAMBÉM. Obs: obrigatório aumentar a carga (kg) entre séries de cores diferentes.'],
            ['DROP SET', 'Divida a série em 3 blocos, sem intervalo entre eles, reduzindo ~30% da carga de um bloco para outro. Busque falhar em cada bloco.'],
            ['CLUSTER SET', 'Divida a série em 3 a 6 blocos, com mesmo número de repetições e 10–20s de intervalo entre blocos. A falha ocorre no último ou nos 2 últimos blocos.'],
            ['PICO DE CONTRAÇÃO', 'Segure 2–3s na fase máxima da contração e faça a fase excêntrica lentamente.'],
            ['BACK OFF SET', 'Após a última série válida (preta), reduza 20–30% da carga, descanse 80–90s e faça mais uma série até a falha total, sem contar repetições.'],
            ['FST-7', 'Faça 7 séries de 10–12 repetições com 30s de intervalo ativo (alongando a musculatura). Carga semelhante à de reconhecimento (verde).'],
          ].map(([tag, text]) => (
            <div key={tag} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 10 }}>
              <div
                style={{
                  background: THEME.red, color: '#000', borderRadius: 12, padding: 10,
                  fontWeight: 900, textTransform: 'uppercase', border: `1px solid ${THEME.stroke}`,
                }}
              >
                {tag}
              </div>
              <div
                style={{
                  background: '#FFFFFF', color: '#000', borderRadius: 12, padding: 12,
                  border: `1px solid ${THEME.stroke}`, lineHeight: 1.5, fontSize: 14,
                }}
              >
                {text}
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <Modal
        open={showVacumVideo}
        onClose={() => setShowVacumVideo(false)}
        title="Vacum (tutorial)"
      >
        <div
          style={{
            border: `1px solid ${THEME.stroke}`,
            borderRadius: 12,
            overflow: 'hidden',
            background: '#000',
            aspectRatio: '16 / 9',
          }}
        >
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/itsURh_YfD8?si=qDUy2I8Mo3fO3kgG"
            title="Vacum Tutorial"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </Modal>

      <AccountModal open={openAccount} onClose={() => setOpenAccount(false)} username={username} />

      <BottomTabs active="inicio" onNavigate={go} />
    </div>
  );
}
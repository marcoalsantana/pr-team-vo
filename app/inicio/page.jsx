'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import BottomTabs from '../../components/BottomTabs';
import Modal from '../../components/Modal';
import WeekStrip from '../../components/WeekStrip';

const THEME = {
  bg: '#1C1C1C',
  card: '#141414',
  stroke: 'rgba(255,255,255,0.10)',
  text: '#FFFFFF',
  muted: '#B9B9B9',
  red: '#C1121F',
  red2: '#E04141',
  shadow: '0 12px 28px rgba(0,0,0,0.35)',
  softShadow: '0 10px 18px rgba(0,0,0,0.28)',
};

const CARD_BASE_STYLE = {
  background: THEME.card,
  borderRadius: 16,
  border: `1px solid ${THEME.stroke}`,
  boxShadow: THEME.shadow,
};

const CTA_BUTTON_STYLE = {
  border: '0',
  borderRadius: 12,
  background: `linear-gradient(180deg, ${THEME.red} 0%, ${THEME.red2} 100%)`,
  color: THEME.text,
  fontWeight: 900,
  fontSize: 14,
  letterSpacing: '0.04em',
  padding: '12px 18px',
  cursor: 'pointer',
  boxShadow: '0 12px 26px rgba(224,65,65,0.28)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
};

const MODAL_CONTENT_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 18,
  width: '100%',
  maxWidth: 380,
  margin: '0 auto',
  background: 'transparent',
};

const CALENDAR_DAYS = [
  { label: 'sab, 27', complete: false },
  { label: 'dom, 28', complete: true },
  { label: 'seg, 29', complete: true, today: true },
  { label: 'ter, 30', complete: false },
  { label: 'qua, 01', complete: false },
];

const BOTTOM_TAB_PATHS = ['/inicio', '/mobilidades', '/treino', '/alimentar'];

function Header({ onAvatarClick }) {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0))',
        backdropFilter: 'blur(6px)',
        padding: '16px 20px 14px',
        borderBottom: `1px solid ${THEME.stroke}`,
        boxShadow: THEME.softShadow,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span
            style={{
              fontSize: 27,
              textTransform: 'uppercase',
              fontWeight: 900,
              letterSpacing: '0.5em',
            }}
          >
            PR TEAM
          </span>
          <span style={{ fontSize: 12, color: THEME.muted, letterSpacing: '0.04em' }}>Painel do aluno</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14, color: THEME.muted }}>
            Olá, <strong style={{ color: THEME.text }}>Pedro</strong>!
          </span>
          <button
            type="button"
            aria-label="Abrir menu de conta"
            onClick={onAvatarClick}
            style={{
              width: 44,
              height: 44,
              borderRadius: '999px',
              border: `1px solid ${THEME.stroke}`,
              background: 'linear-gradient(135deg, rgba(193,18,31,0.18), rgba(193,18,31,0.08))',
              display: 'grid',
              placeItems: 'center',
              color: THEME.text,
              cursor: 'pointer',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Zm0 2.1C7.32 14.1 4.65 16.44 4.65 19.2H19.35c0-2.76-2.67-5.1-7.35-5.1Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

function CalendarCard({ onStart }) {
  return (
    <section
      style={{
        ...CARD_BASE_STYLE,
        padding: '16px 16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 12, color: THEME.muted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Ficha atual
          </span>
          <strong style={{ fontSize: 20, letterSpacing: '0.04em', fontWeight: 700 }}>Ficha 1</strong>
        </div>
        <button type="button" onClick={onStart} style={CTA_BUTTON_STYLE}>
          Iniciar
        </button>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
          gap: 12,
        }}
      >
        {CALENDAR_DAYS.map((day) => {
          const [weekdayRaw = '', dayNumber = ''] = day.label.split(', ');
          const weekday = weekdayRaw.toUpperCase();
          return (
            <div
              key={day.label}
              style={{
                borderRadius: 12,
                border: `1px solid ${THEME.stroke}`,
                background: '#1F1F1F',
                padding: '8px 10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                color: day.today ? THEME.text : THEME.muted,
                boxShadow: day.today
                  ? '0 0 0 2px #C1121F, 0 8px 14px rgba(193,18,31,0.25)'
                  : 'none',
              }}
            >
              <span style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{weekday}</span>
              <span style={{ fontSize: 24, fontWeight: 700, lineHeight: 1 }}>{dayNumber}</span>
              <span style={{ fontSize: 16 }}>{day.complete ? '✅' : '❌'}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SummaryCard() {
  return (
    <section
      style={{
        ...CARD_BASE_STYLE,
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: THEME.muted }}>
          Resumo do aluno
        </span>
        <span style={{ fontSize: 12, color: THEME.muted }}>Atualizado agora</span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 16,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            paddingRight: 14,
            borderRight: `1px solid ${THEME.stroke}`,
          }}
        >
          <span style={{ fontSize: 13, color: THEME.muted }}>Treinos no mês</span>
          <strong style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1 }}>0</strong>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontSize: 13, color: THEME.muted }}>Treinos no total</span>
          <span style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <strong style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1 }}>0</strong>
            <span style={{ fontSize: 12, color: THEME.muted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>em progresso</span>
          </span>
        </div>
      </div>
    </section>
  );
}

function MethodsCard({ onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        ...CARD_BASE_STYLE,
        padding: '20px 22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        textAlign: 'left',
        color: THEME.text,
        cursor: 'pointer',
        background: THEME.card,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>Explicação dos métodos</span>
        <span style={{ fontSize: 13, color: THEME.muted }}>Toque para ver mais</span>
      </div>
      <div
        aria-hidden
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          border: `1px solid ${THEME.stroke}`,
          background: 'rgba(255,255,255,0.04)',
          color: THEME.text,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </button>
  );
}

function DailyNoteCard({ onOpen }) {
  return (
    <section
      style={{
        ...CARD_BASE_STYLE,
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 12, color: THEME.muted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Recado do dia
          </span>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>Foco e consistência</span>
        </div>
        <button
          type="button"
          onClick={onOpen}
          style={{
            background: '#242424',
            border: `1px solid ${THEME.stroke}`,
            color: THEME.text,
            borderRadius: 10,
            padding: '10px 12px',
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.04em',
            cursor: 'pointer',
          }}
        >
          Ver recado
        </button>
      </div>
      <p
        style={{
          margin: 0,
          color: THEME.muted,
          fontSize: 14,
          lineHeight: 1.6,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        Pedro deixa um recado diário para manter você focado. Abra para ler o texto completo e alinhar suas metas de hoje.
      </p>
    </section>
  );
}

export default function InicioPage() {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(false);
  const [showMethods, setShowMethods] = useState(false);
  const [showDaily, setShowDaily] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data?.session) {
        router.replace('/');
      }
    });
  }, [router]);

  useEffect(() => {
    const nav = document.querySelector('.tabs');
    if (!nav) return;
    nav.style.position = 'fixed';
    nav.style.left = '0';
    nav.style.right = '0';
    nav.style.bottom = '0';
    nav.style.zIndex = '40';
    nav.style.background = '#111';
    nav.style.padding = '10px 18px 18px';
    const buttons = nav.querySelectorAll('.tab');
    buttons.forEach((button, index) => {
      const path = BOTTOM_TAB_PATHS[index];
      button.style.opacity = path === pathname ? '1' : '0.68';
      button.style.borderBottom = path === pathname ? `2px solid ${THEME.red}` : '2px solid transparent';
      button.style.paddingBottom = '8px';
      button.style.transition = 'opacity 0.2s ease';
    });
  }, [pathname]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: THEME.bg,
        color: THEME.text,
        paddingBottom: 120,
      }}
    >
      <style>{`
        .modal-backdrop {
          background: rgba(0,0,0,0.6) !important;
          backdrop-filter: blur(3px) !important;
          z-index: 9999 !important;
        }
        .modal {
          background: ${THEME.card} !important;
          border: 1px solid ${THEME.stroke} !important;
          border-radius: 16px !important;
          box-shadow: ${THEME.shadow} !important;
          padding: 18px !important;
          color: ${THEME.text} !important;
        }
        .modal .title {
          color: ${THEME.text} !important;
          font-weight: 700 !important;
        }
      `}</style>
      <Header onAvatarClick={() => setOpenMenu(true)} />

      <main
        style={{
          padding: '24px 18px 40px',
          display: 'grid',
          gap: 20,
          maxWidth: 430,
          margin: '0 auto',
        }}
      >
        <CalendarCard onStart={() => router.push('/treino')} />
        <SummaryCard />
        <MethodsCard onOpen={() => setShowMethods(true)} />
        <DailyNoteCard onOpen={() => setShowDaily(true)} />
        <section
          style={{
            ...CARD_BASE_STYLE,
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>Planejamento da semana</span>
            <span style={{ fontSize: 12, color: THEME.muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Organize seu foco diário
            </span>
          </div>
          <WeekStrip />
        </section>
      </main>

      <BottomTabs />

      <Modal
        open={openMenu}
        onClose={() => setOpenMenu(false)}
        align="top"
        title="Conta"
      >
        <div style={MODAL_CONTENT_STYLE}>
          <p style={{ margin: 0, fontSize: 14, color: THEME.muted }}>Status: ativo ✅</p>
          <button
            type="button"
            onClick={() => {
              setOpenMenu(false);
              supabase.auth.signOut().finally(() => router.replace('/'));
            }}
            style={{
              ...CTA_BUTTON_STYLE,
              width: '100%',
            }}
          >
            Sair da conta
          </button>
        </div>
      </Modal>

      <Modal
        open={showMethods}
        onClose={() => setShowMethods(false)}
        title="Explicação dos métodos"
      >
        <div style={MODAL_CONTENT_STYLE}>
          <p style={{ margin: 0, fontSize: 14, color: THEME.muted, lineHeight: 1.6 }}>
            Conteúdo em desenvolvimento: Progressão de carga, Drop set, Cluster set, Pico de contração, Back-off set e FST-7.
          </p>
        </div>
      </Modal>

      <Modal open={showDaily} onClose={() => setShowDaily(false)} title="Recado do dia!">
        <div style={MODAL_CONTENT_STYLE}>
          <p style={{ margin: 0, fontSize: 14, color: THEME.muted, lineHeight: 1.6 }}>
            Foque na execução perfeita, respiração e controle. Qualidade &gt; quantidade. Beba água, durma bem e apareça para si mesmo hoje. Vamos pra cima! 💪
          </p>
        </div>
      </Modal>
    </div>
  );
}

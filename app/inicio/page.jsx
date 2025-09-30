'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import BottomTabs from '../../components/BottomTabs';
import Modal from '../../components/Modal';
import WeekStrip from '../../components/WeekStrip';

const COLORS = {
  background: '#1C1C1C',
  surface: '#121212',
  surfaceAlt: '#181818',
  stroke: 'rgba(255,255,255,0.09)',
  text: '#FFFFFF',
  muted: '#C9C9C9',
  accent: '#C1121F',
  accentSoft: '#E04141',
};

const SHADOW_SOFT = '0 16px 32px rgba(0,0,0,0.28)';
const SHADOW_HEADER = '0 12px 28px rgba(0,0,0,0.35)';

const CALENDAR_DAYS = [
  { label: 'sab, 27', complete: false },
  { label: 'dom, 28', complete: true },
  { label: 'seg, 29', complete: true, today: true },
  { label: 'ter, 30', complete: false },
  { label: 'qua, 01', complete: false },
];

function Header({ onAvatarClick }) {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: COLORS.surface,
        padding: '18px 18px 16px',
        borderBottom: `1px solid ${COLORS.stroke}`,
        boxShadow: SHADOW_HEADER,
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
              fontSize: 21,
              textTransform: 'uppercase',
              fontWeight: 800,
              letterSpacing: '0.2em',
            }}
          >
            PR TEAM
          </span>
          <span style={{ fontSize: 12, color: COLORS.muted }}>Painel do aluno</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14, color: COLORS.muted }}>
            Olá, <strong style={{ color: COLORS.text }}>Pedro</strong>!
          </span>
          <button
            type="button"
            aria-label="Abrir menu de conta"
            onClick={onAvatarClick}
            style={{
              width: 42,
              height: 42,
              borderRadius: '999px',
              border: `1px solid ${COLORS.stroke}`,
              background: 'linear-gradient(135deg, rgba(193,18,31,0.18), rgba(193,18,31,0.06))',
              display: 'grid',
              placeItems: 'center',
              color: COLORS.text,
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
        background: COLORS.surfaceAlt,
        borderRadius: 16,
        padding: '18px 18px 20px',
        border: `1px solid ${COLORS.stroke}`,
        boxShadow: SHADOW_SOFT,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridAutoFlow: 'column',
          gridAutoColumns: 'minmax(72px, 1fr)',
          gap: 12,
          overflowX: 'auto',
          paddingBottom: 4,
        }}
      >
        {CALENDAR_DAYS.map((day) => (
          <div
            key={day.label}
            style={{
              borderRadius: 14,
              border: day.today ? `2px solid ${COLORS.accent}` : `1px solid ${COLORS.stroke}`,
              background: day.today ? 'linear-gradient(145deg, rgba(193,18,31,0.35), rgba(193,18,31,0.12))' : 'rgba(255,255,255,0.03)',
              color: day.today ? COLORS.text : COLORS.muted,
              padding: '10px 8px 9px',
              textAlign: 'center',
              boxShadow: day.today ? '0 0 18px rgba(193,18,31,0.32)' : 'none',
            }}
          >
            <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{day.label}</span>
            <div style={{ fontSize: 16, marginTop: 8 }}>{day.complete ? '✅' : '❌'}</div>
          </div>
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 12, color: COLORS.muted }}>Ficha atual</span>
          <strong style={{ fontSize: 19, letterSpacing: '0.02em' }}>Ficha 1</strong>
        </div>
        <button
          type="button"
          onClick={onStart}
          style={{
            minWidth: 126,
            height: 48,
            borderRadius: 14,
            border: 'none',
            background: 'linear-gradient(135deg, #C1121F 0%, #E04141 100%)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: '0.04em',
            cursor: 'pointer',
          }}
        >
          Iniciar
        </button>
      </div>
    </section>
  );
}

function SummaryCard() {
  return (
    <section
      style={{
        background: COLORS.surfaceAlt,
        borderRadius: 16,
        padding: '18px 20px',
        border: `1px solid ${COLORS.stroke}`,
        boxShadow: SHADOW_SOFT,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <span style={{ fontSize: 12, letterSpacing: '0.06em', color: COLORS.muted }}>Resumo do aluno</span>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 12, borderRight: `1px solid ${COLORS.stroke}` }}>
          <span style={{ fontSize: 12, color: COLORS.muted }}>Treinos no mês</span>
          <strong style={{ fontSize: 34, fontWeight: 800, lineHeight: 1 }}>0</strong>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 12, color: COLORS.muted }}>Treinos no total</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <strong style={{ fontSize: 34, fontWeight: 800, lineHeight: 1 }}>0</strong>
            <span style={{ fontSize: 18 }}>✅</span>
          </div>
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '18px 20px',
        borderRadius: 16,
        border: `1px solid ${COLORS.stroke}`,
        background: COLORS.surfaceAlt,
        boxShadow: SHADOW_SOFT,
        cursor: 'pointer',
        textAlign: 'left',
        color: COLORS.text,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: 18, fontWeight: 700 }}>Explicação dos métodos</span>
        <span style={{ fontSize: 13, color: COLORS.muted }}>Toque para ver mais</span>
      </div>
      <div
        aria-hidden
        style={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          background: 'rgba(255,255,255,0.08)',
          color: COLORS.muted,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="m10 8 6 4-6 4V8Z" fill="currentColor" />
        </svg>
      </div>
    </button>
  );
}

function DailyNoteCard({ onOpen }) {
  return (
    <section
      style={{
        background: COLORS.surfaceAlt,
        borderRadius: 16,
        padding: '18px 20px',
        border: `1px solid ${COLORS.stroke}`,
        boxShadow: SHADOW_SOFT,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 18, fontWeight: 700 }}>Recado do dia!</span>
        <button
          type="button"
          onClick={onOpen}
          style={{
            border: 'none',
            borderRadius: 12,
            padding: '10px 16px',
            background: 'rgba(255,255,255,0.12)',
            color: COLORS.text,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Ver recado
        </button>
      </div>
      <p style={{ margin: 0, color: COLORS.muted, fontSize: 14, lineHeight: 1.6 }}>
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data?.session) {
        router.replace('/');
      }
    });
  }, [router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: COLORS.background,
        color: COLORS.text,
        paddingBottom: 96,
      }}
    >
      <Header onAvatarClick={() => setOpenMenu(true)} />

      <main
        style={{
          padding: '22px 16px 32px',
          display: 'grid',
          gap: 18,
          maxWidth: 520,
          margin: '0 auto',
        }}
      >
        <CalendarCard onStart={() => router.push('/treino')} />
        <SummaryCard />
        <MethodsCard onOpen={() => setShowMethods(true)} />
        <DailyNoteCard onOpen={() => setShowDaily(true)} />
        <section
          style={{
            background: COLORS.surfaceAlt,
            borderRadius: 16,
            padding: '20px 20px',
            border: `1px solid ${COLORS.stroke}`,
            boxShadow: SHADOW_SOFT,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 18, fontWeight: 700 }}>Planejamento da semana</span>
            <span style={{ fontSize: 12, color: COLORS.muted }}>Organize seu foco diário</span>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ margin: 0, fontSize: 14, color: COLORS.muted }}>Status: ativo ✅</p>
          <button
            type="button"
            onClick={() => {
              setOpenMenu(false);
              supabase.auth.signOut().finally(() => router.replace('/'));
            }}
            style={{
              height: 48,
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, #C1121F, #E04141)',
              color: '#fff',
              fontWeight: 700,
              letterSpacing: '0.05em',
              cursor: 'pointer',
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
        <p style={{ margin: 0, fontSize: 14, color: COLORS.muted, lineHeight: 1.6 }}>
          Conteúdo em desenvolvimento: Progressão de carga, Drop set, Cluster set, Pico de contração, Back-off set e FST-7.
        </p>
      </Modal>

      <Modal open={showDaily} onClose={() => setShowDaily(false)} title="Recado do dia!">
        <p style={{ margin: 0, fontSize: 14, color: COLORS.muted, lineHeight: 1.6 }}>
          Foque na execução perfeita, respiração e controle. Qualidade &gt; quantidade. Beba água, durma bem e apareça para si mesmo hoje. Vamos pra cima! 💪
        </p>
      </Modal>
    </div>
  );
}

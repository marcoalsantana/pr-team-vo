'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

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
};

// Marca de “estou no build certo”
const BUILD_TAG = 'TREINO v2-SPACING';

function Card({ children, style }) {
  return (
    <section
      style={{
        background: THEME.surface,
        border: `1px solid ${THEME.stroke}`,
        borderRadius: 18,
        boxShadow: '0 8px 18px rgba(0,0,0,0.22)',
        padding: 18,
        // 👇 Espaçamento explícito entre cards
        marginBottom: 22,
        ...style,
      }}
    >
      {children}
    </section>
  );
}

function WeekDots() {
  const days = useMemo(() => ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'], []);
  const today = new Date().getDay(); // 0..6

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12 }}>
      {days.map((d, i) => {
        const isToday = i === today;
        return (
          <div
            key={i}
            style={{
              textAlign: 'center',
              color: THEME.text,
              border: `1px solid ${THEME.strokeSoft}`,
              borderRadius: 14,
              padding: '12px 8px',
              background: '#17171A',
            }}
          >
            <div style={{ fontSize: 12, color: THEME.textMute, marginBottom: 8 }}>{d}</div>
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 999,
                margin: '0 auto',
                border: `1px solid ${isToday ? THEME.red : THEME.stroke}`,
                display: 'grid',
                placeItems: 'center',
                background: isToday ? 'rgba(193,18,31,0.18)' : 'transparent',
              }}
            >
              {/* vazia por enquanto; quando concluir treino do dia, troca por ✓ */}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function TreinoPage() {
  const router = useRouter();

  const go = (href) => router.push(href);

  return (
    <div
      style={{
        minHeight: '100dvh',
        color: THEME.text,
        background: `
          linear-gradient(180deg, rgba(193,18,31,0.08), rgba(255,255,255,0.02) 20%, transparent),
          repeating-linear-gradient(-45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 10px),
          repeating-linear-gradient(-45deg, rgba(193,18,31,0.08) 0px, rgba(193,18,31,0.08) 1px, transparent 1px, transparent 22px),
          ${THEME.bg}
        `,
        padding: '16px 16px calc(env(safe-area-inset-bottom) + 100px)',
      }}
    >
      {/* Header compacto com tag de build pra confirmar que pegou */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 5,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0))',
          backdropFilter: 'blur(2px)',
          borderBottom: `1px solid ${THEME.strokeSoft}`,
          padding: '12px 4px 10px',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontSize: 22, fontWeight: 900 }}>Plano de Treino</div>
          <div style={{ fontSize: 10, color: THEME.textMute }}>{BUILD_TAG}</div>
        </div>
      </header>

      {/* 👇 ESPAÇAMENTO TOTAL CONTROLADO AQUI: cada Card tem marginBottom: 22 */}
      <main style={{ maxWidth: 520, margin: '0 auto' }}>
        {/* Card 1 — Sua semana */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <div style={{ fontSize: 17, fontWeight: 900 }}>Sua semana</div>
            <div style={{ fontSize: 12, color: THEME.textMute }}>resumo visual</div>
          </div>
          <WeekDots />
        </Card>

        {/* Card 2 — Treino do dia */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 17, fontWeight: 900 }}>Treino do dia</div>
            <button
              onClick={() => alert('Aqui vai abrir o popup com todos os treinos')}
              style={{
                background: 'transparent',
                border: `1px solid ${THEME.stroke}`,
                color: THEME.text,
                borderRadius: 10,
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              Ver todos
            </button>
          </div>

          <div style={{ fontSize: 14, color: THEME.textDim, marginBottom: 10 }}>Treino B — Pernas</div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {['Agachamento', 'Leg Press', 'Cadeira Extensora', 'Panturrilha'].map((t) => (
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
              width: '100%',
              background: `linear-gradient(180deg, ${THEME.red} 0%, ${THEME.red2} 100%)`,
              border: 'none',
              color: THEME.text,
              borderRadius: 12,
              padding: '12px 18px',
              cursor: 'pointer',
              fontWeight: 900,
            }}
          >
            Começar agora
          </button>
        </Card>

        {/* Card 3 — Programa de treino */}
        <Card>
          <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 12 }}>Programa de treino</div>
          <div style={{ display: 'grid', gap: 10 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 13,
                color: THEME.textDim,
              }}
            >
              <span>Ficha válida</span>
              <span>01/10 a 14/10</span>
            </div>

            <div
              style={{
                height: 10,
                borderRadius: 999,
                background: '#1A1A1D',
                border: `1px solid ${THEME.strokeSoft}`,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: '35%',
                  height: '100%',
                  background: `linear-gradient(90deg, ${THEME.red}, ${THEME.red2})`,
                }}
              />
            </div>

            <div style={{ fontSize: 12, color: THEME.textMute }}>35% concluído</div>
          </div>
        </Card>

        {/* Card 4 — Pré-treino essencial */}
        <Card
          style={{
            background: `linear-gradient(90deg, rgba(193,18,31,.18), rgba(193,18,31,.07))`,
            border: `1px solid ${THEME.stroke}`,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 6 }}>
            ⚡️ Não esqueça a mobilidade e alongamento
          </div>
          <div style={{ fontSize: 13, color: THEME.textMute, marginBottom: 12 }}>
            Leva 5–8 min e melhora MUITO sua performance.
          </div>
          <button
            onClick={() => go('/mobilidades')}
            style={{
              background: 'transparent',
              border: `1px solid ${THEME.stroke}`,
              color: THEME.text,
              borderRadius: 12,
              padding: '10px 14px',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            Ir para Mobilidades
          </button>
        </Card>

        {/* Card 5 — Streak semanal */}
        <Card>
          <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 12 }}>Streak semanal</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 10,
                  borderRadius: 999,
                  background: i < 3 ? THEME.red : '#1A1A1D',
                  border: `1px solid ${THEME.strokeSoft}`,
                }}
              />
            ))}
          </div>
          <div style={{ fontSize: 12, color: THEME.textMute, marginTop: 8 }}>3 dias seguidos</div>
        </Card>
      </main>

      {/* Rodapé “fake” pra garantir respiro no final */}
      <div style={{ height: 60 }} />
    </div>
  );
}

'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const DEFAULT_PLAN = ['A', 'B', 'Descanso', 'C', 'D', 'E', 'Descanso'];
const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function WeekSuggestion({ theme }) {
  const THEME = theme || {
    surface: '#141417',
    stroke: 'rgba(255,255,255,0.06)',
    strokeSoft: 'rgba(255,255,255,0.04)',
    text: '#FFFFFF',
    textMute: '#9B9BA1',
    textDim: '#CFCFD2',
    red: '#C1121F',
    red2: '#E04141',
    accent: 'rgba(193,18,31,0.08)',
  };

  const sp = useSearchParams();
  const wantEdit = sp.get('edit') === '1';
  const [plan, setPlan] = useState(DEFAULT_PLAN);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('suggestedWeekPlan');
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length === 7) setPlan(arr);
      }
    } catch {}
  }, []);

  const save = (newPlan) => {
    setPlan(newPlan);
    try {
      localStorage.setItem('suggestedWeekPlan', JSON.stringify(newPlan));
    } catch {}
  };

  const options = ['A', 'B', 'C', 'D', 'E', 'Descanso'];

  return (
    <section
      style={{
        background: THEME.accent,
        border: `1px solid ${THEME.stroke}`,
        borderRadius: 16,
        padding: 14,
        display: 'grid',
        gap: 10,
      }}
    >
      {/* título */}
      <div style={{ display: 'grid', gap: 4 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: THEME.text }}>
          📅 Plano de treino sugerido pelo Coach Pedro Ratton
        </div>
      </div>

      {!wantEdit && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 6,
            flexWrap: 'wrap',
            marginTop: 4,
          }}
        >
          {plan.map((v, i) => {
            const isRest = String(v).toLowerCase() === 'descanso';
            return (
              <div
                key={i}
                style={{
                  flex: '1 1 calc(14% - 4px)',
                  minWidth: 42,
                  background: isRest
                    ? 'rgba(255,255,255,0.03)'
                    : 'rgba(193,18,31,0.12)',
                  border: `1px solid ${THEME.strokeSoft}`,
                  borderRadius: 10,
                  padding: '8px 4px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 11, color: THEME.textMute }}>
                  {DAY_LABELS[i]}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: isRest ? THEME.textDim : THEME.red2,
                    marginTop: 2,
                  }}
                >
                  {isRest ? 'Desc.' : v}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {wantEdit && (
        <div style={{ display: 'grid', gap: 8, marginTop: 4 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2,1fr)',
              gap: 10,
            }}
          >
            {plan.map((v, i) => (
              <div
                key={i}
                style={{
                  background: '#141417',
                  border: `1px solid ${THEME.stroke}`,
                  borderRadius: 10,
                  padding: 8,
                  display: 'grid',
                  gap: 6,
                }}
              >
                <div style={{ fontSize: 12, color: THEME.textMute }}>
                  {DAY_LABELS[i]}
                </div>
                <select
                  value={v}
                  onChange={(e) => {
                    const next = [...plan];
                    next[i] = e.target.value;
                    setPlan(next);
                  }}
                  style={{
                    background: '#0f0f11',
                    color: THEME.text,
                    border: `1px solid ${THEME.stroke}`,
                    borderRadius: 8,
                    padding: '6px 8px',
                    outline: 'none',
                  }}
                >
                  {options.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button
              onClick={() => save(DEFAULT_PLAN)}
              style={{
                background: 'transparent',
                border: `1px solid ${THEME.stroke}`,
                color: THEME.textDim,
                borderRadius: 10,
                padding: '8px 12px',
              }}
            >
              Restaurar
            </button>
            <button
              onClick={() => save(plan)}
              style={{
                background: `linear-gradient(180deg, ${THEME.red}, ${THEME.red2})`,
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '8px 12px',
                fontWeight: 800,
              }}
            >
              Salvar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
// components/TrainingProgramCard.jsx
'use client';

import { useEffect, useMemo, useState } from 'react';

/**
 * Config que o /admin vai popular futuramente:
 * localStorage.programConfig = {
 *   startDate: "2025-10-01",   // ISO (yyyy-mm-dd)
 *   durationWeeks: 2,          // quantas semanas vale a ficha
 *   restDays: [0],             // dias de descanso (0=Dom .. 6=Sáb)
 * }
 *
 * E os treinos concluídos já existem:
 * localStorage.completedWorkouts = { "2025-10-06": "A", ... }
 */

const DEFAULTS = {
  durationWeeks: 2,
  restDays: [0], // Domingo
};

function ymd(d) {
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}
function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

export default function TrainingProgramCard({ theme }) {
  const THEME = theme;

  const [program, setProgram] = useState(null);
  const [doneMap, setDoneMap] = useState({});

  // carrega configs e treinos do localStorage (somente no client)
  useEffect(() => {
    try {
      const rawCfg = localStorage.getItem('programConfig');
      const cfg = rawCfg ? JSON.parse(rawCfg) : {};
      const startDate = cfg.startDate ? new Date(cfg.startDate) : new Date();
      startDate.setHours(0, 0, 0, 0);

      const durationWeeks = Number(cfg.durationWeeks || DEFAULTS.durationWeeks);
      const restDays = Array.isArray(cfg.restDays) ? cfg.restDays : DEFAULTS.restDays;

      setProgram({
        startDate,
        durationWeeks,
        restDays,
      });
    } catch {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setProgram({
        startDate: today,
        durationWeeks: DEFAULTS.durationWeeks,
        restDays: DEFAULTS.restDays,
      });
    }

    try {
      const raw = localStorage.getItem('completedWorkouts');
      setDoneMap(raw ? JSON.parse(raw) : {});
    } catch {
      setDoneMap({});
    }
  }, []);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const { endDate, percent, weeksText } = useMemo(() => {
    if (!program) return { endDate: null, percent: 0, weeksText: '' };
    const durationDays = program.durationWeeks * 7;
    const end = addDays(program.startDate, durationDays - 1);
    const total = durationDays;
    const elapsed = clamp(
      Math.floor((today - program.startDate) / (1000 * 60 * 60 * 24)) + 1,
      0,
      total
    );
    const pct = Math.round((elapsed / total) * 100);
    const wkText = program.durationWeeks === 1
      ? '1 semana dessa ficha'
      : `${program.durationWeeks} semanas dessa ficha`;
    return { endDate: end, percent: pct, weeksText: wkText };
  }, [program, today]);

  // 🔥 streak real: dias seguidos; dias de descanso NÃO quebram
  const streak = useMemo(() => {
    if (!program) return 0;

    let count = 0;
    // vamos olhar no máximo 180 dias pra trás (mais que suficiente)
    for (let i = 0; i < 180; i++) {
      const d = addDays(today, -i);
      const weekday = d.getDay(); // 0..6
      const key = ymd(d);
      const isRest = program.restDays.includes(weekday);
      const trained = !!doneMap[key];

      if (isRest || trained) {
        count++;
        continue;
      }
      // dia válido sem treino: streak quebra
      break;
    }
    return count;
  }, [program, doneMap, today]);

  // formata datas DD/MM
  const fmt = (d) =>
    d
      ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
      : '--/--';

  // UI do card
  return (
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
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 900 }}>Programa de treino</div>
          <div style={{ fontSize: 12, color: THEME.textMute, marginTop: 2 }}>
            Ficha ativa • {weeksText}
          </div>
        </div>

        {/* 🔥 Streak */}
        <div
          title="Dias seguidos de treino (descanso não quebra o streak)"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 10px',
            borderRadius: 999,
            border: `1px solid ${THEME.stroke}`,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0))',
            color: THEME.text,
            fontWeight: 800,
            boxShadow: THEME.softShadow,
            minWidth: 84,
            justifyContent: 'center',
          }}
        >
          🔥 {streak}
        </div>
      </div>

      {/* Datas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
        }}
      >
        <div
          style={{
            borderRight: `1px solid ${THEME.strokeSoft}`,
            paddingRight: 12,
          }}
        >
          <div style={{ fontSize: 12, color: THEME.textMute, marginBottom: 6 }}>
            Começou em
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1 }}>
            {program ? fmt(program.startDate) : '--/--'}
          </div>
        </div>

        <div style={{ paddingLeft: 12 }}>
          <div style={{ fontSize: 12, color: THEME.textMute, marginBottom: 6 }}>
            Termina em
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1 }}>
            {endDate ? fmt(endDate) : '--/--'}
          </div>
        </div>
      </div>

      {/* Progresso da ficha */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: THEME.textMute }}>Progresso da ficha</span>
          <span style={{ fontSize: 12, color: THEME.textDim }}>{percent}%</span>
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
              width: `${percent}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${THEME.red}, ${THEME.red2})`,
            }}
          />
        </div>
        <div style={{ marginTop: 6, fontSize: 11, color: THEME.textMute }}>
          * Dias de descanso não quebram o 🔥
        </div>
      </div>
    </section>
  );
}
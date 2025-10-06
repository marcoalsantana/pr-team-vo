// components/DailyNote.jsx
'use client';

import React, { useEffect, useState } from 'react';

const THEME = {
  surface: '#121214',
  stroke: 'rgba(255,255,255,0.08)',
  strokeSoft: 'rgba(255,255,255,0.06)',
  text: '#FFFFFF',
  textMute: '#9B9BA1',
  red: '#C1121F',
  softShadow: '0 8px 18px rgba(0,0,0,0.22)',
};

const STORAGE_KEY = 'dailyNote.v1';

export default function DailyNote() {
  const defaultNote = 'Bem-vindo! Foque no básico bem feito hoje: técnica perfeita, constância e boa execução. 🚀';
  const [note, setNote] = useState(defaultNote);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [canEdit, setCanEdit] = useState(false);

  // Habilita edição quando a URL tiver ?edit=1
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      setCanEdit(params.get('edit') === '1');
    } catch {}
  }, []);

  // Carrega do localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const { text, updatedAt } = JSON.parse(raw);
        if (text) setNote(text);
        if (updatedAt) setUpdatedAt(updatedAt);
      }
    } catch {}
  }, []);

  // Salva no localStorage
  const save = (text) => {
    const payload = { text, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setNote(text);
    setUpdatedAt(payload.updatedAt);
  };

  // UI de edição simples (prompt) — temporário até o /admin
  const onEdit = () => {
    const next = window.prompt('Novo recado do dia:', note);
    if (next != null) save(next.trim());
  };

  return (
    <section
      style={{
        background: THEME.surface,
        border: `1px solid ${THEME.stroke}`,
        borderRadius: 16,
        padding: 16,
        boxShadow: THEME.softShadow,
        display: 'grid',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontSize: 18, fontWeight: 900, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: THEME.red,
              boxShadow: '0 0 0 2px rgba(193,18,31,0.25)',
            }}
          />
          Recado do dia!
        </div>

        {canEdit && (
          <button
            onClick={onEdit}
            style={{
              fontSize: 12,
              color: THEME.text,
              border: `1px solid ${THEME.stroke}`,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0))',
              borderRadius: 10,
              padding: '6px 10px',
              cursor: 'pointer',
            }}
          >
            Editar
          </button>
        )}
      </div>

      <p style={{ margin: 0, color: THEME.text, lineHeight: 1.5 }}>{note}</p>

      {updatedAt && (
        <div style={{ fontSize: 11, color: THEME.textMute }}>
          Atualizado em {new Date(updatedAt).toLocaleString('pt-BR')}
        </div>
      )}
    </section>
  );
}
// app/alimentar/page.js
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BottomTabs from '../../components/BottomTabs';
import AccountModal from '../../components/AccountModal';

/* ================= CONFIG (ajuste aqui o WhatsApp do Pedro) ================= */
const WHATSAPP = {
  // DDI + DDD + número, só dígitos (ex.: Brasil 55 + DDD 11 => 5511999999999)
  phone: '5531997640809',
  message:
    'Oi Pedro! Quero assinar o PRFIT+ (Plano de Treino + Alimentar). Pode me enviar os próximos passos?',
};

/* ================= THEME ================= */
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
  textMute: '#9B9BA1',
  textDim: '#CFCFD2',
  red: '#C1121F',
  red2: '#E04141',
  green: '#27C281',
  shadow: '0 10px 22px rgba(0,0,0,0.30)',
  softShadow: '0 8px 18px rgba(0,0,0,0.22)',
};

/* ================= Storage Keys ================= */
const STORAGE_DIET_KEY = 'diet-plan-v1';
const ACCESS_FLAG = 'hasNutritionAccess'; // '1' = tem acesso ao PRFIT+

/* ================= Defaults ================= */
const defaultDiet = {
  observations: [
    'BEBA 4,5L de água por dia',
    'Refrigerante apenas zero (máx. 2 copos/dia)',
    '1 refeição livre na semana, sem exagero',
    'Sucos naturais e café apenas sem açúcar (máx. 2 copos/dia)',
  ],
  meals: [
    {
      title: 'Refeição I (Café da Manhã)',
      items: [
        '2 fatias de pão de forma ou 1 pão de sal ou 40g de tapioca',
        '2 ovos + 1 clara',
        '30g de requeijão light',
        '150g de abacaxi ou 200g de mamão',
      ],
    },
    {
      title: 'Refeição II (Lanche da Manhã)',
      items: ['200ml de leite desnatado ou 170g de iogurte desnatado', '1 banana média', '30g de whey'],
    },
    {
      title: 'Refeição III (Almoço)',
      items: [
        '120g de arroz',
        '50g de feijão',
        '200g de frango/peixe ou 170g de patinho',
        '150g de vegetais variados',
        'Folhas à vontade',
      ],
    },
    {
      title: 'Refeição IV (Lanche da Tarde)',
      items: ['40g de tapioca', '2 ovos', '200g de mamão'],
    },
    {
      title: 'Refeição V (Jantar)',
      items: [
        '120g de arroz',
        '50g de feijão',
        '200g de frango/peixe ou 170g de patinho',
        '150g de vegetais variados',
        'Folhas à vontade',
      ],
    },
  ],
};

/* ================= UI: Card de leitura ================= */
function ReadCard({ title, items }) {
  return (
    <section
      style={{
        background: THEME.surface,
        border: `1px solid ${THEME.stroke}`,
        borderRadius: 16,
        padding: 16,
        boxShadow: THEME.shadow,
        display: 'grid',
        gap: 10,
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 900 }}>{title}</div>
      <ul style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 4 }}>
        {items.map((it, i) => (
          <li key={i} style={{ fontSize: 14, color: THEME.textMute, lineHeight: 1.4 }}>
            {it}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ================= Página ================= */
export default function PlanoAlimentarPage() {
  const router = useRouter();
  const search = useSearchParams();
  const isEdit = search?.get('edit') === '1';

  const [openAccount, setOpenAccount] = useState(false);
  const username = 'aluno';
  const [hasAccess, setHasAccess] = useState(false);
  const [gateReady, setGateReady] = useState(false);

  useEffect(() => {
    try {
      setHasAccess(localStorage.getItem(ACCESS_FLAG) === '1');
    } catch {}
  }, []);

  useEffect(() => {
    if (search?.get('lock') === '1') {
      try {
        localStorage.removeItem(ACCESS_FLAG);
      } catch {}
      setHasAccess(false);
    }
  }, [search]);

  useEffect(() => {
    if (search?.get('unlock') === '1') {
      try {
        localStorage.setItem(ACCESS_FLAG, '1');
      } catch {}
      setHasAccess(true);
      const clean = window.location.pathname;
      window.history.replaceState({}, '', clean);
    }
  }, [search]);

  useEffect(() => {
    if (!hasAccess) {
      setGateReady(false);
      const t = setTimeout(() => setGateReady(true), 10);
      return () => clearTimeout(t);
    }
  }, [hasAccess]);

  const openWhatsApp = () => {
    const url = `https://wa.me/${WHATSAPP.phone}?text=${encodeURIComponent(
      WHATSAPP.message
    )}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const [diet, setDiet] = useState(defaultDiet);
  const [saveStatus, setSaveStatus] = useState('idle');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_DIET_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.meals && parsed?.observations) setDiet(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    try {
      localStorage.setItem(STORAGE_DIET_KEY, JSON.stringify(diet));
    } catch {}
  }, [diet, isEdit]);

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_DIET_KEY, JSON.stringify(diet));
      setSaveStatus('ok');
      setTimeout(() => setSaveStatus('idle'), 1200);
    } catch {
      setSaveStatus('err');
      setTimeout(() => setSaveStatus('idle'), 1200);
    }
  };

  const addMeal = () => {
    setDiet((d) => ({
      ...d,
      meals: [...d.meals, { title: 'Nova refeição', items: ['Novo item'] }],
    }));
  };

  const removeMeal = (idx) => {
    setDiet((d) => ({
      ...d,
      meals: d.meals.filter((_, i) => i !== idx),
    }));
  };

  const updateMealTitle = (idx, title) => {
    setDiet((d) => {
      const meals = d.meals.slice();
      meals[idx] = { ...meals[idx], title };
      return { ...d, meals };
    });
  };

  const addItem = (idx) => {
    setDiet((d) => {
      const meals = d.meals.slice();
      const m = { ...meals[idx] };
      m.items = [...m.items, 'Novo item'];
      meals[idx] = m;
      return { ...d, meals };
    });
  };

  const updateItem = (mealIdx, itemIdx, value) => {
    setDiet((d) => {
      const meals = d.meals.slice();
      const m = { ...meals[mealIdx] };
      const items = m.items.slice();
      items[itemIdx] = value;
      m.items = items;
      meals[mealIdx] = m;
      return { ...d, meals };
    });
  };

  const removeItem = (mealIdx, itemIdx) => {
    setDiet((d) => {
      const meals = d.meals.slice();
      const m = { ...meals[mealIdx] };
      m.items = m.items.filter((_, i) => i !== itemIdx);
      meals[mealIdx] = m;
      return { ...d, meals };
    });
  };

  const addObs = () => {
    setDiet((d) => ({
      ...d,
      observations: [...d.observations, 'Nova observação'],
    }));
  };

  const updateObs = (idx, value) => {
    setDiet((d) => {
      const obs = d.observations.slice();
      obs[idx] = value;
      return { ...d, observations: obs };
    });
  };

  const removeObs = (idx) => {
    setDiet((d) => ({
      ...d,
      observations: d.observations.filter((_, i) => i !== idx),
    }));
  };

    /* ====== UI em modo edição ====== */
    const EditCard = ({ meal, idx }) => (
      <section
        style={{
          background: THEME.surface,
          border: `1px solid ${THEME.stroke}`,
          borderRadius: 16,
          padding: 16,
          boxShadow: THEME.shadow,
          display: 'grid',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <input
            value={meal.title}
            onChange={(e) => updateMealTitle(idx, e.target.value)}
            style={{
              background: 'transparent',
              color: THEME.text,
              fontWeight: 900,
              fontSize: 18,
              border: 'none',
              outline: 'none',
              width: '100%',
            }}
          />
          <button
            onClick={() => removeMeal(idx)}
            style={{
              color: THEME.red2,
              fontSize: 12,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            Remover
          </button>
        </div>
  
        <ul style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 8 }}>
          {meal.items.map((it, i) => (
            <li key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 8 }}>
              <input
                value={it}
                onChange={(e) => updateItem(idx, i, e.target.value)}
                style={{
                  background: 'transparent',
                  color: THEME.textMute,
                  fontSize: 14,
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                }}
              />
              <button
                onClick={() => removeItem(idx, i)}
                style={{
                  color: THEME.red2,
                  fontSize: 12,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
                title="Excluir item"
              >
                x
              </button>
            </li>
          ))}
        </ul>
  
        <button
          onClick={() => addItem(idx)}
          style={{
            background: 'linear-gradient(90deg, rgba(193,18,31,.25), rgba(193,18,31,.05))',
            border: `1px solid ${THEME.stroke}`,
            borderRadius: 10,
            padding: '8px 12px',
            color: THEME.text,
            fontSize: 13,
            cursor: 'pointer',
            width: 'fit-content',
            fontWeight: 800,
          }}
        >
          + Adicionar item
        </button>
      </section>
    );
  
    /* ====== OVERLAY DE BLOQUEIO (PORTÃO PRFIT+) ====== */
    const GateOverlay = () => {
      return (
        <>
          {/* backdrop que NÃO cobre a BottomTabs (deixa 96px livres) */}
          <div
            aria-hidden
            style={{
              position: 'fixed',
              left: 0,
              right: 0,
              top: 0,
              bottom: 96, // mantém a barra inferior visível e clicável
              zIndex: 999,
              background: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              transition: 'opacity .35s ease',
              opacity: gateReady ? 1 : 0,
            }}
          />
  
          {/* modal card persuasivo */}
          <section
            role="dialog"
            aria-modal="true"
            style={{
              position: 'fixed',
              left: '50%',
              top: '12vh',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              width: '92%',
              maxWidth: 520,
              background: THEME.surface,
              border: `1px solid ${THEME.stroke}`,
              borderRadius: 18,
              padding: 18,
              boxShadow: THEME.shadow,
              display: 'grid',
              gap: 14,
              textAlign: 'center',
              opacity: gateReady ? 1 : 0,
              translate: gateReady ? '0 0' : '0 8px',
              transition: 'opacity .35s ease, translate .35s ease',
            }}
          >
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ fontSize: 28, lineHeight: 1 }}>
                <span
                  aria-hidden
                  style={{
                    display: 'inline-grid',
                    placeItems: 'center',
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    marginRight: 8,
                    border: `1px solid ${THEME.stroke}`,
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0))',
                    boxShadow: THEME.softShadow,
                  }}
                >
                  🔒
                </span>
                <strong>PRFIT+</strong>
              </div>
  
              <div style={{ fontSize: 18, fontWeight: 900 }}>
                Acesso restrito aos alunos do <span style={{ color: THEME.red2 }}>PRFIT+</span>
              </div>
  
              <div style={{ fontSize: 13, color: THEME.textMute, lineHeight: 1.6 }}>
                Desbloqueie o <strong>Plano Alimentar completo</strong>, cardápios prontos e ajustes
                guiados para acelerar seus resultados. Faça parte do grupo que <em>joga sério</em> 💪
              </div>
  
              <ul
                style={{
                  listStyle: 'none',
                  margin: '2px 0 0',
                  padding: 0,
                  display: 'grid',
                  gap: 6,
                  textAlign: 'left',
                  color: THEME.textDim,
                  fontSize: 13,
                }}
              >
                <li>🍎 Dieta personalizada por fase</li>
                <li>⏱️ Refeições simples de preparar</li>
                <li>📈 Acompanhamento de evolução</li>
              </ul>
  
              <button
                onClick={openWhatsApp}
                style={{
                  border: 'none',
                  borderRadius: 12,
                  padding: '14px 16px',
                  fontWeight: 900,
                  fontSize: 15,
                  color: '#fff',
                  cursor: 'pointer',
                  background: `linear-gradient(180deg, ${THEME.red} 0%, ${THEME.red2} 100%)`,
                  boxShadow: '0 10px 24px rgba(193,18,31,.28)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                className="shimmer-btn"
              >
                ✨ Quero fazer parte desse grupo!
              </button>
            </div>
          </section>
  
          {/* shimmer do CTA */}
          <style>{`
            .shimmer-btn::before {
              content: '';
              position: absolute;
              top: 0; left: -100%;
              width: 100%;
              height: 100%;
              background: linear-gradient(120deg, rgba(255,255,255,0.1), rgba(255,255,255,0.25), rgba(255,255,255,0.1));
              animation: shimmer 2.8s infinite;
            }
            @keyframes shimmer {
              0% { left: -100%; }
              50% { left: 100%; }
              100% { left: 100%; }
            }
          `}</style>
        </>
      );
    };
  
    /* ====== RENDER PRINCIPAL ====== */
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
        }}
      >
        {/* HEADER */}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                Plano Alimentar
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
                color: THEME.textMute,
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
              }}
            >
              👤
            </button>
          </div>
        </header>
  
        {/* CONTEÚDO */}
        <main
          style={{
            padding: '16px 16px 10px',
            maxWidth: 520,
            margin: '0 auto',
            display: 'grid',
            gap: 20,
          }}
        >
          {/* Observações no topo */}
          <section
            style={{
              background: `linear-gradient(90deg, rgba(193,18,31,.18), rgba(193,18,31,.07))`,
              border: `1px solid ${THEME.stroke}`,
              borderRadius: 16,
              padding: 16,
              boxShadow: THEME.shadow,
              display: 'grid',
              gap: 10,
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 900 }}>Observações</div>
            {!isEdit ? (
              <ul style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 6 }}>
                {diet.observations.map((obs, i) => (
                  <li key={i}>{obs}</li>
                ))}
              </ul>
            ) : (
              <>
                {diet.observations.map((obs, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <input
                      value={obs}
                      onChange={(e) => updateObs(i, e.target.value)}
                      style={{
                        flex: 1,
                        background: 'transparent',
                        color: THEME.text,
                        border: 'none',
                        outline: 'none',
                        borderBottom: `1px solid ${THEME.stroke}`,
                        padding: '4px 2px',
                        fontSize: 13,
                      }}
                    />
                    <button
                      onClick={() => removeObs(i)}
                      style={{
                        color: THEME.red2,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      x
                    </button>
                  </div>
                ))}
                <button
                  onClick={addObs}
                  style={{
                    marginTop: 6,
                    border: `1px solid ${THEME.stroke}`,
                    borderRadius: 10,
                    padding: '6px 10px',
                    background: 'transparent',
                    color: THEME.text,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  + Adicionar observação
                </button>
              </>
            )}
          </section>
  
          {/* Lista de refeições */}
          {!isEdit
            ? diet.meals.map((m, i) => <ReadCard key={i} title={m.title} items={m.items} />)
            : diet.meals.map((m, i) => <EditCard key={i} meal={m} idx={i} />)}
  
          {isEdit && (
            <div style={{ display: 'grid', gap: 10 }}>
              <button
                onClick={addMeal}
                style={{
                  border: `1px solid ${THEME.stroke}`,
                  borderRadius: 12,
                  padding: '10px 12px',
                  background: 'transparent',
                  color: THEME.text,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                + Adicionar refeição
              </button>
  
              <button
                onClick={handleSave}
                style={{
                  border: 'none',
                  borderRadius: 12,
                  padding: '10px 14px',
                  fontWeight: 900,
                  color: '#fff',
                  cursor: 'pointer',
                  background: `linear-gradient(180deg, ${THEME.red}, ${THEME.red2})`,
                }}
              >
                💾 Salvar plano
              </button>
  
              <span
                style={{
                  fontSize: 12,
                  color:
                    saveStatus === 'ok'
                      ? THEME.green
                      : saveStatus === 'err'
                      ? THEME.red2
                      : THEME.textMute,
                }}
              >
                {saveStatus === 'ok'
                  ? '✓ salvo'
                  : saveStatus === 'err'
                  ? 'erro ao salvar'
                  : 'modo edição'}
              </span>
            </div>
          )}
        </main>
  
        {/* MODAIS / COMPONENTES FIXOS */}
        <AccountModal open={openAccount} onClose={() => setOpenAccount(false)} username={username} />
  
        {/* BLOQUEIO (não cobre a BottomTabs) */}
        {!hasAccess && <GateOverlay />}
  
        {/* ABA INFERIOR SEMPRE VISÍVEL */}
        <BottomTabs active="alimentar" onNavigate={(href) => router.push(href)} />
      </div>
    );
  }
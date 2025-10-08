// app/evolucao/page.js
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BottomTabs from '../../components/BottomTabs';
import AccountModal from '../../components/AccountModal';

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

/* ================= STORAGE KEYS ================= */
const STORAGE_COMPLETED = 'completedWorkouts';     // { 'YYYY-MM-DD': 'A'|'B'... }
const STORAGE_PHOTOS    = 'progress-photos-v1';    // [{id,dateISO,dataUrl}]
const STORAGE_WEIGHT    = 'weight-logs-v1';        // [{dateISO, kg}]
const STORAGE_LIFTS     = 'history-lifts-v1';      // [{dateISO, workoutId, exerciseKey, exerciseName, weights:[...], max:number}]
const STORAGE_JOURNAL   = 'self-journal-v1';       // [{dateISO, text}]
const STORAGE_PROFILE   = 'student-profile-v1';    // {name,birthISO,heightCm,goal}

/* ================= HELPERS ================= */
function ymd(d) {
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}
function startOfWeek(d) {
  const x = new Date(d);
  const day = x.getDay(); // 0 = dom
  x.setHours(0,0,0,0);
  x.setDate(x.getDate() - day);
  return x;
}
function startOfMonth(d) {
  const x = new Date(d);
  x.setDate(1);
  x.setHours(0,0,0,0);
  return x;
}
function parseLocalJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function saveLocalJSON(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}
function computeAge(birthISO) {
  if (!birthISO) return null;
  const b = new Date(birthISO);
  if (isNaN(b)) return null;
  const t = new Date();
  let age = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) age--;
  return age;
}

/* ================= MINI COMPONENTES ================= */
function StatPill({ label, value }) {
  return (
    <div
      style={{
        display: 'grid',
        justifyItems: 'center',
        gap: 6,
        background: '#141417',
        border: `1px solid ${THEME.stroke}`,
        borderRadius: 12,
        padding: '10px 12px',
        boxShadow: THEME.softShadow,
        minWidth: 90,
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 900 }}>{value}</div>
      <div style={{ fontSize: 11, color: THEME.textMute }}>{label}</div>
    </div>
  );
}

function Section({ title, children, right }) {
  return (
    <section
      style={{
        background: THEME.surface,
        border: `1px solid ${THEME.stroke}`,
        borderRadius: 16,
        padding: 16,
        boxShadow: THEME.shadow,
        display: 'grid',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 18, fontWeight: 900 }}>{title}</div>
        {right || <span />}
      </div>
      {children}
    </section>
  );
}

/* ================= PESO: Mini Chart SVG ================= */
function WeightChart({ data }) {
  // data: [{dateISO, kg}]
  const width = 520;
  const height = 120;
  const pad = 16;

  if (!data || data.length < 2) {
    return <div style={{ fontSize: 12, color: THEME.textMute }}>Registre mais medições para ver o gráfico.</div>;
  }

  const parsed = data
    .map((d) => ({ t: new Date(d.dateISO).getTime(), y: Number(d.kg) }))
    .filter((d) => !isNaN(d.t) && !isNaN(d.y))
    .sort((a, b) => a.t - b.t);

  const xs = parsed.map((d) => d.t);
  const ys = parsed.map((d) => d.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const spanX = Math.max(1, maxX - minX);
  const spanY = Math.max(1, maxY - minY);

  const points = parsed.map((d) => {
    const x = pad + ((d.t - minX) / spanX) * (width - pad * 2);
    const y = height - pad - ((d.y - minY) / spanY) * (height - pad * 2);
    return `${x},${y}`;
  }).join(' ');

  const last = parsed[parsed.length - 1]?.y;
  const first = parsed[0]?.y;
  const delta = last - first;

  return (
    <div>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke="#E04141"
          strokeWidth="2"
          points={points}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:THEME.textMute }}>
        <span>mín: {minY.toFixed(1)} kg</span>
        <span>atual: {last?.toFixed(1)} kg {isFinite(delta) && delta !== 0 ? `(${delta>0?'+':''}${delta.toFixed(1)} kg)` : ''}</span>
        <span>máx: {maxY.toFixed(1)} kg</span>
      </div>
    </div>
  );
}

/* ================= PÁGINA ================= */
export default function EvolucaoPage() {
  const router = useRouter();
  const search = useSearchParams();
  const isEdit = search?.get('edit') === '1';

  // ======= FIX Hidratação: montar + username dinâmico só no cliente =======
  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState('aluno'); // estável no SSR

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    try {
      const prof = parseLocalJSON(STORAGE_PROFILE, null);
      if (prof?.name) setUsername(prof.name);
    } catch {}
  }, []);

  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  }
  const greeting = mounted ? getGreeting() : 'Olá';

  // Conta / modal
  const [openAccount, setOpenAccount] = useState(false);

  /* ===== Resumo semanal / mensal / total ===== */
  const [doneMap, setDoneMap] = useState({});
  useEffect(() => {
    setDoneMap(parseLocalJSON(STORAGE_COMPLETED, {}));
    const onStorage = (e) => { if (e.key === STORAGE_COMPLETED) setDoneMap(parseLocalJSON(STORAGE_COMPLETED, {})); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const stats = useMemo(() => {
    const entries = Object.entries(doneMap || {}); // [['2025-10-01','A'],...]
    const today = new Date();
    const w0 = startOfWeek(today);
    const m0 = startOfMonth(today);
    let week = 0, month = 0, total = entries.length;
    for (const [dateIso] of entries) {
      const d = new Date(dateIso);
      if (d >= w0) week++;
      if (d >= m0) month++;
    }
    return { week, month, total };
  }, [doneMap]);

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
      {/* Header */}
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
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, letterSpacing:.5, display:'flex', gap:8, alignItems:'center' }}>
              <span style={{ width:10, height:10, borderRadius:2, background:THEME.red, boxShadow:'0 0 0 2px rgba(193,18,31,0.25)' }} />
              Minha Evolução
            </div>
            <div
              style={{ fontSize: 12, color: THEME.textMute, marginTop: 4 }}
              suppressHydrationWarning
            >
              {mounted
                ? `${greeting}, ${username}! Dá uma olhadinha no tanto que você já progrediu! 🚀`
                : 'Olá! Dá uma olhadinha no tanto que você já progrediu! 🚀'}
            </div>
          </div>

          <button
            aria-label="Conta"
            onClick={() => setOpenAccount(true)}
            style={{
              width: 44, height: 44, borderRadius: 12,
              border: `1px solid ${THEME.stroke}`,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0))',
              color: THEME.textMute, display: 'grid', placeItems: 'center', cursor: 'pointer',
            }}
          >
            👤
          </button>
        </div>
      </header>

            {/* Conteúdo principal */}
            <main style={{ padding:'16px 16px 10px', maxWidth: 520, margin:'0 auto', display:'grid', gap: 18 }}>
        {/* Resumo */}
        <section
          style={{
            background: THEME.surface,
            border: `1px solid ${THEME.stroke}`,
            borderRadius: 18,
            padding: 16,
            boxShadow: THEME.shadow,
            display:'grid',
            gap: 12,
          }}
        >
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ fontSize: 17, fontWeight: 900 }}>Resumo de treinos</div>
            <div style={{ fontSize: 12, color: THEME.textMute }}>semana • mês • total</div>
          </div>
          <div style={{ display:'flex', gap: 8, justifyContent:'space-between' }}>
            <StatPill label="esta semana" value={stats.week} />
            <StatPill label="este mês" value={stats.month} />
            <StatPill label="total" value={stats.total} />
          </div>
        </section>

        {/* ===== FOTOS DE PROGRESSO ===== */}
        <Section
          title="Fotos de progresso"
          right={<span style={{ fontSize: 12, color: THEME.textMute }}>atualize a cada 2 semanas</span>}
        >
          <PhotosCard />
        </Section>

        {/* ===== PESO ===== */}
        <Section
          title="Peso corporal"
          right={<span style={{ fontSize: 12, color: THEME.textMute }}>kg</span>}
        >
          <WeightCard />
        </Section>

        {/* ===== PROGRESSÃO DE CARGA ===== */}
        <Section
          title="Progressão de carga"
          right={<span style={{ fontSize: 12, color: THEME.textMute }}>por exercício</span>}
        >
          <LiftsCard />
        </Section>

        {/* ===== DECLARAÇÃO PESSOAL ===== */}
        <Section
          title="Declaração pessoal"
          right={<span style={{ fontSize: 12, color: THEME.textMute }}>autoestima & bem-estar</span>}
        >
          <JournalCard />
        </Section>

        {/* ===== PERFIL ===== */}
        <Section
          title="Perfil"
          right={<span style={{ fontSize: 12, color: THEME.textMute }}>{isEdit ? 'modo edição' : 'edite em ?edit=1'}</span>}
        >
          <ProfileCard isEdit={isEdit} />
        </Section>
      </main>

      {/* Modal de conta */}
      <AccountModal open={openAccount} onClose={() => setOpenAccount(false)} username={username} />

      <BottomTabs active="evolucao" onNavigate={(href) => router.push(href)} />
    </div>
  );
}

/* -------- Diário / Declaração pessoal -------- */
function JournalCard() {
  const [notes, setNotes] = useState(() => parseLocalJSON(STORAGE_JOURNAL, [])); // [{dateISO,text}]
  const [text, setText] = useState('');

  useEffect(() => { saveLocalJSON(STORAGE_JOURNAL, notes); }, [notes]);

  const add = () => {
    const t = (text || '').trim();
    if (!t) return;
    const item = { dateISO: new Date().toISOString(), text: t };
    setNotes((n) => [item, ...n].slice(0, 200));
    setText('');
  };
  const remove = (iso) => setNotes((n) => n.filter((x) => x.dateISO !== iso));

  return (
    <div style={{ display:'grid', gap:12 }}>
      <div style={{ display:'grid', gap:8 }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Como estou me sentindo hoje? Corpo, mente, energia..."
          rows={3}
          style={{
            width:'100%', padding:'10px 12px', borderRadius:10,
            background:'#1a1a1d', color:THEME.text, border:`1px solid ${THEME.stroke}`,
            resize:'vertical'
          }}
        />
        <button
          onClick={add}
          style={{
            border:`1px solid ${THEME.stroke}`, borderRadius:10, padding:'10px 12px',
            background:'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0))',
            color:THEME.text, fontWeight:800, cursor:'pointer', width:'fit-content'
          }}
        >
          Registrar relato
        </button>
      </div>

      <div style={{ display:'grid', gap:8 }}>
        {notes.length ? notes.map((n) => (
          <div
            key={n.dateISO}
            style={{
              border:`1px solid ${THEME.stroke}`, borderRadius:12, padding:'10px 12px',
              background:'#141417', display:'grid', gap:6
            }}
          >
            <div style={{ fontSize:12, color:THEME.textMute, display:'flex', justifyContent:'space-between' }}>
              <span>{formatDate(n.dateISO)} • {new Date(n.dateISO).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</span>
              <button
                onClick={() => remove(n.dateISO)}
                style={{ border:'none', background:'transparent', color:THEME.red2, cursor:'pointer' }}
              >
                excluir
              </button>
            </div>
            <div style={{ fontSize:14, lineHeight:1.5, whiteSpace:'pre-wrap' }}>{n.text}</div>
          </div>
        )) : (
          <div style={{ fontSize:12, color:THEME.textMute }}>Sem relatos ainda.</div>
        )}
      </div>
    </div>
  );
}

/* -------- Perfil (nome, nascimento⇒idade, altura, objetivo) -------- */
function ProfileCard({ isEdit }) {
  const [profile, setProfile] = useState(() =>
    parseLocalJSON(STORAGE_PROFILE, { name:'', birthISO:'', heightCm:'', goal:'' })
  );
  const [status, setStatus] = useState('idle');

  const age = computeAge(profile.birthISO);

  const patch = (p) => setProfile((old) => ({ ...old, ...p }));

  const save = () => {
    try {
      saveLocalJSON(STORAGE_PROFILE, profile);
      setStatus('ok'); setTimeout(()=>setStatus('idle'), 1200);
    } catch {
      setStatus('err'); setTimeout(()=>setStatus('idle'), 1200);
    }
  };

  return (
    <div style={{ display:'grid', gap:12 }}>
      {!isEdit ? (
        <div
          style={{
            display:'grid', gap:10,
            border:`1px solid ${THEME.stroke}`, borderRadius:12, padding:12, background:'#141417'
          }}
        >
          <Row label="Aluno">{profile.name || '—'}</Row>
          <Row label="Idade">{age != null ? `${age} anos` : '—'}</Row>
          <Row label="Altura">{profile.heightCm ? `${profile.heightCm} cm` : '—'}</Row>
          <Row label="Objetivo">{profile.goal || '—'}</Row>
          <div style={{ fontSize:11, color:THEME.textMute }}>
            Para editar, abra esta página com <b>?edit=1</b>.
          </div>
        </div>
      ) : (
        <div
          style={{
            display:'grid', gap:10,
            border:`1px solid ${THEME.stroke}`, borderRadius:12, padding:12, background:'#141417'
          }}
        >
          <InputRow label="Nome">
            <input value={profile.name} onChange={(e)=>patch({name:e.target.value})}
              style={inputStyle}/>
          </InputRow>
          <InputRow label="Data de nascimento">
            <input type="date" value={profile.birthISO} onChange={(e)=>patch({birthISO:e.target.value})}
              style={inputStyle}/>
          </InputRow>
          <InputRow label="Altura (cm)">
            <input type="number" inputMode="numeric" value={profile.heightCm}
              onChange={(e)=>patch({heightCm:e.target.value})} style={inputStyle}/>
          </InputRow>
          <InputRow label="Objetivo">
            <input value={profile.goal} onChange={(e)=>patch({goal:e.target.value})}
              placeholder="ex.: recomposição corporal, ganho de força…" style={inputStyle}/>
          </InputRow>

          <button
            onClick={save}
            style={{
              border:'none', borderRadius:10, padding:'10px 12px', fontWeight:900,
              color:'#fff', cursor:'pointer',
              background:`linear-gradient(180deg, ${THEME.red}, ${THEME.red2})`, width:'fit-content'
            }}
          >
            Salvar perfil
          </button>

          <span style={{ fontSize:12, color: status==='ok' ? THEME.green : status==='err' ? THEME.red2 : THEME.textMute }}>
            {status==='ok' ? '✓ salvo' : status==='err' ? 'erro ao salvar' : '—'}
          </span>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'140px 1fr', gap:8 }}>
      <div style={{ fontSize:12, color:THEME.textMute }}>{label}</div>
      <div style={{ fontWeight:800 }}>{children}</div>
    </div>
  );
}
function InputRow({ label, children }) {
  return (
    <div style={{ display:'grid', gap:6 }}>
      <div style={{ fontSize:12, color:THEME.textMute }}>{label}</div>
      {children}
    </div>
  );
}
const inputStyle = {
  width:'100%', padding:'10px 12px', borderRadius:10, background:'#1a1a1d',
  color:THEME.text, border:`1px solid ${THEME.stroke}`
};

/* ========= SUBCOMPONENTES ========= */

/* -------- Fotos de Progresso -------- */
function PhotosCard() {
  const [photos, setPhotos] = useState(() => parseLocalJSON(STORAGE_PHOTOS, []));
  const [showAll, setShowAll] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    saveLocalJSON(STORAGE_PHOTOS, photos);
  }, [photos]);

  const addPhoto = async (file) => {
    if (!file) return;
    const dataUrl = await readFileAsDataURL(file);
    const item = {
      id: Math.random().toString(36).slice(2),
      dateISO: new Date().toISOString(),
      dataUrl,
    };
    setPhotos((p) => [item, ...p].slice(0, 60)); // mantém até 60 últimas
  };

  const removePhoto = (id) => {
    setPhotos((p) => p.filter((x) => x.id !== id));
  };

  const last = photos[0];

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {/* Card de ação principal */}
      <div
        style={{
          border: `1px solid ${THEME.stroke}`,
          borderRadius: 14,
          background: '#141417',
          boxShadow: THEME.softShadow,
          padding: 12,
          display: 'grid',
          gap: 12,
        }}
      >
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ fontSize: 12, color: THEME.textMute }}>
            Tire foto de frente (e lateral se quiser) em boa luz, sempre em condições semelhantes.
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                border: `1px solid ${THEME.stroke}`,
                borderRadius: 10,
                padding: '10px 12px',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0))',
                color: THEME.text,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              + adicionar foto
            </button>
            <button
              onClick={() => setShowAll((s) => !s)}
              style={{
                border: `1px solid ${THEME.stroke}`,
                borderRadius: 10,
                padding: '10px 12px',
                background: 'transparent',
                color: THEME.text,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {showAll ? 'ocultar histórico' : 'ver histórico'}
            </button>
          </div>
        </div>

        <input
          type="file"
          ref={fileRef}
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={(e) => addPhoto(e.target.files?.[0])}
        />

        {/* Última foto */}
        {last ? (
          <div
            style={{
              display: 'grid',
              gap: 6,
              border: `1px solid ${THEME.stroke}`,
              borderRadius: 12,
              overflow: 'hidden',
              background: '#0f0f12',
            }}
          >
            <img
              src={last.dataUrl}
              alt="Última foto de progresso"
              style={{ width: '100%', display: 'block', maxHeight: 360, objectFit: 'cover' }}
            />
            <div style={{ fontSize: 12, color: THEME.textMute, padding: '8px 10px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Última atualização: {formatDate(last.dateISO)}</span>
              <button
                onClick={() => removePhoto(last.id)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: THEME.red2,
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                excluir
              </button>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 12, color: THEME.textMute }}>Sem fotos ainda.</div>
        )}
      </div>

      {/* Histórico em grid compacto */}
      {showAll && photos.length > 1 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
          }}
        >
          {photos.slice(1).map((p) => (
            <div
              key={p.id}
              style={{
                border: `1px solid ${THEME.stroke}`,
                borderRadius: 10,
                overflow: 'hidden',
                background: '#141417',
                display: 'grid',
                gap: 6,
              }}
            >
              <img src={p.dataUrl} alt="Foto antiga" style={{ width: '100%', aspectRatio: '3 / 4', objectFit: 'cover' }} />
              <div style={{ fontSize: 10, color: THEME.textMute, padding: '4px 6px 8px' }}>
                {formatDate(p.dateISO)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function readFileAsDataURL(file) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = d.getFullYear();
    return `${dd}/${mm}/${yy}`;
  } catch {
    return iso;
  }
}

/* -------- Peso -------- */
function WeightCard() {
  const [logs, setLogs] = useState(() => parseLocalJSON(STORAGE_WEIGHT, []));
  const [kg, setKg] = useState('');
  const [dateISO, setDateISO] = useState(() => new Date().toISOString().slice(0, 10)); // yyyy-mm-dd

  useEffect(() => {
    saveLocalJSON(STORAGE_WEIGHT, logs);
  }, [logs]);

  const add = () => {
    const v = Number(kg);
    if (!v || v <= 0) return;
    const iso = dateISO ? new Date(dateISO).toISOString() : new Date().toISOString();
    const item = { dateISO: iso, kg: v };
    setLogs((l) =>
      [...l.filter((x) => x.dateISO.slice(0, 10) !== iso.slice(0, 10)), item]
        .sort((a, b) => new Date(a.dateISO) - new Date(b.dateISO))
    );
    setKg('');
  };

  const remove = (iso) => {
    setLogs((l) => l.filter((x) => x.dateISO !== iso));
  };

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {/* Form */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8 }}>
        <input
          type="date"
          value={dateISO}
          onChange={(e) => setDateISO(e.target.value)}
          style={{
            padding: '10px 12px',
            borderRadius: 10,
            background: '#1a1a1d',
            color: THEME.text,
            border: `1px solid ${THEME.stroke}`,
          }}
        />
        <input
          type="number"
          inputMode="decimal"
          placeholder="kg"
          value={kg}
          onChange={(e) => setKg(e.target.value)}
          style={{
            padding: '10px 12px',
            borderRadius: 10,
            background: '#1a1a1d',
            color: THEME.text,
            border: `1px solid ${THEME.stroke}`,
          }}
        />
        <button
          onClick={add}
          style={{
            border: `1px solid ${THEME.stroke}`,
            borderRadius: 10,
            padding: '10px 12px',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0))',
            color: THEME.text,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          Registrar
        </button>
      </div>

      {/* Gráfico */}
      <WeightChart data={logs} />

      {/* Tabela compacta (últimos 6) */}
      <div style={{ display: 'grid', gap: 6 }}>
        {logs.slice(-6).reverse().map((x) => (
          <div
            key={x.dateISO}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto auto',
              gap: 8,
              alignItems: 'center',
              border: `1px solid ${THEME.stroke}`,
              borderRadius: 10,
              padding: '8px 10px',
              background: '#141417',
            }}
          >
            <div style={{ fontSize: 13, color: THEME.textMute }}>{formatDate(x.dateISO)}</div>
            <div style={{ fontWeight: 900 }}>{Number(x.kg).toFixed(1)} kg</div>
            <button
              onClick={() => remove(x.dateISO)}
              style={{ border: 'none', background: 'transparent', color: THEME.red2, cursor: 'pointer' }}
              title="Excluir registro"
            >
              x
            </button>
          </div>
        ))}
        {!logs.length && <div style={{ fontSize: 12, color: THEME.textMute }}>Sem registros ainda.</div>}
      </div>
    </div>
  );
}

/* -------- Progressão de Carga -------- */
function LiftsCard() {
  // Formato esperado no storage:
  // [{dateISO, workoutId: 'A'|'B'..., exerciseKey, exerciseName, weights:[n...], max:number}]
  // Dica: treino/[id]/page.js salva isso ao finalizar o treino.
  const [lifts, setLifts] = useState(() => parseLocalJSON(STORAGE_LIFTS, []));
  const [filter, setFilter] = useState('');

  // Indexa nomes únicos
  const names = useMemo(() => {
    const set = new Set();
    (lifts || []).forEach((x) => x.exerciseName && set.add(x.exerciseName));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [lifts]);

  const filtered = useMemo(() => {
    if (!filter) return lifts.slice().sort((a, b) => new Date(a.dateISO) - new Date(b.dateISO));
    return lifts
      .filter((x) => x.exerciseName === filter)
      .sort((a, b) => new Date(a.dateISO) - new Date(b.dateISO));
  }, [lifts, filter]);

  // Estatística simples por exercício (melhor carga)
  const bestPerExercise = useMemo(() => {
    const map = new Map(); // name -> {max, lastDate}
    for (const x of lifts) {
      const max = Number(x.max || 0);
      const prev = map.get(x.exerciseName);
      if (!prev || max > prev.max) {
        map.set(x.exerciseName, { max, lastDate: x.dateISO });
      }
    }
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, max: v.max, lastDate: v.lastDate }))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [lifts]);

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {/* Filtro por exercício */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '10px 12px',
            borderRadius: 10,
            background: '#1a1a1d',
            color: THEME.text,
            border: `1px solid ${THEME.stroke}`,
          }}
        >
          <option value="">Todos os exercícios</option>
          {names.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>

        <button
          onClick={() => setFilter('')}
          style={{
            border: `1px solid ${THEME.stroke}`,
            borderRadius: 10,
            padding: '10px 12px',
            background: 'transparent',
            color: THEME.text,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          Limpar filtro
        </button>
      </div>

      {/* Lista temporal */}
      <div style={{ display: 'grid', gap: 8 }}>
        {filtered.length ? (
          filtered.map((x, i) => (
            <div
              key={`${x.dateISO}-${x.exerciseKey}-${i}`}
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                gap: 10,
                alignItems: 'center',
                border: `1px solid ${THEME.stroke}`,
                borderRadius: 12,
                padding: '10px 12px',
                background: '#141417',
              }}
            >
              <div
                aria-hidden
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  border: `1px solid ${THEME.stroke}`,
                  display: 'grid',
                  placeItems: 'center',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0))',
                  color: THEME.textDim,
                  fontWeight: 900,
                }}
                title={`Treino ${x.workoutId || '-'}`}
              >
                {x.workoutId || '—'}
              </div>

              <div style={{ display: 'grid', gap: 2 }}>
                <div style={{ fontSize: 13, fontWeight: 800 }}>{x.exerciseName || '—'}</div>
                <div style={{ fontSize: 12, color: THEME.textMute }}>
                  {formatDate(x.dateISO)} • séries: {Array.isArray(x.weights) ? x.weights.join(' / ') : '—'}
                </div>
              </div>

              <div style={{ fontWeight: 900 }}>{Number(x.max || 0).toFixed(1)} kg</div>
            </div>
          ))
        ) : (
          <div style={{ fontSize: 12, color: THEME.textMute }}>
            Sem registros ainda. Ao finalizar um treino, salvaremos automaticamente as cargas desse exercício aqui.
          </div>
        )}
      </div>

      {/* Melhores marcas por exercício */}
      {bestPerExercise.length > 0 && (
        <div
          style={{
            marginTop: 6,
            borderTop: `1px dashed ${THEME.strokeSoft}`,
            paddingTop: 10,
            display: 'grid',
            gap: 6,
          }}
        >
          <div style={{ fontSize: 12, color: THEME.textMute, fontWeight: 800 }}>Melhores marcas</div>
          {bestPerExercise.map((b) => (
            <div
              key={b.name}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 8,
                alignItems: 'center',
                border: `1px solid ${THEME.stroke}`,
                borderRadius: 10,
                padding: '8px 10px',
                background: '#141417',
              }}
            >
              <div style={{ fontSize: 13 }}>{b.name}</div>
              <div style={{ fontSize: 12, display: 'grid', justifyItems: 'end' }}>
                <div style={{ fontWeight: 900 }}>{Number(b.max).toFixed(1)} kg</div>
                <div style={{ color: THEME.textMute }}>{formatDate(b.lastDate)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
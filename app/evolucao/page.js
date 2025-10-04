// app/evolucao/page.jsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomTabs from '../../components/BottomTabs';
import AccountModal from '../../components/AccountModal';

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
const ymd = (d) => {
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
};

const startOfWeek = (d) => {
  const x = new Date(d);
  const day = x.getDay(); // 0=Dom
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - day);
  return x;
};

const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

/* ----------------------- MODAL REUTILIZÁVEL ----------------------- */
function Modal({ open, onClose, title, children, maxWidth = 520 }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(3px)', padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '94%', maxWidth, background: THEME.surface, color: THEME.text,
          border: `1px solid ${THEME.stroke}`, borderRadius: 16, padding: 14, boxShadow: THEME.shadow,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontWeight: 900 }}>{title}</div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: THEME.textMute, fontSize: 22, cursor: 'pointer' }}
            aria-label="Fechar"
          >×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ----------------------- PÁGINA ----------------------- */
export default function EvolucaoPage() {
  const router = useRouter();
  const [openAccount, setOpenAccount] = useState(false);
  const username = 'aluno'; // podemos ligar ao login depois

  // RESUMO (puxa completedWorkouts da semana)
  const [completedMap, setCompletedMap] = useState({});
  useEffect(() => {
    try {
      const raw = localStorage.getItem('completedWorkouts');
      setCompletedMap(raw ? JSON.parse(raw) : {});
    } catch { setCompletedMap({}); }
  }, []);

  const weekDates = useMemo(() => {
    const start = startOfWeek(new Date());
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  }, []);

  const workoutsThisWeek = useMemo(() => {
    const keys = weekDates.map(ymd);
    return keys.filter(k => !!completedMap[k]).length;
  }, [completedMap, weekDates]);

  /* ---------- PESO ---------- */
  const [weights, setWeights] = useState([]); // [{date, kg}]
  const [addWeightOpen, setAddWeightOpen] = useState(false);
  const [wDate, setWDate] = useState(ymd(new Date()));
  const [wKg, setWKg] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('evo_weight');
      setWeights(raw ? JSON.parse(raw) : []);
    } catch { setWeights([]); }
  }, []);
  const saveWeights = (arr) => {
    setWeights(arr);
    try { localStorage.setItem('evo_weight', JSON.stringify(arr)); } catch {}
  };
  const addWeight = (e) => {
    e.preventDefault();
    if (!wKg) return;
    const entry = { date: wDate || ymd(new Date()), kg: Number(wKg) };
    const next = [...weights.filter(x => x.date !== entry.date), entry]
      .sort((a,b) => a.date.localeCompare(b.date));
    saveWeights(next);
    setAddWeightOpen(false);
    setWKg('');
  };
  const removeWeight = (date) => {
    saveWeights(weights.filter(w => w.date !== date));
  };

  /* ---------- MEDIDAS ---------- */
  const [measures, setMeasures] = useState([]); // [{date, chest, waist, hip, thigh, arm}]
  const [addMeasOpen, setAddMeasOpen] = useState(false);
  const [m, setM] = useState({
    date: ymd(new Date()),
    chest: '', waist: '', hip: '', thigh: '', arm: ''
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('evo_measures');
      setMeasures(raw ? JSON.parse(raw) : []);
    } catch { setMeasures([]); }
  }, []);
  const saveMeasures = (arr) => {
    setMeasures(arr);
    try { localStorage.setItem('evo_measures', JSON.stringify(arr)); } catch {}
  };
  const addMeasure = (e) => {
    e.preventDefault();
    const entry = { ...m };
    const next = [...measures.filter(x => x.date !== entry.date), entry]
      .sort((a,b) => a.date.localeCompare(b.date));
    saveMeasures(next);
    setAddMeasOpen(false);
    setM({ date: ymd(new Date()), chest:'', waist:'', hip:'', thigh:'', arm:'' });
  };
  const removeMeasure = (date) => {
    saveMeasures(measures.filter(x => x.date !== date));
  };

  /* ---------- PRs (recordes) ---------- */
  const [prs, setPrs] = useState([]); // [{id, exercise, load, reps, date}]
  const [addPrOpen, setAddPrOpen] = useState(false);
  const [pr, setPr] = useState({ exercise:'', load:'', reps:'', date: ymd(new Date()) });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('evo_prs');
      setPrs(raw ? JSON.parse(raw) : []);
    } catch { setPrs([]); }
  }, []);
  const savePrs = (arr) => {
    setPrs(arr);
    try { localStorage.setItem('evo_prs', JSON.stringify(arr)); } catch {}
  };
  const addPr = (e) => {
    e.preventDefault();
    if (!pr.exercise || !pr.load) return;
    const entry = { id: crypto.randomUUID(), ...pr, load: Number(pr.load), reps: pr.reps ? Number(pr.reps) : '' };
    const next = [...prs, entry].sort((a,b) => a.date.localeCompare(b.date));
    savePrs(next);
    setAddPrOpen(false);
    setPr({ exercise:'', load:'', reps:'', date: ymd(new Date()) });
  };
  const removePr = (id) => {
    savePrs(prs.filter(x => x.id !== id));
  };

  /* ---------- FOTOS ---------- */
  const [photos, setPhotos] = useState([]); // [{id, date, dataUrl, note}]
  const [addPhotoOpen, setAddPhotoOpen] = useState(false);
  const [ph, setPh] = useState({ date: ymd(new Date()), file: null, preview: '', note:'' });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('evo_photos');
      setPhotos(raw ? JSON.parse(raw) : []);
    } catch { setPhotos([]); }
  }, []);
  const savePhotos = (arr) => {
    setPhotos(arr);
    try { localStorage.setItem('evo_photos', JSON.stringify(arr)); } catch {}
  };
  const onPickPhoto = async (file) => {
    if (!file) return setPh(p => ({ ...p, file:null, preview:'' }));
    const reader = new FileReader();
    reader.onload = (e) => setPh(p => ({ ...p, file, preview: String(e.target?.result || '') }));
    reader.readAsDataURL(file);
  };
  const addPhoto = (e) => {
    e.preventDefault();
    if (!ph.preview) return;
    const entry = { id: crypto.randomUUID(), date: ph.date, dataUrl: ph.preview, note: ph.note || '' };
    const next = [...photos, entry].sort((a,b) => a.date.localeCompare(b.date));
    savePhotos(next);
    setAddPhotoOpen(false);
    setPh({ date: ymd(new Date()), file:null, preview:'', note:'' });
  };
  const removePhoto = (id) => {
    savePhotos(photos.filter(x => x.id !== id));
  };

  /* ---------- DERIVADOS ---------- */
  const lastWeight = weights.length ? weights[weights.length - 1].kg : null;
  const firstWeight = weights.length ? weights[0].kg : null;
  const weightDelta = lastWeight != null && firstWeight != null ? (lastWeight - firstWeight) : null;

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
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: .5, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: THEME.red, boxShadow: '0 0 0 2px rgba(193,18,31,0.25)' }} />
              Minha evolução
            </div>
            <div style={{ fontSize: 12, color: THEME.textMute, marginTop: 4 }}>
              Acompanhe peso, medidas, PRs e fotos
            </div>
          </div>

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
      </header>

      {/* Conteúdo */}
      <main style={{ padding: '16px 16px 12px', maxWidth: 520, margin: '0 auto', display: 'grid', gap: 18 }}>
        {/* Resumo rápido */}
        <section
          style={{
            background: THEME.surface, border: `1px solid ${THEME.stroke}`,
            borderRadius: 16, padding: 14, boxShadow: THEME.shadow, display:'grid', gap: 8,
          }}
        >
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ fontWeight: 900 }}>Resumo da semana</div>
            <span style={{ fontSize:12, color:THEME.textMute }}>dom → sáb</span>
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <Badge label="Treinos concluídos" value={`${workoutsThisWeek}/7`} />
            <Badge label="Peso atual" value={lastWeight != null ? `${lastWeight} kg` : '—'} />
            <Badge label="Δ Peso" value={weightDelta != null ? `${weightDelta > 0 ? '+' : ''}${weightDelta.toFixed(1)} kg` : '—'} />
          </div>
        </section>

        {/* Peso */}
        <section style={cardStyle()}>
          <Header title="Peso corporal" action={<SmallBtn onClick={()=>setAddWeightOpen(true)}>+ Adicionar</SmallBtn>} />
          {weights.length === 0 ? (
            <Empty>Sem registros ainda.</Empty>
          ) : (
            <div style={{ display:'grid', gap:8 }}>
              {weights.map(w => (
                <Row key={w.date}>
                  <div><strong>{w.kg} kg</strong></div>
                  <div style={{ color: THEME.textMute, fontSize: 12 }}>{w.date}</div>
                  <button onClick={()=>removeWeight(w.date)} style={xBtnStyle()}>Excluir</button>
                </Row>
              ))}
            </div>
          )}
        </section>

        {/* Medidas */}
        <section style={cardStyle()}>
          <Header title="Medidas corporais" action={<SmallBtn onClick={()=>setAddMeasOpen(true)}>+ Adicionar</SmallBtn>} />
          {measures.length === 0 ? (
            <Empty>Cadastre peito, cintura, quadril, coxa e braço.</Empty>
          ) : (
            <div style={{ display:'grid', gap:8 }}>
              {measures.map(me => (
                <div key={me.date} style={{ border:`1px solid ${THEME.strokeSoft}`, borderRadius:12, padding:12, background:'#141417' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                    <div style={{ fontWeight: 800 }}>{me.date}</div>
                    <button onClick={()=>removeMeasure(me.date)} style={xBtnStyle()}>Excluir</button>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, fontSize:13, color:THEME.textDim }}>
                    <span>Peito: <strong style={{color:THEME.text}}>{me.chest || '—'}</strong> cm</span>
                    <span>Cintura: <strong style={{color:THEME.text}}>{me.waist || '—'}</strong> cm</span>
                    <span>Quadril: <strong style={{color:THEME.text}}>{me.hip || '—'}</strong> cm</span>
                    <span>Coxa: <strong style={{color:THEME.text}}>{me.thigh || '—'}</strong> cm</span>
                    <span>Braço: <strong style={{color:THEME.text}}>{me.arm || '—'}</strong> cm</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* PRs */}
        <section style={cardStyle()}>
          <Header title="PRs (recordes pessoais)" action={<SmallBtn onClick={()=>setAddPrOpen(true)}>+ Registrar</SmallBtn>} />
          {prs.length === 0 ? (
            <Empty>Salve seus recordes de carga e repetições.</Empty>
          ) : (
            <div style={{ display:'grid', gap:8 }}>
              {prs.map(p => (
                <Row key={p.id}>
                  <div style={{ fontWeight: 800 }}>{p.exercise}</div>
                  <div style={{ color: THEME.textMute, fontSize: 12 }}>{p.date}</div>
                  <div style={{ fontSize: 13 }}>{p.load} kg {p.reps ? `× ${p.reps}` : ''}</div>
                  <button onClick={()=>removePr(p.id)} style={xBtnStyle()}>Excluir</button>
                </Row>
              ))}
            </div>
          )}
        </section>

        {/* Fotos */}
        <section style={cardStyle()}>
          <Header title="Fotos de progresso" action={<SmallBtn onClick={()=>setAddPhotoOpen(true)}>+ Enviar</SmallBtn>} />
          {photos.length === 0 ? (
            <Empty>Registre seu shape e compare ao longo do tempo.</Empty>
          ) : (
            <div style={{ display:'grid', gap:10 }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                {photos.map(ph => (
                  <div key={ph.id} style={{ border:`1px solid ${THEME.stroke}`, borderRadius:12, overflow:'hidden', background:'#000' }}>
                    <img src={ph.dataUrl} alt={ph.date} style={{ width:'100%', height:150, objectFit:'cover', display:'block' }} />
                    <div style={{ padding:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div style={{ fontSize:11, color:THEME.textMute }}>{ph.date}</div>
                      <button onClick={()=>removePhoto(ph.id)} style={xBtnStyle({pad:'4px 6px'})}>Excluir</button>
                    </div>
                    {ph.note && <div style={{ padding:'0 8px 8px', fontSize:12, color:THEME.textDim }}>{ph.note}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Modais */}
      <Modal open={addWeightOpen} onClose={()=>setAddWeightOpen(false)} title="Adicionar peso">
        <form onSubmit={addWeight} style={{ display:'grid', gap:10 }}>
          <label style={lbl()}>Data</label>
          <input value={wDate} onChange={(e)=>setWDate(e.target.value)} type="date" />
          <label style={lbl()}>Peso (kg)</label>
          <input value={wKg} onChange={(e)=>setWKg(e.target.value)} type="number" step="0.1" placeholder="ex.: 78.4" />
          <button style={primaryBtn()} type="submit">Salvar</button>
        </form>
      </Modal>

      <Modal open={addMeasOpen} onClose={()=>setAddMeasOpen(false)} title="Adicionar medidas">
        <form onSubmit={addMeasure} style={{ display:'grid', gap:10 }}>
          <label style={lbl()}>Data</label>
          <input value={m.date} onChange={(e)=>setM(s=>({...s, date:e.target.value}))} type="date" />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div>
              <label style={lbl()}>Peito (cm)</label>
              <input value={m.chest} onChange={(e)=>setM(s=>({...s, chest:e.target.value}))} type="number" step="0.1" />
            </div>
            <div>
              <label style={lbl()}>Cintura (cm)</label>
              <input value={m.waist} onChange={(e)=>setM(s=>({...s, waist:e.target.value}))} type="number" step="0.1" />
            </div>
            <div>
              <label style={lbl()}>Quadril (cm)</label>
              <input value={m.hip} onChange={(e)=>setM(s=>({...s, hip:e.target.value}))} type="number" step="0.1" />
            </div>
            <div>
              <label style={lbl()}>Coxa (cm)</label>
              <input value={m.thigh} onChange={(e)=>setM(s=>({...s, thigh:e.target.value}))} type="number" step="0.1" />
            </div>
            <div>
              <label style={lbl()}>Braço (cm)</label>
              <input value={m.arm} onChange={(e)=>setM(s=>({...s, arm:e.target.value}))} type="number" step="0.1" />
            </div>
          </div>
          <button style={primaryBtn()} type="submit">Salvar</button>
        </form>
      </Modal>

      <Modal open={addPrOpen} onClose={()=>setAddPrOpen(false)} title="Registrar PR">
        <form onSubmit={addPr} style={{ display:'grid', gap:10 }}>
          <label style={lbl()}>Exercício</label>
          <input value={pr.exercise} onChange={(e)=>setPr(s=>({...s, exercise:e.target.value}))} placeholder="ex.: Supino reto" />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div>
              <label style={lbl()}>Carga (kg)</label>
              <input value={pr.load} onChange={(e)=>setPr(s=>({...s, load:e.target.value}))} type="number" step="0.5" />
            </div>
            <div>
              <label style={lbl()}>Reps (opcional)</label>
              <input value={pr.reps} onChange={(e)=>setPr(s=>({...s, reps:e.target.value}))} type="number" />
            </div>
          </div>
          <label style={lbl()}>Data</label>
          <input value={pr.date} onChange={(e)=>setPr(s=>({...s, date:e.target.value}))} type="date" />
          <button style={primaryBtn()} type="submit">Salvar</button>
        </form>
      </Modal>

      <Modal open={addPhotoOpen} onClose={()=>setAddPhotoOpen(false)} title="Enviar foto de progresso">
        <form onSubmit={addPhoto} style={{ display:'grid', gap:10 }}>
          <label style={lbl()}>Data</label>
          <input value={ph.date} onChange={(e)=>setPh(s=>({...s, date:e.target.value}))} type="date" />
          <label style={lbl()}>Imagem</label>
          <input type="file" accept="image/*" onChange={(e)=>onPickPhoto(e.target.files?.[0] || null)} />
          {ph.preview && (
            <div style={{ border:`1px solid ${THEME.stroke}`, borderRadius:12, overflow:'hidden', background:'#000' }}>
              <img src={ph.preview} alt="preview" style={{ width:'100%', maxHeight:260, objectFit:'contain', display:'block' }} />
            </div>
          )}
          <label style={lbl()}>Observação (opcional)</label>
          <input value={ph.note} onChange={(e)=>setPh(s=>({...s, note:e.target.value}))} placeholder="ex.: 12% BF, sem pump" />
          <button style={primaryBtn()} type="submit">Salvar</button>
        </form>
      </Modal>

      {/* Modal de Conta */}
      <AccountModal open={openAccount} onClose={() => setOpenAccount(false)} username={username} />

      <BottomTabs active="evolucao" onNavigate={(href)=>router.push(href)} />
    </div>
  );
}

/* ----------------------- PEÇAS UI ----------------------- */
function cardStyle() {
  return {
    background: THEME.surface,
    border: `1px solid ${THEME.stroke}`,
    borderRadius: 16,
    padding: 14,
    boxShadow: THEME.shadow,
    display: 'grid',
    gap: 10,
  };
}
function Header({ title, action }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
      <div style={{ fontWeight: 900 }}>{title}</div>
      {action}
    </div>
  );
}
function SmallBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding:'8px 10px', borderRadius:12, border:`1px solid ${THEME.stroke}`,
        background:'linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,0))',
        color: THEME.text, fontSize: 12, fontWeight: 800, cursor:'pointer'
      }}
    >
      {children}
    </button>
  );
}
function Empty({ children }) {
  return (
    <div style={{
      border:`1px solid ${THEME.strokeSoft}`, borderRadius:12, padding:14,
      background:'#141417', color:THEME.textMute, fontSize:13, textAlign:'center'
    }}>
      {children}
    </div>
  );
}
function Row({ children }) {
  return (
    <div style={{
      display:'grid', gridTemplateColumns:'1fr auto auto', alignItems:'center', gap:10,
      border:`1px solid ${THEME.strokeSoft}`, borderRadius:12, padding:'10px 12px',
      background:'#141417'
    }}>
      {children}
    </div>
  );
}
function xBtnStyle(opts = {}) {
  return {
    padding: opts.pad || '6px 10px',
    borderRadius: 10,
    border: `1px solid ${THEME.stroke}`,
    background: 'transparent',
    color: THEME.textMute,
    cursor: 'pointer',
    fontSize: 12,
  };
}
function lbl() {
  return { fontSize: 12, color: THEME.textMute, display: 'block', margin: '2px 0 6px' };
}
function primaryBtn() {
  return {
    background: `linear-gradient(180deg, ${THEME.red} 0%, ${THEME.red2} 100%)`,
    color: '#fff', border: 'none', borderRadius: 12, padding: '12px 14px',
    fontWeight: 900, cursor: 'pointer', boxShadow: '0 8px 22px rgba(193,18,31,.22)'
  };
}
function Badge({ label, value }) {
  return (
    <div style={{
      display:'grid', gap:2, border:`1px solid ${THEME.stroke}`, borderRadius:12,
      padding:'8px 10px', background:'#141417', minWidth:120
    }}>
      <div style={{ fontSize:11, color:THEME.textMute }}>{label}</div>
      <div style={{ fontWeight:900 }}>{value}</div>
    </div>
  );
}
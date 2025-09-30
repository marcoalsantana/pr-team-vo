// components/WeekStrip.jsx
'use client';
import { useMemo } from 'react';

function fmt(d){ return d.toLocaleDateString('pt-BR',{weekday:'short'}) }

export default function WeekStrip(){
  const days = useMemo(()=>{
    const base = new Date();
    const arr = [];
    for(let i=-3;i<=3;i++){
      const d = new Date(base);
      d.setDate(base.getDate()+i);
      arr.push(d);
    }
    return arr;
  },[]);
  const today = new Date().toDateString();
  return (
    <div className="week">
      {days.map((d,i)=>{
        const active = d.toDateString()===today;
        const accent = active
          ? {
              background: 'rgba(255, 31, 51, 0.12)',
              borderColor: 'rgba(255, 31, 51, 0.8)',
              boxShadow: '0 0 22px rgba(255, 31, 51, 0.45)',
              position: 'relative',
              overflow: 'hidden',
            }
          : {};
        return (
          <div key={i} className={`day ${active?'active':''}`} style={accent}>
            {active && (
              <span
                style={{
                  position: 'absolute',
                  inset: '-35%',
                  background: 'radial-gradient(circle, rgba(255, 31, 51, 0.28), transparent 60%)',
                  pointerEvents: 'none',
                }}
              />
            )}
            <div style={{textTransform:'lowercase',fontWeight:700, position: 'relative', zIndex: 1}}>{fmt(d)}</div>
            <div style={{fontSize:12,color:'var(--muted)', position: 'relative', zIndex: 1}}>{String(d.getDate()).padStart(2,'0')}</div>
            {!active && <div className="tick" style={{ position: 'relative', zIndex: 1 }}>✓</div>}
            {active && <div style={{color:'var(--primary)',fontWeight:700, position: 'relative', zIndex: 1}}>HOJE</div>}
          </div>
        );
      })}
    </div>
  );
}
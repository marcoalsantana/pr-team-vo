// components/BottomTabs.jsx
'use client';

import { useRouter, usePathname } from 'next/navigation';

export default function BottomTabs(){
  const r = useRouter();
  const path = usePathname();

  function go(p){ r.push(p); }

  // simples glow gamer já vem do globals.css
  return (
    <nav className="tabs">
      <button className="tab" onClick={()=>go('/inicio')}>
        <svg viewBox="0 0 24 24"><path d="M3 10l9-7 9 7v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V13H9v7a2 2 0 0 1-2 2H3z"/></svg>
        Início
      </button>
      <button className="tab" onClick={()=>go('/mobilidades')}>
        <svg viewBox="0 0 24 24"><path d="M5 12a7 7 0 0 1 14 0"/></svg>
        Mobilidades
      </button>
      <button className="tab" onClick={()=>go('/treino')}>
        <svg viewBox="0 0 24 24"><path d="M4 14h16M4 10h16"/></svg>
        Treino
      </button>
      <button className="tab" onClick={()=>go('/alimentar')}>
        <svg viewBox="0 0 24 24"><path d="M12 2v20M5 7h14"/></svg>
        Alimentar
      </button>
    </nav>
  );
}
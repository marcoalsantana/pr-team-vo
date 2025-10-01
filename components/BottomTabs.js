'use client';

import { useRouter, usePathname } from 'next/navigation';

const THEME = {
  strokeSoft: 'rgba(255,255,255,0.06)',
  text: '#FFFFFF',
  textMute: '#9B9BA1',
  red: '#C1121F',
};

export default function BottomTabs() {
  const router = useRouter();
  const pathname = usePathname();

  const items = [
    { key: 'inicio', href: '/inicio', lines: ['Início'] },
    { key: 'mobilidades', href: '/mobilidades', lines: ['Mobilidades e', 'Alongamentos'] },
    { key: 'treino', href: '/treino', lines: ['Plano de', 'Treino'] },
    { key: 'alimentar', href: '/alimentar', lines: ['Plano', 'Alimentar'] },
    { key: 'evolucao', href: '/evolucao', lines: ['Minha', 'Evolução'] }, // <- já com "Minha"
  ];

  const active =
    pathname.startsWith('/mobilidades') ? 'mobilidades' :
    pathname.startsWith('/treino')      ? 'treino' :
    pathname.startsWith('/alimentar')   ? 'alimentar' :
    pathname.startsWith('/evolucao')    ? 'evolucao' :
    'inicio';

  const Icon = ({ name, active }) => {
    const stroke = active ? '#FFFFFF' : THEME.textMute;
    const fill = active ? THEME.red : 'none';
    const s = 28;

    switch (name) {
      case 'inicio':
        return (
          <svg width={s} height={s} viewBox="0 0 24 24">
            <path d="M3 10.5L12 3l9 7.5" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 10.5V20h14v-9.5" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'mobilidades':
        return (
          <svg width={s} height={s} viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="2.5" fill={stroke}/>
            <path d="M12 7.5v5" stroke={stroke} strokeWidth="2" strokeLinecap="round"/>
            <path d="M9 13c1.5-1 4.5-1 6 0" stroke={stroke} strokeWidth="2" strokeLinecap="round"/>
            <path d="M10 14l-3 5M14 14l3 5" stroke={stroke} strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case 'treino':
        return (
          <svg width={s} height={s} viewBox="0 0 24 24">
            <rect x="2" y="9" width="3" height="6" rx="1" fill={stroke}/>
            <rect x="19" y="9" width="3" height="6" rx="1" fill={stroke}/>
            <rect x="7" y="11" width="10" height="2" rx="1" fill={stroke}/>
            <rect x="10.5" y="7" width="3" height="10" rx="1.2" fill={fill} opacity={active ? 0.25 : 0}/>
          </svg>
        );
      case 'alimentar':
        return (
          <svg width={s} height={s} viewBox="0 0 24 24">
            <path d="M12 4c-3 2.5-5 5.5-5 9 0 3.5 2.5 6 5 6s5-2.5 5-6c0-3.5-2-6.5-5-9z" fill="none" stroke={stroke} strokeWidth="2"/>
          </svg>
        );
      case 'evolucao':
        return (
          <svg width={s} height={s} viewBox="0 0 24 24">
            <path d="M4 18V6M4 18h16" stroke={stroke} strokeWidth="2" strokeLinecap="round"/>
            <path d="M7 14l3-3 3 2 4-5" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="17" cy="8" r="1.5" fill={stroke}/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <nav
      style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 900,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0))',
        backdropFilter: 'blur(6px)',
        borderTop: `1px solid ${THEME.strokeSoft}`,
        display: 'flex', justifyContent: 'space-around',
        padding: '10px 8px calc(env(safe-area-inset-bottom) + 10px)',
      }}
    >
      {items.map((it) => {
        const isActive = it.key === active;
        return (
          <button
            key={it.key}
            onClick={() => router.push(it.href)}
            style={{
              background: 'transparent', border: 'none',
              color: isActive ? THEME.text : THEME.textMute,
              opacity: isActive ? 1 : 0.85,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 6, padding: 6, minWidth: 70, cursor: 'pointer',
              borderBottom: isActive ? `2px solid ${THEME.red}` : '2px solid transparent',
              boxShadow: isActive ? '0 6px 16px rgba(193,18,31,0.25)' : 'none',
              borderRadius: 8,
              transition: 'all .18s ease',
            }}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon name={it.key} active={isActive} />
            <span style={{ fontSize: 11, lineHeight: 1.15, textAlign: 'center', fontWeight: isActive ? 700 : 500 }}>
              {it.lines.map((l, i) => (
                <span key={i} style={{ display: 'block' }}>{l}</span>
              ))}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
// components/TopBar.jsx
'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function TopBar({ onAvatarClick }) {
  const r = useRouter();
  return (
    <div className="topbar">
      <div className="brand" onClick={()=>r.push('/inicio')} style={{cursor:'pointer'}}>
        <Image src="/logo.png" alt="PR TEAM" width={36} height={36} />
        <h1>PR TEAM</h1>
      </div>
      <div className="sub">Treinador Pedro Ratton</div>
      <button className="avatar" onClick={onAvatarClick} aria-label="Perfil">
        <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
          <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-5.33 0-8 2.67-8 6h16c0-3.33-2.67-6-8-6Z" fill="#ddd"/>
        </svg>
      </button>
    </div>
  );
}
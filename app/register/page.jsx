// app/register/page.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

const THEME = {
  bg: '#0E0E10',
  bgGradTop: 'rgba(193,18,31,0.10)',
  bgGradMid: 'rgba(255,255,255,0.02)',
  bgGradBot: 'rgba(0,0,0,0)',
  techLine: 'rgba(255,255,255,0.06)',
  techLine2: 'rgba(193,18,31,0.10)',
  surface: 'rgba(18,18,20,0.85)',
  stroke: 'rgba(255,255,255,0.10)',
  strokeSoft: 'rgba(255,255,255,0.06)',
  text: '#FFFFFF',
  textMute: '#9B9BA1',
  red: '#C1121F',
  red2: '#E04141',
  softShadow: '0 10px 22px rgba(0,0,0,0.32)',
};

export default function RegisterPage() {
  const r = useRouter();
  const [username, setUsername] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);

  const normalize = (s) =>
    s
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
      .replace(/[^a-z0-9._-]/g, ''); // deixa só chars seguros

  async function onRegister(e) {
    e.preventDefault();
    const u = normalize(username);
    if (!u || u.length < 3) {
      alert('Escolha um username com pelo menos 3 caracteres.');
      return;
    }
    if (pass.length < 6) {
      alert('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      // 1) checa se username existe
      const { count, error: countErr } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('username', u);
      if (countErr) throw countErr;
      if ((count ?? 0) > 0) {
        alert('Esse username já está em uso. Tente outro.');
        return;
      }

      // 2) cria conta usando e-mail sintético
      const email = `${u}@alunos.pr`; // e-mail “falso” apenas pro auth
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email,
        password: pass,
      });
      if (signUpErr) throw signUpErr;
      const user = signUpData.user;
      if (!user) throw new Error('Não foi possível criar a conta.');

      // 3) cria profile com username único
      const { error: profErr } = await supabase
        .from('profiles')
        .insert({ id: user.id, username: u });
      if (profErr) throw profErr;

      // 4) faz login na sequência (opcional; em alguns projetos já vem logado)
      const { error: loginErr } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (loginErr) throw loginErr;

      localStorage.setItem('loggedIn', 'true');
      r.replace('/inicio');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Não foi possível criar a conta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: '100dvh',
        position: 'relative',
        overflow: 'hidden',
        display: 'grid',
        placeItems: 'center',
        padding: '24px 16px',
        color: THEME.text,
        background: `
          linear-gradient(180deg, ${THEME.bgGradTop}, ${THEME.bgGradMid} 20%, ${THEME.bgGradBot}),
          repeating-linear-gradient(-45deg, ${THEME.techLine} 0px, ${THEME.techLine} 1px, transparent 1px, transparent 10px),
          repeating-linear-gradient(-45deg, ${THEME.techLine2} 0px, ${THEME.techLine2} 1px, transparent 1px, transparent 22px),
          ${THEME.bg}
        `,
        backgroundBlendMode: 'screen, normal, normal, normal',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          borderRadius: 20,
          border: `1px solid ${THEME.stroke}`,
          background: THEME.surface,
          boxShadow: THEME.softShadow,
          backdropFilter: 'blur(10px)',
          padding: 18,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 10, fontWeight: 900, fontSize: 18 }}>
          Criar conta
        </div>
        <form onSubmit={onRegister}>
          <label style={{ fontSize: 12, color: THEME.textMute, display: 'block', margin: '4px 2px 8px' }}>
            Username (único)
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ex.: joaosilva"
          />
          <div style={{ height: 12 }} />
          <label style={{ fontSize: 12, color: THEME.textMute, display: 'block', margin: '4px 2px 8px' }}>
            Senha
          </label>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="••••••••"
          />
          <div style={{ height: 14 }} />
          <button
            className="btn primary"
            disabled={loading}
            style={{
              background: `linear-gradient(180deg, ${THEME.red} 0%, ${THEME.red2} 100%)`,
              color: '#fff',
              borderRadius: 14,
              padding: '14px 16px',
              fontWeight: 900,
              boxShadow: '0 8px 22px rgba(193,18,31,.22)',
            }}
          >
            {loading ? 'Criando…' : 'Criar conta'}
          </button>
        </form>
        <div style={{ height: 12 }} />
        <div style={{ fontSize: 12, color: THEME.textMute, textAlign: 'center' }}>
          Já tem conta? <button onClick={() => r.push('/')} style={{ color: '#fff', textDecoration: 'underline' }}>Entrar</button>
        </div>
      </div>
    </main>
  );
}
// app/register/page.jsx
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  const [pass2, setPass2] = useState('');
  const [see, setSee] = useState(false);
  const [loading, setLoading] = useState(false);

  // Se já estiver logado, manda pro início
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) {
        localStorage.setItem('loggedIn', 'true');
        r.replace('/inicio');
      }
    });
  }, [r]);

  function validateUsername(u) {
    // só letras, números e ._- , 3 a 20 chars
    return /^[a-z0-9._-]{3,20}$/.test(u);
  }

  async function onRegister(e) {
    e.preventDefault();

    const u = username.trim().toLowerCase();
    if (!validateUsername(u)) {
      alert("Escolha um usuário entre 3 e 20 caracteres (letras/números) e opcionalmente . _ -");
      return;
    }
    if (pass.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (pass !== pass2) {
      alert('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    // Email fake derivado do username
    const fakeEmail = `${u}@prteam.local`;

    // Tenta criar o usuário (com user_metadata.username)
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email: fakeEmail,
      password: pass,
      options: {
        data: { username: u },
      },
    });

    if (signUpErr) {
      setLoading(false);
      // Erro comum se o "username" (logo, o e-mail fake) já existir
      if (signUpErr?.message?.toLowerCase().includes('already') || signUpErr?.status === 400) {
        alert('Esse nome de usuário já está em uso. Tente outro.');
      } else {
        alert(signUpErr.message);
      }
      return;
    }

    // Se o Supabase não voltar sessão automaticamente, faz login manual
    let session = signUpData.session;
    if (!session) {
      const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password: pass,
      });
      if (loginErr) {
        setLoading(false);
        alert(loginErr.message);
        return;
      }
      session = loginData.session;
    }

    // Tudo certo → seta flag local + redireciona
    localStorage.setItem('loggedIn', 'true');
    setLoading(false);
    r.replace('/inicio');
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
      {/* Glow decorativo */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 'auto 10% 40% 10%',
          height: 220,
          background: 'radial-gradient(60% 80% at 50% 50%, rgba(193,18,31,.20), transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      {/* Container “vidro” */}
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
        {/* Topo com logo */}
        <div
          style={{
            display: 'grid',
            justifyItems: 'center',
            gap: 8,
            padding: '6px 6px 0',
          }}
        >
          <div style={{ width: 420, position: 'relative', aspectRatio: '10 / 7' }}>
            <Image
              src="/logo.png"
              alt="PR TEAM"
              fill
              style={{ objectFit: 'contain' }}
              sizes="(max-width: 520px) 420px, 420px"
              priority
            />
          </div>

          <div
            style={{
              marginTop: 2,
              fontSize: 12,
              color: THEME.textMute,
              border: `1px solid ${THEME.stroke}`,
              padding: '6px 10px',
              borderRadius: 999,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0))',
            }}
          >
            Crie sua conta • Acesso exclusivo
          </div>
        </div>

        {/* Card de cadastro */}
        <div
          style={{
            marginTop: -40,
            background: '#141417',
            border: `1px solid ${THEME.stroke}`,
            borderRadius: 16,
            padding: 16,
            boxShadow: THEME.softShadow,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 8,
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 900 }}>Criar conta</div>
            <span style={{ fontSize: 12, color: THEME.textMute }}>sem e-mail</span>
          </div>

          <form onSubmit={onRegister}>
            <label style={{ fontSize: 12, color: THEME.textMute, display: 'block', margin: '4px 2px 8px' }}>
              Nome de usuário
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ex.: joaosilva"
            />
            <div style={{ height: 8 }} />
            <div style={{ fontSize: 11, color: THEME.textMute }}>
              Use apenas letras/números e os símbolos . _ - (3 a 20 caracteres).
            </div>

            <div style={{ height: 14 }} />
            <label style={{ fontSize: 12, color: THEME.textMute, display: 'block', margin: '4px 2px 8px' }}>
              Senha
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type={see ? 'text' : 'password'}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                style={{
                  width: 56,
                  borderRadius: 14,
                  border: `1px solid ${THEME.stroke}`,
                  background: 'linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,.01))',
                  color: THEME.text,
                }}
                onClick={() => setSee((s) => !s)}
              >
                {see ? '🙈' : '👁️'}
              </button>
            </div>

            <div style={{ height: 12 }} />
            <label style={{ fontSize: 12, color: THEME.textMute, display: 'block', margin: '4px 2px 8px' }}>
              Confirmar senha
            </label>
            <input
              type={see ? 'text' : 'password'}
              value={pass2}
              onChange={(e) => setPass2(e.target.value)}
              placeholder="••••••••"
            />

            <div style={{ height: 14 }} />
            <button
              disabled={loading}
              style={{
                width: '100%',
                background: `linear-gradient(180deg, ${THEME.red} 0%, ${THEME.red2} 100%)`,
                color: '#fff',
                borderRadius: 14,
                padding: '14px 16px',
                fontWeight: 900,
                boxShadow: '0 8px 22px rgba(193,18,31,.22)',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.75 : 1,
              }}
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <div style={{ height: 12 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: THEME.textMute }}>
              Ao criar a conta você concorda com as diretrizes do coach.
            </span>
            <button
              style={{ color: THEME.textMute }}
              onClick={() => r.push('/')}
            >
              Já tenho conta
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

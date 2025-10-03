// app/page.jsx
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Modal from '../components/Modal';
import { supabase } from '../lib/supabase';

const quote = 'Não é sorte! É trabalho, disciplina, estratégia, constância e dedicação.';

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

export default function LoginPage() {
  const r = useRouter();

  // agora usamos "username" no lugar de "email"
  const [username, setUsername] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);

  // popup central de "esqueci minha senha"
  const [showForgot, setShowForgot] = useState(false);

  const [see, setSee] = useState(false);

  // se já tiver sessão → vai pra /inicio
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) {
        localStorage.setItem('loggedIn', 'true');
        r.replace('/inicio');
      }
    });
  }, [r]);

  async function onLogin(e) {
    e.preventDefault();
    const u = username.trim().toLowerCase();
    if (!u) { alert('Digite seu usuário.'); return; }
    if (!pass) { alert('Digite sua senha.'); return; }

    setLoading(true);

    // monta o e-mail fake a partir do username
    const fakeEmail = `${u}@prteam.local`;

    const { error } = await supabase.auth.signInWithPassword({
      email: fakeEmail,
      password: pass,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    const { data } = await supabase.auth.getSession();
    if (data?.session) {
      localStorage.setItem('loggedIn', 'true');
      r.replace('/inicio');
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

      {/* Container vidro */}
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
        {/* Topo com logo grande (proporção preservada) */}
        <div
          style={{
            display: 'grid',
            justifyItems: 'center',
            gap: 8,
            padding: '6px 6px 0',
          }}
        >
          <div style={{ width: 500, position: 'relative', aspectRatio: '10 / 7' }}>
            <Image
              src="/logo.png"
              alt="PR TEAM"
              fill
              style={{ objectFit: 'contain' }}
              sizes="(max-width: 520px) 500px, 500px"
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
            Área do aluno • Acesso exclusivo
          </div>
        </div>

        {/* Card de login */}
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
            <div style={{ fontSize: 16, fontWeight: 900 }}>Entrar</div>
            <span style={{ fontSize: 12, color: THEME.textMute }}>usuário + senha</span>
          </div>

          <form onSubmit={onLogin}>
            <label style={{ fontSize: 12, color: THEME.textMute, display: 'block', margin: '4px 2px 8px' }}>
              Usuário
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="seuusuario"
            />

            <div style={{ height: 12 }} />
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
                className="btn ghost"
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
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div style={{ height: 12 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              style={{ fontSize: 12, color: THEME.textMute }}
              onClick={() => setShowForgot(true)}   // abre popup central
            >
              Esqueci minha senha
            </button>
            <button
              style={{ fontSize: 12, color: THEME.textMute }}
              onClick={() => r.push('/register')}
            >
              Criar conta
            </button>
          </div>
        </div>

        {/* Quote no rodapé do bloco */}
        <div style={{ height: 16 }} />
        <blockquote
          style={{
            textAlign: 'center',
            lineHeight: 1.5,
            color: THEME.textMute,
            fontSize: 13,
            margin: 0,
          }}
        >
          “{quote}”
        </blockquote>
        <div style={{ height: 4 }} />
      </div>

      {/* POPUP CENTRAL: Esqueci minha senha */}
      <Modal open={showForgot} onClose={() => setShowForgot(false)} title="Esqueceu a senha?">
        <div style={{ display: 'grid', gap: 10, color: THEME.text }}>
          <p style={{ margin: 0, color: THEME.textMute, lineHeight: 1.5 }}>
            Sem estresse! Fala com o coach no WhatsApp que ele te ajuda a redefinir rapidinho. 😉
          </p>
          <a
            href="https://wa.me/5531997640809?text=Oi%20coach!%20Esqueci%20minha%20senha%20do%20app%20da%20PR%20TEAM."
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 10,
              background: `linear-gradient(180deg, ${THEME.red} 0%, ${THEME.red2} 100%)`,
              color: '#fff',
              borderRadius: 12,
              padding: '12px 14px',
              textDecoration: 'none',
              fontWeight: 900,
              boxShadow: '0 8px 22px rgba(193,18,31,.22)',
            }}
          >
            Abrir WhatsApp
          </a>
        </div>
      </Modal>
    </main>
  );
}
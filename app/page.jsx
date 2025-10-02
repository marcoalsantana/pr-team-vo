// app/page.jsx
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Modal from '../components/Modal';
import { supabase } from '../lib/supabase';

const quote = 'Não é sorte! É trabalho, disciplina, estratégia, constância e dedicação.';
const WHATSAPP_NUMBER = '5531997640809'; // +55 31 99764-0809

export default function LoginPage() {
  const r = useRouter();
  const [email, setEmail] = useState('');
const [pass, setPass]   = useState('');
const [showReset, setShowReset] = useState(false); // <- ADICIONE ESTA LINHA
const [loading, setLoading] = useState(false);
const [see, setSee] = useState(false);

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
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    setLoading(false);
    if (error) { alert(error.message); return; }
    const { data } = await supabase.auth.getSession();
    if (data?.session) {
      localStorage.setItem('loggedIn', 'true');
      r.replace('/inicio');
    }
  }

  function openWhatsApp() {
    const msg = `Olá Pedro! Esqueci minha senha do app PR TEAM.
Meu e-mail é: ${email || '— preencha seu e-mail —'}
Meu usuário: ____ 
Pode me ajudar a redefinir?`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  }

  // paleta
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

      {/* Bloco central */}
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
        {/* Logo responsivo sem distorcer */}
        <div style={{ display: 'grid', justifyItems: 'center', padding: '6px 6px 0' }}>
          <div style={{ width: '100%', maxWidth: 500, aspectRatio: '10 / 7.8', position: 'relative' }}>
            <Image
              src="/logo.png"
              alt="PR TEAM"
              fill
              style={{ objectFit: 'contain' }}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <div style={{ fontSize: 16, fontWeight: 900 }}>Entrar</div>
            <span style={{ fontSize: 12, color: THEME.textMute }} />
          </div>

          <form onSubmit={onLogin}>
            <label style={{ fontSize: 12, color: THEME.textMute, display: 'block', margin: '4px 2px 8px' }}>E-mail</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              inputMode="email"
            />
            <div style={{ height: 12 }} />
            <label style={{ fontSize: 12, color: THEME.textMute, display: 'block', margin: '4px 2px 8px' }}>Senha</label>
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
  onClick={() => setShowReset(true)}   // <- usa a state correta
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

        <div style={{ height: 16 }} />
        <blockquote
          style={{ textAlign: 'center', lineHeight: 1.5, color: THEME.textMute, fontSize: 13, margin: 0 }}
        >
          “{quote}”
        </blockquote>
        <div style={{ height: 4 }} />
      </div>

      {/* Popup central "Esqueci minha senha" */}
<Modal
  open={showReset}
  onClose={() => setShowReset(false)}
  title="Esqueci minha senha"
>
  <p style={{ marginBottom: 12 }}>
    Opa! Esqueceu sua senha? Como este app é exclusivo para alunos, a redefinição
    é feita direto com o Pedro. Basta clicar abaixo para falar com ele no WhatsApp ✅
  </p>
  <button
    onClick={() => {
      window.open("https://wa.me/5531997640809?text=Oi Pedro! Esqueci minha senha.", "_blank");
      setShowReset(false);
    }}
    style={{
      background: "#25D366",
      color: "#fff",
      fontWeight: 700,
      padding: "10px 14px",
      borderRadius: 10,
      width: "100%",
    }}
  >
    Falar com Pedro no WhatsApp
  </button>
</Modal>
    </main>
  );
}
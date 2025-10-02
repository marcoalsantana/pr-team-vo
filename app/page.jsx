// app/page.jsx
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Modal from '../components/Modal';
import { supabase } from '../lib/supabase';

const quote = 'Não é sorte! É trabalho, disciplina, estratégia, constância e dedicação.';

export default function LoginPage() {
  const r = useRouter();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [see, setSee] = useState(false);

  // quando já tiver sessão do Supabase → redireciona
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) {
        localStorage.setItem('loggedIn', 'true'); // garante que salva
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
    if (error) {
      alert(error.message);
      return;
    }
    const { data } = await supabase.auth.getSession();
    if (data?.session) {
      localStorage.setItem('loggedIn', 'true'); // seta login no localStorage
      r.replace('/inicio');
    }
  }

  async function onReset(e) {
    e.preventDefault();
    if (!email) {
      alert('Digite seu e-mail.');
      return;
    }
    const redirectTo = `${window.location.origin}/inicio`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) {
      alert(error.message);
      return;
    }
    setShowReset(false);
    alert(
      'Se existir conta para este e-mail, enviamos o link de redefinição.'
    );
  }

  return (
    <main className="container" style={{ paddingTop: 28, paddingBottom: 36 }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          alignItems: 'center',
        }}
      >
        <Image
          src="/logo.png"
          alt="PR TEAM"
          width={180}
          height={140}
          priority
        />
        <h1 className="title" style={{ fontSize: 36, textAlign: 'center' }}>
          PR TEAM
        </h1>
        <div className="sub" style={{ fontSize: 16 }}>
          Treinador Pedro Ratton
        </div>
      </div>

      <div className="spacer-lg" />

      <div className="card" style={{ padding: '18px 16px' }}>
        <div
          className="title"
          style={{ fontSize: 14, textAlign: 'center' }}
        >
          Acesso exclusivo aos alunos
        </div>
        <div className="spacer" />
        <form onSubmit={onLogin}>
          <label>E-mail</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            inputMode="email"
          />
          <div className="spacer" />
          <label>Senha</label>
          <div className="row" style={{ gap: 8 }}>
            <input
              type={see ? 'text' : 'password'}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••••••"
            />
            <button
              type="button"
              className="btn ghost"
              style={{ width: 56 }}
              onClick={() => setSee((s) => !s)}
            >
              {see ? '🙈' : '👁️'}
            </button>
          </div>
          <div className="spacer" />
          <button className="btn primary" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <div className="spacer" />
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <button className="sub" onClick={() => setShowReset(true)}>
            Esqueci minha senha
          </button>
          <button className="sub" onClick={() => r.push('/register')}>
            Criar conta
          </button>
        </div>
      </div>

      <div className="spacer-lg" />
      <blockquote
        className="sub"
        style={{ textAlign: 'center', lineHeight: 1.5 }}
      >
        “{quote}”
      </blockquote>

      <Modal
        open={showReset}
        onClose={() => setShowReset(false)}
        title="Recuperar senha"
        align="center"
      >
        <form onSubmit={onReset}>
          <label>E-mail da conta</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            inputMode="email"
          />
          <div className="spacer" />
          <button className="btn primary">Enviar link</button>
        </form>
      </Modal>
    </main>
  );
}
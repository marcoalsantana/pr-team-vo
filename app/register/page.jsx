'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

const initialFormState = {
  email: '',
  password: '',
  fullName: '',
  username: '',
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialFormState);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const isStepOne = step === 1;
  const isStepTwo = step === 2;

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!isDirty) {
        return;
      }
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    router.prefetch('/inicio');
  }, [router]);

  const updateField = (field) => (event) => {
    setIsDirty(true);
    setFeedback(null);
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const confirmDiscardChanges = () => {
    if (!isDirty) {
      return true;
    }
    return window.confirm('Você tem alterações não salvas. Deseja sair mesmo assim?');
  };

  const handleNextStep = () => {
    const trimmedEmail = form.email.trim();
    const trimmedPassword = form.password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setFeedback({ type: 'error', message: 'Informe e-mail e senha para continuar.' });
      return;
    }

    if (trimmedPassword.length < 6) {
      setFeedback({ type: 'error', message: 'A senha deve ter pelo menos 6 caracteres.' });
      return;
    }

    setFeedback(null);
    setStep(2);
  };

  const handleBack = () => {
    if (isStepTwo) {
      setFeedback(null);
      setStep(1);
      return;
    }

    if (!confirmDiscardChanges()) {
      return;
    }

    setIsDirty(false);
    router.push('/');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedFullName = form.fullName.trim();
    const trimmedUsername = form.username.trim();

    if (!trimmedFullName || !trimmedUsername) {
      setFeedback({ type: 'error', message: 'Preencha nome completo e nome de usuário.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const trimmedEmail = form.email.trim();
      const password = form.password;

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            username: trimmedUsername,
            full_name: trimmedFullName,
          },
        },
      });

      if (error) {
        throw error;
      }

      const userId = data?.user?.id;

      if (userId) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert(
              [
                {
                  id: userId,
                  email: trimmedEmail,
                  username: trimmedUsername,
                  full_name: trimmedFullName,
                },
              ],
              { onConflict: 'id' }
            );

          if (profileError) {
            console.warn('[Supabase] Falha ao sincronizar perfil:', profileError.message);
          }
        } catch (profileException) {
          console.warn('[Supabase] Ignorando erro ao acessar tabela profiles.', profileException);
        }
      }

      if (data?.session) {
        setIsDirty(false);
        router.push('/inicio');
        return;
      }

      setIsDirty(false);
      setFeedback({
        type: 'info',
        message: 'Quase lá! Enviamos um e-mail de confirmação para você completar o cadastro.',
      });
    } catch (submitError) {
      setFeedback({
        type: 'error',
        message: submitError?.message ?? 'Não foi possível criar a conta. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const disableSubmit = useMemo(
    () => !form.fullName.trim() || !form.username.trim() || isSubmitting,
    [form.fullName, form.username, isSubmitting]
  );

  const feedbackClass = feedback?.type
    ? `login-form__status login-form__status--${feedback.type}`
    : 'login-form__status';

  return (
    <div
      className="login-page"
      style={{
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 20% 20%, rgba(255, 31, 51, 0.16), transparent 55%), radial-gradient(circle at 80% 30%, rgba(255, 31, 51, 0.1), transparent 55%)',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />

      <div
        className="login-page__card"
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '48px 42px',
          gap: '36px',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 'auto -20% -20% -20%',
            background: 'radial-gradient(circle at bottom, rgba(255, 31, 51, 0.22), transparent 60%)',
            zIndex: 0,
          }}
        />

        <header
          className="login-page__header"
          style={{ position: 'relative', zIndex: 1, gap: '12px', textAlign: 'center' }}
        >
          <span className="login-page__brand" style={{ letterSpacing: '0.28em' }}>
            PR TEAM
          </span>
          <h1 className="login-page__title" style={{ fontSize: '1.95rem', fontWeight: 800 }}>
            Criar conta
          </h1>
          <p className="login-page__subtitle" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
            Dois passos rápidos para liberar seu acesso. Seus dados são protegidos e usados apenas para personalizar a experiência.
          </p>
        </header>

        <div
          className="login-page__footer"
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            fontSize: '0.85rem',
          }}
        >
          <span style={{ color: 'var(--color-text-muted)' }}>Passo</span>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.04em' }}>{step}</span>
          <span style={{ color: 'var(--color-text-muted)' }}>de 2</span>
        </div>

        <form
          className="login-form"
          onSubmit={handleSubmit}
          style={{
            position: 'relative',
            zIndex: 1,
            gap: '24px',
            padding: '24px',
            background: 'rgba(10, 10, 10, 0.65)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 31, 51, 0.18)',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
          }}
        >
          {isStepOne ? (
            <div className="login-step login-step--one" style={{ display: 'grid', gap: '20px' }}>
              <label className="login-form__field">
                <span style={{ fontSize: '0.78rem' }}>E-mail</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={updateField('email')}
                  placeholder="voce@exemplo.com"
                  required
                />
              </label>

              <label className="login-form__field">
                <span style={{ fontSize: '0.78rem' }}>Senha</span>
                <div className="login-form__password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={updateField('password')}
                    placeholder="Crie uma senha forte"
                    required
                  />
                  <button
                    type="button"
                    className="login-form__toggle-password"
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
              </label>
            </div>
          ) : null}

          {isStepTwo ? (
            <div className="login-step login-step--two" style={{ display: 'grid', gap: '20px' }}>
              <label className="login-form__field">
                <span style={{ fontSize: '0.78rem' }}>Nome completo</span>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={updateField('fullName')}
                  placeholder="Seu nome e sobrenome"
                  required
                />
              </label>

              <label className="login-form__field">
                <span style={{ fontSize: '0.78rem' }}>Nome de usuário</span>
                <input
                  type="text"
                  value={form.username}
                  onChange={updateField('username')}
                  placeholder="Como você quer ser visto no app?"
                  required
                />
              </label>
            </div>
          ) : null}

          {feedback ? (
            <p className={feedbackClass} style={{ marginTop: '-4px' }}>
              {feedback.message}
            </p>
          ) : null}

          <div className="login-form__links" style={{ flexDirection: 'row', gap: '16px' }}>
            <button
              type="button"
              className="button button--ghost login-form__submit"
              onClick={handleBack}
              style={{
                flex: 1,
                height: '52px',
                fontWeight: 600,
              }}
            >
              {isStepTwo ? 'Voltar' : 'Cancelar'}
            </button>

            {isStepOne ? (
              <button
                type="button"
                className="button button--primary login-form__submit"
                onClick={handleNextStep}
                style={{ flex: 1, height: '52px', fontSize: '1rem' }}
              >
                Próximo passo
              </button>
            ) : (
              <button
                type="submit"
                className="button button--primary login-form__submit"
                disabled={disableSubmit}
                style={{ flex: 1, height: '52px', fontSize: '1rem' }}
              >
                {isSubmitting ? 'Criando conta...' : 'Criar conta'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}


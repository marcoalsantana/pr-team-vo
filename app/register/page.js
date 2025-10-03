// app/register/page.jsx
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
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

function Section({ title, children }) {
  return (
    <section
      style={{
        background: '#141417',
        border: `1px solid ${THEME.stroke}`,
        borderRadius: 16,
        padding: 16,
        boxShadow: THEME.softShadow,
        display: 'grid',
        gap: 12,
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 900 }}>{title}</div>
      {children}
    </section>
  );
}

function Label({ children }) {
  return (
    <label style={{ fontSize: 12, color: THEME.textMute, display: 'block', margin: '2px 2px 6px' }}>
      {children}
    </label>
  );
}

function Row({ children, gap = 10 }) {
  return <div style={{ display: 'grid', gap, gridTemplateColumns: '1fr 1fr' }}>{children}</div>;
}

// máscara CPF
const maskCPF = (v) =>
  v
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

// valida CPF
function isCPFValid(cpf) {
  const s = cpf.replace(/\D/g, '');
  if (!s || s.length !== 11) return false;
  if (/^(\d)\1+$/.test(s)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(s.charAt(i)) * (10 - i);
  let d1 = 11 - (sum % 11);
  if (d1 > 9) d1 = 0;
  if (d1 !== parseInt(s.charAt(9))) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(s.charAt(i)) * (11 - i);
  let d2 = 11 - (sum % 11);
  if (d2 > 9) d2 = 0;
  return d2 === parseInt(s.charAt(10));
}

// máscara CEP
const maskCEP = (v) =>
  v
    .replace(/\D/g, '')
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, '$1-$2');

export default function RegisterPage() {
  const r = useRouter();

  // Básicos
  const [nome, setNome] = useState('');
  const [nasc, setNasc] = useState(''); // yyyy-mm-dd
  const [cpf, setCpf] = useState('');

  // Endereço
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [complemento, setComplemento] = useState('');

  // Medidas
  const [peso, setPeso] = useState('');     // kg
  const [altura, setAltura] = useState(''); // cm

  // Histórico / saúde
  const [pratica, setPratica] = useState(''); // iniciante/intermediário/avançado (op)
  const [ativo, setAtivo] = useState(''); // ex.: "ativo" ou "parado há 2 meses" (op)
  const [objetivo, setObjetivo] = useState(''); // ob
  const [corpoRef, setCorpoRef] = useState(''); // link insta/foto (op)
  const [dores, setDores] = useState({ joelho: false, ombro: false, lombar: false });
  const [dorDesc, setDorDesc] = useState(''); // descrição/observação (op)
  const [medicacao, setMedicacao] = useState(''); // op
  const [outraAtividade, setOutraAtividade] = useState(''); // op
  const [rotina, setRotina] = useState(''); // em pé / sentado / misto (op)

  // Disponibilidade
  const [diasSemana, setDiasSemana] = useState(''); // ob (1–7)
  const [tempoDia, setTempoDia] = useState('');     // ob (ex.: 45min, 1h, 1h30)

  // Credenciais
  const [username, setUsername] = useState('');
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [see, setSee] = useState(false);

  // Controle
  const [loading, setLoading] = useState(false);

  // Se já estiver logado → início
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) {
        localStorage.setItem('loggedIn', 'true');
        r.replace('/inicio');
      }
    });
  }, [r]);

  // auto-preenche via CEP (ViaCEP)
  useEffect(() => {
    const clean = cep.replace(/\D/g, '');
    if (clean.length === 8) {
      (async () => {
        try {
          const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
          const data = await res.json();
          if (!data.erro) {
            setRua(data.logradouro || '');
            setBairro(data.bairro || '');
            setCidade(data.localidade || '');
            setUf(data.uf || '');
          }
        } catch (e) {
          // silencia
        }
      })();
    }
  }, [cep]);

  // helpers
  function validateUsername(u) {
    return /^[a-z0-9._-]{3,20}$/.test(u);
  }

  const obrigatoriosOk = useMemo(() => {
    return (
      nome.trim().length >= 3 &&
      nasc &&
      isCPFValid(cpf) &&
      cep.replace(/\D/g, '').length === 8 &&
      rua.trim().length >= 3 &&
      bairro.trim().length >= 2 &&
      cidade.trim().length >= 2 &&
      uf.trim().length >= 2 &&
      numero.trim().length >= 1 &&
      parseFloat(peso) > 0 &&
      parseFloat(altura) > 0 &&
      objetivo.trim().length >= 3 &&
      diasSemana &&
      tempoDia &&
      validateUsername(username) &&
      pass.length >= 6 &&
      pass === pass2
    );
  }, [
    nome, nasc, cpf, cep, rua, bairro, cidade, uf, numero,
    peso, altura, objetivo, diasSemana, tempoDia,
    username, pass, pass2
  ]);

  async function onRegister(e) {
    e.preventDefault();

    // validações com mensagens claras
    if (!nome.trim()) return alert('Informe seu nome completo.');
    if (!nasc) return alert('Informe sua data de nascimento.');
    if (!isCPFValid(cpf)) return alert('Informe um CPF válido.');
    if (cep.replace(/\D/g, '').length !== 8) return alert('CEP inválido.');
    if (!rua.trim() || !bairro.trim() || !cidade.trim() || !uf.trim() || !numero.trim()) {
      return alert('Complete seu endereço (rua, número, bairro, cidade e UF).');
    }
    const p = parseFloat(peso);
    const a = parseFloat(altura);
    if (!(p > 0)) return alert('Informe um peso válido (kg).');
    if (!(a > 0)) return alert('Informe uma altura válida (cm).');
    if (!objetivo.trim()) return alert('Descreva seu objetivo.');
    if (!diasSemana) return alert('Selecione quantos dias por semana você pode treinar.');
    if (!tempoDia) return alert('Informe quanto tempo por dia você tem para treinar.');
    if (!validateUsername(username)) {
      return alert('Nome de usuário inválido. Use 3–20 caracteres: letras/números e . _ -');
    }
    if (pass.length < 6) return alert('A senha deve ter pelo menos 6 caracteres.');
    if (pass !== pass2) return alert('As senhas não coincidem.');

    setLoading(true);

    try {
      const u = username.trim().toLowerCase();
      const fakeEmail = `${u}@prteam.local`;

      const metadata = {
        nome,
        nasc,          // yyyy-mm-dd
        cpf: cpf.replace(/\D/g, ''),
        endereco: {
          cep: cep.replace(/\D/g, ''),
          rua, numero, complemento, bairro, cidade, uf
        },
        medidas: {
          peso: parseFloat(peso),
          altura: parseFloat(altura),
        },
        pratica: pratica || null,
        ativo_ou_parado: ativo || null,
        objetivo,
        corpo_referencia: corpoRef || null,
        dores: {
          joelho: !!dores.joelho,
          ombro: !!dores.ombro,
          lombar: !!dores.lombar,
          descricao: dorDesc || null,
        },
        outra_atividade: outraAtividade || null,
        medicacao: medicacao || null,
        rotina: rotina || null,
        disponibilidade: {
          dias_semana: parseInt(diasSemana, 10),
          tempo_por_dia: tempoDia,
        },
        username: u,
      };

      // tenta criar
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: fakeEmail,
        password: pass,
        options: { data: metadata },
      });

      if (signUpErr) {
        if (signUpErr?.message?.toLowerCase().includes('already') || signUpErr?.status === 400) {
          alert('Esse nome de usuário já está em uso. Tente outro.');
        } else {
          alert(signUpErr.message);
        }
        setLoading(false);
        return;
      }

      // se não logou automaticamente, faz login
      let session = signUpData.session;
      if (!session) {
        const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
          email: fakeEmail,
          password: pass,
        });
        if (loginErr) {
          alert(loginErr.message);
          setLoading(false);
          return;
        }
        session = loginData.session;
      }

      localStorage.setItem('loggedIn', 'true');
      r.replace('/inicio');
    } catch (err) {
      alert('Não foi possível criar sua conta agora.');
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
      {/* Glow */}
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

      {/* Container */}
      <div
        style={{
          width: '100%',
          maxWidth: 560,
          borderRadius: 20,
          border: `1px solid ${THEME.stroke}`,
          background: THEME.surface,
          boxShadow: THEME.softShadow,
          backdropFilter: 'blur(10px)',
          padding: 18,
          display: 'grid',
          gap: 14,
        }}
      >
        {/* Topo com logo */}
        <div style={{ display: 'grid', justifyItems: 'center', gap: 8, padding: '6px 6px 0' }}>
          <div style={{ width: 420, position: 'relative', aspectRatio: '10 / 7' }}>
            <Image
              src="/logo.png"
              alt="PR TEAM"
              fill
              style={{ objectFit: 'contain' }}
              sizes="(max-width: 560px) 420px, 420px"
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

        {/* FORM */}
        <form onSubmit={onRegister} style={{ display: 'grid', gap: 14 }}>
          {/* Dados básicos */}
          <Section title="Dados básicos">
            <div>
              <Label>Nome completo *</Label>
              <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome completo" />
            </div>
            <Row>
              <div>
                <Label>Data de nascimento *</Label>
                <input type="date" value={nasc} onChange={(e) => setNasc(e.target.value)} />
              </div>
              <div>
                <Label>CPF *</Label>
                <input
                  value={cpf}
                  onChange={(e) => setCpf(maskCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                />
              </div>
            </Row>
          </Section>

          {/* Endereço */}
          <Section title="Endereço">
            <Row>
              <div>
                <Label>CEP *</Label>
                <input
                  value={cep}
                  onChange={(e) => setCep(maskCEP(e.target.value))}
                  placeholder="00000-000"
                  inputMode="numeric"
                />
              </div>
              <div>
                <Label>Número *</Label>
                <input value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="123" />
              </div>
            </Row>
            <div>
              <Label>Rua *</Label>
              <input value={rua} onChange={(e) => setRua(e.target.value)} placeholder="Av. Exemplo" />
            </div>
            <Row>
              <div>
                <Label>Bairro *</Label>
                <input value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Centro" />
              </div>
              <div>
                <Label>Complemento</Label>
                <input value={complemento} onChange={(e) => setComplemento(e.target.value)} placeholder="Apto, bloco..." />
              </div>
            </Row>
            <Row>
              <div>
                <Label>Cidade *</Label>
                <input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Belo Horizonte" />
              </div>
              <div>
                <Label>UF *</Label>
                <input value={uf} onChange={(e) => setUf(e.target.value.toUpperCase().slice(0, 2))} placeholder="MG" />
              </div>
            </Row>
          </Section>

          {/* Medidas */}
          <Section title="Medidas">
            <Row>
              <div>
                <Label>Peso (kg) *</Label>
                <input value={peso} onChange={(e) => setPeso(e.target.value.replace(',', '.'))} placeholder="ex.: 78.5" inputMode="decimal" />
              </div>
              <div>
                <Label>Altura (cm) *</Label>
                <input value={altura} onChange={(e) => setAltura(e.target.value.replace(',', '.'))} placeholder="ex.: 178" inputMode="numeric" />
              </div>
            </Row>
          </Section>

          {/* Histórico / Saúde */}
          <Section title="Histórico e saúde">
            <Row>
              <div>
                <Label>Tempo de prática (opcional)</Label>
                <select value={pratica} onChange={(e) => setPratica(e.target.value)}>
                  <option value="">Selecione...</option>
                  <option value="iniciante">Iniciante</option>
                  <option value="intermediario">Intermediário</option>
                  <option value="avancado">Avançado</option>
                </select>
              </div>
              <div>
                <Label>Está ativo? (opcional)</Label>
                <input value={ativo} onChange={(e) => setAtivo(e.target.value)} placeholder='ex.: "ativo" ou "parado há 2 meses"' />
              </div>
            </Row>

            <div>
              <Label>Objetivo principal *</Label>
              <input value={objetivo} onChange={(e) => setObjetivo(e.target.value)} placeholder="Ex.: hipertrofia, perder gordura, performance..." />
            </div>

            <div>
              <Label>Algum corpo de referência? (link Instagram/foto — opcional)</Label>
              <input value={corpoRef} onChange={(e) => setCorpoRef(e.target.value)} placeholder="https://instagram.com/..." />
            </div>

            <div>
              <Label>Dores (opcional)</Label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13 }}>
                  <input type="checkbox" checked={dores.joelho} onChange={(e) => setDores((d) => ({ ...d, joelho: e.target.checked }))} />
                  Joelho
                </label>
                <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13 }}>
                  <input type="checkbox" checked={dores.ombro} onChange={(e) => setDores((d) => ({ ...d, ombro: e.target.checked }))} />
                  Ombro
                </label>
                <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13 }}>
                  <input type="checkbox" checked={dores.lombar} onChange={(e) => setDores((d) => ({ ...d, lombar: e.target.checked }))} />
                  Lombar
                </label>
              </div>
              <div style={{ height: 8 }} />
              <input value={dorDesc} onChange={(e) => setDorDesc(e.target.value)} placeholder="Explique brevemente (e laudo se tiver)" />
            </div>

            <Row>
              <div>
                <Label>Faz outra atividade? (opcional)</Label>
                <input value={outraAtividade} onChange={(e) => setOutraAtividade(e.target.value)} placeholder="Ex.: futebol 2x semana" />
              </div>
              <div>
                <Label>Medicação? (opcional)</Label>
                <input value={medicacao} onChange={(e) => setMedicacao(e.target.value)} placeholder="Ex.: nenhum / losartana" />
              </div>
            </Row>

            <div>
              <Label>Rotina (opcional)</Label>
              <select value={rotina} onChange={(e) => setRotina(e.target.value)}>
                <option value="">Selecione...</option>
                <option value="em_pe">Em pé</option>
                <option value="sentado">Sentado</option>
                <option value="misto">Misto</option>
              </select>
            </div>
          </Section>

          {/* Disponibilidade */}
          <Section title="Disponibilidade">
            <Row>
              <div>
                <Label>Dias por semana *</Label>
                <select value={diasSemana} onChange={(e) => setDiasSemana(e.target.value)}>
                  <option value="">Selecione...</option>
                  {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <Label>Tempo por dia (min.) *</Label>
                <select value={tempoDia} onChange={(e) => setTempoDia(e.target.value)}>
                  <option value="">Selecione...</option>
                  <option value="30min">30 min</option>
                  <option value="45min">45 min</option>
                  <option value="60min">60 min</option>
                  <option value="75min">75 min</option>
                  <option value="90min">90 min</option>
                </select>
              </div>
            </Row>
          </Section>

          {/* Credenciais */}
          <Section title="Credenciais de acesso">
            <div>
              <Label>Nome de usuário (único) *</Label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="ex.: joaosilva" />
              <div style={{ fontSize: 11, color: THEME.textMute, marginTop: 4 }}>
                Use apenas letras/números e os símbolos . _ - (3 a 20 caracteres).
              </div>
            </div>
            <Row>
              <div>
                <Label>Senha *</Label>
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
              </div>
              <div>
                <Label>Confirmar senha *</Label>
                <input
                  type={see ? 'text' : 'password'}
                  value={pass2}
                  onChange={(e) => setPass2(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </Row>
          </Section>

          <button
            disabled={loading || !obrigatoriosOk}
            style={{
              width: '100%',
              background: obrigatoriosOk
                ? `linear-gradient(180deg, ${THEME.red} 0%, ${THEME.red2} 100%)`
                : '#3a3a3f',
              color: '#fff',
              borderRadius: 14,
              padding: '14px 16px',
              fontWeight: 900,
              boxShadow: obrigatoriosOk ? '0 8px 22px rgba(193,18,31,.22)' : 'none',
              cursor: obrigatoriosOk ? 'pointer' : 'not-allowed',
              opacity: loading ? .8 : 1,
            }}
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: THEME.textMute }}>
              Ao criar a conta você concorda com as diretrizes do coach.
            </span>
            <button type="button" style={{ color: THEME.textMute }} onClick={() => r.push('/')}>
              Já tenho conta
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
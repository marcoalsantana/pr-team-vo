'use client';

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body style={{padding:24,color:'red',background:'#0b0b0b'}}>
        <h1>Algo deu errado</h1>
        <pre style={{whiteSpace:'pre-wrap'}}>{String(error?.message ?? error)}</pre>
        <button onClick={() => reset()} style={{marginTop:12}}>Tentar novamente</button>
      </body>
    </html>
  );
}
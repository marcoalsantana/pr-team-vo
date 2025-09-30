'use client';
export default function Error({ error, reset }) {
  return (
    <div style={{padding:24,color:'#ff6b81',background:'#0b0b0f',minHeight:'100vh'}}>
      <h1>Algo deu errado</h1>
      <pre style={{whiteSpace:'pre-wrap'}}>{String(error?.message ?? error)}</pre>
      <button onClick={() => reset()} style={{marginTop:12,padding:'10px 14px',background:'#ff2d2d',color:'#fff',borderRadius:10}}>
        Tentar novamente
      </button>
    </div>
  );
}
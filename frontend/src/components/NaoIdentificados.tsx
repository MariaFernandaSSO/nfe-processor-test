import { useEffect, useState } from 'react';
import { fetchNaoIdentificados } from '../api';
import type { NaoIdentificado } from '../api';

export default function NaoIdentificados() {
  const [data, setData] = useState<NaoIdentificado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNaoIdentificados()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card">
        <div className="card-header"><h2>XMLs sem Vínculo</h2></div>
        {[1, 2].map(i => <div key={i} className="skeleton" style={{ width: `${50 + i * 15}%` }} />)}
      </div>
    );
  }

  if (error) return <div className="card"><div className="msg msg-error">{error}</div></div>;

  return (
    <div className="card">
      <div className="card-header">
        <h2>XMLs sem Vínculo</h2>
        {data.length > 0 && <span className="badge">{data.length} registro(s)</span>}
      </div>

      {data.length === 0 ? (
        <div className="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Nenhum XML não identificado.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Emitente</th>
                <th>CNPJ Emitente</th>
                <th>Destinatário</th>
                <th>CNPJ Destinatário</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, i) => (
                <tr key={i}>
                  <td>{item.emitente_nome || '—'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{item.emitente_cnpj || '—'}</td>
                  <td>{item.destinatario_nome || '—'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{item.destinatario_cnpj || '—'}</td>
                  <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{item.motivo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

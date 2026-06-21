import { useEffect, useState } from 'react';
import { fetchResumo } from '../api';
import type { ResumoItem } from '../api';

export default function ResumoClientes() {
  const [data, setData] = useState<ResumoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResumo()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card">
        <div className="card-header"><h2>Resumo por Cliente</h2></div>
        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ width: `${60 + i * 10}%` }} />)}
      </div>
    );
  }

  if (error) return <div className="card"><div className="msg msg-error">{error}</div></div>;

  const total = data.reduce((a, b) => ({ compra: a.compra + b.compra, venda: a.venda + b.venda }), { compra: 0, venda: 0 });

  return (
    <div className="card">
      <div className="card-header">
        <h2>Resumo por Cliente</h2>
        {data.length > 0 && <span className="badge">{data.length} cliente(s)</span>}
      </div>

      {data.length === 0 ? (
        <div className="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
          <p>Nenhum dado disponível. Faça upload de XMLs primeiro.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th style={{ textAlign: 'center' }}>Compras</th>
                <th style={{ textAlign: 'center' }}>Vendas</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.cliente}>
                  <td><strong>{item.cliente}</strong></td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="count-badge green">{item.compra}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="count-badge blue">{item.venda}</span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid #e2e8f0' }}>
                <td><strong>Total</strong></td>
                <td style={{ textAlign: 'center' }}><strong>{total.compra}</strong></td>
                <td style={{ textAlign: 'center' }}><strong>{total.venda}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

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

  if (loading) return <div className="card"><p>Carregando...</p></div>;
  if (error) return <div className="card"><div className="error">{error}</div></div>;

  return (
    <div className="card">
      <h2>Resumo por Cliente</h2>
      {data.length === 0 ? (
        <p>Nenhum dado disponível.</p>
      ) : (
        <table>
          <thead>
            <tr><th>Cliente</th><th>Compra</th><th>Venda</th></tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.cliente}>
                <td>{item.cliente}</td>
                <td>{item.compra}</td>
                <td>{item.venda}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

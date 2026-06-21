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

  if (loading) return <div className="card"><p>Carregando...</p></div>;
  if (error) return <div className="card"><div className="error">{error}</div></div>;

  return (
    <div className="card">
      <h2>XMLs sem Vínculo</h2>
      {data.length === 0 ? (
        <p>Nenhum XML não identificado.</p>
      ) : (
        <table>
          <thead>
            <tr><th>Emitente</th><th>CNPJ Emitente</th><th>Destinatário</th><th>CNPJ Destinatário</th><th>Motivo</th></tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr key={i}>
                <td>{item.emitente_nome || '-'}</td>
                <td>{item.emitente_cnpj || '-'}</td>
                <td>{item.destinatario_nome || '-'}</td>
                <td>{item.destinatario_cnpj || '-'}</td>
                <td>{item.motivo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

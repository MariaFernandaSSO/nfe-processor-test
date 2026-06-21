import { useState } from 'react';
import UploadXml from './components/UploadXml';
import ResumoClientes from './components/ResumoClientes';
import NaoIdentificados from './components/NaoIdentificados';
import './App.css';

type Tab = 'upload' | 'resumo' | 'nao-identificados';

export default function App() {
  const [tab, setTab] = useState<Tab>('upload');

  return (
    <div className="app">
      <div className="header">
        <div className="header-icon">N</div>
        <div>
          <h1>NFe Processor</h1>
          <div className="header-sub">Processamento assíncrono de notas fiscais</div>
        </div>
      </div>

      <div className="nav">
        <button className={tab === 'upload' ? 'active' : ''} onClick={() => setTab('upload')}>
          Upload
        </button>
        <button className={tab === 'resumo' ? 'active' : ''} onClick={() => setTab('resumo')}>
          Resumo
        </button>
        <button className={tab === 'nao-identificados' ? 'active' : ''} onClick={() => setTab('nao-identificados')}>
          Não Identificados
        </button>
      </div>

      {tab === 'upload' && <UploadXml />}
      {tab === 'resumo' && <ResumoClientes />}
      {tab === 'nao-identificados' && <NaoIdentificados />}
    </div>
  );
}

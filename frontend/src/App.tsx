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
      <h1>NFe Processor</h1>
      <nav>
        <button className={tab === 'upload' ? 'active' : ''} onClick={() => setTab('upload')}>Upload</button>
        <button className={tab === 'resumo' ? 'active' : ''} onClick={() => setTab('resumo')}>Resumo</button>
        <button className={tab === 'nao-identificados' ? 'active' : ''} onClick={() => setTab('nao-identificados')}>Não Identificados</button>
      </nav>
      {tab === 'upload' && <UploadXml />}
      {tab === 'resumo' && <ResumoClientes />}
      {tab === 'nao-identificados' && <NaoIdentificados />}
    </div>
  );
}

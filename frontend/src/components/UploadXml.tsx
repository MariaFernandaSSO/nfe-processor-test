import { useState, useRef } from 'react';
import { uploadXml } from '../api';

export default function UploadXml() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(Array.from(e.target.files || []));
    setResult(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setResult(null);
    setError(null);
    try {
      const data = await uploadXml(files);
      setResult(`${data.message} — ${data.jobs.length} arquivo(s) enfileirado(s)`);
      setFiles([]);
      if (inputRef.current) inputRef.current.value = '';
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar arquivos');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setResult(null);
    setError(null);
  };

  const handleAreaClick = () => inputRef.current?.click();

  return (
    <div className="card">
      <div className="card-header">
        <h2>Upload de XML</h2>
        <span className="badge">NF-e</span>
      </div>

      <div
        className={`upload-area ${files.length > 0 ? 'has-files' : ''}`}
        onClick={handleAreaClick}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <p>
          <span className="highlight">Clique para selecionar</span> ou arraste arquivos XML
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".xml"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      {files.length > 0 && (
        <div className="file-list">
          {files.map((f, i) => (
            <div key={i} className="file-item">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <span style={{ flex: 1 }}>{f.name}</span>
              <button
                className="btn-remove"
                onClick={() => removeFile(i)}
                title="Remover arquivo"
                disabled={uploading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="14" height="14">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="upload-actions">
        <button className="btn btn-primary" onClick={handleUpload} disabled={uploading || files.length === 0}>
          {uploading ? 'Enviando...' : 'Enviar arquivos'}
        </button>
        {files.length > 0 && <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{files.length} arquivo(s)</span>}
      </div>

      {result && <div className="msg msg-success">{result}</div>}
      {error && <div className="msg msg-error">{error}</div>}
    </div>
  );
}

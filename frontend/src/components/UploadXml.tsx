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

  return (
    <div className="card">
      <h2>Upload de XML</h2>
      <input ref={inputRef} type="file" multiple accept=".xml" onChange={handleFileChange} />
      {files.length > 0 && (
        <p>{files.length} arquivo(s) selecionado(s)</p>
      )}
      <button onClick={handleUpload} disabled={uploading || files.length === 0}>
        {uploading ? 'Enviando...' : 'Enviar'}
      </button>
      {result && <div className="success">{result}</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
}

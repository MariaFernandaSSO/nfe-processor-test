const API_BASE = 'http://localhost:3000/api/v1';

export async function uploadXml(files: File[]): Promise<{ message: string; jobs: { fileName: string; jobId: string }[] }> {
  const formData = new FormData();
  files.forEach(f => formData.append('files', f));

  const res = await fetch(`${API_BASE}/xml/upload`, { method: 'POST', body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Upload failed');
  }
  return res.json();
}

export interface NFe {
  id: string;
  chave: string | null;
  xml_hash: string | null;
  emitente_nome: string | null;
  emitente_cnpj: string | null;
  destinatario_nome: string | null;
  destinatario_cnpj: string | null;
  valor_total: number | null;
  data_emissao: string | null;
  operacao: string | null;
  createdAt: string;
}

export interface ResumoItem {
  cliente: string;
  compra: number;
  venda: number;
}

export interface NaoIdentificado {
  emitente_nome: string | null;
  emitente_cnpj: string | null;
  destinatario_nome: string | null;
  destinatario_cnpj: string | null;
  motivo: string;
}

export async function fetchNfes(): Promise<NFe[]> {
  const res = await fetch(`${API_BASE}/nfe`);
  if (!res.ok) throw new Error('Failed to fetch NF-es');
  return res.json();
}

export async function fetchResumo(): Promise<ResumoItem[]> {
  const res = await fetch(`${API_BASE}/nfe/resumo`);
  if (!res.ok) throw new Error('Failed to fetch resumo');
  return res.json();
}

export async function fetchNaoIdentificados(): Promise<NaoIdentificado[]> {
  const res = await fetch(`${API_BASE}/nfe/nao-identificados`);
  if (!res.ok) throw new Error('Failed to fetch não identificados');
  return res.json();
}

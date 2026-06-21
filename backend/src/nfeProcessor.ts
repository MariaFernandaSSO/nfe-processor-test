import { XMLParser } from 'fast-xml-parser';

export type ParsedNfe = {
  chave?: string | null;
  emitente_nome?: string | null;
  emitente_cnpj?: string | null;
  destinatario_nome?: string | null;
  destinatario_cnpj?: string | null;
  valor_total?: string | null;
  data_emissao?: string | null;
  raw?: any;
};

function findObjectByKeys(obj: any, keys: string[]): any {
  if (!obj || typeof obj !== 'object') return undefined;
  for (const k of Object.keys(obj)) {
    if (keys.includes(k)) return obj[k];
  }
  for (const k of Object.keys(obj)) {
    const found = findObjectByKeys(obj[k], keys);
    if (found !== undefined) return found;
  }
  return undefined;
}

function findValueByKeys(obj: any, keys: string[]): any {
  if (!obj || typeof obj !== 'object') return undefined;
  for (const k of Object.keys(obj)) {
    if (keys.includes(k)) return obj[k];
  }
  for (const k of Object.keys(obj)) {
    const found = findValueByKeys(obj[k], keys);
    if (found !== undefined) return found;
  }
  return undefined;
}

export function normalizeCnpj(v?: string) {
  if (!v) return null;
  return String(v).replace(/\D/g, '').padStart(14, '0');
}

export function parseXml(xml: string): ParsedNfe {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  const parsed = parser.parse(xml);

  const chave = findValueByKeys(parsed, ['chNFe', 'chave']);
  const emitObj = findObjectByKeys(parsed, ['emit', 'Emit']);
  const destObj = findObjectByKeys(parsed, ['dest', 'Dest']);

  const emitente_nome = emitObj ? findValueByKeys(emitObj, ['xNome', 'xnome', 'nome']) : undefined;
  const emitente_cnpj = emitObj ? normalizeCnpj(findValueByKeys(emitObj, ['CNPJ', 'cnpj'])) : undefined;

  const destinatario_nome = destObj ? findValueByKeys(destObj, ['xNome', 'xnome', 'nome']) : undefined;
  const destinatario_cnpj = destObj ? normalizeCnpj(findValueByKeys(destObj, ['CNPJ', 'cnpj'])) : undefined;

  const valor_total = findValueByKeys(parsed, ['vNF', 'vProd', 'valor', 'vTot']) || undefined;
  const data_emissao_raw = findValueByKeys(parsed, ['dhEmi', 'dEmi', 'dhEvento']) || undefined;
  const data_emissao = data_emissao_raw ? String(data_emissao_raw) : undefined;

  return {
    chave: chave ? String(chave) : undefined,
    emitente_nome: emitente_nome ? String(emitente_nome) : undefined,
    emitente_cnpj: emitente_cnpj || undefined,
    destinatario_nome: destinatario_nome ? String(destinatario_nome) : undefined,
    destinatario_cnpj: destinatario_cnpj || undefined,
    valor_total: valor_total ? String(valor_total) : undefined,
    data_emissao: data_emissao || undefined,
    raw: parsed
  };
}

export function identifyOperation(parsed: ParsedNfe, clients: { id: number; name: string; cnpj: string }[]): 'entrada' | 'saida' | 'nao_identificado' {
  const clientsCnpjs = (clients || []).map(c => normalizeCnpj(c.cnpj));
  if (parsed.destinatario_cnpj && clientsCnpjs.includes(parsed.destinatario_cnpj)) return 'entrada';
  if (parsed.emitente_cnpj && clientsCnpjs.includes(parsed.emitente_cnpj)) return 'saida';
  return 'nao_identificado';
}

export default { parseXml, identifyOperation, normalizeCnpj };


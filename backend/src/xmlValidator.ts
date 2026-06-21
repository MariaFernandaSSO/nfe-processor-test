import { XMLParser } from 'fast-xml-parser';
import { findObjectByKeys, findValueByKeys } from './nfeProcessor';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateNfeXml(xml: string): ValidationResult {
  const errors: string[] = [];

  let parsed: any;
  try {
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
    parsed = parser.parse(xml);
  } catch {
    return { valid: false, errors: ['XML malformed or invalid'] };
  }

  if (!parsed || typeof parsed !== 'object' || Object.keys(parsed).length === 0) {
    return { valid: false, errors: ['XML malformed or invalid'] };
  }

  const chave = findValueByKeys(parsed, ['chNFe', 'chave']);
  if (!chave) {
    errors.push('Missing chNFe (NF-e key)');
  }

  const emitObj = findObjectByKeys(parsed, ['emit', 'Emit']);
  if (!emitObj) {
    errors.push('Missing emitente (emit)');
  } else {
    const emitCnpj = findValueByKeys(emitObj, ['CNPJ', 'cnpj']);
    if (!emitCnpj) errors.push('Missing emitente CNPJ');
    const emitNome = findValueByKeys(emitObj, ['xNome', 'xnome', 'nome']);
    if (!emitNome) errors.push('Missing emitente name');
  }

  const destObj = findObjectByKeys(parsed, ['dest', 'Dest']);
  if (!destObj) {
    errors.push('Missing destinatario (dest)');
  } else {
    const destCnpj = findValueByKeys(destObj, ['CNPJ', 'cnpj']);
    if (!destCnpj) errors.push('Missing destinatario CNPJ');
    const destNome = findValueByKeys(destObj, ['xNome', 'xnome', 'nome']);
    if (!destNome) errors.push('Missing destinatario name');
  }

  const valor = findValueByKeys(parsed, ['vNF', 'vProd', 'valor', 'vTot']);
  if (!valor) errors.push('Missing total value (vNF/vProd)');

  return { valid: errors.length === 0, errors };
}

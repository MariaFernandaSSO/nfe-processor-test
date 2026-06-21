import { describe, expect, test } from '@jest/globals';
import { parseXml, identifyOperation, normalizeCnpj } from '../src/nfeProcessor';

const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc>
  <NFe>
    <infNFe>
      <ide>
        <dhEmi>2021-09-01T12:00:00-03:00</dhEmi>
      </ide>
      <emit>
        <CNPJ>12.345.678/0001-99</CNPJ>
        <xNome>Empresa Remetente</xNome>
      </emit>
      <dest>
        <CNPJ>98.765.432/0001-55</CNPJ>
        <xNome>Empresa Destinatario</xNome>
      </dest>
      <total>
        <ICMSTot>
          <vNF>1234.56</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
  <chNFe>12345678901234567890123456789012345678901234</chNFe>
</nfeProc>`;

describe('nfeProcessor', () => {
  test('parseXml extracts fields correctly', () => {
    const p = parseXml(sampleXml);
    expect(p.chave).toBe('12345678901234567890123456789012345678901234');
    expect(p.emitente_nome).toBe('Empresa Remetente');
    expect(p.emitente_cnpj).toBe(normalizeCnpj('12.345.678/0001-99'));
    expect(p.destinatario_nome).toBe('Empresa Destinatario');
    expect(p.destinatario_cnpj).toBe(normalizeCnpj('98.765.432/0001-55'));
    expect(p.valor_total).toBe('1234.56');
    expect(p.data_emissao).toBeDefined();
  });

  test('identifyOperation returns entrada when destinatario is internal', () => {
    const p = parseXml(sampleXml);
    const clients = [{ id: 1, name: 'Cliente X', cnpj: '98765432000155' }];
    const op = identifyOperation(p as any, clients as any);
    expect(op).toBe('entrada');
  });

  test('identifyOperation returns saida when emitente is internal', () => {
    const p = parseXml(sampleXml);
    const clients = [{ id: 1, name: 'Cliente X', cnpj: '12345678000199' }];
    const op = identifyOperation(p as any, clients as any);
    expect(op).toBe('saida');
  });

  test('identifyOperation returns nao_identificado when none match', () => {
    const p = parseXml(sampleXml);
    const clients: any[] = [];
    const op = identifyOperation(p as any, clients);
    expect(op).toBe('nao_identificado');
  });
});



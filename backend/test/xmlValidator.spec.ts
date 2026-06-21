import { describe, expect, test } from '@jest/globals';
import { validateNfeXml } from '../src/xmlValidator';

const validXml = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc>
  <NFe>
    <infNFe>
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

describe('xmlValidator', () => {
  test('valid XML passes validation', () => {
    const result = validateNfeXml(validXml);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('invalid XML string returns error', () => {
    const result = validateNfeXml('not xml');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('XML malformed or invalid');
  });

  test('missing chNFe returns error', () => {
    const xml = validXml.replace('<chNFe>12345678901234567890123456789012345678901234</chNFe>', '');
    const result = validateNfeXml(xml);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing chNFe (NF-e key)');
  });

  test('missing emit returns error', () => {
    const xml = validXml.replace(/<emit>[\s\S]*?<\/emit>/, '');
    const result = validateNfeXml(xml);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing emitente (emit)');
  });

  test('missing dest returns error', () => {
    const xml = validXml.replace(/<dest>[\s\S]*?<\/dest>/, '');
    const result = validateNfeXml(xml);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing destinatario (dest)');
  });

  test('missing vNF returns error', () => {
    const xml = validXml.replace(/<vNF>.*?<\/vNF>/, '');
    const result = validateNfeXml(xml);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing total value (vNF/vProd)');
  });

  test('missing emitente CNPJ returns error', () => {
    const xml = validXml.replace(/<CNPJ>12\.345\.678\/0001-99<\/CNPJ>/, '');
    const result = validateNfeXml(xml);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing emitente CNPJ');
  });
});

import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import express from 'express';
import request from 'supertest';

const mockFindMany = jest.fn<any>();
jest.mock('../src/prisma', () => ({
  nfe: { findMany: mockFindMany }
}));

const nfeRoutes = require('../src/nfeRoutes').default;

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(nfeRoutes);
  return app;
}

describe('nfeRoutes', () => {
  beforeEach(() => {
    mockFindMany.mockReset();
  });

  test('GET /api/v1/nfe returns list of NF-es', async () => {
    mockFindMany.mockResolvedValue([{ id: '1', chave: 'abc', operacao: 'entrada' }]);

    const res = await request(createApp()).get('/api/v1/nfe');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  test('GET /api/v1/nfe/resumo returns grouped data', async () => {
    mockFindMany.mockResolvedValue([
      { emitente_nome: 'Fornecedor', emitente_cnpj: null, destinatario_nome: 'Empresa ABC', destinatario_cnpj: '12345678000199', operacao: 'entrada' },
      { emitente_nome: 'Empresa ABC', emitente_cnpj: '12345678000199', destinatario_nome: 'Cliente X', destinatario_cnpj: null, operacao: 'saida' },
      { emitente_nome: 'Fornecedor', emitente_cnpj: null, destinatario_nome: 'Empresa ABC', destinatario_cnpj: '12345678000199', operacao: 'entrada' },
      { emitente_nome: 'Empresa XPTO', emitente_cnpj: '98765432000155', destinatario_nome: 'Cliente Y', destinatario_cnpj: null, operacao: 'saida' }
    ]);

    const res = await request(createApp()).get('/api/v1/nfe/resumo');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { cliente: 'Empresa ABC', compra: 2, venda: 1 },
      { cliente: 'Empresa XPTO', compra: 0, venda: 1 }
    ]);
  });

  test('GET /api/v1/nfe/resumo returns empty array when no data', async () => {
    mockFindMany.mockResolvedValue([]);

    const res = await request(createApp()).get('/api/v1/nfe/resumo');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('GET /api/v1/nfe/nao-identificados returns unidentified list', async () => {
    mockFindMany.mockResolvedValue([
      {
        emitente_nome: 'Ext', emitente_cnpj: '111',
        destinatario_nome: 'Ext2', destinatario_cnpj: '222',
        operacao: 'nao_identificado'
      }
    ]);

    const res = await request(createApp()).get('/api/v1/nfe/nao-identificados');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].emitente_nome).toBe('Ext');
    expect(res.body[0].motivo).toBeDefined();
  });

  test('GET /api/v1/nfe/nao-identificados returns empty array when none', async () => {
    mockFindMany.mockResolvedValue([]);

    const res = await request(createApp()).get('/api/v1/nfe/nao-identificados');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

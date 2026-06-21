import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import prisma from './prisma';
import { normalizeCnpj } from './nfeProcessor';

const router = Router();

let clientsByCnpj: Record<string, string> | null = null;

function getClientsMap(): Record<string, string> {
  if (clientsByCnpj) return clientsByCnpj;
  clientsByCnpj = {};
  const filePath = path.join(__dirname, '..', 'data', 'clients.json');
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const clients = JSON.parse(raw).clients || [];
    for (const c of clients) {
      const normalized = normalizeCnpj(c.cnpj);
      if (normalized) clientsByCnpj[normalized] = c.name;
    }
  } catch {
    // file not found, proceed with empty map
  }
  return clientsByCnpj;
}

/**
 * @openapi
 * /api/v1/nfe:
 *   get:
 *     summary: List all processed NF-es
 *     tags: [NF-e]
 *     responses:
 *       200:
 *         description: List of NF-es
 */
router.get('/api/v1/nfe', async (_req: Request, res: Response) => {
  const nfes = await prisma.nfe.findMany({ orderBy: { createdAt: 'desc' } });
  return res.json(nfes);
});

/**
 * @openapi
 * /api/v1/nfe/resumo:
 *   get:
 *     summary: Get summary by client (compra/venda counts)
 *     tags: [NF-e]
 *     responses:
 *       200:
 *         description: Summary by client
 */
router.get('/api/v1/nfe/resumo', async (_req: Request, res: Response) => {
  const nfes = await prisma.nfe.findMany({
    where: { operacao: { in: ['entrada', 'saida'] } }
  });

  const clientMap = getClientsMap();
  const resumo: Record<string, { compra: number; venda: number }> = {};

  for (const nfe of nfes) {
    let nome: string | null = null;
    if (nfe.operacao === 'entrada' && nfe.destinatario_cnpj) {
      nome = clientMap[normalizeCnpj(nfe.destinatario_cnpj) || ''] || nfe.destinatario_nome;
    } else if (nfe.operacao === 'saida' && nfe.emitente_cnpj) {
      nome = clientMap[normalizeCnpj(nfe.emitente_cnpj) || ''] || nfe.emitente_nome;
    }
    if (!nome) nome = 'Desconhecido';
    if (!resumo[nome]) resumo[nome] = { compra: 0, venda: 0 };
    if (nfe.operacao === 'entrada') resumo[nome].compra++;
    if (nfe.operacao === 'saida') resumo[nome].venda++;
  }

  return res.json(Object.entries(resumo).map(([cliente, dados]) => ({
    cliente,
    compra: dados.compra,
    venda: dados.venda
  })));
});

/**
 * @openapi
 * /api/v1/nfe/nao-identificados:
 *   get:
 *     summary: List unidentified NF-es
 *     tags: [NF-e]
 *     responses:
 *       200:
 *         description: List of unidentified NF-es
 */
router.get('/api/v1/nfe/nao-identificados', async (_req: Request, res: Response) => {
  const nfes = await prisma.nfe.findMany({
    where: { operacao: 'nao_identificado' },
    orderBy: { createdAt: 'desc' }
  });

  const result = nfes.map(nfe => ({
    emitente_nome: nfe.emitente_nome,
    emitente_cnpj: nfe.emitente_cnpj,
    destinatario_nome: nfe.destinatario_nome,
    destinatario_cnpj: nfe.destinatario_cnpj,
    motivo: 'Nenhum cliente interno identificado como emitente ou destinatário'
  }));

  return res.json(result);
});

export default router;

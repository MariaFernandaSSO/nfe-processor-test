import { Worker } from 'bullmq';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import IORedis from 'ioredis';
import prisma from './prisma';
import { parseXml, identifyOperation, normalizeCnpj } from './nfeProcessor';

const redisUrl = process.env.REDIS_URL || undefined;

const clientsFile = path.join(__dirname, '..', 'data', 'clients.json');
let clients: { id: number; name: string; cnpj: string }[] = [];
if (fs.existsSync(clientsFile)) {
  try {
    const raw = fs.readFileSync(clientsFile, 'utf-8');
    const parsed = JSON.parse(raw);
    clients = parsed.clients || [];
  } catch (err) {
    console.warn('Could not read clients.json', err);
  }
}

const connection = redisUrl
  ? new IORedis(redisUrl, { maxRetriesPerRequest: null })
  : { host: process.env.REDIS_HOST || '127.0.0.1', port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379, maxRetriesPerRequest: null };

const worker = new Worker(
  'xml-processing',
  async job => {
    const data = job.data as { fileName: string; xml: string };
    let parsed: any = {};
    try {
      parsed = parseXml(data.xml);
    } catch (err) {
      console.error('Failed to parse XML for', data.fileName, err);
      throw err;
    }

    const hash = crypto.createHash('sha256').update(data.xml, 'utf8').digest('hex');
    if (parsed.chave) {
      try {
        const existing = await prisma.nfe.findUnique({ where: { chave: parsed.chave } as any });
        if (existing) {
          console.log('NFe with chave already exists, skipping:', parsed.chave);
          return { skipped: true };
        }
      } catch (err) {
        console.warn('Failed to check existing NFe by chave', err);
      }
    }
    try {
      const existingByHash = await prisma.nfe.findUnique({ where: { xml_hash: hash } as any });
      if (existingByHash) {
        console.log('NFe with same xml_hash already exists, skipping:', hash);
        return { skipped: true };
      }
    } catch (err) {
      console.warn('Failed to check existing NFe by xml_hash', err);
    }

    const operacao = identifyOperation(parsed, clients as any);
    try {
      await prisma.nfe.create({
        data: {
          chave: parsed.chave || undefined,
          xml_hash: hash,
          emitente_nome: parsed.emitente_nome || undefined,
          emitente_cnpj: parsed.emitente_cnpj || undefined,
          destinatario_nome: parsed.destinatario_nome || undefined,
          destinatario_cnpj: parsed.destinatario_cnpj || undefined,
          valor_total: parsed.valor_total ? Number(parsed.valor_total) : undefined,
          data_emissao: parsed.data_emissao ? new Date(parsed.data_emissao) : undefined,
          operacao,
          raw_xml: data.xml
        }
      });
    } catch (err: any) {
      const msg = (err && err.message) || String(err);
      if (msg.includes('duplicate key') || msg.includes('unique')) {
        console.log('Unique constraint violation while inserting NFe, skipping (likely duplicate)');
        return { skipped: true };
      }
      console.error('Failed to persist NFe for', data.fileName, err);
      throw err;
    }

    console.log('Processed and persisted', data.fileName, 'operacao=', operacao);
    return { ok: true };
  },
  { connection } as any
);

worker.on('completed', job => console.log('Job completed', job.id));
worker.on('failed', (job, err) => console.error('Job failed', job?.id, err));

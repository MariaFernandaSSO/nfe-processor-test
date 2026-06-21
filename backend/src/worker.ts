import { Worker } from 'bullmq';
import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';
import path from 'path';

const redisUrl = process.env.REDIS_URL || undefined;

const worker = new Worker(
  'xml-processing',
  async job => {
    const data = job.data as { fileName: string; xml: string };
    // very basic parse using fast-xml-parser
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
    let parsed: any = {};
    try {
      parsed = parser.parse(data.xml);
    } catch (err) {
      console.error('Failed to parse XML for', data.fileName, err);
      throw err;
    }

    // For now, store the parsed JSON to disk (for inspection). Later replace with DB persistence.
    const outDir = path.join(__dirname, '..', 'data', 'processed');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const outFile = path.join(outDir, `${Date.now()}-${data.fileName}.json`);
    fs.writeFileSync(outFile, JSON.stringify({ fileName: data.fileName, parsed }, null, 2));

    console.log('Processed', data.fileName, ' ->', outFile);
    return { ok: true };
  },
  redisUrl ? { connection: redisUrl } : undefined
);

worker.on('completed', job => console.log('Job completed', job.id));
worker.on('failed', (job, err) => console.error('Job failed', job?.id, err));


import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { xmlQueue } from './queue';
import path from 'path';
import fs from 'fs';

const upload = multer({ storage: multer.memoryStorage() });
const app = express();
app.use(cors());
app.use(express.json());

// Simple clients mock endpoint (reads data/clients.json)
app.get('/api/v1/clients', (req, res) => {
  const file = path.join(__dirname, '..', 'data', 'clients.json');
  if (!fs.existsSync(file)) return res.status(500).json({ error: 'clients data not found' });
  const raw = fs.readFileSync(file, 'utf-8');
  const clients = JSON.parse(raw);
  return res.json(clients);
});

// Upload endpoint: accepts multiple files (field name: files)
app.post('/api/v1/xml/upload', upload.array('files'), async (req, res) => {
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0) return res.status(400).json({ error: 'No files provided' });

  const jobs: { fileName: string; jobId: string }[] = [];

  for (const file of files) {
    const xmlContent = file.buffer.toString('utf-8');
    // enqueue job
    const job = await xmlQueue.add('process-xml', {
      fileName: file.originalname,
      xml: xmlContent
    });
    jobs.push({ fileName: file.originalname, jobId: job.id?.toString() || '' });
  }

  return res.status(202).json({ message: 'Files queued', jobs });
});

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${port}`);
});


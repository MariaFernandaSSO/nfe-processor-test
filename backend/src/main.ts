import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { xmlQueue as processingQueue } from './queue';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import nfeRoutes from './nfeRoutes';
import { errorHandler } from './errorMiddleware';
import { validateNfeXml } from './xmlValidator';

const upload = multer({ storage: multer.memoryStorage() });
const app = express();
app.use(cors());
app.use(express.json());

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'NFe Processor API', version: '1.0.0' },
    servers: [{ url: '/api/v1' }]
  },
  apis: [path.join(__dirname, '**/*.ts')]
});
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /api/v1/xml/upload:
 *   post:
 *     summary: Upload XML files for processing
 *     tags: [XML]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       202:
 *         description: Files queued successfully
 *       400:
 *         description: No files provided
 */
app.post('/api/v1/xml/upload', upload.array('files'), async (req, res) => {
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0) {
    res.status(400).json({ error: 'No files provided' });
    return;
  }

  const jobs: { fileName: string; jobId: string }[] = [];
  const errors: { fileName: string; errors: string[] }[] = [];

  for (const file of files) {
    const xmlContent = file.buffer.toString('utf-8');
    const validation = validateNfeXml(xmlContent);
    if (!validation.valid) {
      errors.push({ fileName: file.originalname, errors: validation.errors });
      continue;
    }
    const job = await processingQueue.add(
      'process-xml',
      {
        fileName: file.originalname,
        xml: xmlContent
      },
      {
        attempts: 5,
        backoff: { type: 'exponential', delay: 1000 }
      }
    );
    jobs.push({ fileName: file.originalname, jobId: job.id?.toString() || '' });
  }

  const statusCode = jobs.length > 0 ? 202 : 400;
  res.status(statusCode).json({ message: 'Files queued', jobs, errors: errors.length > 0 ? errors : undefined });
});

app.use(nfeRoutes);
app.use(errorHandler);

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});

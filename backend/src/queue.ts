import { Queue } from 'bullmq';

const connection = {
  connection: {
    // read from env or use default
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379
  }
};

// If REDIS_URL is provided prefer that
const redisUrl = process.env.REDIS_URL;

export const xmlQueue = new Queue('xml-processing', redisUrl ? { connection: redisUrl } : connection);


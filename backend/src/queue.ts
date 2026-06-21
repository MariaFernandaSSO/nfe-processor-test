import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL;
let connection: any;
if (redisUrl) {
  connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
} else {
  connection = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
    maxRetriesPerRequest: null
  };
}

export const xmlQueue = new Queue('xml-processing', { connection } as any);

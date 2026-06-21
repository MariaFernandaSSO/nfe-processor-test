import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL;
const connection = redisUrl
  ? new IORedis(redisUrl)
  : {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379
    };

export const xmlQueue = new Queue('xml-processing', { connection } as any);


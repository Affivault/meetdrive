import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.js';

export let inboxSyncQueue: Queue | null = null;

if (redisConnection) {
  inboxSyncQueue = new Queue('inbox-sync', {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 2,
      backoff: { type: 'fixed', delay: 10000 },
      removeOnComplete: 100,
      removeOnFail: 500,
    },
  });

  // A Queue is an EventEmitter — an unhandled 'error' (e.g. Redis unreachable
  // or over quota) would otherwise crash the process. Log and keep running.
  inboxSyncQueue.on('error', (err) => console.error('[Queue:inbox-sync] error:', err.message));
}

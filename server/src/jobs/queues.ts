import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.js';

export let emailQueue: Queue | null = null;
export let inboxSyncQueue: Queue | null = null;

if (redisConnection) {
  emailQueue = new Queue('email-sending', {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: 1000,
      removeOnFail: 5000,
    },
  });

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
  emailQueue.on('error', (err) => console.error('[Queue:email-sending] error:', err.message));
  inboxSyncQueue.on('error', (err) => console.error('[Queue:inbox-sync] error:', err.message));
}

import { resetDailySendCounts, recalculateBounceRates } from '../../services/sse.service.js';

/**
 * SSE Maintenance Scheduler
 *
 * Runs the daily send-count reset and bounce-rate recalculation on an
 * internal timer. These operate across every tenant's smtp_accounts, so
 * they must never be reachable via an authenticated-user HTTP route —
 * only this in-process scheduler triggers them.
 */

let lastResetDay: string | null = null;
let intervalId: ReturnType<typeof setInterval> | null = null;

async function tick() {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== lastResetDay) {
    lastResetDay = today;
    try {
      const count = await resetDailySendCounts();
      if (count > 0) console.log(`[SSE Maintenance] Reset daily send counts for ${count} account(s)`);
    } catch (err: any) {
      console.error('[SSE Maintenance] resetDailySendCounts failed:', err.message);
    }
  }

  try {
    await recalculateBounceRates();
  } catch (err: any) {
    console.error('[SSE Maintenance] recalculateBounceRates failed:', err.message);
  }
}

/**
 * Start the SSE maintenance scheduler. Checks hourly whether the daily
 * reset is due (UTC day boundary) and recalculates bounce rates each tick.
 */
export function startSseMaintenanceScheduler() {
  console.log('[SSE Maintenance] Scheduler started (hourly interval)');

  tick();
  intervalId = setInterval(tick, 60 * 60 * 1000);

  return {
    stop: () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        console.log('[SSE Maintenance] Scheduler stopped');
      }
    },
  };
}

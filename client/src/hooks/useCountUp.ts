import { useEffect, useRef, useState } from 'react';

/**
 * Animate a number from its previous value up to `target` with an ease-out
 * curve. Respects prefers-reduced-motion (jumps straight to the value).
 * Returns the live value to render; pass it through your own formatter.
 */
export function useCountUp(target: number, durationMs = 900): number {
  const [value, setValue] = useState(target);
  // Tracks the latest on-screen value so an interrupted animation resumes from
  // where it visually is, instead of snapping back to a stale baseline.
  const valueRef = useRef(target);
  const rafRef = useRef<number>();

  useEffect(() => {
    const reduce = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || target === valueRef.current) {
      valueRef.current = target;
      setValue(target);
      return;
    }

    const from = valueRef.current;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const next = from + (target - from) * eased;
      valueRef.current = next;
      setValue(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        valueRef.current = target;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, durationMs]);

  return value;
}

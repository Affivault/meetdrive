import { useCountUp } from '../../hooks/useCountUp';

/**
 * Renders a number that ease-animates from its previous value to the new one,
 * passed through your own formatter. Safe to use inline in JSX (the hook lives
 * inside this component, not in the caller).
 */
export function CountUp({ value, format, durationMs }: {
  value: number;
  format: (n: number) => string;
  durationMs?: number;
}) {
  const animated = useCountUp(value, durationMs);
  return <>{format(animated)}</>;
}

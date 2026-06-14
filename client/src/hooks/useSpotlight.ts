import { useCallback } from 'react';

/**
 * Returns an onMouseMove handler that writes the pointer position into
 * CSS vars (--mx / --my) on the element, driving the `.spotlight` glow.
 */
export function useSpotlight() {
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, []);
  return { onMouseMove };
}

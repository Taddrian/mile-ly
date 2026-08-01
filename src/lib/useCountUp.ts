'use client';

import { useEffect, useRef, useState } from 'react';

export function useCountUp(target: number, durationMs = 700): number {
  const [value, setValue] = useState(0);
  // Tracks the value actually painted so far (not just the intended target), so
  // a dev-mode Strict Mode double-invoke (mount → cleanup → mount again, before
  // any frame runs) can't skip the animation by prematurely marking it "done".
  const displayedRef = useRef(0);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const from = displayedRef.current;
    const to = target;
    if (from === to) return;

    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const t = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const next = from + (to - from) * eased;
      displayedRef.current = next;
      setValue(next);
      if (t < 1) frameRef.current = requestAnimationFrame(tick);
    }
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, durationMs]);

  return value;
}

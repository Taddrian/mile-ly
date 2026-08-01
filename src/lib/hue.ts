import type { CSSProperties } from 'react';

// Sets the --node-deep/--node-ring/--node-shadow custom properties consumed by
// the .node-candy / .quest-banner utility classes in globals.css, so any themed
// element can flood teal or coral just by spreading this onto its style prop.
export function hueVars(state: 'teal' | 'coral'): CSSProperties {
  const vars =
    state === 'coral'
      ? { '--node-deep': 'var(--hue-neg-deep)', '--node-ring': 'var(--hue-neg-ring)', '--node-shadow': 'var(--hue-neg-shadow)' }
      : { '--node-deep': 'var(--hue-pos-deep)', '--node-ring': 'var(--hue-pos-ring)', '--node-shadow': 'var(--hue-pos-shadow)' };
  return vars as CSSProperties;
}

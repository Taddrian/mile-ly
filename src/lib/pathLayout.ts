// Pure layout math for the Home-screen "adventure path" — positions N nodes in a
// zig-zag down the screen. Percent-based (not px) so it scales inside both the
// mobile and desktop content widths AppShell already uses.

export interface PathNodePosition {
  xPct: number; // 0-100, horizontal center of the node as % of container width
  y: number;    // px, top offset of the node within the path container
}

export const MAX_PATH_NODES = 5;

const DEFAULT_AMPLITUDE_PCT = 30;
const DEFAULT_Y_SPACING = 116;

export function layoutPathNodes(
  n: number,
  opts?: { amplitudePct?: number; ySpacing?: number }
): PathNodePosition[] {
  const amplitude = opts?.amplitudePct ?? DEFAULT_AMPLITUDE_PCT;
  const spacing = opts?.ySpacing ?? DEFAULT_Y_SPACING;

  return Array.from({ length: n }, (_, i) => {
    // 0, +1, -1, +1, -1, ... — first node centered, then alternating sides
    const dir = i === 0 ? 0 : i % 2 === 1 ? 1 : -1;
    return { xPct: 50 + dir * amplitude, y: i * spacing };
  });
}

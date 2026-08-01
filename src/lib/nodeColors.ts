import type { CSSProperties } from 'react';

// A small candy-color palette for path nodes, so the path reads as a colorful
// trail instead of every node sharing the single budget-status hue. Assigned by
// each node's position along the path (not a label hash) so a handful of nodes
// always land on distinct colors instead of risking two nodes hashing to the
// same bucket.
const PALETTE = [
  { deep: '#129C8C', ring: '#3CC4B0', shadow: 'rgba(18,156,140,0.3)' },   // teal
  { deep: '#E8734F', ring: '#FF9A70', shadow: 'rgba(232,115,79,0.35)' }, // coral
  { deep: '#2E6FAE', ring: '#5FB2F2', shadow: 'rgba(46,111,174,0.35)' }, // blue
  { deep: '#B0862B', ring: '#F0B429', shadow: 'rgba(176,134,43,0.35)' }, // gold
  { deep: '#7C5CB0', ring: '#B689EC', shadow: 'rgba(124,92,176,0.35)' }, // lilac
  { deep: '#C24D72', ring: '#F4849E', shadow: 'rgba(194,77,114,0.35)' }, // pink
];

export function nodeHueVars(index: number): CSSProperties {
  const hue = PALETTE[index % PALETTE.length];
  return { '--node-deep': hue.deep, '--node-ring': hue.ring, '--node-shadow': hue.shadow } as CSSProperties;
}

'use client';

import { useMemo } from 'react';
import { buildPixelBoxShadow } from '@/lib/pixelSprite';
import { RoomSlot } from '@/lib/roomCatalog';

// Small pixel-art furniture, same box-shadow-grid technique as Milo. Each shape
// is shared across every item in its slot — items differ only by recoloring
// (colors prop), exactly like Milo's wardrobe overrides.
const BED_SPRITE = [
  'WWWW............',
  'WWWWPP..BBBBBBBB',
  'WWWW....BBBBBBBB',
  'WWWWBBBBBBBBBBBB',
  '....BBBBBBBBBBBB',
  '....BBBBBBBBBBBB',
  'F..............F',
];

const RUG_SPRITE = [
  '..RRRRRRRRRRRR..',
  '.RRrrrrrrrrrrRR.',
  'RRrrrrrrrrrrrrRR',
  'RRrrrrrrrrrrrrRR',
  '.RRrrrrrrrrrrRR.',
  '..RRRRRRRRRRRR..',
];

const PLANT_SPRITE = [
  '..gg..gg..',
  '.gggggggg.',
  'gggggggggg',
  '.gggggggg.',
  '..gggggg..',
  '...gggg...',
  '....gg....',
  '....gg....',
  '..PPPPPP..',
  '.PPPPPPPP.',
  '.PPPPPPPP.',
  '..PPPPPP..',
];

const SHAPES: Record<RoomSlot, { sprite: string[]; pixel: number }> = {
  bed: { sprite: BED_SPRITE, pixel: 3.8 },
  rug: { sprite: RUG_SPRITE, pixel: 3.8 },
  plant: { sprite: PLANT_SPRITE, pixel: 4.8 },
};

interface FurnitureSpriteProps {
  slot: RoomSlot;
  colors: Record<string, string>;
  size?: number;
}

export default function FurnitureSprite({ slot, colors, size = 56 }: FurnitureSpriteProps) {
  const { sprite, pixel } = SHAPES[slot];
  const cols = sprite[0].length;
  const rows = sprite.length;
  const boxShadow = useMemo(() => buildPixelBoxShadow(sprite, colors, pixel), [sprite, colors, pixel]);

  return (
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: cols * pixel, height: rows * pixel }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: pixel, height: pixel, background: 'transparent', boxShadow }} />
      </div>
    </div>
  );
}

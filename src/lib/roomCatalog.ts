// Static catalog for Milo's Room — same "config lives in code, not the
// database" pattern as SEA_CURRENCIES in src/lib/currency.ts. Items/pricing
// match the Claude Design handoff (design-handoff/Milos Room Scene.dc.html)
// verbatim — `colors` keys are the exact CSS custom-property suffixes the
// shared SVG symbols in roomSprites.tsx expect (e.g. `f1` → `--f1`), so a
// shop variant is purely a var swap on the <use> wrapper, never new geometry.

export type RoomSlot = 'bed' | 'rug' | 'plant';

export interface FurnitureItem {
  id: string;
  slot: RoomSlot;
  name: string;
  cost: number;
  colors: Record<string, string>;
}

export interface WardrobeItem {
  id: string;
  category: 'outfit';
  name: string;
  cost: number;
  // Overrides merged onto MiloFairy's SPRITE_COLORS letter->hex map.
  colorOverrides: Record<string, string>;
}

// Free — every room starts furnished with these so it's never blank; Sparks
// buy upgrades/swaps on top, not the basics.
export const STARTER_ITEM_IDS: Record<RoomSlot, string> = {
  bed: 'bed_pine',
  rug: 'rug_jute',
  plant: 'plant_sprout',
};

export const FURNITURE_ITEMS: FurnitureItem[] = [
  // Bed — one shared shape, frame (f1/f2/f3) + blanket (b1/b2/b3) + pillow (p/psh) recolors.
  { id: 'bed_pine',     slot: 'bed', name: 'Pine Bed',     cost: 0,   colors: {} },
  {
    id: 'bed_tidepool', slot: 'bed', name: 'Tidepool Bed', cost: 240,
    colors: { b1: '#e0f2ee', b2: '#a8dcd3', b3: '#7fc6ba', p: '#eef7f2', psh: '#cfe6dd' },
  },
  {
    id: 'bed_cloud',    slot: 'bed', name: 'Cloud Bed',    cost: 320,
    colors: {
      f1: '#c1c9dc', f2: '#dde3f0', f3: '#a3aec9',
      b1: '#f6f7fb', b2: '#dbe1f0', b3: '#c9d2ea', p: '#ffffff', psh: '#dfe5f1',
    },
  },

  // Rug — field (r1) + border (r2); "Honey Round" reuses the same symbol with
  // an alternate round-rug overlay toggled on via `show-round`.
  { id: 'rug_jute',    slot: 'rug', name: 'Jute Rug',     cost: 0,   colors: {} },
  {
    id: 'rug_berry',    slot: 'rug', name: 'Berry Stripe', cost: 120,
    colors: { r1: '#f6d9d4', r2: '#c56b70', r3: '#e08f92' },
  },
  {
    id: 'rug_honey',    slot: 'rug', name: 'Honey Round',  cost: 180,
    colors: { r1: '#f6dfa3', r2: '#cf9a3a', 'show-round': 'inline' },
  },

  // Plant — same pot always; fern/cactus swap which foliage layer is shown,
  // each layer carries its own baked-in color (no per-item overrides needed).
  { id: 'plant_sprout', slot: 'plant', name: "Lil' Sprout", cost: 0,   colors: {} },
  {
    id: 'plant_fern',   slot: 'plant', name: 'Window Fern', cost: 90,
    colors: { 'pl-plant': 'none', 'pl-fern': 'inline' },
  },
  {
    id: 'plant_cactus', slot: 'plant', name: 'Desert Pal',  cost: 140,
    colors: { 'pl-plant': 'none', 'pl-cactus': 'inline' },
  },
];

// Wardrobe overrides key onto MiloFairy's real SPRITE_COLORS letters, not the
// design handoff's semantic names — mapping: hood → H + D (both currently
// plain white, recolor together so the hood reads as one region), hood
// shadow → N, outer/inner wing → W / w.
export const WARDROBE_ITEMS: WardrobeItem[] = [
  { id: 'outfit_classic', category: 'outfit', name: 'Classic', cost: 0,   colorOverrides: {} },
  {
    id: 'outfit_seafoam', category: 'outfit', name: 'Seafoam', cost: 200,
    colorOverrides: { H: '#bfe6dd', D: '#bfe6dd', N: '#96cabd', W: '#57b3a8', w: '#2f7f76' },
  },
  {
    id: 'outfit_sunset',  category: 'outfit', name: 'Sunset',  cost: 200,
    colorOverrides: { H: '#f0a894', D: '#f0a894', N: '#d88a76', W: '#e5b04c', w: '#c98a2e' },
  },
];

export const ROOM_SLOT_LABELS: Record<RoomSlot, string> = {
  bed: 'Bed',
  rug: 'Rug',
  plant: 'Plant',
};

export function findFurniture(id: string): FurnitureItem | undefined {
  return FURNITURE_ITEMS.find((i) => i.id === id);
}

export function findWardrobe(id: string): WardrobeItem | undefined {
  return WARDROBE_ITEMS.find((i) => i.id === id);
}

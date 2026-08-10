// Static catalog for Milo's Room (idle-game Phase 1) — same "config lives in code,
// not the database" pattern as SEA_CURRENCIES in src/lib/currency.ts. Extending the
// room later just means adding rows here.

export type RoomSlot = 'bed' | 'rug' | 'plant';

export interface FurnitureItem {
  id: string;
  slot: RoomSlot;
  name: string;
  cost: number;
  // Full letter->hex color set for this item's shape (src/components/decor/roomSprites.tsx).
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

// Free — every room starts furnished with these so it's never blank; Sparks buy
// upgrades/swaps on top, not the basics.
export const STARTER_ITEM_IDS: Record<RoomSlot, string> = {
  bed: 'bed_starter',
  rug: 'rug_starter',
  plant: 'plant_starter',
};

export const FURNITURE_ITEMS: FurnitureItem[] = [
  { id: 'bed_starter',     slot: 'bed',   name: 'Simple Bed',     cost: 0,  colors: { W: '#8b5e3c', P: '#ffffff', B: '#d98c54', F: '#4a3324' } },
  { id: 'bed_cozy_teal',   slot: 'bed',   name: 'Cozy Teal Bed',  cost: 40, colors: { W: '#7a5c42', P: '#f5f0e6', B: '#0d9488', F: '#4a3324' } },
  { id: 'bed_cloud_white', slot: 'bed',   name: 'Cloud Bed',      cost: 90, colors: { W: '#d7cbb5', P: '#ffffff', B: '#f5f7fb', F: '#a99b7a' } },

  { id: 'rug_starter',     slot: 'rug',   name: 'Plain Rug',      cost: 0,  colors: { R: '#8a9bb0', r: '#c3d1e0' } },
  { id: 'rug_stripe',      slot: 'rug',   name: 'Striped Rug',    cost: 30, colors: { R: '#e0568c', r: '#f2a6cf' } },
  { id: 'rug_round_gold',  slot: 'rug',   name: 'Round Gold Rug', cost: 70, colors: { R: '#c99318', r: '#f0b429' } },

  { id: 'plant_starter',   slot: 'plant', name: 'Small Plant',    cost: 0,  colors: { g: '#8fbfa0', P: '#a99b7a' } },
  { id: 'plant_fern',      slot: 'plant', name: 'Little Fern',    cost: 25, colors: { g: '#5c9a5c', P: '#c98a5a' } },
  { id: 'plant_cactus',    slot: 'plant', name: 'Potted Cactus',  cost: 60, colors: { g: '#7db87d', P: '#b06a4a' } },
];

export const WARDROBE_ITEMS: WardrobeItem[] = [
  { id: 'raincoat_yellow', category: 'outfit', name: 'Yellow Raincoat', cost: 80,  colorOverrides: { S: '#ffd166', B: '#f0b429' } },
  { id: 'party_pink',      category: 'outfit', name: 'Party Pink',      cost: 80,  colorOverrides: { S: '#ff8fc8', B: '#e85fa8' } },
  { id: 'night_navy',      category: 'outfit', name: 'Night Cape',      cost: 120, colorOverrides: { W: '#4a5db8', w: '#2f3d8f', S: '#dfe3f5' } },
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

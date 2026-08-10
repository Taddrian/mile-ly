// Static catalog for Milo's Room (idle-game Phase 1) — same "config lives in code,
// not the database" pattern as SEA_CURRENCIES in src/lib/currency.ts. Extending the
// room later just means adding rows here.

export type RoomSlot = 'bed' | 'rug' | 'plant';

export interface FurnitureItem {
  id: string;
  slot: RoomSlot;
  name: string;
  cost: number;
  color: string;
}

export interface WardrobeItem {
  id: string;
  category: 'outfit';
  name: string;
  cost: number;
  // Overrides merged onto MiloFairy's SPRITE_COLORS letter->hex map.
  colorOverrides: Record<string, string>;
}

export const FURNITURE_ITEMS: FurnitureItem[] = [
  { id: 'bed_cozy_teal',   slot: 'bed',   name: 'Cozy Teal Bed',  cost: 40, color: '#0d9488' },
  { id: 'bed_cloud_white', slot: 'bed',   name: 'Cloud Bed',      cost: 90, color: '#f5f7fb' },
  { id: 'rug_stripe',      slot: 'rug',   name: 'Striped Rug',    cost: 30, color: '#f2a6cf' },
  { id: 'rug_round_gold',  slot: 'rug',   name: 'Round Gold Rug', cost: 70, color: '#f0b429' },
  { id: 'plant_fern',      slot: 'plant', name: 'Little Fern',    cost: 25, color: '#5c9a5c' },
  { id: 'plant_cactus',    slot: 'plant', name: 'Potted Cactus',  cost: 60, color: '#7db87d' },
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

export type MilesProgram = 'KrisFlyer' | 'Asia Miles' | 'Cashback' | 'Other';

export type CreditCard = {
  id: string;
  name: string;
  last4: string;
  color: string;
  monthlyLimit: number;
  currentSpent: number;
  milesRate: number;       // miles earned per SGD spent
  milesProgram: MilesProgram;
};

export type Transaction = {
  id: string;
  cardId: string;
  merchant: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
};

export type Category = {
  id: string;
  userId: string;
  name: string;
  type: 'income' | 'expense';
};

export type Entry = {
  id: string;
  userId: string;
  month: string;       // ISO date, first of month e.g. "2026-07-01" (legacy bucket, kept for backward compat)
  date: string;        // ISO date, the exact day the transaction occurred
  amount: number;
  categoryId?: string;
  cardId?: string;
  note?: string;
  createdAt?: string;
};

export type Tab = 'home' | 'transactions' | 'room' | 'miles' | 'more';
export type MoreSection = 'changelog' | 'settings' | 'feedback' | null;

// Milo's Room (idle game) — an owned item, keyed by the static catalog id in
// src/lib/roomCatalog.ts, not a DB-defined item row.
export type InventoryItem = {
  id: string;
  itemId: string;
  itemType: 'furniture' | 'wardrobe';
};

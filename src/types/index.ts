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
  month: string;       // ISO date, first of month e.g. "2026-07-01"
  amount: number;
  categoryId?: string;
  cardId?: string;
  note?: string;
  createdAt?: string;
};

export type Tab = 'home' | 'budget' | 'miles' | 'more';
export type MoreSection = 'cards' | 'transactions' | 'settings' | null;

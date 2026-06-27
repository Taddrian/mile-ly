import { Transaction } from '@/types';

export const mockTransactions: Transaction[] = [
  { id: '1', cardId: '1', merchant: 'Starbucks', amount: 7.2, category: 'Food & Drink', date: '2026-06-26' },
  { id: '2', cardId: '2', merchant: 'Shopee', amount: 89.0, category: 'Shopping', date: '2026-06-25' },
  { id: '3', cardId: '3', merchant: 'FairPrice', amount: 45.8, category: 'Groceries', date: '2026-06-25' },
  { id: '4', cardId: '1', merchant: 'McDonald\'s', amount: 12.5, category: 'Food & Drink', date: '2026-06-24' },
  { id: '5', cardId: '4', merchant: 'Grab', amount: 18.0, category: 'Transport', date: '2026-06-24' },
  { id: '6', cardId: '2', merchant: 'Lazada', amount: 156.0, category: 'Shopping', date: '2026-06-23' },
  { id: '7', cardId: '3', merchant: 'Cold Storage', amount: 78.3, category: 'Groceries', date: '2026-06-22' },
  { id: '8', cardId: '1', merchant: 'Netflix', amount: 17.98, category: 'Entertainment', date: '2026-06-21' },
  { id: '9', cardId: '4', merchant: 'Shell', amount: 95.0, category: 'Transport', date: '2026-06-20' },
  { id: '10', cardId: '2', merchant: 'Watsons', amount: 34.5, category: 'Health', date: '2026-06-19' },
  { id: '11', cardId: '1', merchant: 'Ya Kun Kaya Toast', amount: 9.8, category: 'Food & Drink', date: '2026-06-18' },
  { id: '12', cardId: '3', merchant: 'NTUC FairPrice', amount: 62.1, category: 'Groceries', date: '2026-06-17' },
  { id: '13', cardId: '4', merchant: 'Uniqlo', amount: 89.9, category: 'Shopping', date: '2026-06-16' },
  { id: '14', cardId: '2', merchant: 'Singtel', amount: 42.0, category: 'Utilities', date: '2026-06-15' },
  { id: '15', cardId: '1', merchant: 'PS.Cafe', amount: 38.5, category: 'Food & Drink', date: '2026-06-14' },
];

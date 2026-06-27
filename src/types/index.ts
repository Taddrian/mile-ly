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
};

export type Tab = 'dashboard' | 'cards' | 'transactions' | 'points' | 'settings';

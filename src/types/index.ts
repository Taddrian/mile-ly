export type CreditCard = {
  id: string;
  name: string;
  last4: string;
  color: string;
  monthlyLimit: number;
  currentSpent: number;
};

export type Transaction = {
  id: string;
  cardId: string;
  merchant: string;
  amount: number;
  category: string;
  date: string;
};

export type Tab = 'dashboard' | 'cards' | 'transactions' | 'settings';

'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { CreditCard, Transaction } from '@/types';
import { mockCards } from '@/data/mockCards';
import { mockTransactions } from '@/data/mockTransactions';

interface AppContextValue {
  cards: CreditCard[];
  transactions: Transaction[];
  addCard: (card: Omit<CreditCard, 'id' | 'currentSpent'>) => void;
  addTransaction: (txn: Omit<Transaction, 'id'>) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cards, setCards] = useState<CreditCard[]>(mockCards);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);

  function addCard(data: Omit<CreditCard, 'id' | 'currentSpent'>) {
    const newCard: CreditCard = { ...data, id: crypto.randomUUID(), currentSpent: 0 };
    setCards((prev) => [...prev, newCard]);
  }

  function addTransaction(data: Omit<Transaction, 'id'>) {
    const newTxn: Transaction = { ...data, id: crypto.randomUUID() };
    setTransactions((prev) => [newTxn, ...prev]);
    setCards((prev) =>
      prev.map((c) =>
        c.id === data.cardId ? { ...c, currentSpent: c.currentSpent + data.amount } : c
      )
    );
  }

  return (
    <AppContext.Provider value={{ cards, transactions, addCard, addTransaction }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

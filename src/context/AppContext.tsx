'use client';

import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { CreditCard, Transaction, Category, Entry } from '@/types';
import { supabase } from '@/lib/supabase';

interface AppContextValue {
  cards: CreditCard[];
  transactions: Transaction[];
  categories: Category[];
  entries: Entry[];
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  addCard: (card: Omit<CreditCard, 'id' | 'currentSpent'>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  addTransaction: (txn: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCategory: (name: string, type: 'income' | 'expense') => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addEntry: (data: Omit<Entry, 'id' | 'userId'>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth());

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    loadEntries();
  }, [selectedMonth]);

  async function loadAll() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [cardsRes, txnRes, catRes] = await Promise.all([
      supabase.from('cards').select('*').order('created_at'),
      supabase.from('transactions').select('*').order('date', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);

    if (cardsRes.data) setCards(cardsRes.data.map(dbToCard));
    if (txnRes.data) setTransactions(txnRes.data.map(dbToTxn));
    if (catRes.data) setCategories(catRes.data.map(dbToCat));

    await loadEntries();
  }

  async function loadEntries() {
    const { data } = await supabase
      .from('entries')
      .select('*')
      .eq('month', selectedMonth)
      .order('created_at', { ascending: false });
    if (data) setEntries(data.map(dbToEntry));
  }

  // --- Cards ---
  async function addCard(data: Omit<CreditCard, 'id' | 'currentSpent'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: row } = await supabase.from('cards').insert({
      user_id: user.id,
      name: data.name,
      last4: data.last4,
      color: data.color,
      monthly_limit: data.monthlyLimit,
      miles_rate: data.milesRate,
      miles_program: data.milesProgram,
    }).select().single();
    if (row) setCards((prev) => [...prev, dbToCard(row)]);
  }

  async function deleteCard(id: string) {
    await supabase.from('cards').delete().eq('id', id);
    setCards((prev) => prev.filter((c) => c.id !== id));
  }

  // --- Transactions (local only, not in DB yet) ---
  async function addTransaction(data: Omit<Transaction, 'id'>) {
    const newTxn: Transaction = { ...data, id: crypto.randomUUID() };
    setTransactions((prev) => [newTxn, ...prev]);
  }

  async function deleteTransaction(id: string) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  // --- Categories ---
  async function addCategory(name: string, type: 'income' | 'expense') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: row } = await supabase.from('categories').insert({
      user_id: user.id, name, type,
    }).select().single();
    if (row) setCategories((prev) => [...prev, dbToCat(row)]);
  }

  async function deleteCategory(id: string) {
    await supabase.from('categories').delete().eq('id', id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  // --- Entries ---
  async function addEntry(data: Omit<Entry, 'id' | 'userId'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: row } = await supabase.from('entries').insert({
      user_id: user.id,
      month: data.month,
      amount: data.amount,
      category_id: data.categoryId ?? null,
      card_id: data.cardId ?? null,
      note: data.note,
    }).select().single();
    if (row) setEntries((prev) => [dbToEntry(row), ...prev]);
  }

  async function deleteEntry(id: string) {
    await supabase.from('entries').delete().eq('id', id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  // Derive currentSpent per card from selected month's entries
  const cardsWithSpent = useMemo(() =>
    cards.map((card) => ({
      ...card,
      currentSpent: entries
        .filter((e) => e.cardId === card.id)
        .reduce((s, e) => s + e.amount, 0),
    })),
    [cards, entries]
  );

  return (
    <AppContext.Provider value={{
      cards: cardsWithSpent, transactions, categories, entries, selectedMonth, setSelectedMonth,
      addCard, deleteCard, addTransaction, deleteTransaction,
      addCategory, deleteCategory, addEntry, deleteEntry,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

// DB row mappers
function dbToCard(r: Record<string, unknown>): CreditCard {
  return {
    id: r.id as string,
    name: r.name as string,
    last4: r.last4 as string,
    color: r.color as string,
    monthlyLimit: Number(r.monthly_limit),
    currentSpent: 0,
    milesRate: Number(r.miles_rate),
    milesProgram: r.miles_program as CreditCard['milesProgram'],
  };
}

function dbToTxn(r: Record<string, unknown>): Transaction {
  return {
    id: r.id as string,
    cardId: r.card_id as string,
    merchant: r.merchant as string,
    amount: Number(r.amount),
    category: r.category as string,
    date: r.date as string,
    type: r.type as 'income' | 'expense',
  };
}

function dbToCat(r: Record<string, unknown>): Category {
  return {
    id: r.id as string,
    userId: r.user_id as string,
    name: r.name as string,
    type: r.type as 'income' | 'expense',
  };
}

function dbToEntry(r: Record<string, unknown>): Entry {
  return {
    id: r.id as string,
    userId: r.user_id as string,
    month: r.month as string,
    amount: Number(r.amount),
    categoryId: r.category_id as string,
    cardId: r.card_id as string | undefined,
    note: r.note as string | undefined,
    createdAt: r.created_at as string | undefined,
  };
}

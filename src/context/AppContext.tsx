'use client';

import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { CreditCard, Transaction, Category, Entry } from '@/types';
import { supabase } from '@/lib/supabase';
import { cycleStartForDate, cycleEndExclusive } from '@/lib/cycle';

interface AppContextValue {
  cards: CreditCard[];
  transactions: Transaction[];
  categories: Category[];
  entries: Entry[];
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  currency: string;
  setCurrency: (c: string) => void;
  cycleStartDay: number;
  setCycleStartDay: (day: number) => Promise<void>;
  addCard: (card: Omit<CreditCard, 'id' | 'currentSpent'>) => Promise<void>;
  updateCard: (id: string, patch: Partial<Omit<CreditCard, 'id' | 'currentSpent'>>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  addTransaction: (txn: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCategory: (name: string, type: 'income' | 'expense') => Promise<Category | undefined>;
  deleteCategory: (id: string) => Promise<void>;
  addEntry: (data: Omit<Entry, 'id' | 'userId'>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  updateCardSpent: (cardId: string, newTotal: number) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export const CARD_UPDATE_NOTE = '⚡ Balance update';

export function AppProvider({ children }: { children: ReactNode }) {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [cycleStartDay, setCycleStartDayState] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(() => cycleStartForDate(new Date(), 1));
  const [currency, setCurrencyState] = useState('SGD');

  useEffect(() => {
    const stored = localStorage.getItem('milely_currency');
    if (stored) setCurrencyState(stored);
  }, []);

  function setCurrency(c: string) {
    setCurrencyState(c);
    localStorage.setItem('milely_currency', c);
  }

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    loadEntries();
  }, [selectedMonth]);

  async function loadAll() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [cardsRes, txnRes, catRes, settingsRes] = await Promise.all([
      supabase.from('cards').select('*').order('created_at'),
      supabase.from('transactions').select('*').order('date', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
      supabase.from('user_settings').select('*').eq('user_id', user.id).maybeSingle(),
    ]);

    if (cardsRes.data) setCards(cardsRes.data.map(dbToCard));
    if (txnRes.data) setTransactions(txnRes.data.map(dbToTxn));
    if (catRes.data) setCategories(catRes.data.map(dbToCat));

    const day = settingsRes.data ? Number(settingsRes.data.cycle_start_day) : 1;
    setCycleStartDayState(day);
    setSelectedMonth(cycleStartForDate(new Date(), day));

    await loadEntriesFor(cycleStartForDate(new Date(), day));
  }

  async function loadEntries() {
    await loadEntriesFor(selectedMonth);
  }

  async function loadEntriesFor(cycleStart: string) {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .gte('date', cycleStart)
      .lt('date', cycleEndExclusive(cycleStart))
      .order('date', { ascending: false });
    if (error) {
      console.error('Failed to load entries — has the "date" column migration been run on the entries table?', error);
      return;
    }
    if (data) setEntries(data.map(dbToEntry));
  }

  async function setCycleStartDay(day: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('user_settings').upsert({ user_id: user.id, cycle_start_day: day });
    setCycleStartDayState(day);
    setSelectedMonth(cycleStartForDate(new Date(), day));
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

  async function updateCard(id: string, patch: Partial<Omit<CreditCard, 'id' | 'currentSpent'>>) {
    const dbPatch: Record<string, unknown> = {};
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.last4 !== undefined) dbPatch.last4 = patch.last4;
    if (patch.color !== undefined) dbPatch.color = patch.color;
    if (patch.monthlyLimit !== undefined) dbPatch.monthly_limit = patch.monthlyLimit;
    if (patch.milesRate !== undefined) dbPatch.miles_rate = patch.milesRate;
    if (patch.milesProgram !== undefined) dbPatch.miles_program = patch.milesProgram;
    await supabase.from('cards').update(dbPatch).eq('id', id);
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
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
    if (!user) return undefined;
    const { data: row } = await supabase.from('categories').insert({
      user_id: user.id, name, type,
    }).select().single();
    if (!row) return undefined;
    const cat = dbToCat(row);
    setCategories((prev) => [...prev, cat]);
    return cat;
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
      date: data.date,
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

  // Maintains a single replaceable entry per card per month so users can
  // type in the latest statement total instead of logging every transaction.
  async function updateCardSpent(cardId: string, newTotal: number) {
    const cardEntries = entries.filter((e) => e.cardId === cardId);
    const quickEntry = cardEntries.find((e) => e.note === CARD_UPDATE_NOTE);
    const itemizedTotal = cardEntries
      .filter((e) => e.note !== CARD_UPDATE_NOTE && categories.find((c) => c.id === e.categoryId)?.type === 'expense')
      .reduce((s, e) => s + e.amount, 0);
    const neededQuickAmount = Math.round((newTotal - itemizedTotal) * 100) / 100;

    if (quickEntry) await deleteEntry(quickEntry.id);

    if (neededQuickAmount > 0) {
      let cat = categories.find((c) => c.name === 'Credit Card' && c.type === 'expense');
      if (!cat) cat = await addCategory('Credit Card', 'expense');
      await addEntry({
        month: selectedMonth,
        date: selectedMonth,
        amount: neededQuickAmount,
        categoryId: cat?.id,
        cardId,
        note: CARD_UPDATE_NOTE,
      });
    }
  }

  // Derive currentSpent per card from selected month's entries. Only expense-type
  // entries count as "spend" — an income entry tied to a card (e.g. a refund or
  // cashback credit) shouldn't inflate the balance, keeping this aligned with the
  // "Credit Card" total shown in Spending by Category.
  const cardsWithSpent = useMemo(() =>
    cards.map((card) => ({
      ...card,
      currentSpent: entries
        .filter((e) => e.cardId === card.id && categories.find((c) => c.id === e.categoryId)?.type === 'expense')
        .reduce((s, e) => s + e.amount, 0),
    })),
    [cards, entries, categories]
  );

  return (
    <AppContext.Provider value={{
      cards: cardsWithSpent, transactions, categories, entries, selectedMonth, setSelectedMonth,
      currency, setCurrency, cycleStartDay, setCycleStartDay,
      addCard, updateCard, deleteCard, addTransaction, deleteTransaction,
      addCategory, deleteCategory, addEntry, deleteEntry, updateCardSpent,
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
    date: (r.date as string) ?? (r.month as string),
    amount: Number(r.amount),
    categoryId: r.category_id as string,
    cardId: r.card_id as string | undefined,
    note: r.note as string | undefined,
    createdAt: r.created_at as string | undefined,
  };
}

'use client';

import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { CreditCard, Transaction, Category, Entry, InventoryItem } from '@/types';
import { supabase } from '@/lib/supabase';
import { cycleStartForDate, cycleEndExclusive } from '@/lib/cycle';
import { findFurniture, findWardrobe, STARTER_ITEM_IDS } from '@/lib/roomCatalog';

const XP_PER_LEVEL = 200;
const DAILY_ENTRY_CAP = 10;
const SPARKS_PER_ENTRY = 5;

interface AppContextValue {
  cards: CreditCard[];
  transactions: Transaction[];
  categories: Category[];
  entries: Entry[];
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  budgetState: 'teal' | 'coral';
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
  addEntries: (dataList: Omit<Entry, 'id' | 'userId'>[]) => Promise<void>;
  updateEntry: (id: string, data: Omit<Entry, 'id' | 'userId'>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  updateCardSpent: (cardId: string, newTotal: number, date?: string) => Promise<void>;
  // Milo's Room (idle game)
  coinBalance: number;
  xp: number;
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  inventory: InventoryItem[];
  roomSlots: Record<string, string>;
  equippedWardrobe: Record<string, string>;
  purchaseItem: (itemId: string) => Promise<boolean>;
  equipItem: (itemId: string) => Promise<void>;
  unequipSlot: (key: string) => Promise<void>;
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
  const [coinBalance, setCoinBalance] = useState(0);
  const [xp, setXp] = useState(0);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [roomSlots, setRoomSlots] = useState<Record<string, string>>({});
  const [equippedWardrobe, setEquippedWardrobe] = useState<Record<string, string>>({});

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

    const [cardsRes, txnRes, catRes, settingsRes, invRes] = await Promise.all([
      supabase.from('cards').select('*').order('created_at'),
      supabase.from('transactions').select('*').order('date', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
      supabase.from('user_settings').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('inventory').select('*').eq('user_id', user.id),
    ]);

    if (cardsRes.data) setCards(cardsRes.data.map(dbToCard));
    if (txnRes.data) setTransactions(txnRes.data.map(dbToTxn));
    const loadedCategories = catRes.data ? catRes.data.map(dbToCat) : [];
    setCategories(loadedCategories);
    if (invRes.data) setInventory(invRes.data.map(dbToInventory));

    const day = settingsRes.data ? Number(settingsRes.data.cycle_start_day) : 1;
    setCycleStartDayState(day);
    setSelectedMonth(cycleStartForDate(new Date(), day));

    // Every slot without a saved choice defaults to its free starter item, so
    // the room is never blank on first load — Sparks buy swaps/upgrades on top,
    // not the basics.
    const savedRoomSlots = (settingsRes.data?.room_slots as Record<string, string> | null) ?? {};
    setRoomSlots({ ...STARTER_ITEM_IDS, ...savedRoomSlots });
    setEquippedWardrobe((settingsRes.data?.equipped_wardrobe as Record<string, string> | null) ?? {});
    await settleBudgetBonus(user.id, settingsRes.data, day, loadedCategories);

    await loadEntriesFor(cycleStartForDate(new Date(), day));
  }

  // Settles the "stayed under budget" Sparks bonus for whichever cycle most
  // recently closed, exactly once. budgetState is a *live* value that can flip
  // teal/coral repeatedly within a cycle, so it's only evaluated here — after
  // that cycle has actually ended — rather than granted opportunistically while
  // it's still live (which could double-grant or reward a state that reverses).
  async function settleBudgetBonus(
    userId: string,
    settings: Record<string, unknown> | null,
    day: number,
    cats: Category[]
  ) {
    const currentCycleStart = cycleStartForDate(new Date(), day);
    const lastBonusCycle = settings?.last_budget_bonus_cycle as string | null | undefined;
    const dbCoins = settings ? Number(settings.coin_balance ?? 0) : 0;
    const dbXp = settings ? Number(settings.xp ?? 0) : 0;

    if (!lastBonusCycle) {
      // First-ever load — establish a baseline, no retroactive grant.
      await supabase.from('user_settings').upsert({ user_id: userId, last_budget_bonus_cycle: currentCycleStart });
      setCoinBalance(dbCoins);
      setXp(dbXp);
      return;
    }

    if (lastBonusCycle === currentCycleStart) {
      // Already settled for the cycle currently in progress — nothing to do.
      setCoinBalance(dbCoins);
      setXp(dbXp);
      return;
    }

    // A cycle boundary passed since we last checked — evaluate that closed cycle.
    const { data: closedRows } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', userId)
      .gte('date', lastBonusCycle)
      .lt('date', cycleEndExclusive(lastBonusCycle));

    let newCoins = dbCoins;
    let newXp = dbXp;
    if (closedRows) {
      const closed = closedRows.map(dbToEntry);
      const income = closed.filter((e) => cats.find((c) => c.id === e.categoryId)?.type === 'income').reduce((s, e) => s + e.amount, 0);
      const expenses = closed.filter((e) => cats.find((c) => c.id === e.categoryId)?.type === 'expense').reduce((s, e) => s + e.amount, 0);
      if (expenses <= income) {
        newCoins += 50;
        newXp += 50;
      }
    }

    await supabase.from('user_settings').upsert({
      user_id: userId, coin_balance: newCoins, xp: newXp, last_budget_bonus_cycle: currentCycleStart,
    });
    setCoinBalance(newCoins);
    setXp(newXp);
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
    if (row) {
      setEntries((prev) => [dbToEntry(row), ...prev]);
      await grantEntrySparks(1);
    }
  }

  // Bulk variant of addEntry — used for pre-creating a recurring entry's future
  // occurrences in one round-trip instead of N sequential inserts.
  async function addEntries(dataList: Omit<Entry, 'id' | 'userId'>[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || dataList.length === 0) return;
    const { data: rows } = await supabase.from('entries').insert(
      dataList.map((data) => ({
        user_id: user.id,
        month: data.month,
        date: data.date,
        amount: data.amount,
        category_id: data.categoryId ?? null,
        card_id: data.cardId ?? null,
        note: data.note,
      }))
    ).select();
    if (rows) {
      setEntries((prev) => [...rows.map(dbToEntry), ...prev]);
      await grantEntrySparks(rows.length);
    }
  }

  // +5 Sparks per entry logged, capped at 10 coin-earning entries per real day —
  // counted from entries.createdAt (distinct from the transaction date, which can
  // be backdated) so a single bulk recurring save can't mint unbounded Sparks.
  async function grantEntrySparks(newCount: number) {
    const todayStr = new Date().toISOString().slice(0, 10);
    const alreadyToday = entries.filter((e) => (e.createdAt ?? '').slice(0, 10) === todayStr).length;
    const eligible = Math.max(0, Math.min(newCount, DAILY_ENTRY_CAP - alreadyToday));
    if (eligible > 0) await grantSparks(eligible * SPARKS_PER_ENTRY);
  }

  async function grantSparks(amount: number) {
    if (amount <= 0) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const newCoins = coinBalance + amount;
    const newXp = xp + amount;
    await supabase.from('user_settings').upsert({ user_id: user.id, coin_balance: newCoins, xp: newXp });
    setCoinBalance(newCoins);
    setXp(newXp);
  }

  async function updateEntry(id: string, data: Omit<Entry, 'id' | 'userId'>) {
    const { data: row } = await supabase.from('entries').update({
      month: data.month,
      date: data.date,
      amount: data.amount,
      category_id: data.categoryId ?? null,
      card_id: data.cardId ?? null,
      note: data.note,
    }).eq('id', id).select().single();
    if (row) setEntries((prev) => prev.map((e) => (e.id === id ? dbToEntry(row) : e)));
  }

  async function deleteEntry(id: string) {
    await supabase.from('entries').delete().eq('id', id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  // Maintains a single replaceable entry per card per month so users can
  // type in the latest statement total instead of logging every transaction.
  async function updateCardSpent(cardId: string, newTotal: number, date?: string) {
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
      const entryDate = date ?? selectedMonth;
      await addEntry({
        month: entryDate.slice(0, 7) + '-01',
        date: entryDate,
        amount: neededQuickAmount,
        categoryId: cat?.id,
        cardId,
        note: CARD_UPDATE_NOTE,
      });
    }
  }

  // --- Milo's Room (idle game) ---
  async function purchaseItem(itemId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    if (inventory.some((i) => i.itemId === itemId)) return false;

    const furniture = findFurniture(itemId);
    const wardrobe = furniture ? undefined : findWardrobe(itemId);
    const item = furniture ?? wardrobe;
    if (!item || coinBalance < item.cost) return false;

    const { data: row } = await supabase.from('inventory').insert({
      user_id: user.id,
      item_id: itemId,
      item_type: furniture ? 'furniture' : 'wardrobe',
    }).select().single();
    if (!row) return false;

    const newCoins = coinBalance - item.cost;
    await supabase.from('user_settings').upsert({ user_id: user.id, coin_balance: newCoins });
    setCoinBalance(newCoins);
    setInventory((prev) => [...prev, dbToInventory(row)]);
    return true;
  }

  async function equipItem(itemId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const furniture = findFurniture(itemId);
    if (furniture) {
      const next = { ...roomSlots, [furniture.slot]: itemId };
      await supabase.from('user_settings').upsert({ user_id: user.id, room_slots: next });
      setRoomSlots(next);
      return;
    }
    const wardrobe = findWardrobe(itemId);
    if (wardrobe) {
      const next = { ...equippedWardrobe, [wardrobe.category]: itemId };
      await supabase.from('user_settings').upsert({ user_id: user.id, equipped_wardrobe: next });
      setEquippedWardrobe(next);
    }
  }

  async function unequipSlot(key: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (key in roomSlots) {
      const next = { ...roomSlots };
      delete next[key];
      await supabase.from('user_settings').upsert({ user_id: user.id, room_slots: next });
      setRoomSlots(next);
    }
    if (key in equippedWardrobe) {
      const next = { ...equippedWardrobe };
      delete next[key];
      await supabase.from('user_settings').upsert({ user_id: user.id, equipped_wardrobe: next });
      setEquippedWardrobe(next);
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

  // Single hue that floods the whole UI's themed accents this cycle: teal while
  // spending stays within income, coral once expenses outpace it.
  const budgetState = useMemo<'teal' | 'coral'>(() => {
    const income = entries
      .filter((e) => categories.find((c) => c.id === e.categoryId)?.type === 'income')
      .reduce((s, e) => s + e.amount, 0);
    const expenses = entries
      .filter((e) => categories.find((c) => c.id === e.categoryId)?.type === 'expense')
      .reduce((s, e) => s + e.amount, 0);
    return expenses > income ? 'coral' : 'teal';
  }, [entries, categories]);

  // Flat leveling curve for Phase 1 — a real curve is a later refinement.
  const level = useMemo(() => Math.floor(xp / XP_PER_LEVEL) + 1, [xp]);
  const xpIntoLevel = xp % XP_PER_LEVEL;

  return (
    <AppContext.Provider value={{
      cards: cardsWithSpent, transactions, categories, entries, selectedMonth, setSelectedMonth,
      budgetState, currency, setCurrency, cycleStartDay, setCycleStartDay,
      addCard, updateCard, deleteCard, addTransaction, deleteTransaction,
      addCategory, deleteCategory, addEntry, addEntries, updateEntry, deleteEntry, updateCardSpent,
      coinBalance, xp, level, xpIntoLevel, xpForNextLevel: XP_PER_LEVEL,
      inventory, roomSlots, equippedWardrobe, purchaseItem, equipItem, unequipSlot,
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

function dbToInventory(r: Record<string, unknown>): InventoryItem {
  return {
    id: r.id as string,
    itemId: r.item_id as string,
    itemType: r.item_type as 'furniture' | 'wardrobe',
  };
}

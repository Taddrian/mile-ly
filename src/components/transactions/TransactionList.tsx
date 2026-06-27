'use client';

import { useState, useMemo } from 'react';
import { Transaction, CreditCard } from '@/types';
import TransactionRow from '@/components/transactions/TransactionRow';

interface TransactionListProps {
  transactions: Transaction[];
  cards: CreditCard[];
  limit?: number;
}

const ALL = 'all';

function getDateLabel(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);

  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);

  if (d.getTime() === today.getTime()) return 'Today';
  if (d.getTime() === yesterday.getTime()) return 'Yesterday';
  if (d >= weekAgo) return 'This Week';
  return 'Earlier';
}

const GROUP_ORDER = ['Today', 'Yesterday', 'This Week', 'Earlier'];

export default function TransactionList({ transactions, cards, limit }: TransactionListProps) {
  const [search, setSearch] = useState('');
  const [selectedCard, setSelectedCard] = useState(ALL);
  const [selectedCategory, setSelectedCategory] = useState(ALL);

  const cardMap = useMemo(() => Object.fromEntries(cards.map((c) => [c.id, c])), [cards]);

  const categories = useMemo(
    () => Array.from(new Set(transactions.map((t) => t.category))).sort(),
    [transactions]
  );

  const filtered = useMemo(() => {
    let result = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (selectedCard !== ALL) result = result.filter((t) => t.cardId === selectedCard);
    if (selectedCategory !== ALL) result = result.filter((t) => t.category === selectedCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((t) => t.merchant.toLowerCase().includes(q));
    }
    return limit ? result.slice(0, limit) : result;
  }, [transactions, selectedCard, selectedCategory, search, limit]);

  const grouped = useMemo(() => {
    if (limit) return null;
    const map: Record<string, Transaction[]> = {};
    for (const txn of filtered) {
      const label = getDateLabel(txn.date);
      if (!map[label]) map[label] = [];
      map[label].push(txn);
    }
    return GROUP_ORDER.filter((g) => map[g]).map((g) => ({ label: g, items: map[g] }));
  }, [filtered, limit]);

  return (
    <div>
      {!limit && (
        <div className="space-y-2 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search merchants…"
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0d6e5a]"
          />
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedCard(ALL)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedCard === ALL
                  ? 'bg-[#0d6e5a] text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              All Cards
            </button>
            {cards.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCard(c.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedCard === c.id
                    ? 'text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                }`}
                style={selectedCard === c.id ? { backgroundColor: c.color } : {}}
              >
                {c.name.split(' ')[0]}
              </button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(ALL)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === ALL
                  ? 'bg-[#0d6e5a] text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#0d6e5a] text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-zinc-400 text-center py-8">No transactions found</p>
      ) : grouped ? (
        <div className="space-y-1">
          {grouped.map(({ label, items }) => (
            <div key={label}>
              <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-1 pt-4 pb-2 first:pt-1">
                {label}
              </p>
              <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-sm">
                {items.map((txn) => (
                  <TransactionRow key={txn.id} transaction={txn} card={cardMap[txn.cardId]} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {filtered.map((txn) => (
            <TransactionRow key={txn.id} transaction={txn} card={cardMap[txn.cardId]} />
          ))}
        </div>
      )}
    </div>
  );
}

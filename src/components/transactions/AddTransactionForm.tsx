'use client';

import { useState } from 'react';
import { Transaction, CreditCard } from '@/types';

interface AddTransactionFormProps {
  cards: CreditCard[];
  onSubmit: (txn: Omit<Transaction, 'id'>) => void;
  onCancel: () => void;
}

const CATEGORIES = ['Food & Drink', 'Shopping', 'Groceries', 'Transport', 'Entertainment', 'Health', 'Utilities', 'Other'];

const inputClass = 'w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0d6e5a] transition-shadow';
const labelClass = 'block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5';

export default function AddTransactionForm({ cards, onSubmit, onCancel }: AddTransactionFormProps) {
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [cardId, setCardId] = useState(cards[0]?.id ?? '');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !merchant.trim() || !cardId) return;
    onSubmit({ amount: parseFloat(amount), merchant: merchant.trim(), cardId, category, date });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Amount (SGD)</label>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" min="0.01" step="0.01" required className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Merchant</label>
        <input type="text" value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder="e.g. Starbucks" required className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Card</label>
        <select value={cardId} onChange={(e) => setCardId(e.target.value)} required className={inputClass}>
          {cards.map((c) => (
            <option key={c.id} value={c.id}>{c.name} (•••• {c.last4})</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Category</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                category === cat
                  ? 'bg-[#0d6e5a] text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={inputClass} />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 py-3 rounded-xl bg-[#0d6e5a] text-white text-sm font-semibold hover:bg-[#0a5747] transition-colors"
        >
          Save
        </button>
      </div>
    </form>
  );
}

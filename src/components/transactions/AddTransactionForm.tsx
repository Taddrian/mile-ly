'use client';

import { useState } from 'react';
import { Transaction, CreditCard, Category } from '@/types';

interface AddTransactionFormProps {
  cards: CreditCard[];
  categories: Category[];
  onSubmit: (txn: Omit<Transaction, 'id'>) => void;
  onAddCategory: (name: string, type: 'income' | 'expense') => Promise<void>;
  onCancel: () => void;
}

const inputClass = 'w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0d6e5a] transition-shadow';
const labelClass = 'block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5';

export default function AddTransactionForm({ cards, categories, onSubmit, onAddCategory, onCancel }: AddTransactionFormProps) {
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [cardId, setCardId] = useState(cards[0]?.id ?? '');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [newCat, setNewCat] = useState('');
  const [addingCat, setAddingCat] = useState(false);

  const filteredCats = categories.filter((c) => c.type === type);

  async function handleAddCategory() {
    const name = newCat.trim();
    if (!name) return;
    await onAddCategory(name, type);
    setCategory(name);
    setNewCat('');
    setAddingCat(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !merchant.trim()) return;
    onSubmit({
      amount: parseFloat(amount),
      merchant: merchant.trim(),
      cardId: type === 'expense' ? cardId : '',
      category: category || (filteredCats[0]?.name ?? 'Other'),
      date,
      type,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type toggle */}
      <div className="flex rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
        {(['expense', 'income'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setType(t); setCategory(''); }}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
              type === t
                ? t === 'expense'
                  ? 'bg-red-500 text-white'
                  : 'bg-[#0d6e5a] text-white'
                : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
            }`}
          >
            {t === 'expense' ? 'Expense' : 'Income'}
          </button>
        ))}
      </div>

      <div>
        <label className={labelClass}>Amount (SGD)</label>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" min="0.01" step="0.01" required className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>{type === 'expense' ? 'Merchant' : 'Source'}</label>
        <input type="text" value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder={type === 'expense' ? 'e.g. Starbucks' : 'e.g. Salary'} required className={inputClass} />
      </div>

      {type === 'expense' && cards.length > 0 && (
        <div>
          <label className={labelClass}>Card</label>
          <select value={cardId} onChange={(e) => setCardId(e.target.value)} className={inputClass}>
            {cards.map((c) => (
              <option key={c.id} value={c.id}>{c.name} (•••• {c.last4})</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className={labelClass}>Category</label>
        {filteredCats.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-2">
            {filteredCats.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.name)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  category === cat.name
                    ? 'bg-[#0d6e5a] text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-400 mb-2">No categories yet — add one below.</p>
        )}

        {addingCat ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              placeholder="Category name"
              className={inputClass}
              autoFocus
            />
            <button type="button" onClick={handleAddCategory} className="px-3 py-2 rounded-xl bg-[#0d6e5a] text-white text-xs font-semibold">Add</button>
            <button type="button" onClick={() => setAddingCat(false)} className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500">✕</button>
          </div>
        ) : (
          <button type="button" onClick={() => setAddingCat(true)} className="text-xs text-[#0d6e5a] font-semibold hover:underline">
            + New category
          </button>
        )}
      </div>

      <div>
        <label className={labelClass}>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={inputClass} />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
          Cancel
        </button>
        <button type="submit" className="flex-1 py-3 rounded-xl bg-[#0d6e5a] text-white text-sm font-semibold hover:bg-[#0a5747] transition-colors">
          Save
        </button>
      </div>
    </form>
  );
}

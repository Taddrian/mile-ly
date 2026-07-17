'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import CategoryChip from '@/components/ui/CategoryChip';
import SwipeableRow from '@/components/transactions/SwipeableRow';

function fmt(n: number) {
  return n.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function TransactionsScreen() {
  const { entries, categories, cards, deleteEntry } = useApp();
  const [search, setSearch] = useState('');

  const totalIncome = useMemo(() =>
    entries.filter((e) => categories.find((c) => c.id === e.categoryId)?.type === 'income')
      .reduce((s, e) => s + e.amount, 0),
    [entries, categories]
  );

  const totalExpense = useMemo(() =>
    entries.filter((e) => categories.find((c) => c.id === e.categoryId)?.type === 'expense')
      .reduce((s, e) => s + e.amount, 0),
    [entries, categories]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...entries]
      .sort((a, b) => new Date(b.createdAt ?? b.month).getTime() - new Date(a.createdAt ?? a.month).getTime())
      .filter((e) => {
        if (!q) return true;
        const cat = categories.find((c) => c.id === e.categoryId);
        return cat?.name.toLowerCase().includes(q) || e.note?.toLowerCase().includes(q);
      });
  }, [entries, categories, search]);

  return (
    <div className="min-h-screen">
      <div className="px-5 pt-14 pb-4 md:pt-6">
        <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>History</p>
        <h1 className="text-2xl font-medium" style={{ color: 'var(--fg)' }}>Transactions</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'} · +{fmt(totalIncome)} / −{fmt(totalExpense)}
        </p>
      </div>

      <div className="px-4 pb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search category or remark…"
          className="w-full rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0F6E56] mb-4"
          style={{
            backgroundColor: 'var(--card)',
            color: 'var(--fg)',
            border: '0.5px solid var(--border)',
          }}
        />

        {filtered.length === 0 ? (
          <p className="text-sm text-center py-12" style={{ color: 'var(--text-muted)' }}>
            {search ? 'No results found' : 'No entries yet — tap + to add one'}
          </p>
        ) : (
          <div className="rounded-[16px] overflow-hidden" style={{ border: '0.5px solid var(--border)' }}>
            {filtered.map((entry, i) => {
              const cat = categories.find((c) => c.id === entry.categoryId);
              const card = cards.find((c) => c.id === entry.cardId);
              const isIncome = cat?.type === 'income';
              return (
                <SwipeableRow key={entry.id} onDelete={() => deleteEntry(entry.id)}>
                  <div
                    className="flex items-center gap-3 px-4 py-3.5"
                    style={{
                      borderBottom: i < filtered.length - 1 ? '0.5px solid var(--border)' : 'none',
                    }}
                  >
                    <CategoryChip name={cat?.name ?? '?'} size={36} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--fg)' }}>
                        {cat?.name ?? 'Unknown'}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        {card && (
                          <span
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: card.color }}
                          >
                            {card.name}
                          </span>
                        )}
                        {entry.note && (
                          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{entry.note}</p>
                        )}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {fmtDate(entry.createdAt)}
                      </p>
                    </div>
                    <p className="text-sm font-medium shrink-0" style={{ color: isIncome ? '#1D9E75' : 'var(--fg)' }}>
                      {isIncome ? '+' : '−'}SGD {fmt(entry.amount)}
                    </p>
                  </div>
                </SwipeableRow>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

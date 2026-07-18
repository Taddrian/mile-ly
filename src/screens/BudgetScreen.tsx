'use client';

import { useMemo, useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { fmtAmount } from '@/lib/currency';
import MonthPicker from '@/components/ui/MonthPicker';
import ProgressBar from '@/components/ui/ProgressBar';
import CategoryChip from '@/components/ui/CategoryChip';
import StackedBar from '@/components/ui/StackedBar';

function daysLeftInMonth(monthStr: string) {
  const now = new Date();
  const [y, m] = monthStr.split('-').map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  const isCurrentMonth = now.getFullYear() === y && now.getMonth() + 1 === m;
  return isCurrentMonth ? lastDay - now.getDate() + 1 : 0;
}

const BUDGET_KEY = 'milely_monthly_budget';

export default function BudgetScreen() {
  const { entries, categories, selectedMonth, setSelectedMonth, currency } = useApp();
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(BUDGET_KEY);
    if (stored) setMonthlyBudget(parseFloat(stored));
  }, []);

  function saveBudget() {
    const val = parseFloat(budgetInput);
    if (val > 0) {
      setMonthlyBudget(val);
      localStorage.setItem(BUDGET_KEY, String(val));
    }
    setEditingBudget(false);
  }

  const expenses = useMemo(() =>
    entries.filter((e) => categories.find((c) => c.id === e.categoryId)?.type === 'expense')
      .reduce((s, e) => s + e.amount, 0),
    [entries, categories]
  );

  const income = useMemo(() =>
    entries.filter((e) => categories.find((c) => c.id === e.categoryId)?.type === 'income')
      .reduce((s, e) => s + e.amount, 0),
    [entries, categories]
  );

  const daysLeft = daysLeftInMonth(selectedMonth);
  const budgetLeft = monthlyBudget > 0 ? monthlyBudget - expenses : 0;
  const budgetPct = monthlyBudget > 0 ? Math.min(expenses / monthlyBudget, 1) : 0;
  const isOver = monthlyBudget > 0 && expenses > monthlyBudget;

  // Category spend breakdown
  const catSpend = useMemo(() => {
    const map: Record<string, { name: string; amount: number }> = {};
    entries.forEach((e) => {
      const cat = categories.find((c) => c.id === e.categoryId);
      if (!cat || cat.type !== 'expense') return;
      if (!map[cat.id]) map[cat.id] = { name: cat.name, amount: 0 };
      map[cat.id].amount += e.amount;
    });
    return Object.values(map).sort((a, b) => b.amount - a.amount);
  }, [entries, categories]);

  const bucketSegments = [
    { label: 'Needs',   value: expenses * 0.5, color: '#185FA5' },
    { label: 'Wants',   value: expenses * 0.3, color: '#BA7517' },
    { label: 'Savings', value: expenses * 0.2, color: '#1D9E75' },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-4 md:pt-6">
        <span className="text-lg font-medium" style={{ color: 'var(--fg)' }}>Budget</span>
        <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
      </div>

      <div className="px-4 space-y-3 pb-6">
        {/* Hero teal card */}
        <div className="rounded-[20px] p-5 text-white" style={{ backgroundColor: '#0F6E56' }}>
          <p className="text-xs text-white/70 mb-1">Spent this month</p>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-medium">{currency} {fmtAmount(expenses, currency)}</span>
            {monthlyBudget > 0 && (
              <span className="text-sm text-white/60">/ {currency} {fmtAmount(monthlyBudget, currency)}</span>
            )}
          </div>

          {daysLeft > 0 && <p className="text-xs text-white/60 mb-3">{daysLeft} days left this month</p>}

          {monthlyBudget > 0 ? (
            <>
              <div className="h-2 rounded-full bg-white/20 mb-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${budgetPct * 100}%`,
                    backgroundColor: isOver ? '#E24B4A' : 'white',
                  }}
                />
              </div>
              <p className="text-xs text-white/80">
                {isOver
                  ? `${currency} ${fmtAmount(expenses - monthlyBudget, currency)} over budget`
                  : `${currency} ${fmtAmount(budgetLeft, currency)} left`}
              </p>
            </>
          ) : (
            <div>
              {editingBudget ? (
                <div className="flex gap-2 mt-2">
                  <input
                    type="number"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    placeholder="Monthly budget"
                    autoFocus
                    className="flex-1 rounded-xl px-3 py-2 text-sm text-zinc-900 outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && saveBudget()}
                  />
                  <button onClick={saveBudget} className="px-4 py-2 rounded-xl text-xs font-medium bg-white/20 text-white">Set</button>
                </div>
              ) : (
                <button
                  onClick={() => { setEditingBudget(true); setBudgetInput(''); }}
                  className="mt-2 text-xs text-white/70 underline"
                >
                  Set monthly budget
                </button>
              )}
            </div>
          )}

          {monthlyBudget > 0 && (
            <button
              onClick={() => { setEditingBudget(true); setBudgetInput(String(monthlyBudget)); }}
              className="text-xs text-white/50 mt-2 block"
            >
              {editingBudget ? '' : 'Edit budget'}
            </button>
          )}
          {editingBudget && monthlyBudget > 0 && (
            <div className="flex gap-2 mt-2">
              <input
                type="number"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                autoFocus
                className="flex-1 rounded-xl px-3 py-2 text-sm text-zinc-900 outline-none"
                onKeyDown={(e) => e.key === 'Enter' && saveBudget()}
              />
              <button onClick={saveBudget} className="px-4 py-2 rounded-xl text-xs font-medium bg-white/20 text-white">Set</button>
              <button onClick={() => setEditingBudget(false)} className="px-3 py-2 rounded-xl text-xs bg-white/10 text-white">✕</button>
            </div>
          )}
        </div>

        {/* 50/30/20 */}
        {expenses > 0 && (
          <div
            className="rounded-[16px] p-5"
            style={{ backgroundColor: 'var(--card)', border: '0.5px solid var(--border)' }}
          >
            <p className="text-xs font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>
              50/30/20 split
            </p>
            <StackedBar segments={bucketSegments} height={10} />
            <div className="mt-4 space-y-2.5">
              {[
                { label: 'Needs (50%)',   target: expenses * 0.5, color: '#185FA5' },
                { label: 'Wants (30%)',   target: expenses * 0.3, color: '#BA7517' },
                { label: 'Savings (20%)', target: expenses * 0.2, color: '#1D9E75' },
              ].map(({ label, target, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                    <span className="font-medium" style={{ color: 'var(--fg)' }}>{currency} {fmtAmount(target, currency)}</span>
                  </div>
                  <ProgressBar value={target} max={expenses} color={color} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category spend */}
        {catSpend.length > 0 && (
          <div
            className="rounded-[16px] p-5"
            style={{ backgroundColor: 'var(--card)', border: '0.5px solid var(--border)' }}
          >
            <p className="text-xs font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>
              Spending by category
            </p>
            <div className="space-y-4">
              {catSpend.map(({ name, amount }) => (
                <div key={name}>
                  <div className="flex items-center gap-3 mb-1.5">
                    <CategoryChip name={name} size={28} />
                    <div className="flex-1 flex justify-between text-xs">
                      <span style={{ color: 'var(--fg)' }}>{name}</span>
                      <span className="font-medium" style={{ color: 'var(--fg)' }}>{currency} {fmtAmount(amount, currency)}</span>
                    </div>
                  </div>
                  <ProgressBar value={amount} max={expenses} color="#0F6E56" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {expenses === 0 && income === 0 && (
          <div
            className="rounded-[16px] p-8 text-center"
            style={{ backgroundColor: 'var(--card)', border: '0.5px solid var(--border)' }}
          >
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--fg)' }}>No entries yet</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Add entries with the + button to see your budget breakdown
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

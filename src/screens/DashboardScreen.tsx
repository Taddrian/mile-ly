'use client';

import { useMemo, useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import { fmtAmount } from '@/lib/currency';
import DonutRing from '@/components/ui/DonutRing';
import StackedBar from '@/components/ui/StackedBar';
import StatTile from '@/components/ui/StatTile';
import MonthPicker from '@/components/ui/MonthPicker';
import ProgressBar from '@/components/ui/ProgressBar';
import CategoryChip from '@/components/ui/CategoryChip';
import AddCardForm from '@/components/cards/AddCardForm';
import Modal from '@/components/ui/Modal';

const BUDGET_KEY = 'milely_monthly_budget';

function prevMonthStr(month: string) {
  const d = new Date(month);
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

function delta(current: number, previous: number) {
  if (previous === 0) return null;
  const pct = Math.round(((current - previous) / previous) * 100);
  return pct;
}

function daysLeftInMonth(monthStr: string) {
  const now = new Date();
  const [y, m] = monthStr.split('-').map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  const isCurrentMonth = now.getFullYear() === y && now.getMonth() + 1 === m;
  return isCurrentMonth ? lastDay - now.getDate() + 1 : 0;
}

export default function DashboardScreen() {
  const { entries, categories, cards, addCard, selectedMonth, setSelectedMonth, currency } = useApp();
  const [showAddCard, setShowAddCard] = useState(false);
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
  const [prevIncome, setPrevIncome] = useState(0);
  const [prevExpenses, setPrevExpenses] = useState(0);

  useEffect(() => {
    const pm = prevMonthStr(selectedMonth);
    supabase.from('entries').select('amount, category_id').eq('month', pm).then(({ data }) => {
      if (!data) return;
      let inc = 0, exp = 0;
      data.forEach((r) => {
        const cat = categories.find((c) => c.id === r.category_id);
        if (cat?.type === 'income') inc += Number(r.amount);
        else exp += Number(r.amount);
      });
      setPrevIncome(inc);
      setPrevExpenses(exp);
    });
  }, [selectedMonth, categories]);

  const income = useMemo(() =>
    entries.filter((e) => categories.find((c) => c.id === e.categoryId)?.type === 'income')
      .reduce((s, e) => s + e.amount, 0),
    [entries, categories]
  );

  const expenses = useMemo(() =>
    entries.filter((e) => categories.find((c) => c.id === e.categoryId)?.type === 'expense')
      .reduce((s, e) => s + e.amount, 0),
    [entries, categories]
  );

  const saved = Math.max(0, income - expenses);
  const total = income > 0 ? income : expenses + saved;
  const daysLeft = daysLeftInMonth(selectedMonth);
  const perDay = daysLeft > 0 && saved > 0 ? saved / daysLeft : 0;

  const budgetLeft = monthlyBudget > 0 ? monthlyBudget - expenses : 0;
  const budgetPct  = monthlyBudget > 0 ? Math.min(expenses / monthlyBudget, 1) : 0;
  const isOver     = monthlyBudget > 0 && expenses > monthlyBudget;

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

  const ringSegments = [
    { value: expenses, color: '#0F6E56' },
    { value: saved,    color: '#1D9E75' },
  ];

  const bucketSegments = [
    { label: 'Needs',   value: expenses * 0.5, color: '#185FA5' },
    { label: 'Wants',   value: expenses * 0.3, color: '#BA7517' },
    { label: 'Savings', value: expenses * 0.2, color: '#1D9E75' },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-4 md:pt-6">
        <span className="text-lg font-medium" style={{ color: 'var(--fg)' }}>Mile-ly</span>
        <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
      </div>

      <div className="px-4 space-y-3 pb-6">
        {/* Balance ring card */}
        <div
          className="rounded-[20px] p-5"
          style={{ backgroundColor: 'var(--card)', border: '0.5px solid var(--border)' }}
        >
          <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-secondary)' }}>Balance</p>
          <p className="text-[11px] mb-4" style={{ color: 'var(--text-muted)' }}>
            Left = Income − Spent
          </p>

          <div className="flex items-center gap-6">
            <DonutRing
              segments={ringSegments}
              centerLabel={`${currency} ${fmtAmount(saved, currency)}`}
              centerSublabel="left"
              trackColor="#E1F5EE"
              size={120}
            />

            {/* Legend */}
            <div className="flex-1 space-y-3">
              {[
                { dot: '#E7E7E3', label: 'Income',  value: income,   prev: prevIncome   },
                { dot: '#0F6E56', label: 'Spent',   value: expenses, prev: prevExpenses },
                { dot: '#1D9E75', label: 'Saved',   value: saved,    prev: null         },
              ].map(({ dot, label, value, prev }) => {
                const d = prev !== null ? delta(value, prev) : null;
                return (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dot }} />
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {d !== null && (
                        <span
                          className="text-[10px] font-medium px-1 py-0.5 rounded"
                          style={{
                            backgroundColor: d > 0 ? (label === 'Spent' ? '#FEE2E2' : '#D1FAE5') : (label === 'Spent' ? '#D1FAE5' : '#FEE2E2'),
                            color: d > 0 ? (label === 'Spent' ? '#E24B4A' : '#1D9E75') : (label === 'Spent' ? '#1D9E75' : '#E24B4A'),
                          }}
                        >
                          {d > 0 ? '+' : ''}{d}%
                        </span>
                      )}
                      <span className="text-xs font-medium" style={{ color: 'var(--fg)' }}>
                        {fmtAmount(value, currency)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stat tiles */}
        <div className="flex gap-3">
          <StatTile
            chipLabel="savings"
            label="Saved this month"
            value={`${currency} ${fmtAmount(saved, currency)}`}
            caption={income > 0 ? `${Math.round((saved / income) * 100)}% of income` : 'No income yet'}
          />
          <StatTile
            chipLabel="calendar"
            label="Safe to spend / day"
            value={perDay > 0 ? `${currency} ${fmtAmount(perDay, currency)}` : '—'}
            caption={daysLeft > 0 ? `${daysLeft} days left` : 'End of month'}
          />
        </div>

        {/* Budget progress */}
        <div
          className="rounded-[16px] p-4"
          style={{ backgroundColor: 'var(--card)', border: '0.5px solid var(--border)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Budget</p>
            <button
              onClick={() => { setEditingBudget(true); setBudgetInput(monthlyBudget > 0 ? String(monthlyBudget) : ''); }}
              className="text-xs font-medium"
              style={{ color: '#0F6E56' }}
            >
              {monthlyBudget > 0 ? 'Edit' : 'Set budget'}
            </button>
          </div>

          {editingBudget ? (
            <div className="flex gap-2">
              <input
                type="number"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                placeholder="Monthly budget"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && saveBudget()}
                className="flex-1 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0F6E56]"
                style={{ backgroundColor: 'var(--bg)', color: 'var(--fg)', border: '0.5px solid var(--border)' }}
              />
              <button onClick={saveBudget} className="px-3 py-2 rounded-xl text-xs font-medium text-white" style={{ backgroundColor: '#0F6E56' }}>Set</button>
              <button onClick={() => setEditingBudget(false)} className="px-3 py-2 rounded-xl text-xs" style={{ border: '0.5px solid var(--border)', color: 'var(--text-secondary)' }}>✕</button>
            </div>
          ) : monthlyBudget > 0 ? (
            <>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>
                  {currency} {fmtAmount(expenses, currency)}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  of {currency} {fmtAmount(monthlyBudget, currency)}
                </span>
              </div>
              <ProgressBar value={expenses} max={monthlyBudget} color={isOver ? '#E24B4A' : '#0F6E56'} />
              <p className="text-xs mt-2" style={{ color: isOver ? '#E24B4A' : 'var(--text-muted)' }}>
                {isOver
                  ? `${currency} ${fmtAmount(expenses - monthlyBudget, currency)} over budget`
                  : `${currency} ${fmtAmount(budgetLeft, currency)} left`}
              </p>
            </>
          ) : (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              No budget set — tap "Set budget" to track your spending limit.
            </p>
          )}
        </div>

        {/* Where it's going */}
        {expenses > 0 && (
          <div
            className="rounded-[16px] p-5"
            style={{ backgroundColor: 'var(--card)', border: '0.5px solid var(--border)' }}
          >
            <p className="text-xs font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>
              Where it's going
            </p>
            <StackedBar segments={bucketSegments} height={10} />
          </div>
        )}

        {/* Category breakdown */}
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
        {income === 0 && expenses === 0 && (
          <div
            className="rounded-[16px] p-8 text-center"
            style={{ backgroundColor: 'var(--card)', border: '0.5px solid var(--border)' }}
          >
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--fg)' }}>Nothing here yet</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Tap the + button to add your first entry
            </p>
          </div>
        )}

        {/* Cards */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Cards</p>
            <button
              onClick={() => setShowAddCard(true)}
              className="text-xs font-medium"
              style={{ color: '#0F6E56' }}
            >
              + Add
            </button>
          </div>

          {cards.length === 0 ? (
            <button
              onClick={() => setShowAddCard(true)}
              className="w-full py-5 rounded-[16px] text-xs border-2 border-dashed transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              Add your first card
            </button>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
              {cards.map((card) => {
                const pct = card.monthlyLimit > 0 ? Math.min((card.currentSpent / card.monthlyLimit) * 100, 100) : 0;
                const num = parseInt(card.color.replace('#', ''), 16);
                const r = Math.min(255, (num >> 16) + 30);
                const g = Math.min(255, ((num >> 8) & 0xff) + 30);
                const b = Math.min(255, (num & 0xff) + 30);
                const lighter = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                return (
                  <div
                    key={card.id}
                    className="shrink-0 rounded-2xl p-4 flex flex-col justify-between"
                    style={{
                      width: 160,
                      minHeight: 100,
                      background: `linear-gradient(135deg, ${card.color} 0%, ${lighter} 100%)`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-white text-xs font-semibold truncate pr-1">{card.name}</p>
                      <p className="text-white/60 text-[10px] font-mono shrink-0">••{card.last4}</p>
                    </div>
                    <div>
                      <p className="text-white text-sm font-bold">{currency} {fmtAmount(card.currentSpent, currency)}</p>
                      {card.monthlyLimit > 0 && (
                        <>
                          <p className="text-white/60 text-[10px] mb-1.5">of {currency} {fmtAmount(card.monthlyLimit, currency)}</p>
                          <div className="h-1 rounded-full bg-white/20">
                            <div className="h-1 rounded-full bg-white transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showAddCard} onClose={() => setShowAddCard(false)} title="Add New Card" key={showAddCard ? 'open' : 'closed'}>
        <AddCardForm
          onSubmit={(data) => { addCard(data); setShowAddCard(false); }}
          onCancel={() => setShowAddCard(false)}
        />
      </Modal>
    </div>
  );
}

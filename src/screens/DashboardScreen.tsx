'use client';

import { useMemo, useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import { fmtAmount } from '@/lib/currency';
import DonutRing from '@/components/ui/DonutRing';
import StackedBar from '@/components/ui/StackedBar';
import StatTile from '@/components/ui/StatTile';
import MonthPicker from '@/components/ui/MonthPicker';
import CategoryChip from '@/components/ui/CategoryChip';
import AddCardForm from '@/components/cards/AddCardForm';
import Modal from '@/components/ui/Modal';
import MiloMascot from '@/components/decor/MiloMascot';
import OnTrackBadge from '@/components/decor/OnTrackBadge';
import Sparkle from '@/components/decor/Sparkle';

const BUDGET_KEY = 'milely_monthly_budget';

function prevMonthStr(month: string) {
  const d = new Date(month);
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

function delta(current: number, previous: number) {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
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

  // teal = saved, coral = spent  (matches reference design)
  const ringSegments = [
    { value: saved,    color: '#0D9488' },
    { value: expenses, color: '#FF6B5E' },
  ];

  const bucketSegments = [
    { label: 'Needs',   value: expenses * 0.5, color: '#185FA5' },
    { label: 'Wants',   value: expenses * 0.3, color: '#BA7517' },
    { label: 'Savings', value: expenses * 0.2, color: '#1D9E75' },
  ];

  const legendItems = [
    { dot: '#0D9488', label: 'SAVED',  value: saved,    prev: null         },
    { dot: '#FF6B5E', label: 'SPENT',  value: expenses, prev: prevExpenses },
    { dot: '#E4E9E8', label: 'INCOME', value: income,   prev: prevIncome   },
  ];

  return (
    <div className="min-h-screen">

      {/* ── Gradient header band ── */}
      <div
        style={{
          position: 'relative',
          background: 'linear-gradient(135deg, #0D9488 0%, #2DD4BF 100%)',
          paddingTop: 52,
          paddingBottom: 36,
          paddingLeft: 20,
          paddingRight: 20,
          color: 'white',
          overflow: 'hidden',
        }}
      >
        {/* Decorative sparkles */}
        <div style={{ position: 'absolute', top: 18, right: 32, opacity: 0.9 }}>
          <Sparkle size={16} color="#FFC800" />
        </div>
        <div style={{ position: 'absolute', top: 36, right: 62, opacity: 0.7 }}>
          <Sparkle size={9} color="rgba(255,255,255,0.85)" />
        </div>
        <div style={{ position: 'absolute', top: 64, right: 26, opacity: 0.6 }}>
          <Sparkle size={7} color="rgba(255,255,255,0.6)" />
        </div>

        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', marginBottom: 6 }}>
          Mile-ly
        </p>
        <div style={{ color: 'white' }}>
          <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
        </div>

        {/* Wavy bottom edge */}
        <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0 }}>
          <svg viewBox="0 0 375 24" preserveAspectRatio="none" style={{ width: '100%', height: 24, display: 'block' }}>
            <path d="M0,14 C70,28 140,0 210,14 C280,28 330,6 375,14 L375,24 L0,24 Z" fill="var(--bg)" />
          </svg>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-4 space-y-3 pb-6 pt-2">

        {/* Balance ring card */}
        <div className="card-chunky p-5" style={{ position: 'relative', overflow: 'visible' }}>
          {/* OnTrackBadge overlapping top-right */}
          <div style={{ position: 'absolute', top: -14, right: 14, zIndex: 10 }}>
            <OnTrackBadge />
          </div>

          <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--m-slate, #777777)', marginBottom: 14 }}>
            Balance
          </p>

          {/* DonutRing + Mascot row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <DonutRing
              segments={ringSegments}
              centerLabel={`${currency} ${fmtAmount(saved, currency)}`}
              centerSublabel="left to spend"
              trackColor="#EFF3F2"
              size={140}
            />
            <MiloMascot />
          </div>

          {/* Horizontal legend */}
          <div style={{ borderTop: '1.5px solid var(--m-border, #E5E5E5)', marginTop: 16, paddingTop: 14, display: 'flex', justifyContent: 'space-around' }}>
            {legendItems.map(({ dot, label, value, prev }) => {
              const d = prev !== null ? delta(value, prev) : null;
              return (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot, display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--m-slate, #777777)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {label}
                    </span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--m-ink, #3C3C3C)' }}>
                    {fmtAmount(value, currency)}
                  </span>
                  {d !== null && (
                    <span style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '2px 5px',
                      borderRadius: 6,
                      background: d > 0 ? (label === 'SPENT' ? '#FEE2E2' : '#D1FAE5') : (label === 'SPENT' ? '#D1FAE5' : '#FEE2E2'),
                      color: d > 0 ? (label === 'SPENT' ? '#E24B4A' : '#1D9E75') : (label === 'SPENT' ? '#1D9E75' : '#E24B4A'),
                    }}>
                      {d > 0 ? '+' : ''}{d}%
                    </span>
                  )}
                </div>
              );
            })}
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
        <div className="card-chunky p-4">
          <div className="flex items-center justify-between mb-3">
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--m-slate, #777777)' }}>
              Monthly Budget
            </p>
            <button
              onClick={() => { setEditingBudget(true); setBudgetInput(monthlyBudget > 0 ? String(monthlyBudget) : ''); }}
              style={{ fontSize: 12, fontWeight: 700, color: 'var(--m-teal, #0D9488)' }}
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
                className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: 'var(--bg)', color: 'var(--fg)', border: '2px solid var(--m-border)', boxShadow: '0 2px 0 var(--m-border-dark)' }}
              />
              <button onClick={saveBudget} className="px-3 py-2 rounded-xl text-xs font-bold text-white" style={{ background: 'var(--m-teal)', boxShadow: '0 3px 0 var(--m-teal-dark)' }}>Set</button>
              <button onClick={() => setEditingBudget(false)} className="px-3 py-2 rounded-xl text-xs font-semibold" style={{ border: '2px solid var(--m-border)', color: 'var(--text-secondary)' }}>✕</button>
            </div>
          ) : monthlyBudget > 0 ? (
            <>
              <div className="flex items-baseline justify-between mb-2">
                <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--m-ink, #3C3C3C)' }}>
                  {currency} {fmtAmount(expenses, currency)}
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--m-slate, #777777)' }}>
                  of {currency} {fmtAmount(monthlyBudget, currency)}
                </span>
              </div>

              {/* Label-in-bar */}
              <div style={{ height: 22, borderRadius: 999, background: '#EFF3F2', overflow: 'hidden', position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    top: 0, left: 0, bottom: 0,
                    width: `${budgetPct * 100}%`,
                    background: isOver ? '#FF6B5E' : '#0D9488',
                    borderRadius: 999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: 8,
                    minWidth: budgetPct > 0 ? 8 : 0,
                    transition: 'width 0.6s ease',
                  }}
                >
                  {/* Highlight strip */}
                  <div style={{ position: 'absolute', top: 3, left: 4, right: 4, height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.3)' }} />
                  {budgetPct > 0.18 && (
                    <span style={{ color: 'white', fontSize: 11, fontWeight: 700, position: 'relative' }}>
                      {Math.round(budgetPct * 100)}%
                    </span>
                  )}
                </div>
              </div>

              <p style={{ marginTop: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: isOver ? '#FF6B5E' : 'var(--m-slate, #777777)' }}>
                {isOver
                  ? `${currency} ${fmtAmount(expenses - monthlyBudget, currency)} over budget`
                  : `${currency} ${fmtAmount(budgetLeft, currency)} left`}
              </p>
            </>
          ) : (
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              No budget set — tap "Set budget" to track your spending limit.
            </p>
          )}
        </div>

        {/* Where it's going */}
        {expenses > 0 && (
          <div className="card-chunky p-5">
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--m-slate, #777777)', marginBottom: 14 }}>
              Where it's going
            </p>
            <StackedBar segments={bucketSegments} />
          </div>
        )}

        {/* Category breakdown */}
        {catSpend.length > 0 && (
          <div className="card-chunky p-5">
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--m-slate, #777777)', marginBottom: 14 }}>
              Spending by category
            </p>
            <div className="space-y-4">
              {catSpend.map(({ name, amount }) => (
                <div key={name}>
                  <div className="flex items-center gap-3 mb-1.5">
                    <CategoryChip name={name} size={28} />
                    <div className="flex-1 flex justify-between text-xs">
                      <span style={{ fontWeight: 600, color: 'var(--m-ink, #3C3C3C)' }}>{name}</span>
                      <span style={{ fontWeight: 700, color: 'var(--m-ink, #3C3C3C)' }}>{currency} {fmtAmount(amount, currency)}</span>
                    </div>
                  </div>
                  {/* Mini progress bar */}
                  <div style={{ height: 6, borderRadius: 999, background: '#EFF3F2', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 999, background: '#0D9488', width: `${(amount / expenses) * 100}%`, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {income === 0 && expenses === 0 && (
          <div className="card-chunky p-8 text-center">
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--m-ink)' }} className="mb-1">Nothing here yet</p>
            <p style={{ fontSize: 12, color: 'var(--m-slate)' }}>
              Tap the + button to add your first entry
            </p>
          </div>
        )}

        {/* Cards */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--m-slate, #777777)' }}>
              Your Cards
            </p>
            <button
              onClick={() => setShowAddCard(true)}
              style={{ fontSize: 12, fontWeight: 700, color: 'var(--m-teal, #0D9488)' }}
            >
              + Add
            </button>
          </div>

          {cards.length === 0 ? (
            <button
              onClick={() => setShowAddCard(true)}
              className="w-full py-5 rounded-[18px] text-xs font-semibold transition-colors"
              style={{ border: '2px dashed var(--m-border)', color: 'var(--m-slate)' }}
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
                      boxShadow: '0 4px 0 rgba(0,0,0,0.18)',
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

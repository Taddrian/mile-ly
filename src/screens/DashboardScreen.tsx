'use client';

import { useMemo, useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import DonutRing from '@/components/ui/DonutRing';
import StackedBar from '@/components/ui/StackedBar';
import StatTile from '@/components/ui/StatTile';
import MonthPicker from '@/components/ui/MonthPicker';

function fmt(n: number) {
  return n.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

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
  const { entries, categories, selectedMonth, setSelectedMonth } = useApp();
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
              centerLabel={`SGD ${fmt(saved)}`}
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
                        {fmt(value)}
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
            value={`SGD ${fmt(saved)}`}
            caption={income > 0 ? `${Math.round((saved / income) * 100)}% of income` : 'No income yet'}
          />
          <StatTile
            chipLabel="calendar"
            label="Safe to spend / day"
            value={perDay > 0 ? `SGD ${fmt(perDay)}` : '—'}
            caption={daysLeft > 0 ? `${daysLeft} days left` : 'End of month'}
          />
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
      </div>
    </div>
  );
}

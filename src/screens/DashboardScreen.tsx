'use client';

import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import SummaryBar from '@/components/dashboard/SummaryBar';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import CategoryBreakdown from '@/components/dashboard/CategoryBreakdown';
import CardTile from '@/components/cards/CardTile';
import DonutChart from '@/components/ui/DonutChart';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function fmt(n: number) {
  return n.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function MonthSelector({ value, onChange }: { value: string; onChange: (m: string) => void }) {
  const date = new Date(value);
  const label = date.toLocaleDateString('en-SG', { month: 'long', year: 'numeric' });

  function shift(delta: number) {
    const d = new Date(value);
    d.setMonth(d.getMonth() + delta);
    onChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`);
  }

  return (
    <div className="flex items-center gap-3">
      <button onClick={() => shift(-1)} className="text-white/70 hover:text-white text-xl leading-none">‹</button>
      <span className="text-white text-2xl font-bold">{label}</span>
      <button onClick={() => shift(1)} className="text-white/70 hover:text-white text-xl leading-none">›</button>
    </div>
  );
}

export default function DashboardScreen() {
  const { cards, transactions, entries, categories, selectedMonth, setSelectedMonth } = useApp();

  const income = useMemo(() => entries.filter((e) => {
    const cat = categories.find((c) => c.id === e.categoryId);
    return cat?.type === 'income';
  }).reduce((s, e) => s + e.amount, 0), [entries, categories]);

  const expenses = useMemo(() => entries.filter((e) => {
    const cat = categories.find((c) => c.id === e.categoryId);
    return cat?.type === 'expense';
  }).reduce((s, e) => s + e.amount, 0), [entries, categories]);

  const balance = income - expenses;

  const chartData = cards.map((c) => ({
    name: c.name.split(' ')[0],
    value: c.currentSpent,
    color: c.color,
  }));

  const needs = expenses * 0.5;
  const wants = expenses * 0.3;
  const savings = expenses * 0.2;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-[#0d6e5a] dark:bg-[#0a5747] px-5 pt-14 pb-10 md:pt-8 md:rounded-2xl">
        <p className="text-white/70 text-sm font-medium mb-2">
          {getGreeting()} 👋
        </p>
        <MonthSelector value={selectedMonth} onChange={setSelectedMonth} />
      </div>

      <div className="px-4 space-y-5 -mt-5">
        {/* Income / Expense / Balance */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Income</p>
              <p className="text-base font-bold text-[#0d6e5a]">+{fmt(income)}</p>
            </div>
            <div className="text-center border-x border-zinc-100 dark:border-zinc-800">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Expenses</p>
              <p className="text-base font-bold text-red-500">-{fmt(expenses)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Balance</p>
              <p className={`text-base font-bold ${balance >= 0 ? 'text-zinc-900 dark:text-zinc-100' : 'text-red-500'}`}>
                {balance >= 0 ? '+' : ''}{fmt(balance)}
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <SummaryBar cards={cards} />

        {/* 50/30/20 Budget Helper */}
        {expenses > 0 && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800">
            <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4">50/30/20 Guide</h2>
            <div className="space-y-3">
              {[
                { label: 'Needs (50%)', value: needs, color: 'bg-blue-400' },
                { label: 'Wants (30%)', value: wants, color: 'bg-purple-400' },
                { label: 'Savings (20%)', value: savings, color: 'bg-[#0d6e5a]' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-500 dark:text-zinc-400">{label}</span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">SGD {fmt(value)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div className={`h-2 rounded-full ${color}`} style={{ width: '100%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category breakdown */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800">
          <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4">Spending by Category</h2>
          <CategoryBreakdown transactions={transactions} />
        </div>

        {/* Donut chart */}
        {chartData.some((d) => d.value > 0) && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800">
            <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Spend by Card</h2>
            <DonutChart data={chartData} />
          </div>
        )}

        {/* Card details */}
        {cards.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3 px-1">Card Details</h2>
            <div className="space-y-3">
              {cards.map((card) => (
                <CardTile key={card.id} card={card} />
              ))}
            </div>
          </div>
        )}

        {/* Recent transactions */}
        <div>
          <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3 px-1">Recent Transactions</h2>
          <RecentTransactions transactions={transactions} cards={cards} />
        </div>
      </div>

      <div className="h-6" />
    </div>
  );
}

'use client';

import { useApp } from '@/context/AppContext';
import SummaryBar from '@/components/dashboard/SummaryBar';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import CardTile from '@/components/cards/CardTile';
import DonutChart from '@/components/ui/DonutChart';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function getMonthYear() {
  return new Date().toLocaleDateString('en-SG', { month: 'long', year: 'numeric' });
}

export default function DashboardScreen() {
  const { cards, transactions } = useApp();

  const chartData = cards.map((c) => ({
    name: c.name.split(' ')[0],
    value: c.currentSpent,
    color: c.color,
  }));

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-blue-600 dark:bg-blue-700 px-4 pt-14 pb-8 text-white rounded-b-3xl">
        <p className="text-lg font-semibold opacity-90">{getGreeting()}, Aaron 👋</p>
        <p className="text-sm opacity-70 mt-0.5">{getMonthYear()} Spending Overview</p>
      </div>

      <div className="px-4 space-y-5 -mt-4">
        {/* Summary */}
        <SummaryBar cards={cards} />

        {/* Spending by card */}
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Spending by Card</h2>
          <div className="space-y-3">
            {cards.map((card) => (
              <CardTile key={card.id} card={card} />
            ))}
          </div>
        </div>

        {/* Donut chart */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Spend Distribution</h2>
          <DonutChart data={chartData} />
        </div>

        {/* Recent transactions */}
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Recent Transactions</h2>
          <RecentTransactions transactions={transactions} cards={cards} />
        </div>
      </div>

      <div className="h-6" />
    </div>
  );
}

'use client';

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

function getMonth() {
  return new Date().toLocaleDateString('en-SG', { month: 'long', year: 'numeric' });
}

function InsightBanner({ cards, transactions }: { cards: import('@/types').CreditCard[]; transactions: import('@/types').Transaction[] }) {
  const totalLimit = cards.reduce((s, c) => s + c.monthlyLimit, 0);
  const totalSpent = cards.reduce((s, c) => s + c.currentSpent, 0);
  const pct = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;
  const remaining = totalLimit - totalSpent;

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - now.getDate();

  let message = '';
  let icon = '💡';
  let bgColor = 'bg-[#e6f4f1] dark:bg-[#0d2e28]';
  let textColor = 'text-[#0d6e5a] dark:text-[#4ade9e]';

  if (pct >= 90) {
    icon = '🚨';
    bgColor = 'bg-red-50 dark:bg-red-950/40';
    textColor = 'text-red-600 dark:text-red-400';
    message = `You've used ${pct.toFixed(0)}% of your budget. Only SGD ${remaining.toFixed(0)} left.`;
  } else if (pct >= 75) {
    icon = '⚠️';
    bgColor = 'bg-amber-50 dark:bg-amber-950/40';
    textColor = 'text-amber-700 dark:text-amber-400';
    message = `${pct.toFixed(0)}% of budget used with ${daysLeft} days left this month.`;
  } else if (transactions.length === 0) {
    message = 'No transactions yet. Add your first spend below.';
  } else {
    const dailyAvg = totalSpent / Math.max(1, now.getDate());
    const projected = dailyAvg * daysInMonth;
    if (projected > totalLimit) {
      icon = '📈';
      message = `At this pace, you'll exceed your limit by SGD ${(projected - totalLimit).toFixed(0)}.`;
    } else {
      message = `${pct.toFixed(0)}% used · ${daysLeft} days left · SGD ${remaining.toLocaleString('en-SG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} remaining.`;
    }
  }

  return (
    <div className={`${bgColor} rounded-2xl px-4 py-3.5 flex items-start gap-3`}>
      <span className="text-lg leading-none mt-0.5">{icon}</span>
      <p className={`text-sm font-medium ${textColor} leading-snug`}>{message}</p>
    </div>
  );
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
      <div className="bg-[#0d6e5a] dark:bg-[#0a5747] px-5 pt-14 pb-10 md:pt-8 md:rounded-2xl">
        <p className="text-white/70 text-sm font-medium mb-1">{getGreeting()}, Aaron 👋</p>
        <p className="text-white text-2xl font-bold">{getMonth()}</p>
      </div>

      <div className="px-4 space-y-5 -mt-5">
        {/* Summary */}
        <SummaryBar cards={cards} />

        {/* Insight banner */}
        <InsightBanner cards={cards} transactions={transactions} />

        {/* Category breakdown */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800">
          <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4">
            Spending by Category
          </h2>
          <CategoryBreakdown transactions={transactions} />
        </div>

        {/* Donut chart */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800">
          <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
            Spend by Card
          </h2>
          <DonutChart data={chartData} />
        </div>

        {/* Spending by card */}
        <div>
          <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3 px-1">
            Card Details
          </h2>
          <div className="space-y-3">
            {cards.map((card) => (
              <CardTile key={card.id} card={card} />
            ))}
          </div>
        </div>

        {/* Recent transactions */}
        <div>
          <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3 px-1">
            Recent Transactions
          </h2>
          <RecentTransactions transactions={transactions} cards={cards} />
        </div>
      </div>

      <div className="h-6" />
    </div>
  );
}

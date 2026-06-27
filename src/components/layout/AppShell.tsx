'use client';

import { useState } from 'react';
import { Tab } from '@/types';
import { AppProvider } from '@/context/AppContext';
import BottomNav from '@/components/layout/BottomNav';
import DashboardScreen from '@/screens/DashboardScreen';
import CardsScreen from '@/screens/CardsScreen';
import TransactionsScreen from '@/screens/TransactionsScreen';
import PointsScreen from '@/screens/PointsScreen';
import SettingsScreen from '@/screens/SettingsScreen';

function ScreenContent({ activeTab }: { activeTab: Tab }) {
  switch (activeTab) {
    case 'dashboard': return <DashboardScreen />;
    case 'cards': return <CardsScreen />;
    case 'transactions': return <TransactionsScreen />;
    case 'points': return <PointsScreen />;
    case 'settings': return <SettingsScreen />;
  }
}

export default function AppShell() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  return (
    <AppProvider>
      <div className="relative min-h-screen bg-zinc-50 dark:bg-zinc-950 md:flex">
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="pb-20 md:pb-0 min-h-screen overflow-y-auto flex-1 md:ml-56">
          <div className="max-w-md mx-auto md:max-w-2xl md:px-8 md:py-8">
            <ScreenContent activeTab={activeTab} />
          </div>
        </main>
      </div>
    </AppProvider>
  );
}

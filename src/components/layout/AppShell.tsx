'use client';

import { useState } from 'react';
import { Tab } from '@/types';
import { AppProvider } from '@/context/AppContext';
import BottomNav from '@/components/layout/BottomNav';
import DashboardScreen from '@/screens/DashboardScreen';
import CardsScreen from '@/screens/CardsScreen';
import TransactionsScreen from '@/screens/TransactionsScreen';
import SettingsScreen from '@/screens/SettingsScreen';

function ScreenContent({ activeTab }: { activeTab: Tab }) {
  switch (activeTab) {
    case 'dashboard': return <DashboardScreen />;
    case 'cards': return <CardsScreen />;
    case 'transactions': return <TransactionsScreen />;
    case 'settings': return <SettingsScreen />;
  }
}

export default function AppShell() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  return (
    <AppProvider>
      <div className="relative min-h-screen bg-zinc-50 dark:bg-zinc-950 max-w-md mx-auto">
        <main className="pb-20 min-h-screen overflow-y-auto">
          <ScreenContent activeTab={activeTab} />
        </main>
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </AppProvider>
  );
}

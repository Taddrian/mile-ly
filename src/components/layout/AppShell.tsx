'use client';

import { useState } from 'react';
import { Tab, MoreSection } from '@/types';
import { AppProvider } from '@/context/AppContext';
import BottomNav from '@/components/layout/BottomNav';
import DashboardScreen from '@/screens/DashboardScreen';
import TransactionsScreen from '@/screens/TransactionsScreen';
import PointsScreen from '@/screens/PointsScreen';
import MoreScreen from '@/screens/MoreScreen';
import AddEntrySheet from '@/components/transactions/AddEntrySheet';

function ScreenContent({
  activeTab,
  moreSection,
  onMoreSection,
}: {
  activeTab: Tab;
  moreSection: MoreSection;
  onMoreSection: (s: MoreSection) => void;
}) {
  switch (activeTab) {
    case 'home':         return <DashboardScreen />;
    case 'transactions': return <TransactionsScreen />;
    case 'miles':        return <PointsScreen />;
    case 'more':         return <MoreScreen section={moreSection} onSection={onMoreSection} />;
  }
}

export default function AppShell() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showAdd, setShowAdd] = useState(false);
  const [moreSection, setMoreSection] = useState<MoreSection>(null);

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    if (tab !== 'more') setMoreSection(null);
  }

  return (
    <AppProvider>
      <div className="relative min-h-screen md:flex" style={{ backgroundColor: 'var(--bg)' }}>
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} onAddPress={() => setShowAdd(true)} />

        <main className="pb-24 md:pb-0 min-h-screen overflow-y-auto flex-1 md:ml-56">
          <div className="max-w-md mx-auto md:max-w-2xl">
            <ScreenContent
              activeTab={activeTab}
              moreSection={moreSection}
              onMoreSection={setMoreSection}
            />
          </div>
        </main>

        <AddEntrySheet isOpen={showAdd} onClose={() => setShowAdd(false)} />
      </div>
    </AppProvider>
  );
}

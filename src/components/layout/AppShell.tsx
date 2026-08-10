'use client';

import { useState } from 'react';
import { Tab, MoreSection } from '@/types';
import { AppProvider } from '@/context/AppContext';
import BottomNav from '@/components/layout/BottomNav';
import TransactionsScreen from '@/screens/TransactionsScreen';
import RoomScreen from '@/screens/RoomScreen';
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
    case 'home':         return <RoomScreen />;
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

        {/* Home is a locked, non-scrolling full-bleed screen (the room fits
            whatever the device's viewport is, via its own dvh sizing +
            "slice" scene cropping, instead of scrolling) — every other tab
            keeps the normal scrollable page treatment. */}
        <main className={`flex-1 md:ml-56 md:pb-0 md:h-[100dvh] md:overflow-y-auto ${
          activeTab === 'home' ? 'h-[100dvh] overflow-hidden' : 'min-h-screen overflow-y-auto pb-24'
        }`}>
          <div className="max-w-md mx-auto md:max-w-2xl">
            <div key={activeTab} className="tab-fade-in">
              <ScreenContent
                activeTab={activeTab}
                moreSection={moreSection}
                onMoreSection={setMoreSection}
              />
            </div>
          </div>
        </main>

        <AddEntrySheet isOpen={showAdd} onClose={() => setShowAdd(false)} />
      </div>
    </AppProvider>
  );
}

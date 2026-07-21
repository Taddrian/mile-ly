'use client';

import { Tab } from '@/types';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onAddPress: () => void;
}

const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
    <path d="M9 21V12h6v9" />
  </svg>
);

const TransactionsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 6l4-4 4 4" /><path d="M12 2v10.5" />
    <path d="M16 18l-4 4-4-4" /><path d="M12 22V11.5" />
  </svg>
);

const MilesIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.5a2.5 2.5 0 0 1-2.5 2.5H4a2 2 0 0 1-2-2v-1l2-6h14l2 4.5" />
    <path d="M12 7V4" /><path d="M8 7l-2-3" /><path d="M16 7l2-3" />
    <circle cx="19" cy="17" r="1" />
  </svg>
);

const MoreIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

const TABS: { id: Tab; label: string; Icon: React.FC }[] = [
  { id: 'home',         label: 'Home',         Icon: HomeIcon         },
  { id: 'transactions', label: 'Transactions', Icon: TransactionsIcon },
  { id: 'miles',        label: 'Miles',        Icon: MilesIcon        },
  { id: 'more',         label: 'More',         Icon: MoreIcon         },
];

export default function BottomNav({ activeTab, onTabChange, onAddPress }: BottomNavProps) {
  const ACTIVE = '#0F6E56';
  const INACTIVE = '#9A9A94';

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:right-auto md:top-0 md:h-screen md:w-56 md:flex md:flex-col"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
    >
      {/* Mobile bottom bar */}
      <div
        className="flex items-end pb-safe md:hidden"
        style={{ borderTop: '0.5px solid var(--border)' }}
      >
        {/* Left two tabs */}
        {TABS.slice(0, 2).map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className="flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors"
              style={{ color: active ? ACTIVE : INACTIVE }}
            >
              <Icon />
              <span>{label}</span>
            </button>
          );
        })}

        {/* Center Add button */}
        <div className="flex-1 flex justify-center pb-1">
          <button
            onClick={onAddPress}
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 -mt-4"
            style={{ backgroundColor: ACTIVE }}
            aria-label="Add entry"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>

        {/* Right two tabs */}
        {TABS.slice(2).map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className="flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors"
              style={{ color: active ? ACTIVE : INACTIVE }}
            >
              <Icon />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Desktop sidebar */}
      <div
        className="hidden md:flex md:flex-col md:h-full md:py-6 md:px-3"
        style={{ borderRight: '0.5px solid var(--border)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-2 pb-8">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: ACTIVE }}>
            <span className="text-white font-medium text-sm">M</span>
          </div>
          <span className="font-medium text-sm" style={{ color: 'var(--fg)' }}>Mile-ly</span>
        </div>

        {/* Nav items — with Add button between budget and miles */}
        <div className="flex flex-col gap-1">
          {TABS.slice(0, 2).map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left"
                style={{
                  backgroundColor: active ? '#E1F5EE' : 'transparent',
                  color: active ? ACTIVE : 'var(--text-secondary)',
                }}
              >
                <span style={{ color: active ? ACTIVE : 'var(--text-muted)' }}><Icon /></span>
                {label}
              </button>
            );
          })}

          {/* Add button row */}
          <button
            onClick={onAddPress}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left"
            style={{ color: 'var(--text-secondary)' }}
          >
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: ACTIVE }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
            Add entry
          </button>

          {TABS.slice(2).map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left"
                style={{
                  backgroundColor: active ? '#E1F5EE' : 'transparent',
                  color: active ? ACTIVE : 'var(--text-secondary)',
                }}
              >
                <span style={{ color: active ? ACTIVE : 'var(--text-muted)' }}><Icon /></span>
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

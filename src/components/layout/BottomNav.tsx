'use client';

import { useState } from 'react';
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

const ACTIVE_COLOR  = '#0D9488';
const INACTIVE_COLOR = '#777777';

export default function BottomNav({ activeTab, onTabChange, onAddPress }: BottomNavProps) {
  const [bouncing, setBouncing] = useState<Tab | null>(null);

  function handleTabPress(id: Tab) {
    setBouncing(id);
    setTimeout(() => setBouncing(null), 200);
    onTabChange(id);
  }

  return (
    <nav
      className="md:fixed md:left-0 md:top-0 md:h-screen md:w-56 md:flex md:flex-col"
      style={{ backgroundColor: 'var(--card)' }}
    >
      {/* Mobile floating glass pill */}
      <div
        className="fixed left-4 right-4 z-40 md:hidden flex justify-center"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
      >
        <div
          className="flex items-center justify-between w-full"
          style={{
            maxWidth: 360,
            padding: '8px 14px',
            borderRadius: 999,
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            backdropFilter: 'blur(40px) saturate(2)',
            WebkitBackdropFilter: 'blur(40px) saturate(2)',
          }}
        >
          {/* Left two tabs */}
          {TABS.slice(0, 2).map(({ id, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => handleTabPress(id)}
                aria-label={TABS.find((t) => t.id === id)?.label}
                className={`flex items-center justify-center ${bouncing === id ? 'tab-bounce' : ''}`}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  color: active ? '#fff' : 'var(--glass-icon)',
                  background: active ? ACTIVE_COLOR : 'transparent',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                <Icon />
              </button>
            );
          })}

          {/* Center Add button */}
          <button
            onClick={onAddPress}
            className="flex items-center justify-center active:scale-95 transition-transform"
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: ACTIVE_COLOR,
              boxShadow: '0 4px 12px rgba(13,148,136,0.4)',
              flexShrink: 0,
            }}
            aria-label="Add entry"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>

          {/* Right two tabs */}
          {TABS.slice(2).map(({ id, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => handleTabPress(id)}
                aria-label={TABS.find((t) => t.id === id)?.label}
                className={`flex items-center justify-center ${bouncing === id ? 'tab-bounce' : ''}`}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  color: active ? '#fff' : 'var(--glass-icon)',
                  background: active ? ACTIVE_COLOR : 'transparent',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                <Icon />
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop sidebar — unchanged */}
      <div
        className="hidden md:flex md:flex-col md:h-full md:py-6 md:px-3"
        style={{ borderRight: '0.5px solid var(--border)' }}
      >
        <div className="flex items-center gap-2.5 px-2 pb-8">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: ACTIVE_COLOR }}>
            <span className="text-white font-medium text-sm">M</span>
          </div>
          <span className="font-medium text-sm" style={{ color: 'var(--fg)' }}>Mile-ly</span>
        </div>

        <div className="flex flex-col gap-1">
          {TABS.slice(0, 2).map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left"
                style={{
                  backgroundColor: active ? 'var(--m-teal-xl)' : 'transparent',
                  color: active ? ACTIVE_COLOR : 'var(--text-secondary)',
                }}
              >
                <span style={{ color: active ? ACTIVE_COLOR : 'var(--text-muted)' }}><Icon /></span>
                {label}
              </button>
            );
          })}

          <button
            onClick={onAddPress}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left"
            style={{ color: 'var(--text-secondary)' }}
          >
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: ACTIVE_COLOR }}
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
                  backgroundColor: active ? 'var(--m-teal-xl)' : 'transparent',
                  color: active ? ACTIVE_COLOR : 'var(--text-secondary)',
                }}
              >
                <span style={{ color: active ? ACTIVE_COLOR : 'var(--text-muted)' }}><Icon /></span>
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

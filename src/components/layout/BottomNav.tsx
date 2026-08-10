'use client';

import { useState } from 'react';
import { Tab } from '@/types';
import { useApp } from '@/context/AppContext';
import { hueVars } from '@/lib/hue';

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

const RoomIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v6a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-6" />
    <path d="M5 12a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3" />
    <path d="M8 19v-3M16 19v-3" />
  </svg>
);

const MilesIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 20l-1.4-6.9L21 8.5c1.2-1.2 1.5-2.7 1-3.5-.8-.5-2.3-.2-3.5 1L13.4 10 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2z" />
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
  { id: 'room',         label: 'Room',         Icon: RoomIcon         },
  { id: 'miles',        label: 'Miles',        Icon: MilesIcon        },
  { id: 'more',         label: 'More',         Icon: MoreIcon         },
];

// Distinct inactive-tab colors instead of uniform gray, matching the reference's
// colorful icon strip. The active tab overrides this with the candy hue-flood.
const TAB_COLORS: Record<Tab, string> = {
  home: '#f4845f',
  transactions: '#5fb2f2',
  room: '#f2a6cf',
  miles: '#b689ec',
  more: '#f0b429',
};

export default function BottomNav({ activeTab, onTabChange, onAddPress }: BottomNavProps) {
  const { budgetState } = useApp();
  const activeColor = budgetState === 'coral' ? 'var(--hue-neg-deep)' : 'var(--hue-pos-deep)';
  const activeTint = budgetState === 'coral' ? 'rgba(232,115,79,0.12)' : 'var(--m-teal-xl)';
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
            boxShadow: `0 8px 24px rgba(0,0,0,0.12), inset 0 1px 0 var(--glass-highlight)`,
            backdropFilter: 'blur(14px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(14px) saturate(1.4)',
          }}
        >
          {/* Left three tabs */}
          {TABS.slice(0, 3).map(({ id, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => handleTabPress(id)}
                aria-label={TABS.find((t) => t.id === id)?.label}
                className={`flex items-center justify-center ${bouncing === id ? 'tab-bounce' : ''} ${active ? 'node-candy' : ''}`}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  color: active ? '#fff' : TAB_COLORS[id],
                  background: active ? undefined : 'transparent',
                  transition: 'color 0.15s, --node-deep 0.4s ease, --node-ring 0.4s ease, --node-shadow 0.4s ease, box-shadow 0.4s ease',
                  ...(active ? hueVars(budgetState) : {}),
                }}
              >
                <Icon />
              </button>
            );
          })}

          {/* Center Add button */}
          <button
            onClick={onAddPress}
            className="node-candy flex items-center justify-center active:scale-95 transition-transform"
            style={{
              width: 44,
              height: 44,
              flexShrink: 0,
              ...hueVars(budgetState),
            }}
            aria-label="Add entry"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>

          {/* Right two tabs */}
          {TABS.slice(3).map(({ id, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => handleTabPress(id)}
                aria-label={TABS.find((t) => t.id === id)?.label}
                className={`flex items-center justify-center ${bouncing === id ? 'tab-bounce' : ''} ${active ? 'node-candy' : ''}`}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  color: active ? '#fff' : TAB_COLORS[id],
                  background: active ? undefined : 'transparent',
                  transition: 'color 0.15s, --node-deep 0.4s ease, --node-ring 0.4s ease, --node-shadow 0.4s ease, box-shadow 0.4s ease',
                  ...(active ? hueVars(budgetState) : {}),
                }}
              >
                <Icon />
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop sidebar */}
      <div
        className="hidden md:flex md:flex-col md:h-full md:py-6 md:px-3"
        style={{ borderRight: '0.5px solid var(--border)' }}
      >
        <div className="flex items-center gap-2.5 px-2 pb-8">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: activeColor }}>
            <span className="text-white font-medium text-sm">M</span>
          </div>
          <span className="font-medium text-sm" style={{ color: 'var(--fg)' }}>Mile-ly</span>
        </div>

        <div className="flex flex-col gap-1">
          {TABS.slice(0, 3).map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left"
                style={{
                  backgroundColor: active ? activeTint : 'transparent',
                  color: active ? activeColor : 'var(--text-secondary)',
                }}
              >
                <span style={{ color: active ? activeColor : TAB_COLORS[id] }}><Icon /></span>
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
              style={{ backgroundColor: activeColor }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
            Add entry
          </button>

          {TABS.slice(3).map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left"
                style={{
                  backgroundColor: active ? activeTint : 'transparent',
                  color: active ? activeColor : 'var(--text-secondary)',
                }}
              >
                <span style={{ color: active ? activeColor : TAB_COLORS[id] }}><Icon /></span>
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

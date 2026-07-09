'use client';

import { MoreSection } from '@/types';
import CardsScreen from '@/screens/CardsScreen';
import TransactionsScreen from '@/screens/TransactionsScreen';
import SettingsScreen from '@/screens/SettingsScreen';

const MENU_ITEMS: { id: Exclude<MoreSection, null>; label: string; description: string; Icon: React.FC }[] = [
  {
    id: 'cards',
    label: 'Cards',
    description: 'Manage your credit & debit cards',
    Icon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="3" /><path d="M2 10h20" />
      </svg>
    ),
  },
  {
    id: 'transactions',
    label: 'Transactions',
    description: 'Browse your full transaction history',
    Icon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 6l4-4 4 4" /><path d="M12 2v10.5" />
        <path d="M16 18l-4 4-4-4" /><path d="M12 22V11.5" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Preferences, categories & account',
    Icon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
  },
];

interface MoreScreenProps {
  section: MoreSection;
  onSection: (s: MoreSection) => void;
}

export default function MoreScreen({ section, onSection }: MoreScreenProps) {
  if (section === 'cards')        return <CardsScreen />;
  if (section === 'transactions') return <TransactionsScreen />;
  if (section === 'settings')     return <SettingsScreen />;

  return (
    <div className="min-h-screen">
      <div className="px-5 pt-14 pb-4 md:pt-6">
        <span className="text-lg font-medium" style={{ color: 'var(--fg)' }}>More</span>
      </div>

      <div className="px-4 space-y-2">
        {MENU_ITEMS.map(({ id, label, description, Icon }) => (
          <button
            key={id}
            onClick={() => onSection(id)}
            className="w-full flex items-center gap-4 p-4 rounded-[16px] text-left transition-opacity active:opacity-70"
            style={{ backgroundColor: 'var(--card)', border: '0.5px solid var(--border)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: '#E1F5EE', color: '#0F6E56' }}
            >
              <Icon />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--fg)' }}>{label}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{description}</p>
            </div>
            <svg
              className="ml-auto shrink-0"
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              style={{ color: 'var(--text-muted)' }}
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { MoreSection } from '@/types';
import SettingsScreen from '@/screens/SettingsScreen';
import ChangelogScreen from '@/screens/ChangelogScreen';
import FeedbackScreen from '@/screens/FeedbackScreen';
import { supabase } from '@/lib/supabase';

interface MenuItem {
  id: Exclude<MoreSection, null>;
  label: string;
  description: string;
  emoji: string;
  iconBg: string;
  iconColor: string;
  Icon: React.FC<{ color: string }>;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'changelog',
    label: "What's New",
    description: 'Latest features and improvements',
    emoji: '⭐',
    iconBg: '#FFF3C4',
    iconColor: '#D97706',
    Icon: ({ color }) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    id: 'feedback',
    label: 'Feedback',
    description: 'Report a bug or suggest a feature',
    emoji: '💬',
    iconBg: '#DBEAFE',
    iconColor: '#2563EB',
    Icon: ({ color }) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Preferences, categories & account',
    emoji: '⚙️',
    iconBg: '#FFEDD5',
    iconColor: '#EA580C',
    Icon: ({ color }) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    setSigningOut(false);
  }
  if (section !== null) {
    return (
      <div>
        <button
          onClick={() => onSection(null)}
          className="flex items-center gap-2 px-4 pt-4 pb-2"
          style={{ color: 'var(--m-teal, #0D9488)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 700 }}>More</span>
        </button>
        {section === 'changelog' && <ChangelogScreen />}
        {section === 'feedback'  && <FeedbackScreen />}
        {section === 'settings'  && <SettingsScreen />}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div style={{ padding: '52px 20px 20px', paddingTop: 52 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--m-slate)', marginBottom: 4 }}>
          Menu
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--m-ink, #3C3C3C)' }}>
          More
        </h1>
      </div>

      <div className="px-4 space-y-3 pb-8">
        {MENU_ITEMS.map(({ id, label, description, iconBg, iconColor, Icon }) => (
          <button
            key={id}
            onClick={() => onSection(id)}
            className="card-chunky w-full flex items-center gap-4 p-4 text-left transition-opacity active:opacity-70"
          >
            {/* Colored icon badge */}
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: iconBg,
                flexShrink: 0,
              }}
            >
              <Icon color={iconColor} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--m-ink, #3C3C3C)' }}>{label}</p>
              <p style={{ fontSize: 12, color: 'var(--m-slate, #777777)', marginTop: 2 }}>{description}</p>
            </div>

            <svg
              style={{ color: 'var(--m-border-dark, #D9D9D9)', flexShrink: 0 }}
              width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        ))}
      </div>

      {/* Sign Out */}
      <div className="px-4 pb-4">
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="card-chunky w-full flex items-center gap-4 p-4 text-left transition-opacity active:opacity-70"
          style={{ borderColor: '#FFD6D3', boxShadow: '0 3px 0 #FFBDB8' }}
        >
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#FFF0EE', flexShrink: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E04E42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 15, fontWeight: 800, color: '#E04E42' }}>
              {signingOut ? 'Signing out…' : 'Sign Out'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--m-slate, #777777)', marginTop: 2 }}>End your current session</p>
          </div>
        </button>
      </div>

      {/* Version tag */}
      <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--m-border-dark)', paddingBottom: 16 }}>
        Mile-ly v0.6.0
      </p>
    </div>
  );
}

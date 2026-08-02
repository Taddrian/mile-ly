'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import { Category } from '@/types';
import { SEA_CURRENCIES } from '@/lib/currency';
import { WalletIcon, CalendarIcon, LayersIcon } from '@/components/decor/icons';

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        height: 28,
        width: 48,
        borderRadius: 999,
        background: checked ? 'linear-gradient(180deg, var(--node-ring), var(--node-deep))' : 'var(--m-border, #E5E5E5)',
        transition: 'background 0.2s ease',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          display: 'block',
          height: 20,
          width: 20,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
          transform: `translateX(${checked ? 24 : 4}px)`,
          transition: 'transform 0.2s ease',
        }}
      />
    </button>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[var(--m-border,#E5E5E5)] last:border-b-0" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 0' }}>
      <div style={{ minWidth: 0 }}>
        <p className="font-display" style={{ fontSize: 14, fontWeight: 700, color: 'var(--m-ink, #3C3C3C)' }}>{label}</p>
        {description && <p style={{ fontSize: 12, color: 'var(--m-slate, #777777)', marginTop: 2 }}>{description}</p>}
      </div>
      {children}
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  borderRadius: 10,
  padding: '7px 12px',
  outline: 'none',
  cursor: 'pointer',
  border: 'none',
  background: 'color-mix(in srgb, var(--node-ring) 16%, white)',
  color: 'var(--node-deep)',
};

function SectionCard({ icon, iconBg, title, children }: { icon: React.ReactNode; iconBg: string; title: string; children: React.ReactNode }) {
  return (
    <div className="card-chunky" style={{ padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: iconBg, flexShrink: 0 }}>
          {icon}
        </div>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--m-slate, #777777)' }}>{title}</p>
      </div>
      {children}
    </div>
  );
}

const inputClass = 'flex-1 rounded-xl px-3 py-2 text-sm focus:outline-none';

function CategoriesSection() {
  const { categories, addCategory, deleteCategory } = useApp();
  const [tab, setTab] = useState<'expense' | 'income'>('expense');
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  const filtered = categories.filter((c) => c.type === tab);

  async function handleAdd() {
    const name = newName.trim();
    if (!name) return;
    await addCategory(name, tab);
    setNewName('');
    setAdding(false);
  }

  return (
    <SectionCard icon={<LayersIcon size={17} color="#8F5FD6" />} iconBg="#F1E9FB" title="Categories">
      <div style={{ display: 'flex', borderRadius: 12, overflow: 'hidden', marginBottom: 12, marginTop: 8 }}>
        {(['expense', 'income'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="font-display"
            style={{
              flex: 1,
              padding: '8px 0',
              fontSize: 12,
              fontWeight: 700,
              transition: 'all 0.15s ease',
              background: tab === t
                ? t === 'expense' ? 'linear-gradient(180deg, #FF9A70, #E8734F)' : 'linear-gradient(180deg, var(--node-ring), var(--node-deep))'
                : 'color-mix(in srgb, var(--m-border) 40%, white)',
              color: tab === t ? '#fff' : 'var(--m-slate)',
            }}
          >
            {t === 'expense' ? 'Expense' : 'Income'}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ fontSize: 12, color: 'var(--m-slate)', paddingBottom: 12 }}>No {tab} categories yet.</p>
      )}

      <div style={{ marginBottom: 12 }}>
        {filtered.map((cat) => (
          <div key={cat.id} className="border-b border-[var(--m-border,#E5E5E5)] last:border-b-0" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--m-ink, #3C3C3C)' }}>{cat.name}</span>
            <button onClick={() => deleteCategory(cat.id)} style={{ fontSize: 11, fontWeight: 700, color: '#E04E42' }}>Remove</button>
          </div>
        ))}
      </div>

      {adding ? (
        <div style={{ display: 'flex', gap: 8, paddingBottom: 4 }}>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Category name"
            className={inputClass}
            style={{ background: 'color-mix(in srgb, var(--m-border) 30%, white)', color: 'var(--m-ink)' }}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button
            onClick={handleAdd}
            className="font-display"
            style={{ padding: '8px 14px', borderRadius: 10, background: 'linear-gradient(180deg, var(--node-ring), var(--node-deep))', color: '#fff', fontSize: 12, fontWeight: 700 }}
          >
            Add
          </button>
          <button onClick={() => setAdding(false)} style={{ padding: '8px 12px', borderRadius: 10, border: '1.5px solid var(--m-border)', fontSize: 12, color: 'var(--m-slate)' }}>✕</button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="font-display" style={{ fontSize: 12, fontWeight: 700, color: 'var(--node-deep)', paddingBottom: 4, display: 'block' }}>
          + New category
        </button>
      )}
    </SectionCard>
  );
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

export default function SettingsScreen() {
  const { currency, setCurrency, cycleStartDay, setCycleStartDay } = useApp();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains('dark'));

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    function onSystemChange(e: MediaQueryListEvent) {
      if (!localStorage.getItem('theme')) {
        document.documentElement.classList.toggle('dark', e.matches);
        setDarkMode(e.matches);
      }
    }
    mq.addEventListener('change', onSystemChange);
    return () => mq.removeEventListener('change', onSystemChange);
  }, []);

  function toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    setDarkMode(isDark);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  async function handleExportCSV() {
    const { data: entries } = await supabase.from('entries').select('*').order('created_at');
    const { data: cats } = await supabase.from('categories').select('*');
    if (!entries || !cats) return;

    const catMap = Object.fromEntries((cats as Category[]).map((c) => [c.id, c]));
    const header = 'Date,Month,Category,Type,Amount,Note';
    const rows = entries.map((e) => {
      const cat = catMap[e.category_id];
      return [
        (e.created_at as string)?.slice(0, 10) ?? '',
        e.month,
        cat?.name ?? '',
        cat?.type ?? '',
        Number(e.amount).toFixed(2),
        e.note ?? '',
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });

    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `milely-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen">
      <div style={{ padding: '52px 20px 20px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--m-slate)', marginBottom: 4 }}>
          Preferences
        </p>
        <h1 className="font-display" style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--m-ink, #3C3C3C)' }}>
          Settings
        </h1>
      </div>

      <div className="px-4 space-y-3 pb-8">
        <SectionCard icon={<WalletIcon size={17} color="#E8A33F" />} iconBg="#FBF0DB" title="Currency">
          <SettingRow label="Default Currency" description="Used for all spending displays">
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={selectStyle}>
              {SEA_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
              ))}
            </select>
          </SettingRow>
        </SectionCard>

        <SectionCard icon={<CalendarIcon size={17} color="#3D7FD1" />} iconBg="#E5F0FB" title="Billing Cycle">
          <SettingRow label="Cycle Start Day" description="When your card statement / salary period begins">
            <select value={cycleStartDay} onChange={(e) => setCycleStartDay(Number(e.target.value))} style={selectStyle}>
              {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>{ordinal(day)}</option>
              ))}
            </select>
          </SettingRow>
        </SectionCard>

        <SectionCard
          icon={
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#E0568C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.4 5.4 0 0 1-7.54-7.54c-.44-.06-.9-.1-1.36-.1z" />
            </svg>
          }
          iconBg="#FBE5EE"
          title="Appearance"
        >
          <SettingRow label="Dark Mode" description="Switch to dark theme">
            <ToggleSwitch checked={darkMode} onChange={toggleDarkMode} />
          </SettingRow>
        </SectionCard>

        <CategoriesSection />

        <SectionCard
          icon={
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#129C8C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v13" /><path d="M7 12l5 5 5-5" /><path d="M4 20h16" />
            </svg>
          }
          iconBg="#DFF3EF"
          title="Data"
        >
          <SettingRow label="Export CSV" description="Download all your entries">
            <button
              onClick={handleExportCSV}
              className="font-display"
              style={{ fontSize: 12, fontWeight: 700, padding: '8px 16px', borderRadius: 10, background: 'linear-gradient(180deg, var(--node-ring), var(--node-deep))', color: '#fff' }}
            >
              Export
            </button>
          </SettingRow>
        </SectionCard>

        <SectionCard
          icon={
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#E04E42" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          }
          iconBg="#FFF0EE"
          title="Account"
        >
          <SettingRow label="Sign Out" description="Sign out of your account">
            <button
              onClick={handleSignOut}
              className="font-display"
              style={{ fontSize: 12, fontWeight: 700, color: '#E04E42', background: '#FFF0EE', padding: '8px 16px', borderRadius: 10 }}
            >
              Sign Out
            </button>
          </SettingRow>
        </SectionCard>

        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ width: 48, height: 48, borderRadius: 16, background: 'linear-gradient(180deg, var(--node-ring), var(--node-deep))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.18)' }}>
            <span className="font-display" style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>M</span>
          </div>
          <p className="font-display" style={{ fontSize: 14, fontWeight: 700, color: 'var(--m-ink)' }}>Mile-ly</p>
          <p style={{ fontSize: 11, color: 'var(--m-slate)', marginTop: 2 }}>v0.9.0 · Supabase</p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
        checked ? 'bg-[#0d6e5a]' : 'bg-zinc-200 dark:bg-zinc-700'
      }`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <div>
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{label}</p>
        {description && <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl px-5 shadow-sm border border-zinc-100 dark:border-zinc-800">
      <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pt-4 pb-1">{title}</p>
      {children}
    </div>
  );
}

const inputClass = 'flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0d6e5a]';

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
    <div className="bg-white dark:bg-zinc-900 rounded-2xl px-5 shadow-sm border border-zinc-100 dark:border-zinc-800">
      <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pt-4 pb-3">Categories</p>

      {/* Tab */}
      <div className="flex rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 mb-4">
        {(['expense', 'income'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-semibold transition-colors ${
              tab === t
                ? t === 'expense' ? 'bg-red-500 text-white' : 'bg-[#0d6e5a] text-white'
                : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-500'
            }`}
          >
            {t === 'expense' ? 'Expense' : 'Income'}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-xs text-zinc-400 pb-3">No {tab} categories yet.</p>
      )}

      <div className="space-y-1 mb-3">
        {filtered.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
            <span className="text-sm text-zinc-800 dark:text-zinc-200">{cat.name}</span>
            <button onClick={() => deleteCategory(cat.id)} className="text-xs text-red-400 hover:text-red-600 font-semibold">Remove</button>
          </div>
        ))}
      </div>

      {adding ? (
        <div className="flex gap-2 pb-4">
          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Category name" className={inputClass} autoFocus onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
          <button onClick={handleAdd} className="px-3 py-2 rounded-xl bg-[#0d6e5a] text-white text-xs font-semibold">Add</button>
          <button onClick={() => setAdding(false)} className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500">✕</button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="text-xs text-[#0d6e5a] font-semibold hover:underline pb-4 block">
          + New category
        </button>
      )}
    </div>
  );
}

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  function toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle('dark');
    setDarkMode(isDark);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  return (
    <div className="min-h-screen">
      <div className="px-5 pt-14 pb-4 md:pt-6">
        <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Preferences</p>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Settings</h1>
      </div>

      <div className="px-4 space-y-4">
        <SectionCard title="Currency">
          <SettingRow label="Default Currency" description="Used for all spending displays">
            <span className="text-sm font-bold text-[#0d6e5a] bg-[#e6f4f1] dark:bg-[#0d2e28] px-3 py-1 rounded-lg">SGD</span>
          </SettingRow>
        </SectionCard>

        <SectionCard title="Appearance">
          <SettingRow label="Dark Mode" description="Switch to dark theme">
            <ToggleSwitch checked={darkMode} onChange={toggleDarkMode} />
          </SettingRow>
        </SectionCard>

        <CategoriesSection />

        <SectionCard title="Data">
          <SettingRow label="Export CSV" description="Download your transaction history">
            <button disabled className="text-xs font-semibold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-lg cursor-not-allowed">
              Coming Soon
            </button>
          </SettingRow>
        </SectionCard>

        <SectionCard title="Account">
          <SettingRow label="Sign Out" description="Sign out of your account">
            <button onClick={handleSignOut} className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-950/40 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors">
              Sign Out
            </button>
          </SettingRow>
        </SectionCard>

        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-2xl bg-[#0d6e5a] flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Mile-ly</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-0.5">v0.2.0 · Supabase</p>
        </div>
      </div>
    </div>
  );
}

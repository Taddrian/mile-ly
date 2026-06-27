'use client';

import { useState, useEffect } from 'react';

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        checked ? 'bg-blue-600' : 'bg-zinc-200 dark:bg-zinc-700'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
      {children}
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl px-5 shadow-sm border border-zinc-100 dark:border-zinc-800">
      <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pt-4 pb-2">
        {title}
      </h2>
      {children}
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

  return (
    <div className="min-h-screen">
      <div className="px-4 pt-14 pb-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">Settings</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">App preferences</p>
      </div>

      <div className="px-4 space-y-4">
        <SectionCard title="Currency">
          <SettingRow label="Default Currency">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-lg">
              SGD
            </span>
          </SettingRow>
        </SectionCard>

        <SectionCard title="Appearance">
          <SettingRow label="Dark Mode">
            <ToggleSwitch checked={darkMode} onChange={toggleDarkMode} />
          </SettingRow>
        </SectionCard>

        <SectionCard title="Data">
          <SettingRow label="Export CSV">
            <button
              disabled
              className="text-sm font-medium text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-4 py-1.5 rounded-lg cursor-not-allowed"
            >
              Coming Soon
            </button>
          </SettingRow>
        </SectionCard>

        <div className="text-center py-6">
          <p className="text-xs text-zinc-400 dark:text-zinc-600">Mile-ly v0.1.0 · UI only · Mock data</p>
        </div>
      </div>
    </div>
  );
}

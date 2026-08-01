'use client';

import { ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm backdrop-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl shadow-2xl max-h-[92vh] overflow-y-auto sheet-pop-in"
        style={{ background: 'var(--card)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pull handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div style={{ width: 40, height: 5, borderRadius: 999, background: 'var(--m-border)' }} />
        </div>
        <div
          className="flex items-center justify-between px-5 pt-3 pb-4"
          style={{ borderBottom: '2px solid var(--m-border)' }}
        >
          <h2 className="font-display" style={{ fontSize: 17, fontWeight: 700, color: 'var(--fg)' }}>{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors text-lg leading-none"
            style={{ background: 'var(--bg)', border: '2px solid var(--m-border)', color: 'var(--m-slate)' }}
          >
            ×
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

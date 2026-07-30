'use client';

import { useRef, useState } from 'react';

interface SwipeableRowProps {
  children: React.ReactNode;
  onDelete: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const REVEAL = 76;

export default function SwipeableRow({ children, onDelete, className, style }: SwipeableRowProps) {
  const [offset, setOffset] = useState(0);
  const startX = useRef(0);
  const startY = useRef(0);
  const locked = useRef<'h' | 'v' | null>(null);

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    locked.current = null;
  }

  function onTouchMove(e: React.TouchEvent) {
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    if (!locked.current) {
      if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
      locked.current = Math.abs(dx) >= Math.abs(dy) ? 'h' : 'v';
    }
    if (locked.current !== 'h') return;

    if (dx < 0) setOffset(Math.max(dx, -REVEAL));
    else if (offset < 0) setOffset(Math.min(dx + offset, 0));
  }

  function onTouchEnd() {
    setOffset(offset < -REVEAL / 2 ? -REVEAL : 0);
  }

  const armed = offset <= -REVEAL;

  return (
    <div className={`relative overflow-hidden ${className ?? ''}`} style={style}>
      {/* Delete affordance */}
      <div
        className="absolute right-0 top-0 bottom-0 flex items-center justify-center"
        style={{ width: REVEAL, backgroundColor: armed ? '#C93A3A' : '#E24B4A', transition: 'background-color 0.15s' }}
      >
        <button
          onClick={onDelete}
          className={`w-full h-full flex items-center justify-center text-white text-xs font-semibold ${armed ? 'delete-armed-pulse' : ''}`}
        >
          Delete
        </button>
      </div>

      {/* Sliding content */}
      <div
        style={{
          transform: `translateX(${offset}px)`,
          transition: locked.current === 'h' ? 'none' : 'transform 0.2s ease',
          backgroundColor: 'var(--card)',
          touchAction: 'pan-y',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={() => { if (offset !== 0) setOffset(0); }}
      >
        {children}
      </div>
    </div>
  );
}

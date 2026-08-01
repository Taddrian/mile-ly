'use client';

import { ReactNode } from 'react';
import { hueVars } from '@/lib/hue';

interface PathNodeProps {
  label: string;
  amount?: string;
  /** Share of this cycle's total expenses (0-1). Drawn as a progress ring when active. */
  fraction?: number;
  active: boolean;
  budgetState: 'teal' | 'coral';
  icon?: ReactNode;
  showCheck?: boolean;
  onClick?: () => void;
  size?: number;
  style?: React.CSSProperties;
}

export default function PathNode({
  label,
  amount,
  fraction = 0,
  active,
  budgetState,
  icon,
  showCheck,
  onClick,
  size = 82,
  style,
}: PathNodeProps) {
  const pct = Math.round(Math.min(Math.max(fraction, 0), 1) * 100);
  const ringSize = size + 20;
  const ringR = (ringSize - 8) / 2;
  const ringCirc = 2 * Math.PI * ringR;
  // Cap the visible arc a touch short of a full circle so there's always a gap, like the reference.
  const arcLen = ringCirc * Math.min(pct / 100, 0.9);

  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      onClick={onClick}
      className="path-node-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: 150,
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      <div style={{ position: 'relative', width: ringSize, height: ringSize, flexShrink: 0 }}>
        {active && pct > 0 && (
          <svg viewBox={`0 0 ${ringSize} ${ringSize}`} width={ringSize} height={ringSize} style={{ position: 'absolute', inset: 0 }}>
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={ringR}
              fill="none"
              stroke="var(--node-deep)"
              strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray={`${arcLen} ${ringCirc}`}
              opacity={0.55}
              transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
              style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(0.22,1,0.36,1)' }}
            />
          </svg>
        )}
        <div
          className={`node-candy ${active ? '' : 'node-candy--locked'}`}
          style={{
            position: 'absolute',
            inset: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...(active ? hueVars(budgetState) : {}),
          }}
        >
          <div style={{ position: 'relative', zIndex: 1, color: active ? '#fff' : 'var(--node-locked-text)' }}>{icon}</div>
          {showCheck && (
            <div className="node-check-badge">
              <svg viewBox="0 0 20 20" width={14} height={14}>
                <path d="M4 10.5L8 14.5L16 5.5" stroke="var(--node-deep)" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>
      </div>
      <p
        className="font-display"
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: active ? 'var(--m-ink)' : 'var(--node-locked-text)',
          marginTop: 10,
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '100%',
        }}
      >
        {label}
        {amount && <span style={{ color: 'var(--m-slate)', fontWeight: 600 }}> · {amount}</span>}
      </p>
    </Wrapper>
  );
}

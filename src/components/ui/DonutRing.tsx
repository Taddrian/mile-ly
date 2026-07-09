'use client';

const R = 52;
const CX = 60;
const CY = 60;
const SW = 13;
const CIRC = 2 * Math.PI * R; // ≈ 326.73

interface Segment {
  value: number;
  color: string;
}

interface DonutRingProps {
  segments: Segment[];
  centerLabel: string;
  centerSublabel?: string;
  trackColor?: string;
  size?: number;
}

export default function DonutRing({
  segments,
  centerLabel,
  centerSublabel,
  trackColor = '#E1F5EE',
  size = 120,
}: DonutRingProps) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const scale = size / 120;

  let offset = 0;
  const arcs = segments.map((seg) => {
    const len = total > 0 ? (seg.value / total) * CIRC : 0;
    const dashoffset = -offset;
    offset += len;
    return { ...seg, len, dashoffset };
  });

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 120 120"
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Track */}
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke={trackColor}
          strokeWidth={SW}
        />
        {/* Segments */}
        {arcs.map((arc, i) => (
          <circle
            key={i}
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke={arc.color}
            strokeWidth={SW}
            strokeDasharray={`${arc.len} ${CIRC - arc.len}`}
            strokeDashoffset={arc.dashoffset}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      {/* Center label (absolutely positioned so we control font) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span
          className="font-medium leading-tight text-zinc-900 dark:text-zinc-100"
          style={{ fontSize: Math.round(14 * scale) }}
        >
          {centerLabel}
        </span>
        {centerSublabel && (
          <span
            className="text-zinc-400"
            style={{ fontSize: Math.round(10 * scale) }}
          >
            {centerSublabel}
          </span>
        )}
      </div>
    </div>
  );
}

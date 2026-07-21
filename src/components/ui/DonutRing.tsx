'use client';

const R = 44;
const CX = 60;
const CY = 60;
const SW = 18;
const CIRC = 2 * Math.PI * R; // ≈ 276.5

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

function star5Points(cx: number, cy: number, outer: number, inner: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return pts.join(' ');
}

export default function DonutRing({
  segments,
  centerLabel,
  centerSublabel,
  trackColor = '#EFF3F2',
  size = 140,
}: DonutRingProps) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const scale = size / 120;

  // Each segment is shortened by GAP to create breathing room for round caps
  const GAP = 8;
  let offset = 0;
  const arcs = segments.map((seg) => {
    const fullLen = total > 0 ? (seg.value / total) * CIRC : 0;
    const len = Math.max(0, fullLen - GAP);
    const dashoffset = -offset;
    offset += fullLen;
    return { ...seg, len, dashoffset };
  });

  // Star cap: sits at the visual end of the first (primary) arc
  const primaryFrac = total > 0 && segments[0] ? segments[0].value / total : 0;
  const visualR = R * scale;
  // Visual angle from 12-o'clock going CW = primaryFrac * 2π; convert to standard math angle:
  const capAngle = (-Math.PI / 2) + primaryFrac * 2 * Math.PI;
  const halfSize = size / 2;
  const starS = 18;
  const starLeft = halfSize + visualR * Math.cos(capAngle) - starS / 2;
  const starTop  = halfSize + visualR * Math.sin(capAngle) - starS / 2;
  const showStar = primaryFrac > 0.06 && primaryFrac < 0.96;

  return (
    <div className="relative" style={{ width: size, height: size, flexShrink: 0 }}>
      {/* Ring */}
      <svg
        viewBox="0 0 120 120"
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Track */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={trackColor} strokeWidth={SW} />
        {/* Coloured arcs */}
        {arcs.map((arc, i) => (
          <circle
            key={i}
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke={arc.color}
            strokeWidth={SW}
            strokeDasharray={`${arc.len} ${CIRC}`}
            strokeDashoffset={arc.dashoffset}
            strokeLinecap="round"
          />
        ))}
      </svg>

      {/* Star cap — rendered outside the rotated SVG so it stays upright */}
      {showStar && (
        <svg
          width={starS}
          height={starS}
          viewBox={`0 0 ${starS} ${starS}`}
          aria-hidden
          style={{ position: 'absolute', left: starLeft, top: starTop, pointerEvents: 'none' }}
        >
          <polygon
            points={star5Points(starS / 2, starS / 2, starS / 2 - 1, (starS / 2 - 1) * 0.42)}
            fill="#FFC800"
            stroke="#E6A800"
            strokeWidth="1"
          />
        </svg>
      )}

      {/* Scattered sparkles */}
      <svg
        width="12" height="12" viewBox="0 0 14 14" aria-hidden
        style={{ position: 'absolute', top: '10%', left: '8%', pointerEvents: 'none' }}
      >
        <polygon points="7,0 8.2,5.8 14,7 8.2,8.2 7,14 5.8,8.2 0,7 5.8,5.8" fill="#FFC800" />
      </svg>
      <svg
        width="9" height="9" viewBox="0 0 14 14" aria-hidden
        style={{ position: 'absolute', top: '7%', right: '12%', pointerEvents: 'none' }}
      >
        <polygon points="7,0 8.2,5.8 14,7 8.2,8.2 7,14 5.8,8.2 0,7 5.8,5.8" fill="#2DD4BF" />
      </svg>
      <svg
        width="8" height="8" viewBox="0 0 14 14" aria-hidden
        style={{ position: 'absolute', bottom: '12%', left: '4%', pointerEvents: 'none' }}
      >
        <polygon points="7,0 8.2,5.8 14,7 8.2,8.2 7,14 5.8,8.2 0,7 5.8,5.8" fill="#FF6B5E" />
      </svg>

      {/* Center text — auto-sized to fit inside the inner circle */}
      {(() => {
        // Inner circle usable width in px
        const innerR = (R - SW / 2) * scale;
        const usableW = innerR * 2 * 0.78;

        // Split "SGD 2,448.07" → currencyPart + numberPart for better sizing
        const spaceIdx = centerLabel.indexOf(' ');
        const hasCurrency = spaceIdx !== -1;
        const currencyPart = hasCurrency ? centerLabel.slice(0, spaceIdx) : '';
        const numberPart   = hasCurrency ? centerLabel.slice(spaceIdx + 1) : centerLabel;

        // Auto-size the number based on character count
        const charRatio = 0.58; // avg char width / fontSize for weight-800 numeric
        const autoSize = Math.floor(usableW / (numberPart.length * charRatio));
        const numberFontSize = Math.min(Math.max(autoSize, 8), 18);

        const currencyFontSize = Math.min(Math.round(7 * scale), 9);
        const sublabelFontSize = Math.min(Math.round(7 * scale), 9);

        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
            {hasCurrency && (
              <span style={{
                fontSize: currencyFontSize,
                fontWeight: 700,
                color: 'var(--m-slate, #777777)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                lineHeight: 1.2,
              }}>
                {currencyPart}
              </span>
            )}
            <span style={{
              fontSize: numberFontSize,
              fontWeight: 800,
              color: 'var(--m-ink, #3C3C3C)',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
            }}>
              {numberPart}
            </span>
            {centerSublabel && (
              <span style={{
                fontSize: sublabelFontSize,
                fontWeight: 700,
                color: 'var(--m-slate, #777777)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginTop: 2,
              }}>
                {centerSublabel}
              </span>
            )}
          </div>
        );
      })()}
    </div>
  );
}

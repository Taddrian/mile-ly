'use client';

import { useMemo } from 'react';
import { buildPixelBoxShadow, buildPixelBoxShadowLayer, pixelBoxCenter, maskSprite } from '@/lib/pixelSprite';

// Pixel-sprite fairy Milo, ported verbatim from the Claude Design handoff's
// SPRITE/SPRITE_COLORS table (box-shadow pixel grid, mirrored L/R halves per row).
const PIXEL = 2.1;

const seg = (n: number, ch: string) => ch.repeat(n);

function mkRow(wing: string, body: string, center: string) {
  const half = wing + body;
  return half + center + half.split('').reverse().join('');
}

const SPRITE = [
  mkRow(seg(12, '.'), seg(5, '.'), 'H'),
  mkRow(seg(12, '.'), seg(2, '.') + seg(3, 'H'), 'H'),
  mkRow(seg(12, '.'), seg(1, '.') + seg(4, 'H'), 'H'),
  mkRow(seg(10, '.') + 'Ww', seg(5, 'H'), 'H'),
  mkRow(seg(9, '.') + 'WWw', seg(5, 'H'), 'H'),
  mkRow(seg(8, '.') + 'WWww', seg(1, 'S') + seg(4, 'H'), 'H'),
  mkRow(seg(7, '.') + 'WWWww', seg(2, 'S') + seg(3, 'B'), 'B'),
  mkRow(seg(6, '.') + 'WWWwww', seg(5, 'S'), 'S'),
  mkRow(seg(5, '.') + 'gWWwwww', seg(1, 'S') + seg(3, 'E') + seg(1, 'S'), 'S'),
  mkRow(seg(5, '.') + 'gWWwwww', seg(1, 'S') + seg(3, 'E') + seg(1, 'S'), 'S'),
  mkRow(seg(6, '.') + 'WWWwww', seg(5, 'S'), 'S'),
  mkRow(seg(7, '.') + 'WWWww', seg(5, 'S'), 'M'),
  mkRow(seg(8, '.') + 'WWww', seg(5, 'S'), 'S'),
  mkRow(seg(9, '.') + 'WWw', seg(1, 'P') + seg(4, 'N'), 'N'),
  mkRow(seg(10, '.') + 'Ww', seg(1, 'P') + seg(4, 'D'), 'D'),
  mkRow(seg(11, '.') + 'w', seg(1, 'P') + seg(4, 'D'), 'D'),
  mkRow(seg(12, '.'), seg(2, '.') + seg(3, 'D'), 'D'),
  mkRow(seg(12, '.'), seg(3, '.') + seg(2, 'P'), '.'),
];

const SPRITE_COLORS: Record<string, string> = {
  H: '#ffffff', S: '#f5c2dd', E: '#1c2e3a', B: '#8a7690', M: '#e8613f',
  D: '#ffffff', N: '#e6e1ec', P: '#f2a6cf', W: '#7db8f5', w: '#4f8ff0', g: '#8fbfa0',
};

const cols = SPRITE[0].length;
const rows = SPRITE.length;
const spriteW = cols * PIXEL;
const spriteH = rows * PIXEL;

// ── Layer split (module-scope, geometry is static — only colors vary per
// render) — separates the single sprite into independently-animatable
// pieces: two wings (flap, always) and two feet (tap, only while walking).
// Everything else stays one "body" layer. The last row's two 2px-wide `P`
// clusters (either side of center, with a gap between — distinct from the
// single-pixel `P` dress trim on rows above) are the feet peeking out from
// under the hem; `W`/`w`/`g` are exclusively wing colors wherever they occur.
const lastRow = rows - 1;
const midCol = cols / 2;
const isWing = (c: string) => c === 'W' || c === 'w' || c === 'g';
const isFoot = (c: string, y: number) => c === 'P' && y === lastRow;

const BODY_SPRITE = maskSprite(SPRITE, (c, y) => !isWing(c) && !isFoot(c, y));
const LEFT_WING_SPRITE = maskSprite(SPRITE, (c, _y, x) => isWing(c) && x < midCol);
const RIGHT_WING_SPRITE = maskSprite(SPRITE, (c, _y, x) => isWing(c) && x >= midCol);
const LEFT_FOOT_SPRITE = maskSprite(SPRITE, (c, y, x) => isFoot(c, y) && x < midCol);
const RIGHT_FOOT_SPRITE = maskSprite(SPRITE, (c, y, x) => isFoot(c, y) && x >= midCol);

const LEFT_WING_ORIGIN = pixelBoxCenter(LEFT_WING_SPRITE, PIXEL);
const RIGHT_WING_ORIGIN = pixelBoxCenter(RIGHT_WING_SPRITE, PIXEL);

interface MiloFairyProps {
  // Wardrobe recolor — merged onto the base SPRITE_COLORS letter->hex map. Omit
  // for the default look (every existing call site does this — output is then
  // byte-identical to before this prop existed).
  colorOverrides?: Record<string, string>;
  // Feet visibly tap only while actually moving (Room's wandering instance);
  // everywhere else Milo is just standing, so feet stay in their still pose.
  // Wings flap either way — that motion is independent of walking.
  walking?: boolean;
}

export default function MiloFairy({ colorOverrides, walking = false }: MiloFairyProps) {
  const colors = colorOverrides ? { ...SPRITE_COLORS, ...colorOverrides } : SPRITE_COLORS;

  const bodyShadow = useMemo(() => buildPixelBoxShadow(BODY_SPRITE, colors, PIXEL), [colors]);
  const leftFootShadow = useMemo(() => buildPixelBoxShadow(LEFT_FOOT_SPRITE, colors, PIXEL), [colors]);
  const rightFootShadow = useMemo(() => buildPixelBoxShadow(RIGHT_FOOT_SPRITE, colors, PIXEL), [colors]);
  const leftWingShadow = useMemo(
    () => buildPixelBoxShadowLayer(LEFT_WING_SPRITE, colors, PIXEL, LEFT_WING_ORIGIN.cx, LEFT_WING_ORIGIN.cy),
    [colors]
  );
  const rightWingShadow = useMemo(
    () => buildPixelBoxShadowLayer(RIGHT_WING_SPRITE, colors, PIXEL, RIGHT_WING_ORIGIN.cx, RIGHT_WING_ORIGIN.cy),
    [colors]
  );

  return (
    <div style={{ width: spriteW + 10, height: spriteH + 8, position: 'relative', flex: 'none' }}>
      <div className="milo-fairy-alive" style={{ position: 'absolute', inset: -6, borderRadius: '50%', background: 'radial-gradient(circle, var(--node-ring), transparent 70%)', opacity: 0.3, zIndex: -1 }} />

      {/* Whole composite pulses together (existing "alive" breathing effect);
          feet/wings each carry their own additional local animation on top. */}
      <div className="milo-fairy-alive" style={{ position: 'absolute', left: 5, top: 4, width: PIXEL, height: PIXEL, transition: 'box-shadow 0.4s' }}>
        <div style={{ position: 'absolute', inset: 0, boxShadow: bodyShadow }} />

        <div
          className={`room-milo-foot-tap ${walking ? '' : 'room-milo-foot-still'}`}
          style={{ position: 'absolute', inset: 0, boxShadow: leftFootShadow }}
        />
        <div
          className={`room-milo-foot-tap ${walking ? '' : 'room-milo-foot-still'}`}
          style={{ position: 'absolute', inset: 0, boxShadow: rightFootShadow, animationDelay: '0.35s' }}
        />

        <div
          className="room-milo-wing-flap"
          style={{ position: 'absolute', left: LEFT_WING_ORIGIN.cx, top: LEFT_WING_ORIGIN.cy, width: PIXEL, height: PIXEL, boxShadow: leftWingShadow }}
        />
        <div
          className="room-milo-wing-flap"
          style={{ position: 'absolute', left: RIGHT_WING_ORIGIN.cx, top: RIGHT_WING_ORIGIN.cy, width: PIXEL, height: PIXEL, boxShadow: rightWingShadow, animationDelay: '0.1s' }}
        />
      </div>

      <span className="milo-fairy-sparkle" style={{ position: 'absolute', top: 2, left: -6, width: 3, height: 3, borderRadius: '50%', background: 'var(--node-ring)' }} />
      <span className="milo-fairy-sparkle milo-fairy-sparkle-2" style={{ position: 'absolute', bottom: 10, right: -4, width: 3, height: 3, borderRadius: '50%', background: 'var(--node-ring)' }} />
      <span className="milo-fairy-bubble" style={{ position: 'absolute', right: 0, top: 2, width: 4, height: 4, borderRadius: '50%', background: 'var(--node-ring)' }} />
      <span className="milo-fairy-bubble milo-fairy-bubble-2" style={{ position: 'absolute', left: -2, top: 30, width: 3, height: 3, borderRadius: '50%', background: 'var(--node-ring)' }} />
    </div>
  );
}

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
const shadows: string[] = [];
SPRITE.forEach((row, y) => {
  for (let x = 0; x < row.length; x++) {
    const c = row[x];
    if (c !== '.') shadows.push(`${x * PIXEL}px ${y * PIXEL}px 0 ${SPRITE_COLORS[c]}`);
  }
});
const boxShadow = shadows.join(', ');
const spriteW = cols * PIXEL;
const spriteH = rows * PIXEL;

export default function MiloFairy() {
  return (
    <div style={{ width: spriteW + 10, height: spriteH + 8, position: 'relative', flex: 'none' }}>
      <div className="milo-fairy-alive" style={{ position: 'absolute', inset: -6, borderRadius: '50%', background: 'radial-gradient(circle, var(--node-ring), transparent 70%)', opacity: 0.3, zIndex: -1 }} />
      <div
        className="milo-fairy-alive"
        style={{ position: 'absolute', left: 5, top: 4, width: PIXEL, height: PIXEL, background: 'transparent', boxShadow, transition: 'box-shadow 0.4s' }}
      />
      <span className="milo-fairy-sparkle" style={{ position: 'absolute', top: 2, left: -6, width: 3, height: 3, borderRadius: '50%', background: 'var(--node-ring)' }} />
      <span className="milo-fairy-sparkle milo-fairy-sparkle-2" style={{ position: 'absolute', bottom: 10, right: -4, width: 3, height: 3, borderRadius: '50%', background: 'var(--node-ring)' }} />
      <span className="milo-fairy-bubble" style={{ position: 'absolute', right: 0, top: 2, width: 4, height: 4, borderRadius: '50%', background: 'var(--node-ring)' }} />
      <span className="milo-fairy-bubble milo-fairy-bubble-2" style={{ position: 'absolute', left: -2, top: 30, width: 3, height: 3, borderRadius: '50%', background: 'var(--node-ring)' }} />
    </div>
  );
}

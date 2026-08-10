// Shared box-shadow pixel-grid technique, factored out of MiloFairy.tsx so
// furniture sprites (src/components/decor/roomSprites.tsx) can use the exact
// same rendering approach instead of a second implementation.
export function buildPixelBoxShadow(sprite: string[], colors: Record<string, string>, pixel: number): string {
  const shadows: string[] = [];
  sprite.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const c = row[x];
      if (c !== '.') shadows.push(`${x * pixel}px ${y * pixel}px 0 ${colors[c] ?? '#000'}`);
    }
  });
  return shadows.join(', ');
}

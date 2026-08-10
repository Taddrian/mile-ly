// Shared box-shadow pixel-grid technique, factored out of MiloFairy.tsx so
// furniture sprites (src/components/decor/roomSprites.tsx) can use the exact
// same rendering approach instead of a second implementation.
export function buildPixelBoxShadow(sprite: string[], colors: Record<string, string>, pixel: number): string {
  return buildPixelBoxShadowLayer(sprite, colors, pixel, 0, 0);
}

// Same technique, but every shadow offset is measured from a given
// (originX, originY) instead of the sprite's own top-left — lets a sub-region
// of a larger sprite (e.g. one wing) be rendered by its own tiny "real"
// element positioned AT that origin, so a CSS transform on that element
// (scaleX, rotate) pivots around the sub-region's own visual center instead
// of the whole sprite's corner. Body/limb layers that only ever translate
// don't need this — origin only matters for scale/rotate.
export function buildPixelBoxShadowLayer(
  sprite: string[], colors: Record<string, string>, pixel: number, originX: number, originY: number
): string {
  const shadows: string[] = [];
  sprite.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const c = row[x];
      if (c !== '.') shadows.push(`${x * pixel - originX}px ${y * pixel - originY}px 0 ${colors[c] ?? '#000'}`);
    }
  });
  return shadows.join(', ');
}

// Bounding-box center (in px) of a sprite's non-empty cells — the origin to
// pass to buildPixelBoxShadowLayer for a piece that needs to scale/rotate
// around its own visual middle (see above).
export function pixelBoxCenter(sprite: string[], pixel: number): { cx: number; cy: number } {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  sprite.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] !== '.') {
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
    }
  });
  if (minX === Infinity) return { cx: 0, cy: 0 };
  return { cx: ((minX + maxX + 1) / 2) * pixel, cy: ((minY + maxY + 1) / 2) * pixel };
}

// Blank out every cell that doesn't satisfy `keep` — used to split one
// sprite into independently animatable layers (body / left foot / right
// wing / ...) that composite back to the exact original image when stacked.
export function maskSprite(sprite: string[], keep: (ch: string, y: number, x: number) => boolean): string[] {
  return sprite.map((row, y) =>
    row.split('').map((c, x) => (c !== '.' && keep(c, y, x) ? c : '.')).join('')
  );
}

# Handoff round 2b: feedback on the HUD/dock sample

## Context
This is feedback on the sample you just sent back for round 2 (`design-handoff/room-scene-brief-v2.md`) — the top HUD (level badge + XP bar, Sparks coin counter) and bottom icon dock (Decor/Wardrobe/Pet/Budget), shown in both light and dark variants. Overall direction is good — the glass-pill material and the dark-mode swap both work. Five things to tighten up before we treat this as final:

## 1. Drop the financial mini-stats row — don't build it
The original round-2 brief asked for a second HUD row under the level/coins row (saved amount, % saved, days left). This sample left it out, and it's better that way — cleaner, closer to the "Mini Cozy Room" reference, less competing with the level/coins row. **Decision: leave this row out for good.** Those 3 numbers will live inside the "Budget" panel (behind the bottom-dock tap), not on the persistent HUD. No design work needed here — just confirming the sample's simpler version is the one we're keeping.

## 2. Bottom dock icons need to be semantic, not abstract
Right now the 4 glyphs (square / shield / circle / square) don't read as their labels on their own — only the text underneath tells them apart. Please redesign the 4 icons so each is recognizable by shape alone:
- **Decor** → a small sofa/couch silhouette
- **Wardrobe** → a hanger or folded shirt
- **Pet** → a paw print
- **Budget** → a checklist or small bar-chart glyph

Same size/weight/style as the current glyphs (simple filled shape inside the dark circle chip) — just make the shapes actually mean something.

## 3. Deliverable format — need real code, not an image
This round came back as a static picture. For an exact port into React/CSS we need one of:
- The actual HTML/CSS markup, or
- A precise spec: hex values for both light and dark variants (including the "opaque-black tint" swap mentioned), blur amount, border color/opacity, corner radius, padding, font sizes/weights for the numerals and labels.

Whichever's easier on your end — just needs to be exact enough to reproduce pixel-for-pixel, not eyeballed from a screenshot.

## 4. Reserve clearance for Mile-ly's own bottom nav
Not shown in these mockups: Mile-ly has its own separate floating nav pill that sits *below* this dock on the real app (home/transactions/miles/more tabs + a center add button). We need roughly 60–70px of clear space between the bottom of this dock and the true screen edge so the two don't visually collide or overlap. Please account for that gap in the layout, or at minimum tell us the exact gap you're designing for so we can position it correctly in code.

## 5. Lock in the Level badge treatment as shown
The small colored circle with the numeral (not "Level 7" spelled out) + horizontal track bar is the right call — cleaner, more icon-like, matches the reference. No changes needed here, just confirming this is the version we're porting.

## Not being asked for again
- The room scene itself (round 1) — accepted, no changes.
- The financial mini-stats HUD row — explicitly dropped per #1 above, don't design it.

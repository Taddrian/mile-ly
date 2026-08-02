'use client';

type ChangeType = 'new' | 'improved' | 'fix' | 'removed';

interface Change {
  type: ChangeType;
  text: string;
}

interface Release {
  version: string;
  date: string;
  changes: Change[];
}

const CHANGELOG: Release[] = [
  {
    version: 'v0.10.0',
    date: 'Aug 2026',
    changes: [
      { type: 'new',      text: 'Milo now free-roams the whole Home path card as a pixel-sprite fairy instead of pacing a small strip at the bottom' },
      { type: 'improved', text: 'Settings, Feedback, and What\'s New restyled to match the adventure-path look — candy-gradient buttons, icon badges, chunky cards' },
      { type: 'fix',      text: 'Fixed poor text contrast in dark mode on the Home stat strip and path node labels' },
      { type: 'removed',  text: 'Removed two unused legacy screens left over from earlier redesigns' },
    ],
  },
  {
    version: 'v0.9.0',
    date: 'Aug 2026',
    changes: [
      { type: 'new',      text: 'Home redesigned as an "adventure path" — a single page with a top stat strip, a quest-banner hero showing how much is left to spend this cycle, and a trail of candy-style nodes for your cards and each spending category' },
      { type: 'new',      text: 'The node touching your most recent entry is marked "You are here"' },
      { type: 'new',      text: 'The whole app now shifts between teal ("on track") and coral ("overspending") based on how this cycle is going — the quest banner, path, and bottom nav all reflect it' },
      { type: 'improved', text: 'Trail Notes (formerly Remarks) is now a single icon in the quest banner instead of its own box' },
      { type: 'improved', text: 'Tapping the Cards node opens your full card list in one step, so adding, editing, or updating a balance is always just one tap away' },
      { type: 'improved', text: 'Bottom nav tabs each get their own color instead of uniform gray when inactive' },
      { type: 'fix',      text: 'Fixed a bug where a card\'s balance could render as $0.00 the moment its modal opened, before snapping to the right number' },
    ],
  },
  {
    version: 'v0.8.0',
    date: 'Jul 2026',
    changes: [
      { type: 'new', text: 'Custom billing cycle start day — set your card statement or salary period to start on any day (e.g. 25th), not just the 1st' },
      { type: 'new', text: 'Cycle preference syncs across devices via your account, in Settings > Billing Cycle' },
      { type: 'improved', text: 'Entries now remember their exact date instead of just the month, so month-over-month comparisons and cycle boundaries are accurate' },
    ],
  },
  {
    version: 'v0.7.0',
    date: 'Jul 2026',
    changes: [
      { type: 'new',      text: 'Update a card\'s total spent right from the "+" sheet instead of logging every transaction one by one' },
      { type: 'new',      text: 'Edit a card\'s name, colour, limit, and miles rate anytime after adding it' },
      { type: 'new',      text: 'Monthly Remarks section — jot down notable spending highlights for the month' },
      { type: 'new',      text: 'Sign Out promoted to its own row in the More tab' },
      { type: 'improved', text: '"Your Cards" redesigned as a scrollable vertical list instead of a horizontal swipe carousel' },
      { type: 'improved', text: 'Bottom nav redesigned as a floating frosted-glass pill' },
      { type: 'improved', text: 'Milo now swims around and reacts to your balance — happy when you\'re on track, droopy when overspent' },
      { type: 'improved', text: 'Donut ring fills in and the balance number counts up on load; lists fade in with a subtle stagger' },
      { type: 'improved', text: 'Large currency amounts auto-shorten (e.g. "2.45M") so they always fit inside the ring' },
      { type: 'improved', text: 'Card fields (last 4 digits, monthly limit, miles rate) are now optional when adding a card' },
      { type: 'fix',      text: 'Add Entry sheet no longer gets stuck showing "Saved!" after saving' },
      { type: 'fix',      text: 'Typing a new card balance no longer prepends to the prefilled amount' },
      { type: 'improved', text: 'Amounts now show proper currency symbols (S$, RM, Rp, ฿, ₱, ₫, K, B$, ៛, ₭) instead of 3-letter codes' },
    ],
  },
  {
    version: 'v0.6.0',
    date: 'Jul 2026',
    changes: [
      { type: 'new',      text: 'Milo the mascot — your friendly teal companion on the Home screen' },
      { type: 'new',      text: 'Playful Duolingo-style design: chunky 3D cards, bold typography, teal-mint gradient header' },
      { type: 'improved', text: 'Donut ring redesigned with thick strokes, round caps, and a golden star cap decoration' },
      { type: 'improved', text: 'Budget bar now shows percentage inside the fill for a cleaner read' },
      { type: 'improved', text: 'Tab bar updated with active rounded-square highlight and tap bounce animation' },
      { type: 'improved', text: 'Ring colours updated: saved is now teal, spent is coral for clearer visual distinction' },
    ],
  },
  {
    version: 'v0.5.0',
    date: 'Jul 2026',
    changes: [
      { type: 'new', text: 'Feedback form in More tab — report bugs or suggest features directly from the app' },
      { type: 'new', text: 'Transactions moved to bottom nav for quicker access' },
      { type: 'improved', text: 'Budget merged into Home tab — budget progress, 50/30/20 split, and category breakdown all in one scroll' },
      { type: 'improved', text: 'More tab cleaned up — What\'s New moved to top, Transactions removed' },
    ],
  },
  {
    version: 'v0.4.0',
    date: 'Jul 2026',
    changes: [
      { type: 'new',      text: 'Cards moved to Home tab for quick access' },
      { type: 'new',      text: 'Multi-currency support for 10 SEA currencies (SGD, MYR, IDR, THB, PHP, VND, MMK, BND, KHR, LAK)' },
      { type: 'new',      text: 'What\'s New screen (you\'re reading it!)' },
      { type: 'improved', text: 'Entries can now be saved with just a card OR just a category — neither is required together' },
      { type: 'improved', text: 'Card selector moved above Category in Add Entry for a cleaner top-to-bottom flow' },
      { type: 'removed',  text: 'Removed "Cash / Other" pill and "Card · optional" label from Add Entry' },
    ],
  },
  {
    version: 'v0.3.0',
    date: 'Jul 2026',
    changes: [
      { type: 'new',      text: 'Credit cards can now be linked to individual entries' },
      { type: 'new',      text: 'Card spending automatically calculated from linked entries' },
      { type: 'new',      text: 'Colored card badge shown on each transaction row' },
      { type: 'new',      text: 'Swipe left on a transaction to delete it' },
      { type: 'new',      text: 'Month-over-month % comparison on Home (Income & Spent)' },
      { type: 'new',      text: 'CSV export in Settings — downloads all entries as a spreadsheet' },
      { type: 'new',      text: 'Transactions screen wired to Supabase (real data, not mock)' },
      { type: 'improved', text: 'Category delete now uses a safe confirmation action sheet instead of immediate removal' },
      { type: 'improved', text: 'Add Entry date pre-fills to today for current month, last day for past months' },
    ],
  },
  {
    version: 'v0.2.0',
    date: 'Jul 2026',
    changes: [
      { type: 'new',      text: 'Full UI redesign — new design tokens, teal brand palette' },
      { type: 'new',      text: 'Home tab with donut ring, stat tiles, and 50/30/20 spend breakdown' },
      { type: 'new',      text: 'Budget screen with monthly budget goal and category spend breakdown' },
      { type: 'new',      text: 'Bottom nav with Home, Budget, +, Miles, More tabs' },
      { type: 'new',      text: 'Add Entry sheet with income/expense toggle and dynamic categories' },
      { type: 'new',      text: 'Dark mode with auto system preference detection' },
      { type: 'new',      text: 'Month picker to browse any month\'s data' },
      { type: 'new',      text: 'Back button on all More sub-screens' },
      { type: 'new',      text: 'Stable color tints per category name' },
    ],
  },
  {
    version: 'v0.1.0',
    date: 'Jun 2026',
    changes: [
      { type: 'new', text: 'Initial release — miles tracking, credit card management' },
      { type: 'new', text: 'Supabase auth with sign in / sign up' },
      { type: 'new', text: 'KrisFlyer, Asia Miles, Cashback card support' },
      { type: 'new', text: 'Points calculator and redemption estimator' },
    ],
  },
];

const TYPE_STYLES: Record<ChangeType, { label: string; bg: string; color: string }> = {
  new:      { label: 'New',      bg: '#DFF3EF', color: '#129C8C' },
  improved: { label: 'Improved', bg: '#E5F0FB', color: '#3D7FD1' },
  fix:      { label: 'Fix',      bg: '#FBF0DB', color: '#C99318' },
  removed:  { label: 'Removed',  bg: '#FBE0DB', color: '#E8734F' },
};

export default function ChangelogScreen() {
  return (
    <div className="min-h-screen">
      <div style={{ padding: '52px 20px 20px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--m-slate)', marginBottom: 4 }}>
          Release notes
        </p>
        <h1 className="font-display" style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--m-ink)' }}>
          What's New
        </h1>
      </div>

      <div className="px-4 pb-8 space-y-3">
        {CHANGELOG.map((release) => (
          <div key={release.version} className="card-chunky" style={{ overflow: 'hidden' }}>
            {/* Version header */}
            <div
              style={{
                padding: '14px 18px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '1px solid var(--m-border, #E5E5E5)',
              }}
            >
              <span className="font-display" style={{ fontSize: 14, fontWeight: 800, color: 'var(--m-ink)' }}>{release.version}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--m-slate)' }}>{release.date}</span>
            </div>

            {/* Changes */}
            <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {release.changes.map((change, i) => {
                const style = TYPE_STYLES[change.type];
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span
                      className="font-display"
                      style={{
                        fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 6,
                        flexShrink: 0, marginTop: 2,
                        background: style.bg, color: style.color,
                      }}
                    >
                      {style.label}
                    </span>
                    <p style={{ fontSize: 13, lineHeight: 1.45, color: 'var(--m-ink)' }}>{change.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

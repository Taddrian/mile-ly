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
  new:      { label: 'New',      bg: '#E1F5EE', color: '#0F6E56' },
  improved: { label: 'Improved', bg: '#EBF5FF', color: '#1E5FA5' },
  fix:      { label: 'Fix',      bg: '#FFF8E6', color: '#A07800' },
  removed:  { label: 'Removed',  bg: '#FEE8E8', color: '#C0392B' },
};

export default function ChangelogScreen() {
  return (
    <div className="min-h-screen">
      <div className="px-5 pt-14 pb-4 md:pt-6">
        <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Release notes</p>
        <h1 className="text-2xl font-medium" style={{ color: 'var(--fg)' }}>What's New</h1>
      </div>

      <div className="px-4 pb-8 space-y-4">
        {CHANGELOG.map((release) => (
          <div
            key={release.version}
            className="rounded-[16px] overflow-hidden"
            style={{ backgroundColor: 'var(--card)', border: '0.5px solid var(--border)' }}
          >
            {/* Version header */}
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: '0.5px solid var(--border)' }}
            >
              <span className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>{release.version}</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{release.date}</span>
            </div>

            {/* Changes */}
            <div className="px-4 py-3 space-y-3">
              {release.changes.map((change, i) => {
                const style = TYPE_STYLES[change.type];
                return (
                  <div key={i} className="flex items-start gap-2.5">
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 mt-0.5"
                      style={{ backgroundColor: style.bg, color: style.color }}
                    >
                      {style.label}
                    </span>
                    <p className="text-sm leading-snug" style={{ color: 'var(--fg)' }}>{change.text}</p>
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

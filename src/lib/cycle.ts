// Billing-cycle math shared across AppContext, AddEntrySheet, MonthPicker, and DashboardScreen.
// A "cycle" is identified by its start date (ISO "YYYY-MM-DD") where the day-of-month equals
// the user's cycleStartDay. With cycleStartDay = 1, this is identical to a calendar month.

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// The start date of the cycle containing `date`, given the user's cycleStartDay.
export function cycleStartForDate(date: Date, cycleStartDay: number): string {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  if (d >= cycleStartDay) {
    return toISO(new Date(y, m, cycleStartDay));
  }
  return toISO(new Date(y, m - 1, cycleStartDay));
}

// Shift a cycle-start ISO date by `delta` cycles (each cycle is one calendar month long).
export function addCycle(cycleStartISO: string, delta: number): string {
  const [y, m, d] = cycleStartISO.split('-').map(Number);
  return toISO(new Date(y, m - 1 + delta, d));
}

// Exclusive upper bound for a date-range query covering this cycle.
export function cycleEndExclusive(cycleStartISO: string): string {
  return addCycle(cycleStartISO, 1);
}

// Days remaining in the cycle if `cycleStartISO` is the cycle containing today; 0 otherwise.
export function daysLeftInCycle(cycleStartISO: string, cycleStartDay: number): number {
  const now = new Date();
  const currentCycleStart = cycleStartForDate(now, cycleStartDay);
  if (currentCycleStart !== cycleStartISO) return 0;
  const end = new Date(cycleEndExclusive(cycleStartISO));
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((end.getTime() - now.setHours(0, 0, 0, 0)) / msPerDay);
}

// 1-based week number within the cycle if `cycleStartISO` is the cycle containing
// today (e.g. day 1-7 → week 1); null if viewing a past/future cycle, where "week"
// isn't a meaningful concept.
export function weekOfCycle(cycleStartISO: string, cycleStartDay: number): number | null {
  const now = new Date();
  const currentCycleStart = cycleStartForDate(now, cycleStartDay);
  if (currentCycleStart !== cycleStartISO) return null;
  const start = new Date(cycleStartISO);
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysElapsed = Math.floor((now.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0)) / msPerDay);
  return Math.floor(daysElapsed / 7) + 1;
}

function ordinalDay(d: Date): string {
  return d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' });
}

// Human label for a cycle: "July 2026" for calendar months, "25 Jul – 24 Aug" for custom cycles.
export function formatCycleLabel(cycleStartISO: string, cycleStartDay: number): string {
  const start = new Date(cycleStartISO);
  if (cycleStartDay === 1) {
    return start.toLocaleDateString('en-SG', { month: 'long', year: 'numeric' });
  }
  const endInclusive = new Date(cycleEndExclusive(cycleStartISO));
  endInclusive.setDate(endInclusive.getDate() - 1);
  return `${ordinalDay(start)} – ${ordinalDay(endInclusive)}`;
}

// Sensible default date to prefill when adding an entry for the given cycle:
// today if it's the current cycle, the last day if it's a past cycle, the start day if future.
export function defaultDateForCycle(cycleStartISO: string, cycleStartDay: number): string {
  const now = new Date();
  const currentCycleStart = cycleStartForDate(now, cycleStartDay);
  if (cycleStartISO === currentCycleStart) return toISO(now);
  if (new Date(cycleStartISO) < new Date(currentCycleStart)) {
    const end = new Date(cycleEndExclusive(cycleStartISO));
    end.setDate(end.getDate() - 1);
    return toISO(end);
  }
  return cycleStartISO;
}

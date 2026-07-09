import CategoryChip from './CategoryChip';

interface StatTileProps {
  label: string;
  value: string;
  caption?: string;
  chipLabel: string;
}

export default function StatTile({ label, value, caption, chipLabel }: StatTileProps) {
  return (
    <div
      className="flex-1 rounded-[16px] border p-4 flex flex-col gap-2"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-center gap-2">
        <CategoryChip name={chipLabel} size={28} />
        <span className="text-xs text-[var(--text-secondary)]">{label}</span>
      </div>
      <p className="text-xl font-medium text-[var(--fg)] leading-tight">{value}</p>
      {caption && <p className="text-xs text-[var(--text-muted)]">{caption}</p>}
    </div>
  );
}

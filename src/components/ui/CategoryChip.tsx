const TINTS = [
  { bg: '#FAECE7', color: '#993C1D' },
  { bg: '#EEEDFE', color: '#534AB7' },
  { bg: '#FBEAF0', color: '#993556' },
  { bg: '#EBF5FF', color: '#1E5FA5' },
  { bg: '#FFFAE6', color: '#A07800' },
  { bg: '#E6FAF0', color: '#1D7A55' },
  { bg: '#F5E6FF', color: '#7A1D9E' },
  { bg: '#FFE6E6', color: '#9E1D1D' },
];

function stableHash(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function categoryTint(name: string) {
  return TINTS[stableHash(name) % TINTS.length];
}

interface CategoryChipProps {
  name: string;
  size?: number;
}

export default function CategoryChip({ name, size = 36 }: CategoryChipProps) {
  const { bg, color } = categoryTint(name);
  const initial = name.charAt(0).toUpperCase();
  const fontSize = Math.round(size * 0.4);
  return (
    <div
      className="font-display flex items-center justify-center rounded-2xl shrink-0 select-none"
      style={{ width: size, height: size, backgroundColor: bg, color, fontSize, fontWeight: 700 }}
    >
      {initial}
    </div>
  );
}

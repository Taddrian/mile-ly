interface IconProps {
  size?: number;
  color?: string;
}

const base = (size: number, color: string, children: React.ReactNode) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

export const CardIcon = ({ size = 20, color = '#ffffff' }: IconProps) =>
  base(size, color, <><rect x="2" y="5" width="20" height="14" rx="2.5" /><path d="M2 10h20" /></>);

export const PiggyIcon = ({ size = 20, color = '#ffffff' }: IconProps) =>
  base(size, color, <>
    <path d="M19 8.5c-1 0-2 .7-2.4 1.6C13.7 8.7 8 9.2 6 12.5c-1.5 2.5.5 4 1.5 4.5V19h3v-1.2h3V19h3v-2c1-.4 1.6-1 2-1.8h1.5v-3H18c0-.9-.4-1.5-.9-2z" />
  </>);

export const CoinsIcon = ({ size = 20, color = '#ffffff' }: IconProps) =>
  base(size, color, <><circle cx="9" cy="9" r="6" /><path d="M18 11a6 6 0 1 1-7-6" /></>);

export const LayersIcon = ({ size = 20, color = '#ffffff' }: IconProps) =>
  base(size, color, <><path d="M12 3L3 8l9 5 9-5z" /><path d="M3 16l9 5 9-5M3 12l9 5 9-5" /></>);

export const TargetIcon = ({ size = 20, color = '#ffffff' }: IconProps) =>
  base(size, color, <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="3.5" /></>);

export const CalendarIcon = ({ size = 20, color = '#ffffff' }: IconProps) =>
  base(size, color, <><rect x="3" y="4.5" width="18" height="16" rx="2" /><path d="M16 2.5v4M8 2.5v4M3 10h18" /></>);

export const WalletIcon = ({ size = 20, color = '#ffffff' }: IconProps) =>
  base(size, color, <><path d="M20 11.5V7H5.5a2.5 2.5 0 0 1 0-5H18v4" /><path d="M3 5.5v13A2.5 2.5 0 0 0 5.5 21H20v-5" /><path d="M17.5 11.5A2.5 2.5 0 0 0 17.5 16H21v-4.5z" /></>);

export const PlaneIcon = ({ size = 20, color = '#ffffff' }: IconProps) =>
  base(size, color, <><path d="M17 20l-1.4-6.9L21 8.5c1.2-1.2 1.5-2.7 1-3.5-.8-.5-2.3-.2-3.5 1L13.4 10 6.5 8.6c-.4-.1-.8.1-1 .4l-.2.4c-.2.4-.1.9.3 1.2L10.5 14l-2 3H5.5l-1 1 3 2 2 3 1-1v-3l3-2z" /></>);

// Cycles through the same 6 icons the path nodes use, indexed by position.
const NODE_ICONS = [CardIcon, PiggyIcon, CoinsIcon, LayersIcon, TargetIcon, CardIcon];
export function nodeIconFor(index: number, size = 22, color = '#ffffff') {
  const Icon = NODE_ICONS[index % NODE_ICONS.length];
  return <Icon size={size} color={color} />;
}

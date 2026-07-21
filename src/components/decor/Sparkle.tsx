interface SparkleProps {
  size?: number;
  color?: string;
}

export default function Sparkle({ size = 12, color = '#FFC800' }: SparkleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden style={{ display: 'block' }}>
      <polygon points="7,0 8.2,5.8 14,7 8.2,8.2 7,14 5.8,8.2 0,7 5.8,5.8" fill={color} />
    </svg>
  );
}

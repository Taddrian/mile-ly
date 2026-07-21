export default function MiloMascot() {
  return (
    <svg
      width="96"
      height="84"
      viewBox="0 0 90 80"
      aria-hidden
      style={{ flexShrink: 0, display: 'block' }}
    >
      {/* Motion puffs behind */}
      <ellipse cx="10" cy="32" rx="5.5" ry="4" fill="white" opacity="0.55" />
      <ellipse cx="5" cy="43" rx="3.5" ry="2.8" fill="white" opacity="0.4" />
      <ellipse cx="13" cy="51" rx="4.5" ry="3.2" fill="white" opacity="0.48" />

      {/* Tail fins */}
      <path d="M 20 30 Q 4 21 6 38 Q 14 34 22 37 Z" fill="#0A6E63" />
      <path d="M 20 52 Q 4 61 6 44 Q 14 47 22 45 Z" fill="#0A6E63" />

      {/* Body */}
      <ellipse cx="47" cy="41" rx="28" ry="21" fill="#0D9488" />

      {/* Top fin */}
      <path d="M 34 21 Q 44 7 61 17 Q 52 23 37 22 Z" fill="#2DD4BF" />

      {/* Beak / nose */}
      <ellipse cx="73" cy="41" rx="11" ry="7" fill="#FFC800" stroke="#E6A800" strokeWidth="0.8" />

      {/* Eye — white sclera */}
      <circle cx="59" cy="32" r="9.5" fill="white" />
      {/* Iris */}
      <circle cx="59" cy="32" r="5.5" fill="#2D3748" />
      {/* Highlight */}
      <circle cx="62" cy="29" r="2" fill="white" />

      {/* Rosy cheek */}
      <ellipse cx="51" cy="46" rx="6" ry="4.5" fill="#FF8888" opacity="0.35" />

      {/* Smile */}
      <path d="M 56 50 Q 62 57 69 51" stroke="#2D3748" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

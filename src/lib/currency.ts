export type CurrencyCode = 'SGD' | 'MYR' | 'IDR' | 'THB' | 'PHP' | 'VND' | 'MMK' | 'BND' | 'KHR' | 'LAK';

export const SEA_CURRENCIES: { code: CurrencyCode; name: string; locale: string; decimals: number }[] = [
  { code: 'SGD', name: 'Singapore Dollar',  locale: 'en-SG',  decimals: 2 },
  { code: 'MYR', name: 'Malaysian Ringgit', locale: 'ms-MY',  decimals: 2 },
  { code: 'IDR', name: 'Indonesian Rupiah', locale: 'id-ID',  decimals: 0 },
  { code: 'THB', name: 'Thai Baht',         locale: 'th-TH',  decimals: 2 },
  { code: 'PHP', name: 'Philippine Peso',   locale: 'fil-PH', decimals: 2 },
  { code: 'VND', name: 'Vietnamese Dong',   locale: 'vi-VN',  decimals: 0 },
  { code: 'MMK', name: 'Myanmar Kyat',      locale: 'my-MM',  decimals: 0 },
  { code: 'BND', name: 'Brunei Dollar',     locale: 'ms-BN',  decimals: 2 },
  { code: 'KHR', name: 'Cambodian Riel',    locale: 'km-KH',  decimals: 0 },
  { code: 'LAK', name: 'Lao Kip',           locale: 'lo-LA',  decimals: 0 },
];

export function fmtAmount(n: number, code: string): string {
  const cur = SEA_CURRENCIES.find((c) => c.code === code) ?? SEA_CURRENCIES[0];
  return n.toLocaleString(cur.locale, {
    minimumFractionDigits: cur.decimals,
    maximumFractionDigits: cur.decimals,
  });
}

// Compact formatter for small display spaces (DonutRing center, stat tiles, etc.)
// Rounds to 3 significant digits and appends K / M / B suffix.
export function fmtShort(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) {
    const v = n / 1_000_000_000;
    return `${+v.toPrecision(3)}B`;
  }
  if (abs >= 1_000_000) {
    const v = n / 1_000_000;
    return `${+v.toPrecision(3)}M`;
  }
  if (abs >= 10_000) {
    const v = n / 1_000;
    return `${+v.toPrecision(3)}K`;
  }
  // Below 10K — return plain integer (no locale separators needed, fits fine)
  return String(Math.round(n));
}

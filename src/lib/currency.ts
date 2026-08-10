export type CurrencyCode = 'SGD' | 'MYR' | 'IDR' | 'THB' | 'PHP' | 'VND' | 'MMK' | 'BND' | 'KHR' | 'LAK';

export const SEA_CURRENCIES: { code: CurrencyCode; name: string; locale: string; decimals: number; symbol: string }[] = [
  { code: 'SGD', name: 'Singapore Dollar',  locale: 'en-SG',  decimals: 2, symbol: 'S$' },
  { code: 'MYR', name: 'Malaysian Ringgit', locale: 'ms-MY',  decimals: 2, symbol: 'RM' },
  { code: 'IDR', name: 'Indonesian Rupiah', locale: 'id-ID',  decimals: 0, symbol: 'Rp' },
  { code: 'THB', name: 'Thai Baht',         locale: 'th-TH',  decimals: 2, symbol: '฿' },
  { code: 'PHP', name: 'Philippine Peso',   locale: 'fil-PH', decimals: 2, symbol: '₱' },
  { code: 'VND', name: 'Vietnamese Dong',   locale: 'vi-VN',  decimals: 0, symbol: '₫' },
  { code: 'MMK', name: 'Myanmar Kyat',      locale: 'my-MM',  decimals: 0, symbol: 'K' },
  { code: 'BND', name: 'Brunei Dollar',     locale: 'ms-BN',  decimals: 2, symbol: 'B$' },
  { code: 'KHR', name: 'Cambodian Riel',    locale: 'km-KH',  decimals: 0, symbol: '៛' },
  { code: 'LAK', name: 'Lao Kip',           locale: 'lo-LA',  decimals: 0, symbol: '₭' },
];

export function currencySymbol(code: string): string {
  const cur = SEA_CURRENCIES.find((c) => c.code === code) ?? SEA_CURRENCIES[0];
  return cur.symbol;
}

export function fmtAmount(n: number, code: string): string {
  const cur = SEA_CURRENCIES.find((c) => c.code === code) ?? SEA_CURRENCIES[0];
  return n.toLocaleString(cur.locale, {
    minimumFractionDigits: cur.decimals,
    maximumFractionDigits: cur.decimals,
  });
}

// Symbol + formatted number together, e.g. "S$1,234.56" — the standard way
// to display an amount in the UI (replaces the old "SGD 1,234.56" code-prefix style).
export function fmtCurrency(n: number, code: string): string {
  return `${currencySymbol(code)}${fmtAmount(n, code)}`;
}

// Compact formatter for small display spaces (DonutRing center, stat tiles, etc.)
// Rounds to 3 significant digits and appends K / M / B suffix — only for numbers
// actually large enough to need it. Below that threshold, keeps the currency's
// real decimal places instead of collapsing to a whole number.
export function fmtShort(n: number, code: string): string {
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
  return fmtAmount(n, code);
}

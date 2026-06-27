'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { CreditCard, MilesProgram } from '@/types';

const CURRENCIES = [
  { code: 'USD', flag: '🇺🇸' },
  { code: 'MYR', flag: '🇲🇾' },
  { code: 'JPY', flag: '🇯🇵' },
  { code: 'AUD', flag: '🇦🇺' },
  { code: 'GBP', flag: '🇬🇧' },
];

const PROGRAM_COLORS: Record<MilesProgram, string> = {
  KrisFlyer: '#1a3c6e',
  'Asia Miles': '#006b5b',
  Cashback: '#6b21a8',
  Other: '#71717a',
};

const PROGRAM_LOGO_BG: Record<MilesProgram, string> = {
  KrisFlyer: 'bg-[#1a3c6e]',
  'Asia Miles': 'bg-[#006b5b]',
  Cashback: 'bg-purple-700',
  Other: 'bg-zinc-500',
};

type AwardRates = { saver: number; advantage: number; cash: number } | null;
type CabinClass = 'economy' | 'business' | 'first';

interface Redemption {
  destination: string;
  region: string;
  flag: string;
  economy: AwardRates;
  business: AwardRates;
  first: AwardRates;
}

// KrisFlyer award chart — one-way from SIN, approximate. null = not operated.
const ALL_DESTINATIONS: Redemption[] = [
  // Malaysia / Brunei
  { destination: 'Kuala Lumpur',   region: 'Malaysia',       flag: '🇲🇾', economy: { saver: 3750,   advantage: 5500,   cash: 120  }, business: { saver: 12500,  advantage: 18750,  cash: 450  }, first: null },
  { destination: 'Kota Kinabalu',  region: 'Malaysia',       flag: '🇲🇾', economy: { saver: 3750,   advantage: 5500,   cash: 150  }, business: { saver: 12500,  advantage: 18750,  cash: 500  }, first: null },
  { destination: 'Penang',         region: 'Malaysia',       flag: '🇲🇾', economy: { saver: 3750,   advantage: 5500,   cash: 130  }, business: { saver: 12500,  advantage: 18750,  cash: 480  }, first: null },
  { destination: 'Brunei',         region: 'Malaysia',       flag: '🇧🇳', economy: { saver: 3750,   advantage: 5500,   cash: 160  }, business: { saver: 12500,  advantage: 18750,  cash: 520  }, first: null },
  // Southeast Asia
  { destination: 'Bangkok',        region: 'Southeast Asia', flag: '🇹🇭', economy: { saver: 8750,   advantage: 13125,  cash: 280  }, business: { saver: 19000,  advantage: 28500,  cash: 850  }, first: null },
  { destination: 'Jakarta',        region: 'Southeast Asia', flag: '🇮🇩', economy: { saver: 8750,   advantage: 13125,  cash: 260  }, business: { saver: 19000,  advantage: 28500,  cash: 800  }, first: null },
  { destination: 'Bali',           region: 'Southeast Asia', flag: '🇮🇩', economy: { saver: 8750,   advantage: 13125,  cash: 300  }, business: { saver: 19000,  advantage: 28500,  cash: 900  }, first: null },
  { destination: 'Manila',         region: 'Southeast Asia', flag: '🇵🇭', economy: { saver: 8750,   advantage: 13125,  cash: 300  }, business: { saver: 19000,  advantage: 28500,  cash: 900  }, first: null },
  { destination: 'Ho Chi Minh',    region: 'Southeast Asia', flag: '🇻🇳', economy: { saver: 8750,   advantage: 13125,  cash: 250  }, business: { saver: 19000,  advantage: 28500,  cash: 780  }, first: null },
  { destination: 'Hanoi',          region: 'Southeast Asia', flag: '🇻🇳', economy: { saver: 8750,   advantage: 13125,  cash: 260  }, business: { saver: 19000,  advantage: 28500,  cash: 800  }, first: null },
  { destination: 'Yangon',         region: 'Southeast Asia', flag: '🇲🇲', economy: { saver: 8750,   advantage: 13125,  cash: 270  }, business: { saver: 19000,  advantage: 28500,  cash: 820  }, first: null },
  { destination: 'Phnom Penh',     region: 'Southeast Asia', flag: '🇰🇭', economy: { saver: 8750,   advantage: 13125,  cash: 280  }, business: { saver: 19000,  advantage: 28500,  cash: 850  }, first: null },
  // Northeast Asia
  { destination: 'Hong Kong',      region: 'Northeast Asia', flag: '🇭🇰', economy: { saver: 10000,  advantage: 15000,  cash: 350  }, business: { saver: 30000,  advantage: 45000,  cash: 1200 }, first: null },
  { destination: 'Taipei',         region: 'Northeast Asia', flag: '🇹🇼', economy: { saver: 10000,  advantage: 15000,  cash: 380  }, business: { saver: 30000,  advantage: 45000,  cash: 1250 }, first: null },
  { destination: 'Tokyo',          region: 'Northeast Asia', flag: '🇯🇵', economy: { saver: 17500,  advantage: 26250,  cash: 600  }, business: { saver: 51000,  advantage: 76500,  cash: 2200 }, first: { saver: 85500,  advantage: 128250, cash: 4500  } },
  { destination: 'Osaka',          region: 'Northeast Asia', flag: '🇯🇵', economy: { saver: 17500,  advantage: 26250,  cash: 580  }, business: { saver: 51000,  advantage: 76500,  cash: 2100 }, first: { saver: 85500,  advantage: 128250, cash: 4300  } },
  { destination: 'Seoul',          region: 'Northeast Asia', flag: '🇰🇷', economy: { saver: 17500,  advantage: 26250,  cash: 550  }, business: { saver: 51000,  advantage: 76500,  cash: 2000 }, first: null },
  { destination: 'Beijing',        region: 'Northeast Asia', flag: '🇨🇳', economy: { saver: 15000,  advantage: 22500,  cash: 500  }, business: { saver: 45000,  advantage: 67500,  cash: 1800 }, first: null },
  { destination: 'Shanghai',       region: 'Northeast Asia', flag: '🇨🇳', economy: { saver: 15000,  advantage: 22500,  cash: 480  }, business: { saver: 45000,  advantage: 67500,  cash: 1750 }, first: null },
  // South Asia
  { destination: 'Mumbai',         region: 'South Asia',     flag: '🇮🇳', economy: { saver: 23750,  advantage: 35625,  cash: 700  }, business: { saver: 71250,  advantage: 106875, cash: 2800 }, first: null },
  { destination: 'Delhi',          region: 'South Asia',     flag: '🇮🇳', economy: { saver: 23750,  advantage: 35625,  cash: 720  }, business: { saver: 71250,  advantage: 106875, cash: 2900 }, first: null },
  { destination: 'Chennai',        region: 'South Asia',     flag: '🇮🇳', economy: { saver: 15000,  advantage: 22500,  cash: 450  }, business: { saver: 45000,  advantage: 67500,  cash: 1600 }, first: null },
  { destination: 'Colombo',        region: 'South Asia',     flag: '🇱🇰', economy: { saver: 15000,  advantage: 22500,  cash: 420  }, business: { saver: 45000,  advantage: 67500,  cash: 1500 }, first: null },
  // Australia / New Zealand
  { destination: 'Sydney',         region: 'Australia & NZ', flag: '🇦🇺', economy: { saver: 22500,  advantage: 33750,  cash: 750  }, business: { saver: 67500,  advantage: 101250, cash: 3000 }, first: null },
  { destination: 'Melbourne',      region: 'Australia & NZ', flag: '🇦🇺', economy: { saver: 22500,  advantage: 33750,  cash: 750  }, business: { saver: 67500,  advantage: 101250, cash: 3000 }, first: null },
  { destination: 'Brisbane',       region: 'Australia & NZ', flag: '🇦🇺', economy: { saver: 22500,  advantage: 33750,  cash: 780  }, business: { saver: 67500,  advantage: 101250, cash: 3100 }, first: null },
  { destination: 'Perth',          region: 'Australia & NZ', flag: '🇦🇺', economy: { saver: 17500,  advantage: 26250,  cash: 600  }, business: { saver: 51000,  advantage: 76500,  cash: 2200 }, first: null },
  { destination: 'Auckland',       region: 'Australia & NZ', flag: '🇳🇿', economy: { saver: 28500,  advantage: 42750,  cash: 950  }, business: { saver: 85500,  advantage: 128250, cash: 3800 }, first: null },
  // Europe
  { destination: 'London',         region: 'Europe',         flag: '🇬🇧', economy: { saver: 67500,  advantage: 101250, cash: 1800 }, business: { saver: 132750, advantage: 199125, cash: 5500 }, first: { saver: 204750, advantage: 307125, cash: 11000 } },
  { destination: 'Paris',          region: 'Europe',         flag: '🇫🇷', economy: { saver: 67500,  advantage: 101250, cash: 1800 }, business: { saver: 132750, advantage: 199125, cash: 5500 }, first: { saver: 204750, advantage: 307125, cash: 11000 } },
  { destination: 'Amsterdam',      region: 'Europe',         flag: '🇳🇱', economy: { saver: 67500,  advantage: 101250, cash: 1750 }, business: { saver: 132750, advantage: 199125, cash: 5400 }, first: { saver: 204750, advantage: 307125, cash: 10500 } },
  { destination: 'Frankfurt',      region: 'Europe',         flag: '🇩🇪', economy: { saver: 67500,  advantage: 101250, cash: 1750 }, business: { saver: 132750, advantage: 199125, cash: 5400 }, first: { saver: 204750, advantage: 307125, cash: 10500 } },
  { destination: 'Zurich',         region: 'Europe',         flag: '🇨🇭', economy: { saver: 67500,  advantage: 101250, cash: 1800 }, business: { saver: 132750, advantage: 199125, cash: 5500 }, first: { saver: 204750, advantage: 307125, cash: 11000 } },
  { destination: 'Milan',          region: 'Europe',         flag: '🇮🇹', economy: { saver: 67500,  advantage: 101250, cash: 1800 }, business: { saver: 132750, advantage: 199125, cash: 5500 }, first: null },
  { destination: 'Copenhagen',     region: 'Europe',         flag: '🇩🇰', economy: { saver: 67500,  advantage: 101250, cash: 1750 }, business: { saver: 132750, advantage: 199125, cash: 5400 }, first: null },
  { destination: 'Manchester',     region: 'Europe',         flag: '🇬🇧', economy: { saver: 67500,  advantage: 101250, cash: 1700 }, business: { saver: 132750, advantage: 199125, cash: 5300 }, first: null },
  { destination: 'Barcelona',      region: 'Europe',         flag: '🇪🇸', economy: { saver: 67500,  advantage: 101250, cash: 1800 }, business: { saver: 132750, advantage: 199125, cash: 5500 }, first: null },
  // Middle East & Africa
  { destination: 'Dubai',          region: 'Middle East',    flag: '🇦🇪', economy: { saver: 35000,  advantage: 52500,  cash: 900  }, business: { saver: 85000,  advantage: 127500, cash: 3500 }, first: null },
  { destination: 'Johannesburg',   region: 'Africa',         flag: '🇿🇦', economy: { saver: 67500,  advantage: 101250, cash: 2000 }, business: { saver: 132750, advantage: 199125, cash: 6000 }, first: null },
  // USA
  { destination: 'New York',       region: 'USA',            flag: '🇺🇸', economy: { saver: 77500,  advantage: 116250, cash: 2200 }, business: { saver: 152500, advantage: 228750, cash: 6500 }, first: { saver: 228750, advantage: 343125, cash: 13000 } },
  { destination: 'Los Angeles',    region: 'USA',            flag: '🇺🇸', economy: { saver: 77500,  advantage: 116250, cash: 2000 }, business: { saver: 152500, advantage: 228750, cash: 6000 }, first: { saver: 228750, advantage: 343125, cash: 12000 } },
  { destination: 'San Francisco',  region: 'USA',            flag: '🇺🇸', economy: { saver: 77500,  advantage: 116250, cash: 2100 }, business: { saver: 152500, advantage: 228750, cash: 6200 }, first: { saver: 228750, advantage: 343125, cash: 12500 } },
  { destination: 'Houston',        region: 'USA',            flag: '🇺🇸', economy: { saver: 77500,  advantage: 116250, cash: 2200 }, business: { saver: 152500, advantage: 228750, cash: 6500 }, first: null },
];

const DEFAULT_PICKS = ['Bangkok', 'Tokyo', 'Sydney', 'London', 'New York'];
const MAX_PICKS = 5;
const STORAGE_KEY = 'milely_destinations';

const DEST_COORDS: Record<string, { lat: number; lng: number }> = {
  'Kuala Lumpur':  { lat: 3.139,   lng: 101.687  },
  'Kota Kinabalu': { lat: 5.979,   lng: 116.073  },
  'Penang':        { lat: 5.413,   lng: 100.329  },
  'Brunei':        { lat: 4.903,   lng: 114.940  },
  'Bangkok':       { lat: 13.756,  lng: 100.502  },
  'Jakarta':       { lat: -6.208,  lng: 106.846  },
  'Bali':          { lat: -8.409,  lng: 115.189  },
  'Manila':        { lat: 14.599,  lng: 120.984  },
  'Ho Chi Minh':   { lat: 10.823,  lng: 106.630  },
  'Hanoi':         { lat: 21.028,  lng: 105.804  },
  'Yangon':        { lat: 16.871,  lng: 96.198   },
  'Phnom Penh':    { lat: 11.563,  lng: 104.916  },
  'Hong Kong':     { lat: 22.319,  lng: 114.170  },
  'Taipei':        { lat: 25.033,  lng: 121.565  },
  'Tokyo':         { lat: 35.689,  lng: 139.692  },
  'Osaka':         { lat: 34.694,  lng: 135.502  },
  'Seoul':         { lat: 37.566,  lng: 126.978  },
  'Beijing':       { lat: 39.904,  lng: 116.407  },
  'Shanghai':      { lat: 31.230,  lng: 121.474  },
  'Mumbai':        { lat: 19.076,  lng: 72.878   },
  'Delhi':         { lat: 28.614,  lng: 77.209   },
  'Chennai':       { lat: 13.083,  lng: 80.270   },
  'Colombo':       { lat: 6.927,   lng: 79.862   },
  'Sydney':        { lat: -33.869, lng: 151.209  },
  'Melbourne':     { lat: -37.814, lng: 144.963  },
  'Brisbane':      { lat: -27.468, lng: 153.028  },
  'Perth':         { lat: -31.951, lng: 115.861  },
  'Auckland':      { lat: -36.848, lng: 174.763  },
  'London':        { lat: 51.507,  lng: -0.128   },
  'Paris':         { lat: 48.857,  lng: 2.347    },
  'Amsterdam':     { lat: 52.374,  lng: 4.890    },
  'Frankfurt':     { lat: 50.111,  lng: 8.682    },
  'Zurich':        { lat: 47.376,  lng: 8.541    },
  'Milan':         { lat: 45.465,  lng: 9.186    },
  'Copenhagen':    { lat: 55.676,  lng: 12.568   },
  'Manchester':    { lat: 53.479,  lng: -2.245   },
  'Barcelona':     { lat: 41.385,  lng: 2.173    },
  'Dubai':         { lat: 25.205,  lng: 55.271   },
  'Johannesburg':  { lat: -26.205, lng: 28.050   },
  'New York':      { lat: 40.713,  lng: -74.006  },
  'Los Angeles':   { lat: 34.052,  lng: -118.244 },
  'San Francisco': { lat: 37.775,  lng: -122.419 },
  'Houston':       { lat: 29.760,  lng: -95.370  },
};

function weatherEmoji(code: number): string {
  if (code === 0) return '☀️';
  if (code <= 3) return '🌤️';
  if (code <= 48) return '🌫️';
  if (code <= 55) return '🌦️';
  if (code <= 65) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌧️';
  return '⛈️';
}

interface WeatherData { temp: number; code: number }

interface Escape {
  id: string;
  destination: string;
  flag: string;
  region: string;
  ecoMiles: number | null;
  bizMiles: number | null;
  travelWindow: string;
  bookBy: string;
  discount: string;
}

// June 2026 Spontaneous Escapes — 30% off Saver rates, book by 30 Jun 2026, travel 1–31 Jul 2026
const SAMPLE_ESCAPES: Escape[] = [
  // South East Asia
  { id: 'se1',  destination: 'Brunei',           flag: '🇧🇳', region: 'South East Asia', ecoMiles: 5600,  bizMiles: null,  travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  { id: 'se2',  destination: 'Kuala Lumpur',     flag: '🇲🇾', region: 'South East Asia', ecoMiles: 5600,  bizMiles: 15400, travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  { id: 'se3',  destination: 'Penang',           flag: '🇲🇾', region: 'South East Asia', ecoMiles: 5600,  bizMiles: null,  travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  { id: 'se4',  destination: 'Medan',            flag: '🇮🇩', region: 'South East Asia', ecoMiles: 5600,  bizMiles: 15400, travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  { id: 'se5',  destination: 'Jakarta',          flag: '🇮🇩', region: 'South East Asia', ecoMiles: null,  bizMiles: 15400, travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  { id: 'se6',  destination: 'Surabaya',         flag: '🇮🇩', region: 'South East Asia', ecoMiles: null,  bizMiles: 15400, travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  { id: 'se7',  destination: 'Bangkok',          flag: '🇹🇭', region: 'South East Asia', ecoMiles: 9100,  bizMiles: 17500, travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  { id: 'se8',  destination: 'Phuket',           flag: '🇹🇭', region: 'South East Asia', ecoMiles: 9100,  bizMiles: 17500, travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  { id: 'se9',  destination: 'Hanoi',            flag: '🇻🇳', region: 'South East Asia', ecoMiles: 9100,  bizMiles: 17500, travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  { id: 'se10', destination: 'Ho Chi Minh City', flag: '🇻🇳', region: 'South East Asia', ecoMiles: 9100,  bizMiles: 17500, travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  { id: 'se11', destination: 'Manila',           flag: '🇵🇭', region: 'South East Asia', ecoMiles: 9100,  bizMiles: 17500, travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  { id: 'se12', destination: 'Phnom Penh',       flag: '🇰🇭', region: 'South East Asia', ecoMiles: 9100,  bizMiles: null,  travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  { id: 'se13', destination: 'Siem Reap',        flag: '🇰🇭', region: 'South East Asia', ecoMiles: 9100,  bizMiles: null,  travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  // North Asia
  { id: 'na1',  destination: 'Taipei',           flag: '🇹🇼', region: 'North Asia',      ecoMiles: 10850, bizMiles: null,  travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  { id: 'na2',  destination: 'Shenzhen',         flag: '🇨🇳', region: 'North Asia',      ecoMiles: 10850, bizMiles: null,  travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  { id: 'na3',  destination: 'Xiamen',           flag: '🇨🇳', region: 'North Asia',      ecoMiles: 10850, bizMiles: null,  travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  { id: 'na4',  destination: 'Chongqing',        flag: '🇨🇳', region: 'North Asia',      ecoMiles: 10850, bizMiles: 24850, travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  { id: 'na5',  destination: 'Chengdu',          flag: '🇨🇳', region: 'North Asia',      ecoMiles: 10850, bizMiles: 24850, travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  { id: 'na6',  destination: 'Hangzhou',         flag: '🇨🇳', region: 'North Asia',      ecoMiles: 10850, bizMiles: 24850, travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  { id: 'na7',  destination: 'Beijing',          flag: '🇨🇳', region: 'North Asia',      ecoMiles: 14350, bizMiles: 31500, travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  { id: 'na8',  destination: 'Shanghai',         flag: '🇨🇳', region: 'North Asia',      ecoMiles: 14350, bizMiles: null,  travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  { id: 'na9',  destination: 'Busan',            flag: '🇰🇷', region: 'North Asia',      ecoMiles: 17850, bizMiles: null,  travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  { id: 'na10', destination: 'Seoul',            flag: '🇰🇷', region: 'North Asia',      ecoMiles: 17850, bizMiles: null,  travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  { id: 'na11', destination: 'Fukuoka',          flag: '🇯🇵', region: 'North Asia',      ecoMiles: 17850, bizMiles: null,  travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  { id: 'na12', destination: 'Nagoya',           flag: '🇯🇵', region: 'North Asia',      ecoMiles: 17850, bizMiles: null,  travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  { id: 'na13', destination: 'Osaka',            flag: '🇯🇵', region: 'North Asia',      ecoMiles: 17850, bizMiles: null,  travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  { id: 'na14', destination: 'Tokyo',            flag: '🇯🇵', region: 'North Asia',      ecoMiles: 17850, bizMiles: null,  travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  // West Asia & Africa
  { id: 'wa1',  destination: 'Ahmedabad',        flag: '🇮🇳', region: 'West Asia',       ecoMiles: 13300, bizMiles: 31500, travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  { id: 'wa2',  destination: 'Dhaka',            flag: '🇧🇩', region: 'West Asia',       ecoMiles: 13300, bizMiles: 31500, travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  { id: 'wa3',  destination: 'Colombo',          flag: '🇱🇰', region: 'West Asia',       ecoMiles: null,  bizMiles: 31500, travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  { id: 'wa4',  destination: 'Hyderabad',        flag: '🇮🇳', region: 'West Asia',       ecoMiles: null,  bizMiles: 31500, travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  // Southwest Pacific
  { id: 'sp1',  destination: 'Darwin',           flag: '🇦🇺', region: 'SW Pacific',      ecoMiles: 14350, bizMiles: null,  travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  { id: 'sp2',  destination: 'Perth',            flag: '🇦🇺', region: 'SW Pacific',      ecoMiles: 14350, bizMiles: null,  travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  { id: 'sp3',  destination: 'Adelaide',         flag: '🇦🇺', region: 'SW Pacific',      ecoMiles: 20300, bizMiles: null,  travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  { id: 'sp4',  destination: 'Brisbane',         flag: '🇦🇺', region: 'SW Pacific',      ecoMiles: 20300, bizMiles: null,  travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  { id: 'sp5',  destination: 'Cairns',           flag: '🇦🇺', region: 'SW Pacific',      ecoMiles: 20300, bizMiles: 50400, travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  { id: 'sp6',  destination: 'Melbourne',        flag: '🇦🇺', region: 'SW Pacific',      ecoMiles: 20300, bizMiles: null,  travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  { id: 'sp7',  destination: 'Sydney',           flag: '🇦🇺', region: 'SW Pacific',      ecoMiles: 20300, bizMiles: null,  travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
  // Europe
  { id: 'eu1',  destination: 'Frankfurt',        flag: '🇩🇪', region: 'Europe',          ecoMiles: 30800, bizMiles: null,  travelWindow: '1–31 Jul 2026', bookBy: '30 Jun 2026', discount: '30% off' },
];

const REGIONS = [...new Set(ALL_DESTINATIONS.map(d => d.region))];

function fmt(n: number) {
  return Math.round(n).toLocaleString('en-SG');
}

function CardMilesRow({ card }: { card: CreditCard }) {
  const milesEarned = Math.floor(card.currentSpent * card.milesRate);
  const color = PROGRAM_COLORS[card.milesProgram];

  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <div
        className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-white text-xs font-bold"
        style={{ backgroundColor: card.color }}
      >
        {card.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">{card.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: color }}>
            {card.milesProgram}
          </span>
          <span className="text-xs text-zinc-400">{card.milesRate} mpd</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">{fmt(milesEarned)}</p>
        <p className="text-xs text-zinc-400">miles</p>
      </div>
    </div>
  );
}

function RedemptionRow({ destination, flag, rates, cabin, totalMiles, weather }: {
  destination: string; flag: string;
  rates: NonNullable<AwardRates>;
  cabin: CabinClass;
  totalMiles: number;
  weather?: WeatherData | null;
}) {
  const cabinLabel = cabin === 'economy' ? 'Economy' : cabin === 'business' ? 'Business' : 'First';
  return (
    <div className="py-3.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-xl">{flag}</span>
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{destination}</p>
        {weather && (
          <span className="text-[10px] text-zinc-400 ml-1">
            {weatherEmoji(weather.code)} {Math.round(weather.temp)}°C
          </span>
        )}
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-auto">{cabinLabel}</span>
      </div>
      {(['saver', 'advantage'] as const).map(type => {
        const miles = rates[type];
        const canAfford = totalMiles >= miles;
        const pct = Math.min((totalMiles / miles) * 100, 100);
        return (
          <div key={type} className={`mb-2 ${!canAfford ? 'opacity-55' : ''}`}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 capitalize">{type}</span>
              <div className="flex items-center gap-2">
                {!canAfford && <span className="text-[10px] text-zinc-400">{fmt(miles - Math.floor(totalMiles))} to go</span>}
                <span className={`text-xs font-bold ${canAfford ? 'text-[#0d6e5a]' : 'text-zinc-400'}`}>{fmt(miles)} mi</span>
              </div>
            </div>
            <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${canAfford ? 'bg-[#0d6e5a]' : 'bg-zinc-300 dark:bg-zinc-600'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
      <p className="text-[10px] text-zinc-400 mt-1">≈ SGD {rates.cash} cash fare</p>
    </div>
  );
}

function DestinationPicker({ selected, onSave, onClose }: {
  selected: string[];
  onSave: (picks: string[]) => void;
  onClose: () => void;
}) {
  const [picks, setPicks] = useState<string[]>(selected);

  function toggle(dest: string) {
    setPicks(prev =>
      prev.includes(dest)
        ? prev.filter(d => d !== dest)
        : prev.length < MAX_PICKS ? [...prev, dest] : prev
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-50 dark:bg-zinc-950 max-w-md mx-auto md:inset-y-8 md:left-1/2 md:-translate-x-1/2 md:w-[480px] md:max-w-none md:mx-0 md:rounded-2xl md:shadow-2xl md:overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-4 bg-[#0d6e5a] md:pt-5">
        <div>
          <h2 className="text-white text-lg font-bold">Choose Destinations</h2>
          <p className="text-white/70 text-xs mt-0.5">Pick up to {MAX_PICKS} · {picks.length}/{MAX_PICKS} selected</p>
        </div>
        <button onClick={onClose} className="text-white/80 p-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pb-24">
        {REGIONS.map(region => (
          <div key={region}>
            <p className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-900 sticky top-0">
              {region}
            </p>
            {ALL_DESTINATIONS.filter(d => d.region === region).map(d => {
              const isSelected = picks.includes(d.destination);
              const isDisabled = !isSelected && picks.length >= MAX_PICKS;
              return (
                <button
                  key={d.destination}
                  onClick={() => toggle(d.destination)}
                  disabled={isDisabled}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 transition-colors text-left ${
                    isDisabled ? 'opacity-35' : 'active:bg-zinc-100 dark:active:bg-zinc-800'
                  }`}
                >
                  <span className="text-xl">{d.flag}</span>
                  <span className="flex-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">{d.destination}</span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-[#0d6e5a] border-[#0d6e5a]' : 'border-zinc-300 dark:border-zinc-600'
                  }`}>
                    {isSelected && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Save button */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-5 pb-8 pt-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 md:relative md:bottom-auto md:left-auto md:right-auto md:max-w-none md:mx-0 md:pb-5">
        <button
          onClick={() => { onSave(picks); onClose(); }}
          disabled={picks.length === 0}
          className="w-full py-3.5 rounded-2xl bg-[#0d6e5a] text-white font-semibold text-sm disabled:opacity-40 transition-opacity"
        >
          Save {picks.length} destination{picks.length !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
}

function EscapeRow({ escape, totalMiles, isReturn }: { escape: Escape; totalMiles: number; isReturn: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const multiplier = isReturn ? 2 : 1;
  const ecoMiles = escape.ecoMiles ? escape.ecoMiles * multiplier : null;
  const bizMiles = escape.bizMiles ? escape.bizMiles * multiplier : null;
  const cheapest = ecoMiles ?? bizMiles ?? 0;
  const canAffordEco = ecoMiles ? totalMiles >= ecoMiles : false;
  const canAffordBiz = bizMiles ? totalMiles >= bizMiles : false;
  const canAffordAny = canAffordEco || canAffordBiz;

  return (
    <div className="border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-2.5 py-2.5 text-left"
      >
        <span className="text-base shrink-0">{escape.flag}</span>
        <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate flex-1">{escape.destination}</p>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] text-zinc-400">
            {ecoMiles ? `Eco ${fmt(ecoMiles)}` : ''}{ecoMiles && bizMiles ? ' · ' : ''}{bizMiles ? `Biz ${fmt(bizMiles)}` : ''}
          </span>
          {canAffordAny
            ? <span className="w-1.5 h-1.5 rounded-full bg-[#0d6e5a] shrink-0" />
            : <span className="text-[10px] text-zinc-300 shrink-0">·</span>
          }
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className={`text-zinc-300 transition-transform duration-200 shrink-0 ${expanded ? 'rotate-180' : ''}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="pb-2.5 pl-8 space-y-1">
          {ecoMiles && (
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Economy</span>
              <span className={`text-[10px] font-bold ${canAffordEco ? 'text-[#0d6e5a]' : 'text-zinc-400'}`}>
                {canAffordEco ? '✓ ' : ''}{fmt(ecoMiles)} mi
              </span>
            </div>
          )}
          {bizMiles && (
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Business</span>
              <span className={`text-[10px] font-bold ${canAffordBiz ? 'text-[#0d6e5a]' : 'text-zinc-400'}`}>
                {canAffordBiz ? '✓ ' : ''}{fmt(bizMiles)} mi
              </span>
            </div>
          )}
          <p className="text-[10px] text-zinc-400">{escape.travelWindow} · Book by {escape.bookBy}</p>
        </div>
      )}
    </div>
  );
}


export default function PointsScreen() {
  const { cards } = useApp();
  const [cpp, setCpp] = useState(1.5);
  const [manualMiles, setManualMiles] = useState('');
  const [selectedCabin, setSelectedCabin] = useState<CabinClass>('economy');
  const [showPicker, setShowPicker] = useState(false);
  const [pickedDestinations, setPickedDestinations] = useState<string[]>(DEFAULT_PICKS);
  const [escapes] = useState<Escape[]>(SAMPLE_ESCAPES);
  const [escapeSearch, setEscapeSearch] = useState('');
  const [escapeRegion, setEscapeRegion] = useState('All');
  const [isReturn, setIsReturn] = useState(false);
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesError, setRatesError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [weatherMap, setWeatherMap] = useState<Record<string, WeatherData>>({});
  const [news, setNews] = useState<{ title: string; link: string; pubDate: string; description: string }[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  // Load saved destinations from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setPickedDestinations(JSON.parse(saved));
    } catch {}
  }, []);

  function savePicks(picks: string[]) {
    setPickedDestinations(picks);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(picks)); } catch {}
  }

  const fetchRates = useCallback(() => {
    setRatesLoading(true);
    setRatesError(false);
    fetch('https://open.er-api.com/v6/latest/SGD')
      .then(r => r.json())
      .then(data => {
        setRates(data.rates);
        setLastUpdated(new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }));
      })
      .catch(() => setRatesError(true))
      .finally(() => setRatesLoading(false));
  }, []);

  useEffect(() => { fetchRates(); }, [fetchRates]);

  // Fetch weather for picked destinations
  useEffect(() => {
    const dests = pickedDestinations.filter(d => DEST_COORDS[d]);
    if (dests.length === 0) return;
    Promise.all(
      dests.map(dest => {
        const { lat, lng } = DEST_COORDS[dest];
        return fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&temperature_unit=celsius`
        )
          .then(r => r.json())
          .then(data => ({ dest, temp: data.current_weather.temperature as number, code: data.current_weather.weathercode as number }))
          .catch(() => null);
      })
    ).then(results => {
      const map: Record<string, WeatherData> = {};
      for (const r of results) {
        if (r) map[r.dest] = { temp: r.temp, code: r.code };
      }
      setWeatherMap(map);
    });
  }, [pickedDestinations]);

  // Fetch KrisFlyer news
  useEffect(() => {
    fetch('/api/news')
      .then(r => r.json())
      .then(data => setNews(data.items ?? []))
      .catch(() => {})
      .finally(() => setNewsLoading(false));
  }, []);

  const { totalMiles } = useMemo(() => {
    let total = 0;
    for (const card of cards) {
      if (card.milesProgram !== 'KrisFlyer') continue;
      total += Math.floor(card.currentSpent * card.milesRate);
    }
    return { totalMiles: total };
  }, [cards]);

  const displayMiles = manualMiles !== '' ? parseInt(manualMiles) || 0 : totalMiles;
  const estimatedValue = (displayMiles * cpp) / 100;
  const milesCards = cards.filter(c => c.milesProgram === 'KrisFlyer');

  const visibleDestinations = ALL_DESTINATIONS.filter(d =>
    pickedDestinations.includes(d.destination) && d[selectedCabin] !== null
  ).sort((a, b) => pickedDestinations.indexOf(a.destination) - pickedDestinations.indexOf(b.destination));

  return (
    <>
      {showPicker && (
        <DestinationPicker
          selected={pickedDestinations}
          onSave={savePicks}
          onClose={() => setShowPicker(false)}
        />
      )}

      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-[#0d6e5a] dark:bg-[#0a5747] px-5 pt-14 pb-12 md:pt-8 md:rounded-2xl">
          <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Singapore Airlines</p>
          <h1 className="text-white text-2xl font-bold">KrisFlyer Miles</h1>
        </div>

        <div className="px-4 space-y-5 -mt-6">
          {/* Total miles card */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden">
            {/* Card top — green band */}
            <div className="bg-[#0d6e5a]/8 dark:bg-[#0d6e5a]/20 px-5 pt-4 pb-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-bold text-[#0d6e5a] uppercase tracking-widest">KrisFlyer Miles Balance</p>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0d6e5a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.6">
                  <path d="M22 16.5a2.5 2.5 0 0 1-2.5 2.5H4a2 2 0 0 1-2-2v-1l2-6h14l2 4.5" />
                  <path d="M12 7V4" /><path d="M8 7l-2-3" /><path d="M16 7l2-3" />
                  <circle cx="19" cy="17" r="1" />
                </svg>
              </div>
              <div className="flex items-end gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder={String(totalMiles)}
                  value={manualMiles}
                  onChange={(e) => setManualMiles(e.target.value)}
                  className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 bg-transparent w-full outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-sm font-semibold text-zinc-400 mb-1.5 shrink-0">miles</span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-1">Tap to enter your actual balance</p>
            </div>

            {/* Value estimator */}
            <div className="px-5 py-4">
            <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Value Estimate</p>
                <p className="text-lg font-bold text-[#0d6e5a]">
                  SGD {estimatedValue.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 shrink-0">0.5¢</span>
                <input type="range" min="0.5" max="3.0" step="0.1" value={cpp}
                  onChange={(e) => setCpp(parseFloat(e.target.value))} className="flex-1 accent-[#0d6e5a]" />
                <span className="text-xs text-zinc-400 shrink-0">3.0¢</span>
              </div>
              <p className="text-center text-xs text-zinc-400 mt-1">
                at <span className="font-semibold text-zinc-600 dark:text-zinc-300">{cpp.toFixed(1)}¢</span> per mile (SGD)
              </p>
              <p className="text-center text-[10px] text-zinc-300 dark:text-zinc-600 mt-1">
                KrisFlyer economy ≈ 1.5¢ · Business ≈ 3.0¢
              </p>

              {/* Live exchange rates */}
              <div className="mt-4 border-t border-zinc-200 dark:border-zinc-700 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Live Conversion</p>
                  {lastUpdated && !ratesError && (
                    <p className="text-[10px] text-zinc-300 dark:text-zinc-600">Updated {lastUpdated}</p>
                  )}
                </div>
                {ratesLoading && (
                  <div className="space-y-2">
                    {CURRENCIES.map(c => (
                      <div key={c.code} className="flex justify-between items-center animate-pulse">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{c.flag}</span>
                          <div className="h-3 w-8 bg-zinc-200 dark:bg-zinc-700 rounded" />
                        </div>
                        <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-700 rounded" />
                      </div>
                    ))}
                  </div>
                )}
                {ratesError && (
                  <div className="text-center py-2">
                    <p className="text-xs text-zinc-400">Could not load live rates</p>
                    <button onClick={fetchRates} className="text-xs font-semibold text-[#0d6e5a] mt-1">Retry</button>
                  </div>
                )}
                {!ratesLoading && !ratesError && rates && (
                  <div className="space-y-2.5">
                    {CURRENCIES.map(({ code, flag }) => {
                      const rate = rates[code];
                      const converted = estimatedValue * (rate ?? 1);
                      const isJpy = code === 'JPY';
                      return (
                        <div key={code} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{flag}</span>
                            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{code}</span>
                          </div>
                          <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                            {isJpy
                              ? `¥${Math.round(converted).toLocaleString()}`
                              : converted.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            </div>
          </div>

{/* Redemption section */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl px-5 shadow-sm border border-zinc-100 dark:border-zinc-800">
            <div className="pt-4 pb-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">What Can You Redeem?</p>
                <button
                  onClick={() => setShowPicker(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-[#0d6e5a]"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
                  </svg>
                  Edit
                </button>
              </div>
              <p className="text-[10px] text-zinc-400 mb-3">One-way from SIN · Saver &amp; Advantage awards</p>
              {/* Cabin selector */}
              <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 gap-1">
                {(['economy', 'business', 'first'] as CabinClass[]).map(cabin => (
                  <button
                    key={cabin}
                    onClick={() => setSelectedCabin(cabin)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                      selectedCabin === cabin
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                        : 'text-zinc-400 dark:text-zinc-500'
                    }`}
                  >
                    {cabin}
                  </button>
                ))}
              </div>
            </div>

            {visibleDestinations.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-zinc-400">No First Class routes for your selections</p>
                <button onClick={() => setShowPicker(true)} className="text-xs font-semibold text-[#0d6e5a] mt-2">
                  Edit destinations
                </button>
              </div>
            ) : (
              visibleDestinations.map(r => (
                <RedemptionRow
                  key={r.destination}
                  destination={r.destination}
                  flag={r.flag}
                  rates={r[selectedCabin]!}
                  cabin={selectedCabin}
                  totalMiles={displayMiles}
                  weather={weatherMap[r.destination] ?? null}
                />
              ))
            )}
          </div>

          {/* Spontaneous Escapes */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
            <div className="px-5 pt-4 pb-3">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">30% off Saver</p>
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Spontaneous Escapes</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Updated 27 Jun 2026, 12:00 SGT</p>
                </div>
                {/* One-way / Return toggle */}
                <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-0.5">
                  {(['One-way', 'Return'] as const).map(opt => (
                    <button
                      key={opt}
                      onClick={() => setIsReturn(opt === 'Return')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        (opt === 'Return') === isReturn
                          ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                          : 'text-zinc-400'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Search destination…"
                  value={escapeSearch}
                  onChange={e => setEscapeSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#0d6e5a] transition-shadow"
                />
              </div>

              {/* Region filter chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {['All', ...Array.from(new Set(escapes.map(e => e.region)))].map(region => (
                  <button
                    key={region}
                    onClick={() => setEscapeRegion(region)}
                    className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${
                      escapeRegion === region
                        ? 'bg-[#0d6e5a] text-white border-[#0d6e5a]'
                        : 'bg-transparent text-zinc-500 border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-y-auto max-h-[185px] px-5">
              {(() => {
                const filtered = escapes.filter(e =>
                  (escapeRegion === 'All' || e.region === escapeRegion) &&
                  e.destination.toLowerCase().includes(escapeSearch.toLowerCase())
                );
                return filtered.length === 0
                  ? <p className="text-sm text-zinc-400 text-center py-8">No destinations match</p>
                  : filtered.map(escape => (
                      <EscapeRow key={escape.id} escape={escape} totalMiles={displayMiles} isReturn={isReturn} />
                    ));
              })()}
            </div>
          </div>

          {/* KrisFlyer News */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl px-5 shadow-sm border border-zinc-100 dark:border-zinc-800">
            <div className="pt-4 pb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">KrisFlyer News</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">via MileLion · live</p>
              </div>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>
            {newsLoading ? (
              <div className="space-y-3 pb-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse space-y-1.5">
                    <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-3/4" />
                    <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : news.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-6">Could not load news</p>
            ) : (
              <div className="overflow-y-auto max-h-[260px] pb-3">
                {news.map((item, i) => (
                  <a
                    key={i}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 -mx-5 px-5 transition-colors"
                  >
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-snug mb-1">{item.title}</p>
                    <p className="text-[10px] text-zinc-400 leading-snug">{item.description}</p>
                    <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-1">
                      {new Date(item.pubDate).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="text-center pb-4">
            <p className="text-[10px] text-zinc-300 dark:text-zinc-600">
              Award rates are approximate · Exchange rates updated live
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

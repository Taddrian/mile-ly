import { CreditCard } from '@/types';

export const mockCards: CreditCard[] = [
  {
    id: '1',
    name: 'UOB Preferred Platinum',
    last4: '1234',
    color: '#1E3A8A',
    monthlyLimit: 5000,
    currentSpent: 1200,
  },
  {
    id: '2',
    name: 'Citi Rewards',
    last4: '5678',
    color: '#0F766E',
    monthlyLimit: 6000,
    currentSpent: 2850,
  },
  {
    id: '3',
    name: 'HSBC Revolution',
    last4: '9876',
    color: '#DC2626',
    monthlyLimit: 3000,
    currentSpent: 950,
  },
  {
    id: '4',
    name: 'DBS Altitude',
    last4: '4321',
    color: '#7C3AED',
    monthlyLimit: 4000,
    currentSpent: 1550,
  },
];

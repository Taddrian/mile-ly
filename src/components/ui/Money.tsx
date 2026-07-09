interface MoneyProps {
  amount: number;
  sign?: '+' | '-' | 'auto' | 'none';
  currency?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm:  { whole: 'text-sm',   cents: 'text-xs'  },
  md:  { whole: 'text-base', cents: 'text-xs'  },
  lg:  { whole: 'text-xl',   cents: 'text-sm'  },
  xl:  { whole: 'text-[34px] tracking-tight', cents: 'text-lg' },
};

export default function Money({
  amount,
  sign = 'none',
  currency = 'SGD',
  size = 'md',
  className = '',
}: MoneyProps) {
  const abs = Math.abs(amount);
  const [whole, cents] = abs.toFixed(2).split('.');
  const wholeFormatted = Number(whole).toLocaleString('en-SG');

  const prefix =
    sign === 'none' ? '' :
    sign === '+' ? '+' :
    sign === '-' ? '−' :
    amount >= 0 ? '+' : '−';

  const { whole: wCls, cents: cCls } = sizeMap[size];

  return (
    <span className={`inline-flex items-baseline gap-0.5 ${className}`}>
      {prefix && <span className={wCls}>{prefix}</span>}
      <span className="text-[10px] font-medium mr-0.5 self-start mt-1">{currency}</span>
      <span className={`font-medium ${wCls}`}>{wholeFormatted}</span>
      <span className={`font-medium ${cCls} opacity-70`}>.{cents}</span>
    </span>
  );
}

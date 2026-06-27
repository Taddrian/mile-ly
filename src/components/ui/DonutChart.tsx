'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DonutChartProps {
  data: { name: string; value: number; color: string }[];
}

export default function DonutChart({ data }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return <p className="text-sm text-zinc-400 text-center py-8">No spending data</p>;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [`SGD ${Number(value).toFixed(2)}`, '']}
          contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        />
        <Legend
          formatter={(value) => <span className="text-xs text-zinc-600 dark:text-zinc-300">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

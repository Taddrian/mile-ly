const categoryColors: Record<string, string> = {
  'Food & Drink': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  Shopping: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  Groceries: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  Transport: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Entertainment: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  Health: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  Utilities: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
};

const defaultColor = 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300';

interface BadgeProps {
  label: string;
}

export default function Badge({ label }: BadgeProps) {
  const colorClass = categoryColors[label] ?? defaultColor;
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {label}
    </span>
  );
}

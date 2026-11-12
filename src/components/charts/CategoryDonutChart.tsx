import React, { useState } from 'react';
import { Category, Transaction } from '../../types/finance';
import { formatRupiah } from '../../utils/formatters';
import { CategoryIcon } from '../CategoryIcon';

interface CategoryDonutChartProps {
  categories: Category[];
  transactions: Transaction[];
  onSelectCategory?: (categoryId: string | null) => void;
  selectedCategoryId?: string | null;
}

interface SliceData {
  category: Category;
  amount: number;
  percentage: number;
  startAngle: number;
  endAngle: number;
  path: string;
  midAngle: number;
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  categories,
  transactions,
  onSelectCategory,
  selectedCategoryId,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Filter only expenses
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  const totalExpense = expenseTransactions.reduce((acc, t) => acc + t.amount, 0);

  // Group by category
  const expenseMap = new Map<string, number>();
  expenseTransactions.forEach((t) => {
    expenseMap.set(t.categoryId, (expenseMap.get(t.categoryId) || 0) + t.amount);
  });

  // Build sorted list
  const dataItems: { category: Category; amount: number; percentage: number }[] = [];
  categories
    .filter((c) => c.type === 'expense')
    .forEach((cat) => {
      const amount = expenseMap.get(cat.id) || 0;
      if (amount > 0) {
        dataItems.push({
          category: cat,
          amount,
          percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
        });
      }
    });

  // Sort descending by amount
  dataItems.sort((a, b) => b.amount - a.amount);

  // Calculate SVG arc paths
  const size = 260;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  let currentAngle = -Math.PI / 2; // start from top (12 o'clock)
  const slices: SliceData[] = dataItems.map((item) => {
    const angle = totalExpense > 0 ? (item.amount / totalExpense) * (Math.PI * 2) : 0;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle += angle;

    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);

    const largeArcFlag = angle > Math.PI ? 1 : 0;
    const path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;

    return {
      category: item.category,
      amount: item.amount,
      percentage: item.percentage,
      startAngle,
      endAngle,
      path,
      midAngle: (startAngle + endAngle) / 2,
    };
  });

  const activeCategory =
    hoveredId ? dataItems.find((d) => d.category.id === hoveredId) :
    selectedCategoryId ? dataItems.find((d) => d.category.id === selectedCategoryId) :
    null;

  if (totalExpense === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 dark:text-slate-400">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
          <span className="text-2xl">📊</span>
        </div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Belum Ada Pengeluaran</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Catat pengeluaran bulan ini untuk melihat proporsi grafik kategori pengeluaran Anda.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row items-center gap-6">
      {/* SVG Donut */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg width={size} height={size} className="overflow-visible">
          {/* Subtle base track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-slate-100 dark:text-slate-800"
            strokeWidth={strokeWidth}
          />

          {/* Slices */}
          {slices.map((slice) => {
            const isHovered = hoveredId === slice.category.id;
            const isSelected = selectedCategoryId === slice.category.id;
            const isDimmed = (hoveredId && !isHovered) || (selectedCategoryId && !isSelected);

            return (
              <path
                key={slice.category.id}
                d={slice.path}
                fill="none"
                stroke={slice.category.color}
                strokeWidth={isHovered || isSelected ? strokeWidth + 6 : strokeWidth}
                strokeLinecap="round"
                opacity={isDimmed ? 0.35 : 1}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredId(slice.category.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => {
                  if (onSelectCategory) {
                    onSelectCategory(selectedCategoryId === slice.category.id ? null : slice.category.id);
                  }
                }}
              />
            );
          })}
        </svg>

        {/* Center Text Info */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          {activeCategory ? (
            <>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                {activeCategory.category.name}
              </span>
              <span className="text-lg font-bold text-slate-900 dark:text-white tabular-nums tracking-tight mt-0.5">
                {formatRupiah(activeCategory.amount, true)}
              </span>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
                {activeCategory.percentage.toFixed(1)}% dari total
              </span>
            </>
          ) : (
            <>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Pengeluaran</span>
              <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums tracking-tight mt-0.5">
                {formatRupiah(totalExpense, true)}
              </span>
              <span className="text-[11px] text-slate-400">
                {dataItems.length} Kategori
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legend & Breakdown List */}
      <div className="flex-1 w-full space-y-2 max-h-64 overflow-y-auto pr-1">
        {dataItems.map((item) => {
          const isSelected = selectedCategoryId === item.category.id;
          const isHovered = hoveredId === item.category.id;

          return (
            <button
              key={item.category.id}
              onClick={() => {
                if (onSelectCategory) {
                  onSelectCategory(isSelected ? null : item.category.id);
                }
              }}
              onMouseEnter={() => setHoveredId(item.category.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                isSelected
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 ring-1 ring-indigo-500/30'
                  : isHovered
                  ? 'bg-slate-100/80 dark:bg-slate-800/60'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.category.color }}
                />
                <CategoryIcon
                  name={item.category.iconName}
                  className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0"
                />
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                  {item.category.name}
                </span>
              </div>

              <div className="text-right shrink-0 ml-3">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatRupiah(item.amount)}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                  {item.percentage.toFixed(1)}%
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

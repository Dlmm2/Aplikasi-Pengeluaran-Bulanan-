import React from 'react';
import { Category, Transaction } from '../../types/finance';
import { formatRupiah } from '../../utils/formatters';
import { CategoryIcon } from '../CategoryIcon';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface BudgetVsActualChartProps {
  categories: Category[];
  transactions: Transaction[];
  categoryBudgets: Record<string, number>;
  onEditCategoryBudget?: (categoryId: string) => void;
}

export const BudgetVsActualChart: React.FC<BudgetVsActualChartProps> = ({
  categories,
  transactions,
  categoryBudgets,
  onEditCategoryBudget,
}) => {
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  // Sum expenses per category
  const expensesMap = new Map<string, number>();
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      expensesMap.set(t.categoryId, (expensesMap.get(t.categoryId) || 0) + t.amount);
    });

  const categoryStats = expenseCategories.map((cat) => {
    const budget = categoryBudgets[cat.id] ?? (cat.defaultBudget || 0);
    const spent = expensesMap.get(cat.id) || 0;
    const remaining = budget - spent;
    const percentUsed = budget > 0 ? (spent / budget) * 100 : 0;
    const isOver = spent > budget && budget > 0;
    const isWarning = percentUsed >= 80 && !isOver;

    return {
      cat,
      budget,
      spent,
      remaining,
      percentUsed,
      isOver,
      isWarning,
    };
  });

  // Sort: Over-budget first, then by spent descending
  categoryStats.sort((a, b) => {
    if (a.isOver !== b.isOver) return a.isOver ? -1 : 1;
    return b.spent - a.spent;
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {categoryStats.map((item) => {
          const { cat, budget, spent, remaining, percentUsed, isOver, isWarning } = item;

          return (
            <div
              key={cat.id}
              className={`p-3.5 rounded-xl border transition-all ${
                isOver
                  ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                  : isWarning
                  ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                  >
                    <CategoryIcon name={cat.iconName} className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate">
                      {cat.name}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                      Batas: {formatRupiah(budget)}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-xs font-bold tabular-nums ${
                      isOver
                        ? 'text-rose-600 dark:text-rose-400'
                        : isWarning
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {percentUsed.toFixed(0)}%
                  </span>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 tabular-nums">
                    {formatRupiah(spent)}
                  </div>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="relative w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden my-1.5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isOver
                      ? 'bg-rose-500'
                      : isWarning
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, percentUsed)}%` }}
                />
              </div>

              {/* Footer status & Remaining */}
              <div className="flex items-center justify-between text-[11px] pt-1">
                <div className="flex items-center gap-1">
                  {isOver ? (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="text-rose-600 dark:text-rose-400 font-medium">
                        Melebihi {formatRupiah(Math.abs(remaining))}
                      </span>
                    </>
                  ) : isWarning ? (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        Mendekati Batas
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="text-slate-500 dark:text-slate-400">
                        Sisa {formatRupiah(remaining)}
                      </span>
                    </>
                  )}
                </div>

                {onEditCategoryBudget && (
                  <button
                    onClick={() => onEditCategoryBudget(cat.id)}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
                  >
                    Ubah
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

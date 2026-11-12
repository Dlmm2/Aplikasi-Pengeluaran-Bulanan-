import React, { useState } from 'react';
import { Transaction } from '../../types/finance';
import { formatRupiah, formatDateIndo, getDaysInMonth } from '../../utils/formatters';

interface DailyTrendChartProps {
  currentMonth: string; // YYYY-MM
  transactions: Transaction[];
  monthlyBudget: number;
  startDate?: string; // Optional custom range start (YYYY-MM-DD)
  endDate?: string; // Optional custom range end (YYYY-MM-DD)
}

export const DailyTrendChart: React.FC<DailyTrendChartProps> = ({
  currentMonth,
  transactions,
  monthlyBudget,
  startDate,
  endDate,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const daysCountInMonth = getDaysInMonth(currentMonth);
  const effectiveStart = startDate || `${currentMonth}-01`;
  const effectiveEnd = endDate || `${currentMonth}-${String(daysCountInMonth).padStart(2, '0')}`;

  // Generate sequence of dates between effectiveStart and effectiveEnd
  const dateList: string[] = [];
  const curr = new Date(effectiveStart);
  const stop = new Date(effectiveEnd);

  if (!isNaN(curr.getTime()) && !isNaN(stop.getTime())) {
    while (curr <= stop && dateList.length < 60) {
      dateList.push(curr.toISOString().split('T')[0]);
      curr.setDate(curr.getDate() + 1);
    }
  }

  // Filter only expenses
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');

  // Map expenses for each date in dateList
  const dailyData = dateList.map((dateStr, idx) => {
    const dayTxs = expenseTransactions.filter((t) => t.date === dateStr);
    const total = dayTxs.reduce((sum, t) => sum + t.amount, 0);
    const [, m, d] = dateStr.split('-');

    return {
      index: idx,
      dateStr,
      dayNum: parseInt(d, 10),
      monthNum: parseInt(m, 10),
      total,
      transactions: dayTxs,
    };
  });

  // Calculate cumulative sum
  let runningSum = 0;
  const cumulativeData = dailyData.map((item) => {
    runningSum += item.total;
    return {
      ...item,
      cumulative: runningSum,
    };
  });

  const rangeDaysCount = Math.max(1, dailyData.length);
  const totalRangeExpense = runningSum;
  const maxDaily = Math.max(...dailyData.map((d) => d.total), 1);
  const idealDailyBudget = monthlyBudget > 0 ? monthlyBudget / daysCountInMonth : 0;

  // Active hover detail
  const activeDetail = hoveredIdx !== null ? cumulativeData[hoveredIdx] : null;

  return (
    <div className="space-y-4">
      {/* Legend & Summary Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-indigo-500 shrink-0" />
            <span>Pengeluaran Harian</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t border-dashed border-amber-500 shrink-0" />
            <span>Target Rata-rata ({formatRupiah(idealDailyBudget, true)}/hari)</span>
          </div>
        </div>

        {activeDetail ? (
          <div className="font-medium text-slate-800 dark:text-slate-200 tabular-nums">
            {formatDateIndo(activeDetail.dateStr)}:{' '}
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">
              {formatRupiah(activeDetail.total)}
            </span>{' '}
            (Kumulatif: {formatRupiah(activeDetail.cumulative, true)})
          </div>
        ) : (
          <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums font-medium">
            Total Rentang: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{formatRupiah(totalRangeExpense, true)}</span> ({rangeDaysCount} hari)
          </div>
        )}
      </div>

      {/* Daily Chart Display */}
      <div className="relative pt-2">
        <div className="flex items-end gap-1 sm:gap-1.5 h-44 border-b border-slate-200 dark:border-slate-800 pb-1">
          {dailyData.map((item, idx) => {
            const heightPercent = maxDaily > 0 ? Math.min(100, (item.total / maxDaily) * 100) : 0;
            const isHovered = hoveredIdx === idx;
            const hasExpense = item.total > 0;

            // Label interval: if many days, show fewer labels
            const step = rangeDaysCount > 25 ? 5 : rangeDaysCount > 14 ? 3 : 2;
            const showLabel = idx === 0 || idx === rangeDaysCount - 1 || idx % step === 0;

            return (
              <div
                key={item.dateStr}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Bar */}
                <div
                  style={{ height: hasExpense ? `${Math.max(6, heightPercent)}%` : '2px' }}
                  className={`w-full rounded-t transition-all duration-150 ${
                    hasExpense
                      ? isHovered
                        ? 'bg-indigo-600 dark:bg-indigo-400 shadow-sm'
                        : 'bg-indigo-500/80 dark:bg-indigo-500/90 hover:bg-indigo-600'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />

                {/* Date / Day label on bottom */}
                {showLabel && (
                  <span className="absolute -bottom-5 text-[10px] text-slate-400 tabular-nums whitespace-nowrap">
                    {rangeDaysCount > 20 ? item.dayNum : `${item.dayNum}/${item.monthNum}`}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Hover Popup Detail */}
        {activeDetail && activeDetail.total > 0 && (
          <div className="mt-7 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200/80 dark:border-slate-700 text-xs">
            <div className="flex items-center justify-between mb-1.5 font-semibold text-slate-800 dark:text-slate-200">
              <span>Transaksi {formatDateIndo(activeDetail.dateStr)}</span>
              <span className="tabular-nums text-indigo-600 dark:text-indigo-400">
                Total: {formatRupiah(activeDetail.total)}
              </span>
            </div>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {activeDetail.transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span className="truncate pr-2">{tx.title}</span>
                  <span className="tabular-nums font-medium text-slate-900 dark:text-slate-200">
                    {formatRupiah(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

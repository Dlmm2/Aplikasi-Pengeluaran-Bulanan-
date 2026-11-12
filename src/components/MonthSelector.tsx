import React from 'react';
import { formatMonthYear } from '../utils/formatters';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface MonthSelectorProps {
  currentMonth: string; // YYYY-MM
  onChangeMonth: (newMonth: string) => void;
  systemMonth: string; // YYYY-MM
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  currentMonth,
  onChangeMonth,
  systemMonth,
}) => {
  const [year, month] = currentMonth.split('-').map(Number);

  const handlePrev = () => {
    let newYear = year;
    let newMonth = month - 1;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    onChangeMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleNext = () => {
    let newYear = year;
    let newMonth = month + 1;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    onChangeMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const isCurrentSystemMonth = currentMonth === systemMonth;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={handlePrev}
            title="Bulan sebelumnya"
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="px-3 py-1 text-sm font-bold text-slate-900 dark:text-white tabular-nums flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span>{formatMonthYear(currentMonth)}</span>
          </div>

          <button
            onClick={handleNext}
            title="Bulan berikutnya"
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {!isCurrentSystemMonth && (
          <button
            onClick={() => onChangeMonth(systemMonth)}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            Kembali ke Bulan Ini
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>Periode Pembukuan Bulanan</span>
        <span aria-hidden="true">·</span>
        <span>Mata Uang: IDR (Rupiah)</span>
      </div>
    </div>
  );
};

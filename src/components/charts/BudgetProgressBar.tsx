import React from 'react';
import { formatRupiah } from '../../utils/formatters';
import { SlidersHorizontal, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';

interface BudgetProgressBarProps {
  totalBudget: number;
  totalExpense: number;
  remainingBudget: number;
  daysPassed: number;
  daysInMonth: number;
  onOpenBudgetModal: () => void;
}

export const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({
  totalBudget,
  totalExpense,
  remainingBudget,
  daysPassed,
  daysInMonth,
  onOpenBudgetModal,
}) => {
  const percentUsed = totalBudget > 0 ? (totalExpense / totalBudget) * 100 : 0;
  const isOverBudget = remainingBudget < 0;
  const daysRemaining = Math.max(1, daysInMonth - daysPassed);
  
  // Safe daily allowance for remaining days
  const dailyAllowance = remainingBudget > 0 ? remainingBudget / daysRemaining : 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Status Anggaran Bulanan
            </h2>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              Hari ke-{daysPassed} dari {daysInMonth}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kontrol pengeluaran agar tidak melebihi alokasi dana bulanan
          </p>
        </div>

        <button
          onClick={onOpenBudgetModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer self-start sm:self-auto shrink-0"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Atur Anggaran</span>
        </button>
      </div>

      {/* Main Budget Progress Indicator */}
      <div className="pt-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div className="space-y-0.5">
            <span className="text-xs text-slate-500 dark:text-slate-400">Terpakai Saat Ini</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
                {formatRupiah(totalExpense)}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                dari {formatRupiah(totalBudget)}
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {isOverBudget ? 'Melebihi Anggaran' : 'Sisa Anggaran'}
            </span>
            <div
              className={`text-lg font-bold tabular-nums ${
                isOverBudget
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {isOverBudget ? `- ${formatRupiah(Math.abs(remainingBudget))}` : formatRupiah(remainingBudget)}
            </div>
          </div>
        </div>

        {/* Progress Bar with markers */}
        <div className="relative pt-1">
          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverBudget
                  ? 'bg-rose-500'
                  : percentUsed >= 85
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, percentUsed)}%` }}
            />
          </div>

          {/* Progress Percent Text */}
          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1.5 tabular-nums">
            <span>0%</span>
            <span
              className={`font-semibold ${
                isOverBudget
                  ? 'text-rose-600 dark:text-rose-400'
                  : percentUsed >= 85
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {percentUsed.toFixed(1)}% Terpakai
            </span>
            <span>100% Target</span>
          </div>
        </div>

        {/* Smart financial calculation banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
            {isOverBudget ? (
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                {isOverBudget ? 'Perlu Penghematan' : 'Kondisi Anggaran Sehat'}
              </span>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                {isOverBudget
                  ? 'Pengeluaran telah melampaui rencana anggaran bulan ini. Tahan belanja non-primer.'
                  : `Anda telah memanfaatkan ${percentUsed.toFixed(0)}% dari batas anggaran yang dialokasikan.`}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/80 dark:border-indigo-900/40 text-xs">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-indigo-900 dark:text-indigo-200 block">
                Alokasi Harian Aman
              </span>
              <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                {remainingBudget > 0 ? (
                  <>
                    Maksimal <strong className="text-indigo-700 dark:text-indigo-300 tabular-nums">{formatRupiah(dailyAllowance)} / hari</strong> untuk {daysRemaining} hari ke depan.
                  </>
                ) : (
                  'Batas anggaran sudah habis untuk sisa hari di bulan ini.'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

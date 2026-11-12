import React from 'react';
import { FinancialStats } from '../types/finance';
import { formatRupiah } from '../utils/formatters';
import { ArrowDownLeft, ArrowUpRight, Wallet, CalendarDays, TrendingUp } from 'lucide-react';

interface KPICardsProps {
  stats: FinancialStats;
  incomeCount: number;
  expenseCount: number;
}

export const KPICards: React.FC<KPICardsProps> = ({ stats, incomeCount, expenseCount }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Pemasukan */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Pemasukan</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
            {formatRupiah(stats.totalIncome)}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
            <span>{incomeCount} transaksi masuk</span>
          </div>
        </div>
      </div>

      {/* Pengeluaran */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Pengeluaran</span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
            {formatRupiah(stats.totalExpense)}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
            <span>{expenseCount} transaksi tercatat</span>
          </div>
        </div>
      </div>

      {/* Arus Kas Bersih (Sisa Saldo) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Sisa Uang (Net Cashflow)</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div
            className={`text-xl sm:text-2xl font-bold tabular-nums tracking-tight ${
              stats.balance >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatRupiah(stats.balance)}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
            <span className="tabular-nums">Tingkat hemat {stats.savingsRate.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Rata-Rata Harian */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Rata-Rata Pengeluaran</span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <CalendarDays className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
            {formatRupiah(stats.avgDailyExpense)}
            <span className="text-xs font-normal text-slate-400 ml-1">/hari</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
            <span>Estimasi s/d akhir: {formatRupiah(stats.projectedMonthEndExpense, true)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

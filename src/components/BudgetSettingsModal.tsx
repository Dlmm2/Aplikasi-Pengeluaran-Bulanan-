import React, { useState, useEffect } from 'react';
import { Category } from '../types/finance';
import { formatRupiah } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { X, Check, RotateCcw, Sparkles } from 'lucide-react';

interface BudgetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  currentBudgets: Record<string, number>;
  onSaveBudgets: (newBudgets: Record<string, number>) => void;
  highlightCategoryId?: string | null;
}

export const BudgetSettingsModal: React.FC<BudgetSettingsModalProps> = ({
  isOpen,
  onClose,
  categories,
  currentBudgets,
  onSaveBudgets,
  highlightCategoryId,
}) => {
  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const [budgets, setBudgets] = useState<Record<string, number>>({});

  useEffect(() => {
    if (isOpen) {
      const initial: Record<string, number> = {};
      expenseCategories.forEach((cat) => {
        initial[cat.id] = currentBudgets[cat.id] ?? (cat.defaultBudget || 0);
      });
      setBudgets(initial);
    }
  }, [isOpen, currentBudgets, categories]);

  const handleBudgetChange = (catId: string, val: string) => {
    const clean = val.replace(/\D/g, '');
    const num = clean ? parseInt(clean, 10) : 0;
    setBudgets((prev) => ({
      ...prev,
      [catId]: num,
    }));
  };

  const handleResetDefaults = () => {
    const reset: Record<string, number> = {};
    expenseCategories.forEach((cat) => {
      reset[cat.id] = cat.defaultBudget || 0;
    });
    setBudgets(reset);
  };

  const handleApplyPreset503020 = () => {
    // Standard template assuming a ~Rp 10.000.000 monthly living baseline:
    // Needs (50%): Food, Bills, Groceries, Transport, Health (~5jt)
    // Wants (30%): Entertainment, Family, Education, Other (~3jt)
    // Savings (20%): Tabungan & Investasi (2jt)
    setBudgets({
      cat_food: 2300000,
      cat_groceries: 1400000,
      cat_bills: 1000000,
      cat_transport: 800000,
      cat_health: 400000,
      cat_entertainment: 600000,
      cat_family: 500000,
      cat_education: 500000,
      cat_other_exp: 300000,
      cat_savings: 2000000,
    });
  };

  const totalAllocated = Object.values(budgets).reduce((sum, val) => sum + (val || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveBudgets(budgets);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Atur Rencana Anggaran Bulanan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tentukan batas maksimal belanja untuk setiap kategori agar pengeluaran terkontrol
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick presets toolbar */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleApplyPreset503020}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition-colors cursor-pointer font-medium"
            >
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>Prinsip 50/30/20</span>
            </button>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-slate-400" />
              <span>Reset Standar</span>
            </button>
          </div>

          <div className="text-slate-600 dark:text-slate-300">
            Total Alokasi:{' '}
            <strong className="text-indigo-600 dark:text-indigo-400 font-bold tabular-nums">
              {formatRupiah(totalAllocated)}
            </strong>
          </div>
        </div>

        {/* Categories budget list */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-96 overflow-y-auto space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {expenseCategories.map((cat) => {
                const currentVal = budgets[cat.id] || 0;
                const isHighlighted = highlightCategoryId === cat.id;

                return (
                  <div
                    key={cat.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isHighlighted
                        ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-500 ring-2 ring-indigo-500/20'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                      >
                        <CategoryIcon name={cat.iconName} className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {cat.name}
                      </span>
                    </div>

                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                        Rp
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={currentVal ? currentVal.toLocaleString('id-ID') : ''}
                        onChange={(e) => handleBudgetChange(cat.id, e.target.value)}
                        placeholder="0"
                        className="w-full pl-9 pr-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {expenseCategories.length} kategori pengeluaran terdaftar
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Anggaran</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

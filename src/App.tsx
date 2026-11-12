import React, { useState, useEffect, useMemo } from 'react';
import { Category, MonthlyBudget, Transaction } from './types/finance';
import { DEFAULT_CATEGORIES, INITIAL_TRANSACTIONS } from './data/defaultData';
import { formatRupiah, getDaysInMonth } from './utils/formatters';
import { Navbar, ActiveTab } from './components/Navbar';
import { MonthSelector } from './components/MonthSelector';
import { KPICards } from './components/KPICards';
import { BudgetProgressBar } from './components/charts/BudgetProgressBar';
import { CategoryDonutChart } from './components/charts/CategoryDonutChart';
import { DailyTrendChart } from './components/charts/DailyTrendChart';
import { BudgetVsActualChart } from './components/charts/BudgetVsActualChart';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { BudgetSettingsModal } from './components/BudgetSettingsModal';
import { DateRangeSelector, DateRange } from './components/DateRangeSelector';
import {
  PieChart,
  BarChart3,
  CalendarDays,
  SlidersHorizontal,
  PlusCircle,
  TrendingDown,
  ShieldAlert,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

const STORAGE_KEY_TXS = 'arthabulan_transactions_v1';
const STORAGE_KEY_BUDGETS = 'arthabulan_budgets_v1';
const STORAGE_KEY_THEME = 'arthabulan_theme_v1';

export default function App() {
  // Determine system current month
  const today = new Date();
  const systemMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    if (saved !== null) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'light');
    }
  }, [darkMode]);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Selected viewing month (YYYY-MM)
  const [currentMonth, setCurrentMonth] = useState<string>('2026-11');

  // Customizable date range for daily trend chart
  const [trendDateRange, setTrendDateRange] = useState<DateRange>(() => {
    const days = getDaysInMonth('2026-11');
    return {
      startDate: '2026-11-01',
      endDate: `2026-11-${String(days).padStart(2, '0')}`,
      presetLabel: `Bulan Penuh (1 - ${days})`,
    };
  });

  // Keep trend date range synced when currentMonth changes
  useEffect(() => {
    const days = getDaysInMonth(currentMonth);
    setTrendDateRange({
      startDate: `${currentMonth}-01`,
      endDate: `${currentMonth}-${String(days).padStart(2, '0')}`,
      presetLabel: `Bulan Penuh (1 - ${days})`,
    });
  }, [currentMonth]);

  // Categories
  const [categories] = useState<Category[]>(DEFAULT_CATEGORIES);

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TXS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse saved transactions', e);
    }
    return INITIAL_TRANSACTIONS;
  });

  // Save transactions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TXS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions', e);
    }
  }, [transactions]);

  // Category Budgets per month
  const [monthlyBudgets, setMonthlyBudgets] = useState<Record<string, Record<string, number>>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BUDGETS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse budgets', e);
    }
    // Default initial budget mapping
    const defaultMap: Record<string, number> = {};
    DEFAULT_CATEGORIES.filter((c) => c.type === 'expense').forEach((c) => {
      defaultMap[c.id] = c.defaultBudget || 0;
    });
    return {
      '2026-11': defaultMap,
    };
  });

  // Save budgets to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(monthlyBudgets));
    } catch (e) {
      console.error('Failed to save budgets', e);
    }
  }, [monthlyBudgets]);

  // Current month's category budgets
  const activeCategoryBudgets = useMemo(() => {
    if (monthlyBudgets[currentMonth]) {
      return monthlyBudgets[currentMonth];
    }
    // Fallback to default category budgets
    const fallback: Record<string, number> = {};
    categories.filter((c) => c.type === 'expense').forEach((c) => {
      fallback[c.id] = c.defaultBudget || 0;
    });
    return fallback;
  }, [monthlyBudgets, currentMonth, categories]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [highlightCategoryId, setHighlightCategoryId] = useState<string | null>(null);

  // Month-filtered transactions
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(currentMonth));
  }, [transactions, currentMonth]);

  // Sum of category expenses for this month
  const monthCategoryExpenses = useMemo(() => {
    const map: Record<string, number> = {};
    monthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
      });
    return map;
  }, [monthTransactions]);

  // Financial Stats Calculation
  const stats = useMemo(() => {
    const incomeTxs = monthTransactions.filter((t) => t.type === 'income');
    const expenseTxs = monthTransactions.filter((t) => t.type === 'expense');

    const totalIncome = incomeTxs.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expenseTxs.reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.max(0, (balance / totalIncome) * 100) : 0;

    // Total budget is sum of all category targets
    const totalBudget = Object.values(activeCategoryBudgets).reduce((sum, b) => sum + (b || 0), 0);
    const remainingBudget = totalBudget - totalExpense;
    const budgetUsedPercent = totalBudget > 0 ? (totalExpense / totalBudget) * 100 : 0;

    const daysInMonth = getDaysInMonth(currentMonth);

    // If current viewed month is system's current month, use today's day; otherwise use all days
    let daysPassed = daysInMonth;
    if (currentMonth === systemMonth) {
      daysPassed = Math.min(today.getDate(), daysInMonth);
    } else {
      const [vYear, vMonth] = currentMonth.split('-').map(Number);
      const nowYear = today.getFullYear();
      const nowMonth = today.getMonth() + 1;
      if (vYear > nowYear || (vYear === nowYear && vMonth > nowMonth)) {
        daysPassed = 1;
      } else {
        daysPassed = daysInMonth;
      }
    }

    const avgDailyExpense = daysPassed > 0 ? totalExpense / daysPassed : 0;
    const projectedMonthEndExpense = avgDailyExpense * daysInMonth;

    return {
      totalIncome,
      totalExpense,
      balance,
      savingsRate,
      totalBudget,
      remainingBudget,
      budgetUsedPercent,
      avgDailyExpense,
      projectedMonthEndExpense,
      daysPassed,
      daysInMonth,
    };
  }, [monthTransactions, activeCategoryBudgets, currentMonth, systemMonth, today]);

  // Transaction Actions
  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === existingId ? { ...t, ...txData } : t))
      );
    } else {
      const newTx: Transaction = {
        ...txData,
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        createdAt: Date.now(),
      };
      setTransactions((prev) => [newTx, ...prev]);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsAddModalOpen(true);
  };

  const handleOpenAddNew = () => {
    setEditingTransaction(null);
    setIsAddModalOpen(true);
  };

  const handleSaveBudgets = (newBudgets: Record<string, number>) => {
    setMonthlyBudgets((prev) => ({
      ...prev,
      [currentMonth]: newBudgets,
    }));
  };

  const handleEditCategoryBudget = (catId: string) => {
    setHighlightCategoryId(catId);
    setIsBudgetModalOpen(true);
  };

  const handleImportTransactions = (imported: Transaction[]) => {
    if (Array.isArray(imported)) {
      setTransactions(imported);
      alert(`Berhasil mengimpor ${imported.length} transaksi!`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAddModal={handleOpenAddNew}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Month Selector Bar */}
        <MonthSelector
          currentMonth={currentMonth}
          onChangeMonth={setCurrentMonth}
          systemMonth={systemMonth}
        />

        {/* TAB 1: OVERVIEW (RINGKASAN) */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Summary Cards */}
            <KPICards
              stats={stats}
              incomeCount={monthTransactions.filter((t) => t.type === 'income').length}
              expenseCount={monthTransactions.filter((t) => t.type === 'expense').length}
            />

            {/* Budget Gauge & Safe Spending Advisor */}
            <BudgetProgressBar
              totalBudget={stats.totalBudget}
              totalExpense={stats.totalExpense}
              remainingBudget={stats.remainingBudget}
              daysPassed={stats.daysPassed}
              daysInMonth={stats.daysInMonth}
              onOpenBudgetModal={() => {
                setHighlightCategoryId(null);
                setIsBudgetModalOpen(true);
              }}
            />

            {/* Charts Double Section: Category Donut + Daily Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Expense Donut */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                        <PieChart className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Rasio Kategori Pengeluaran
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('charts')}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Detail</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="pt-4">
                    <CategoryDonutChart
                      categories={categories}
                      transactions={monthTransactions}
                    />
                  </div>
                </div>
              </div>

              {/* Daily Trend Chart */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Tren Pengeluaran Harian
                      </h3>
                    </div>
                    <DateRangeSelector
                      currentMonth={currentMonth}
                      range={trendDateRange}
                      onChangeRange={setTrendDateRange}
                      daysInMonth={stats.daysInMonth}
                    />
                  </div>
                  <div className="pt-4">
                    <DailyTrendChart
                      currentMonth={currentMonth}
                      transactions={transactions}
                      monthlyBudget={stats.totalBudget}
                      startDate={trendDateRange.startDate}
                      endDate={trendDateRange.endDate}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Recent Transactions Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Transaksi Terakhir Bulan Ini
                </h3>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Buka Buku Transaksi Lengkap</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <TransactionList
                transactions={monthTransactions.slice(0, 5)}
                categories={categories}
                onEditTransaction={handleEditTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                onAddNew={handleOpenAddNew}
                onImportData={handleImportTransactions}
              />
            </div>
          </div>
        )}

        {/* TAB 2: CHARTS & ANALYTICS (VISUALISASI GRAFIK) */}
        {activeTab === 'charts' && (
          <div className="space-y-6">
            {/* Header description */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-900 text-white p-6 rounded-2xl shadow-sm">
              <div className="space-y-1">
                <h2 className="text-lg font-bold tracking-tight">
                  Visualisasi & Analisis Grafik Anggaran
                </h2>
                <p className="text-xs text-indigo-200 max-w-xl">
                  Pantau alokasi pos anggaran, bandingkan realisasi dengan target, dan kenali pola pengeluaran bulanan Anda.
                </p>
              </div>
              <button
                onClick={() => {
                  setHighlightCategoryId(null);
                  setIsBudgetModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-white text-indigo-900 hover:bg-indigo-50 rounded-xl transition-all shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Sesuaikan Target Anggaran</span>
              </button>
            </div>

            {/* Visual Budget vs Actual Comparison */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Realisasi vs Target Anggaran per Kategori
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Warna hijau menunjukkan pengeluaran aman (&lt;80%), kuning mendekati batas, merah melebihi anggaran
                  </p>
                </div>
              </div>
              <div className="pt-4">
                <BudgetVsActualChart
                  categories={categories}
                  transactions={monthTransactions}
                  categoryBudgets={activeCategoryBudgets}
                  onEditCategoryBudget={handleEditCategoryBudget}
                />
              </div>
            </div>

            {/* Two Side-by-Side Charts: Category Proportion & Daily Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Donut */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Distribusi Pengeluaran Kategori
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Klik kategori pada diagram untuk melihat proporsi nominal
                  </p>
                </div>
                <div className="pt-4">
                  <CategoryDonutChart
                    categories={categories}
                    transactions={monthTransactions}
                  />
                </div>
              </div>

              {/* Daily Trend */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Kurva Tren Belanja Harian
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Laju pengeluaran harian terhadap garis aman rata-rata bulanan
                    </p>
                  </div>
                  <DateRangeSelector
                    currentMonth={currentMonth}
                    range={trendDateRange}
                    onChangeRange={setTrendDateRange}
                    daysInMonth={stats.daysInMonth}
                  />
                </div>
                <div className="pt-4">
                  <DailyTrendChart
                    currentMonth={currentMonth}
                    transactions={transactions}
                    monthlyBudget={stats.totalBudget}
                    startDate={trendDateRange.startDate}
                    endDate={trendDateRange.endDate}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TRANSACTIONS (BUKU TRANSAKSI) */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <TransactionList
              transactions={transactions}
              categories={categories}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onAddNew={handleOpenAddNew}
              onImportData={handleImportTransactions}
            />
          </div>
        )}

        {/* TAB 4: BUDGETS PLANNER (TARGET ANGGARAN) */}
        {activeTab === 'budgets' && (
          <div className="space-y-6">
            <BudgetProgressBar
              totalBudget={stats.totalBudget}
              totalExpense={stats.totalExpense}
              remainingBudget={stats.remainingBudget}
              daysPassed={stats.daysPassed}
              daysInMonth={stats.daysInMonth}
              onOpenBudgetModal={() => {
                setHighlightCategoryId(null);
                setIsBudgetModalOpen(true);
              }}
            />

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Rincian Alokasi Batas Kategori
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Klik tombol 'Ubah' pada pos kategori untuk mengatur ulang plafon anggaran
                  </p>
                </div>

                <button
                  onClick={() => {
                    setHighlightCategoryId(null);
                    setIsBudgetModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Ubah Semua Anggaran</span>
                </button>
              </div>

              <div className="pt-4">
                <BudgetVsActualChart
                  categories={categories}
                  transactions={monthTransactions}
                  categoryBudgets={activeCategoryBudgets}
                  onEditCategoryBudget={handleEditCategoryBudget}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-bold text-slate-800 dark:text-slate-200">ArthaBulan</span>
            <span>·</span>
            <span>Aplikasi Pengelola Uang & Anggaran Bulanan</span>
          </div>
          <div className="text-slate-400 text-[11px]">
            Data tersimpan aman di peramban lokal (Local Storage)
          </div>
        </div>
      </footer>

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        categories={categories}
        editingTransaction={editingTransaction}
        defaultDate={`${currentMonth}-12`}
        categoryBudgets={activeCategoryBudgets}
        categoryExpenses={monthCategoryExpenses}
      />

      {/* Budget Settings Modal */}
      <BudgetSettingsModal
        isOpen={isBudgetModalOpen}
        onClose={() => {
          setIsBudgetModalOpen(false);
          setHighlightCategoryId(null);
        }}
        categories={categories}
        currentBudgets={activeCategoryBudgets}
        onSaveBudgets={handleSaveBudgets}
        highlightCategoryId={highlightCategoryId}
      />
    </div>
  );
}

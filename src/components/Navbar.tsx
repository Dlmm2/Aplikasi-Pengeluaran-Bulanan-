import React from 'react';
import { PlusCircle, Moon, Sun, Wallet } from 'lucide-react';

export type ActiveTab = 'overview' | 'charts' | 'transactions' | 'budgets';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenAddModal,
  darkMode,
  onToggleDarkMode,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single element) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            ArthaBulan
          </span>
        </div>

        {/* Zone 2: 4-5 single-line nav links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onTabChange('overview')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Ringkasan Keuangan
          </button>
          <button
            onClick={() => onTabChange('charts')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'charts'
                ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Visualisasi Grafik
          </button>
          <button
            onClick={() => onTabChange('transactions')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'transactions'
                ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Buku Transaksi
          </button>
          <button
            onClick={() => onTabChange('budgets')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'budgets'
                ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Target Anggaran
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Dark mode button */}
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Primary CTA */}
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs hover:shadow-indigo-500/20 whitespace-nowrap cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">+ Catat Transaksi</span>
            <span className="sm:hidden">+ Catat</span>
          </button>
        </div>
      </div>

      {/* Mobile nav tabs */}
      <div className="flex md:hidden items-center justify-around px-2 py-2 border-t border-slate-100 dark:border-slate-800 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => onTabChange('overview')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
            activeTab === 'overview'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500'
          }`}
        >
          Ringkasan
        </button>
        <button
          onClick={() => onTabChange('charts')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
            activeTab === 'charts'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500'
          }`}
        >
          Grafik
        </button>
        <button
          onClick={() => onTabChange('transactions')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
            activeTab === 'transactions'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500'
          }`}
        >
          Transaksi
        </button>
        <button
          onClick={() => onTabChange('budgets')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
            activeTab === 'budgets'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500'
          }`}
        >
          Anggaran
        </button>
      </div>
    </header>
  );
};

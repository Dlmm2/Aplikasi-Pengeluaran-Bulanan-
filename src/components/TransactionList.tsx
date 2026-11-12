import React, { useState, useMemo } from 'react';
import { Category, PaymentMethod, Transaction, TransactionType } from '../types/finance';
import { formatDateIndo, formatRupiah, getPaymentMethodInfo, downloadCSV } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Upload,
  Edit2,
  Trash2,
  PlusCircle,
  FileSpreadsheet,
  FileJson,
  CheckCircle2,
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onAddNew: () => void;
  onImportData?: (importedTxs: Transaction[]) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  onEditTransaction,
  onDeleteTransaction,
  onAddNew,
  onImportData,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Category lookup map
  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((cat) => map.set(cat.id, cat));
    return map;
  }, [categories]);

  // Filtered & sorted transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = t.title.toLowerCase().includes(q);
          const matchesNotes = t.notes?.toLowerCase().includes(q) || false;
          const cat = categoryMap.get(t.categoryId);
          const matchesCat = cat?.name.toLowerCase().includes(q) || false;
          if (!matchesTitle && !matchesNotes && !matchesCat) return false;
        }

        // Type filter
        if (typeFilter !== 'all' && t.type !== typeFilter) {
          return false;
        }

        // Category filter
        if (categoryFilter !== 'all' && t.categoryId !== categoryFilter) {
          return false;
        }

        // Payment method filter
        if (paymentFilter !== 'all' && t.paymentMethod !== paymentFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt;
        }
        if (sortBy === 'date-asc') {
          return new Date(a.date).getTime() - new Date(b.date).getTime() || a.createdAt - b.createdAt;
        }
        if (sortBy === 'amount-desc') {
          return b.amount - a.amount;
        }
        if (sortBy === 'amount-asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [transactions, searchQuery, typeFilter, categoryFilter, paymentFilter, sortBy, categoryMap]);

  // Export CSV
  const handleExportCSV = () => {
    const header = ['ID', 'Tanggal', 'Tipe', 'Kategori', 'Nama Transaksi', 'Nominal (Rp)', 'Metode Pembayaran', 'Catatan'];
    const rows = filteredTransactions.map((t) => {
      const cat = categoryMap.get(t.categoryId);
      const pay = getPaymentMethodInfo(t.paymentMethod);
      return [
        t.id,
        t.date,
        t.type === 'expense' ? 'Pengeluaran' : 'Pemasukan',
        cat ? cat.name : t.categoryId,
        t.title,
        t.amount,
        pay.label,
        t.notes || '',
      ];
    });

    downloadCSV(`arthabulan_transaksi_${new Date().toISOString().split('T')[0]}.csv`, [header, ...rows]);
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(transactions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `arthabulan_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && onImportData) {
          onImportData(parsed);
        }
      } catch (err) {
        alert('File JSON tidak valid atau rusak');
      }
    };
    reader.readAsText(file);
    // reset input
    e.target.value = '';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Control bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Daftar Catatan Transaksi
            </h3>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {filteredTransactions.length} dari {transactions.length} transaksi
            </span>
          </div>

          {/* Quick Tools: Export & Add */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              title="Unduh data dalam format CSV / Excel"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ekspor CSV</span>
            </button>

            <button
              onClick={handleExportJSON}
              title="Cadangkan semua data transaksi dalam file JSON"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <FileJson className="w-3.5 h-3.5 text-amber-600" />
              <span>Backup JSON</span>
            </button>

            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-indigo-500" />
              <span>Impor Data</span>
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>

            <button
              onClick={onAddNew}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Catat Baru</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari transaksi atau catatan..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Semua Tipe</option>
            <option value="expense">Pengeluaran Saja</option>
            <option value="income">Pemasukan Saja</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat.type === 'expense' ? 'Pengeluaran' : 'Pemasukan'})
              </option>
            ))}
          </select>

          {/* Sort order */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="date-desc">Tanggal: Terbaru</option>
            <option value="date-asc">Tanggal: Terlama</option>
            <option value="amount-desc">Nominal: Terbesar</option>
            <option value="amount-asc">Nominal: Terkecil</option>
          </select>
        </div>
      </div>

      {/* Transaction Table / List */}
      {filteredTransactions.length === 0 ? (
        <div className="py-16 text-center text-slate-500 dark:text-slate-400">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Tidak ada transaksi ditemukan
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery || typeFilter !== 'all' || categoryFilter !== 'all'
              ? 'Coba sesuaikan kata kunci pencarian atau bersihkan filter di atas.'
              : 'Mulai dengan mencatat pengeluaran atau pemasukan pertama Anda.'}
          </p>
          <button
            onClick={onAddNew}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Catat Transaksi Baru</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">Transaksi & Kategori</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Metode Bayar</th>
                <th className="py-3 px-4 text-right">Nominal</th>
                <th className="py-3 px-4 text-right w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredTransactions.map((tx) => {
                const cat = categoryMap.get(tx.categoryId);
                const payInfo = getPaymentMethodInfo(tx.paymentMethod);
                const isExpense = tx.type === 'expense';
                const isConfirmingDelete = deleteConfirmId === tx.id;

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Title & Category */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: cat ? `${cat.color}18` : '#f1f5f9',
                            color: cat?.color || '#64748b',
                          }}
                        >
                          <CategoryIcon name={cat?.iconName || 'Wallet'} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-900 dark:text-white block truncate">
                            {tx.title}
                          </span>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                            <span>{cat?.name || 'Kategori'}</span>
                            {tx.notes && (
                              <>
                                <span>·</span>
                                <span className="truncate max-w-[200px] italic">{tx.notes}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap tabular-nums">
                      {formatDateIndo(tx.date)}
                    </td>

                    {/* Payment Method */}
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                        {payInfo.label}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span
                        className={`font-bold tabular-nums ${
                          isExpense
                            ? 'text-slate-900 dark:text-white'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {isExpense ? '- ' : '+ '}
                        {formatRupiah(tx.amount)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {isConfirmingDelete ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              onDeleteTransaction(tx.id);
                              setDeleteConfirmId(null);
                            }}
                            className="px-2 py-1 text-[11px] font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded transition-colors cursor-pointer"
                          >
                            Hapus
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 text-[11px] text-slate-500 hover:text-slate-700 rounded transition-colors cursor-pointer"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            title="Edit transaksi"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(tx.id)}
                            title="Hapus transaksi"
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

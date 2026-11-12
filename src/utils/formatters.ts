import { PaymentMethod } from '../types/finance';

/**
 * Format number into Indonesian Rupiah format, e.g. Rp 1.500.000
 */
export function formatRupiah(amount: number, compact: boolean = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp 0';
  }

  if (compact && Math.abs(amount) >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} M`;
  }
  if (compact && Math.abs(amount) >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
  }
  if (compact && Math.abs(amount) >= 1_000) {
    return `Rp ${(amount / 1_000).toLocaleString('id-ID', { maximumFractionDigits: 0 })} rb`;
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount).replace(/\s+/g, ' ');
}

/**
 * Format YYYY-MM into Indonesian Month and Year (e.g., "November 2026")
 */
export function formatMonthYear(monthStr: string): string {
  const [yearStr, monthNum] = monthStr.split('-');
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const idx = parseInt(monthNum, 10) - 1;
  return `${months[idx] || ''} ${yearStr}`;
}

/**
 * Format YYYY-MM-DD into human Indonesian date (e.g., "12 Nov 2026")
 */
export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Get days count in a given YYYY-MM
 */
export function getDaysInMonth(monthStr: string): number {
  const [year, month] = monthStr.split('-').map(Number);
  return new Date(year, month, 0).getDate();
}

/**
 * Get readable payment method info
 */
export function getPaymentMethodInfo(method: PaymentMethod): { label: string; icon: string } {
  switch (method) {
    case 'ewallet':
      return { label: 'e-Wallet', icon: 'Smartphone' };
    case 'transfer':
      return { label: 'Transfer Bank', icon: 'Building2' };
    case 'cash':
      return { label: 'Tunai', icon: 'Banknote' };
    case 'credit_card':
      return { label: 'Kartu Kredit', icon: 'CreditCard' };
    default:
      return { label: 'Lainnya', icon: 'Wallet' };
  }
}

/**
 * Export data to CSV
 */
export function downloadCSV(filename: string, rows: (string | number)[][]): void {
  const processRow = (row: (string | number)[]) => {
    return row
      .map((val) => {
        const str = String(val ?? '');
        if (str.search(/("|,|\n)/g) >= 0) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      })
      .join(',');
  };

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map(processRow).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

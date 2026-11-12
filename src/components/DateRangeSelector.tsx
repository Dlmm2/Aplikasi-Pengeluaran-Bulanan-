import React, { useState, useRef, useEffect } from 'react';
import { formatDateIndo } from '../utils/formatters';
import { Calendar, ChevronDown, Check, RotateCcw } from 'lucide-react';

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  presetLabel?: string;
}

interface DateRangeSelectorProps {
  currentMonth: string; // YYYY-MM
  range: DateRange;
  onChangeRange: (newRange: DateRange) => void;
  daysInMonth: number;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  currentMonth,
  range,
  onChangeRange,
  daysInMonth,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customStart, setCustomStart] = useState(range.startDate);
  const [customEnd, setCustomEnd] = useState(range.endDate);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    setCustomStart(range.startDate);
    setCustomEnd(range.endDate);
  }, [range]);

  const monthStart = `${currentMonth}-01`;
  const monthEnd = `${currentMonth}-${String(daysInMonth).padStart(2, '0')}`;

  // Helper presets
  const handleSelectPreset = (preset: 'full' | 'monthToDate' | 'last7' | 'last14') => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (preset === 'full') {
      onChangeRange({
        startDate: monthStart,
        endDate: monthEnd,
        presetLabel: `Bulan Penuh (1 - ${daysInMonth})`,
      });
    } else if (preset === 'monthToDate') {
      // If current month is this month, up to today, else up to month end
      const isThisMonth = todayStr.startsWith(currentMonth);
      const end = isThisMonth ? todayStr : monthEnd;
      const endDay = parseInt(end.split('-')[2], 10);
      onChangeRange({
        startDate: monthStart,
        endDate: end,
        presetLabel: `Tgl 1 - ${endDay}`,
      });
    } else if (preset === 'last7') {
      const endObj = todayStr.startsWith(currentMonth) ? today : new Date(`${currentMonth}-${String(daysInMonth).padStart(2, '0')}`);
      const startObj = new Date(endObj);
      startObj.setDate(endObj.getDate() - 6);
      const startStr = startObj.toISOString().split('T')[0];
      const endStr = endObj.toISOString().split('T')[0];
      onChangeRange({
        startDate: startStr,
        endDate: endStr,
        presetLabel: '7 Hari Terakhir',
      });
    } else if (preset === 'last14') {
      const endObj = todayStr.startsWith(currentMonth) ? today : new Date(`${currentMonth}-${String(daysInMonth).padStart(2, '0')}`);
      const startObj = new Date(endObj);
      startObj.setDate(endObj.getDate() - 13);
      const startStr = startObj.toISOString().split('T')[0];
      const endStr = endObj.toISOString().split('T')[0];
      onChangeRange({
        startDate: startStr,
        endDate: endStr,
        presetLabel: '14 Hari Terakhir',
      });
    }
    setIsOpen(false);
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStart || !customEnd) return;

    // ensure start <= end
    let start = customStart;
    let end = customEnd;
    if (new Date(start).getTime() > new Date(end).getTime()) {
      const tmp = start;
      start = end;
      end = tmp;
    }

    onChangeRange({
      startDate: start,
      endDate: end,
      presetLabel: `${formatDateIndo(start)} - ${formatDateIndo(end)}`,
    });
    setIsOpen(false);
  };

  // Display label
  const isFullMonth = range.startDate === monthStart && range.endDate === monthEnd;
  const displayLabel = range.presetLabel || (isFullMonth ? `Hari 1 - ${daysInMonth}` : `${formatDateIndo(range.startDate)} - ${formatDateIndo(range.endDate)}`);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button replacing the static text */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors cursor-pointer shadow-2xs"
        title="Klik untuk memilih rentang tanggal grafik"
      >
        <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
        <span className="tabular-nums whitespace-nowrap">{displayLabel}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-72 sm:w-80 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 p-4 space-y-3.5 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Rentang Tanggal Grafik
            </span>
            <button
              type="button"
              onClick={() => handleSelectPreset('full')}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Bulan</span>
            </button>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1.5">
              Pilihan Cepat
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleSelectPreset('full')}
                className={`px-2 py-1.5 text-[11px] font-medium rounded-lg text-left transition-colors cursor-pointer border ${
                  isFullMonth
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                1 Bulan Penuh (1 - {daysInMonth})
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset('monthToDate')}
                className="px-2 py-1.5 text-[11px] font-medium rounded-lg text-left transition-colors cursor-pointer border bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Tgl 1 s/d Hari Ini
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset('last7')}
                className="px-2 py-1.5 text-[11px] font-medium rounded-lg text-left transition-colors cursor-pointer border bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                7 Hari Terakhir
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset('last14')}
                className="px-2 py-1.5 text-[11px] font-medium rounded-lg text-left transition-colors cursor-pointer border bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                14 Hari Terakhir
              </button>
            </div>
          </div>

          {/* Custom Date Inputs */}
          <form onSubmit={handleApplyCustom} className="space-y-2.5 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              Atur Rentang Kustom
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Dari Tanggal</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white tabular-nums focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Sampai Tanggal</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white tabular-nums focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Terapkan Rentang</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

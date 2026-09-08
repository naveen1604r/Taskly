import React from 'react';
import DateRangeSelector from './DateRangeSelector';
import AnalyticsFilters from './AnalyticsFilters';
import ExportReport from './ExportReport';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.08] pb-5">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#c4b5fd] bg-[#7C3AED]/15 px-2.5 py-0.5 rounded-md border border-[#7C3AED]/25">
            <BarChart3 className="w-3.5 h-3.5 text-[#7C3AED]" />
            Productivity Intelligence
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Analytics & Reports
        </h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Comprehensive execution velocity, focus performance, and time estimation reports.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto print:hidden">
        <DateRangeSelector />
        <AnalyticsFilters />
        <ExportReport />
      </div>
    </div>
  );
}

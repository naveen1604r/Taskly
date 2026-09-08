import React from 'react';
import { useAnalyticsContext } from '../../context/AnalyticsContext';
import { Download, Printer } from 'lucide-react';
import Button from '../common/Button';

export default function ExportReport() {
  const { downloadCSV, printReport } = useAnalyticsContext();

  return (
    <div className="flex items-center gap-2 print:hidden">
      <button
        type="button"
        onClick={downloadCSV}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#11151F] hover:bg-[#171C27] border border-white/[0.08] hover:border-white/[0.18] text-slate-300 hover:text-white transition-all shadow-xs"
        title="Export CSV report"
      >
        <Download className="w-3.5 h-3.5 text-[#22C55E]" />
        <span>Export CSV</span>
      </button>

      <button
        type="button"
        onClick={printReport}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#11151F] hover:bg-[#171C27] border border-white/[0.08] hover:border-white/[0.18] text-slate-300 hover:text-white transition-all shadow-xs"
        title="Print analytics report"
      >
        <Printer className="w-3.5 h-3.5 text-[#06B6D4]" />
        <span>Print</span>
      </button>
    </div>
  );
}

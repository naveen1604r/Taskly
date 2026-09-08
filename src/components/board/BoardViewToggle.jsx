import React from 'react';
import { useBoardContext } from '../../context/BoardContext';
import { LayoutGrid, Rows } from 'lucide-react';

export default function BoardViewToggle() {
  const { boardView, setBoardView } = useBoardContext();

  return (
    <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[#11151F] border border-white/[0.08] text-xs">
      <button
        type="button"
        onClick={() => setBoardView('comfortable')}
        className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
          boardView === 'comfortable'
            ? 'bg-[#7C3AED] text-white shadow-xs'
            : 'text-slate-400 hover:text-white'
        }`}
        title="Comfortable card view"
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Comfortable</span>
      </button>

      <button
        type="button"
        onClick={() => setBoardView('compact')}
        className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
          boardView === 'compact'
            ? 'bg-[#7C3AED] text-white shadow-xs'
            : 'text-slate-400 hover:text-white'
        }`}
        title="Compact card view"
      >
        <Rows className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Compact</span>
      </button>
    </div>
  );
}

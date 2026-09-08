import React from 'react';
import { useBoardContext } from '../../context/BoardContext';
import { COLUMNS } from '../../utils/boardUtils';
import BoardHeader from './BoardHeader';
import BoardColumn from './BoardColumn';
import { Circle, Play, CheckCircle2 } from 'lucide-react';

const mobileTabIcons = {
  pending: Circle,
  in_progress: Play,
  completed: CheckCircle2,
};

export default function TaskBoard() {
  const {
    groupedTasks,
    activeMobileTab,
    setActiveMobileTab,
    columnCounts,
  } = useBoardContext();

  return (
    <div className="space-y-6 sm:space-y-7 pb-16 animate-in fade-in duration-200">
      {/* 1. Board Header & Filters */}
      <BoardHeader />

      {/* 2. Mobile Tab Switcher (Requirement 24) */}
      <div className="flex md:hidden items-center gap-1.5 p-1 bg-[#11151F] rounded-2xl border border-white/[0.08] text-xs">
        {COLUMNS.map((col) => {
          const Icon = mobileTabIcons[col.id] || Circle;
          const count = columnCounts[col.id === 'in_progress' ? 'inProgress' : col.id] || 0;
          const isSelected = activeMobileTab === col.id;

          return (
            <button
              key={col.id}
              type="button"
              onClick={() => setActiveMobileTab(col.id)}
              className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                isSelected
                  ? 'bg-[#7C3AED] text-white shadow-glow-primary'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{col.title}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-white/20' : 'bg-white/[0.06]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Columns Layout */}
      {/* Desktop (md & up): 3 horizontal columns */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        {COLUMNS.map((col) => (
          <BoardColumn
            key={col.id}
            column={col}
            tasks={groupedTasks[col.id] || []}
          />
        ))}
      </div>

      {/* Mobile (sm & below): Selected single column */}
      <div className="block md:hidden">
        {COLUMNS.filter((col) => col.id === activeMobileTab).map((col) => (
          <BoardColumn
            key={col.id}
            column={col}
            tasks={groupedTasks[col.id] || []}
          />
        ))}
      </div>
    </div>
  );
}

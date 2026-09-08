import React, { useState } from 'react';
import CalendarTask from './CalendarTask';
import { Plus, X } from 'lucide-react';
import { getTodayDateString } from '../../utils/taskStorage';

export default function MonthDayCell({
  cell,
  tasks = [],
  onTaskClick,
  onDropTask,
  onQuickAdd,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const isToday = cell.dateStr === getTodayDateString();
  const visibleTasks = tasks.slice(0, 3);
  const hiddenCount = tasks.length - visibleTasks.length;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId && onDropTask) {
      onDropTask(taskId, cell.dateStr);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => onQuickAdd && onQuickAdd(cell.dateStr)}
      className={`min-h-[105px] sm:min-h-[125px] p-2 rounded-2xl border transition-all flex flex-col justify-between group cursor-pointer ${
        isDragOver
          ? 'bg-[#7C3AED]/15 border-[#7C3AED] scale-[0.99]'
          : isToday
          ? 'bg-[#171C27] border-[#7C3AED]/40 shadow-glow-primary/20'
          : cell.isCurrentMonth
          ? 'bg-[#11151F] border-white/[0.05] hover:border-white/[0.14]'
          : 'bg-[#11151F]/40 border-white/[0.02] text-slate-600'
      }`}
    >
      {/* Top row: Day Number & Add trigger */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          {isToday ? (
            <span className="w-6 h-6 rounded-full bg-[#7C3AED] text-white font-black text-xs flex items-center justify-center shadow-sm">
              {cell.dayNumber}
            </span>
          ) : (
            <span
              className={`text-xs font-bold ${
                cell.isCurrentMonth ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              {cell.dayNumber}
            </span>
          )}
          {isToday && (
            <span className="hidden sm:inline text-[9px] font-bold text-[#c4b5fd] uppercase tracking-wider">
              Today
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onQuickAdd && onQuickAdd(cell.dateStr);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-opacity"
          title={`Add task on ${cell.dateStr}`}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Task Chips */}
      <div className="space-y-1 flex-1">
        {visibleTasks.map((t) => (
          <CalendarTask
            key={t.id}
            task={t}
            view="month"
            onClick={onTaskClick}
          />
        ))}

        {hiddenCount > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMoreOpen(true);
            }}
            className="w-full text-left text-[10px] font-bold text-[#7C3AED] hover:text-[#c4b5fd] transition-colors px-1"
          >
            + {hiddenCount} more
          </button>
        )}
      </div>

      {/* Popover for hidden tasks */}
      {isMoreOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation();
            setIsMoreOpen(false);
          }}
        >
          <div
            className="w-full max-w-sm bg-[#11151F] border border-white/[0.1] rounded-3xl p-5 shadow-2xl space-y-3 animate-in zoom-in-95 duration-150 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
              <span className="font-bold text-white">
                Tasks for {cell.dateStr}
              </span>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {tasks.map((t) => (
                <CalendarTask
                  key={t.id}
                  task={t}
                  view="month"
                  onClick={(task) => {
                    setIsMoreOpen(false);
                    onTaskClick && onTaskClick(task);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

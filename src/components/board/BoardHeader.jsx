import React from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { useBoardContext } from '../../context/BoardContext';
import BoardSort from './BoardSort';
import BoardFilters from './BoardFilters';
import BoardViewToggle from './BoardViewToggle';
import FilterChips from '../tasks/FilterChips';
import Button from '../common/Button';
import {
  Plus,
  Search,
  X,
  KanbanSquare,
  AlertTriangle,
  CheckCircle2,
  Play,
  Circle,
} from 'lucide-react';

export default function BoardHeader() {
  const { openCreateModal } = useTaskContext();
  const {
    progress,
    columnCounts,
    boardSearchQuery,
    setBoardSearchQuery,
  } = useBoardContext();

  return (
    <div className="space-y-4">
      {/* 1. Top Title & Quick Add Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#c4b5fd] bg-[#7C3AED]/15 px-2.5 py-0.5 rounded-md border border-[#7C3AED]/25">
              <KanbanSquare className="w-3.5 h-3.5 text-[#7C3AED]" />
              Visual Workflow
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Task Board
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Drag, prioritize, and track deliverables across operational stages.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={openCreateModal}
          icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
          className="shadow-glow-primary self-start sm:self-auto"
        >
          Add Task
        </Button>
      </div>

      {/* 2. Board Stats & Progress Snapshot (Requirements 41 & 42) */}
      <div className="p-4 rounded-2xl bg-[#11151F] border border-white/[0.08] shadow-card space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Progress Indicator */}
          <div className="space-y-1.5 flex-1 max-w-md">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Overall Board Progress</span>
              <span className="font-mono font-bold text-white">
                {progress.completed} / {progress.total} completed ({progress.percentage}%)
              </span>
            </div>
            <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#7C3AED] via-[#06B6D4] to-[#22C55E] rounded-full transition-all duration-500"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>

          {/* Quick Stats Pills (Requirement 42) */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-semibold">
              <Circle className="w-3 h-3" />
              <span>Pending: {columnCounts.pending}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-semibold">
              <Play className="w-3 h-3" />
              <span>In Progress: {columnCounts.inProgress}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-semibold">
              <CheckCircle2 className="w-3 h-3" />
              <span>Completed: {columnCounts.completed}</span>
            </span>

            {columnCounts.overdue > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 font-semibold">
                <AlertTriangle className="w-3 h-3" />
                <span>Overdue: {columnCounts.overdue}</span>
              </span>
            )}
          </div>
        </div>

        {/* 3. Search & Control Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
          {/* Instant Search input */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={boardSearchQuery}
              onChange={(e) => setBoardSearchQuery(e.target.value)}
              placeholder="Search board tasks..."
              className="w-full bg-[#171C27] border border-white/[0.08] focus:border-[#7C3AED] rounded-xl pl-9 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            {boardSearchQuery && (
              <button
                type="button"
                onClick={() => setBoardSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Tools: Filter, Sort, View Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <BoardFilters />
            <BoardSort />
            <BoardViewToggle />
          </div>
        </div>

        {/* Filter chips */}
        <FilterChips />
      </div>
    </div>
  );
}

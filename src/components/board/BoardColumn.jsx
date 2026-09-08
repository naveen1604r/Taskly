import React, { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { useBoardContext } from '../../context/BoardContext';
import BoardTaskCard from './BoardTaskCard';
import BoardEmptyState from './BoardEmptyState';
import { Plus, ChevronDown, ChevronRight, Circle, Play, CheckCircle2 } from 'lucide-react';

const columnIcons = {
  pending: Circle,
  in_progress: Play,
  completed: CheckCircle2,
};

const columnThemes = {
  pending: {
    badge: 'border-amber-500/30 text-amber-300 bg-amber-500/10',
    headerDot: 'bg-amber-400',
    dropHighlight: 'border-amber-500/50 bg-amber-500/[0.04]',
  },
  in_progress: {
    badge: 'border-cyan-500/30 text-cyan-300 bg-cyan-500/10',
    headerDot: 'bg-[#06B6D4]',
    dropHighlight: 'border-cyan-500/50 bg-cyan-500/[0.04]',
  },
  completed: {
    badge: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10',
    headerDot: 'bg-[#22C55E]',
    dropHighlight: 'border-emerald-500/50 bg-emerald-500/[0.04]',
  },
};

export default function BoardColumn({ column, tasks = [] }) {
  const { openCreateModal } = useTaskContext();
  const {
    collapsedColumns,
    toggleColumnCollapse,
    moveTaskStatus,
    reorderTaskInColumn,
    draggedTaskId,
    setDraggedTaskId,
    dragOverColumn,
    setDragOverColumn,
  } = useBoardContext();

  const isCollapsed = Boolean(collapsedColumns[column.id]);
  const theme = columnThemes[column.id] || columnThemes.pending;
  const Icon = columnIcons[column.id] || Circle;

  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== column.id) {
      setDragOverColumn(column.id);
    }
  };

  const handleDragLeave = (e) => {
    // Only clear if leaving the column boundary
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumn(null);
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      moveTaskStatus(taskId, column.id, dragOverIndex);
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
    setDragOverIndex(null);
  };

  const handleQuickAdd = () => {
    // Open task create modal
    openCreateModal();
  };

  const isCurrentDropTarget = dragOverColumn === column.id;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col rounded-3xl bg-[#11151F] border transition-all duration-200 ${
        isCurrentDropTarget
          ? `${theme.dropHighlight} border-2 shadow-glow-primary/20`
          : 'border-white/[0.08]'
      } ${isCollapsed ? 'w-full lg:w-16' : 'w-full min-w-0'}`}
    >
      {/* Column Header */}
      <div className="p-3.5 sm:p-4 border-b border-white/[0.06] flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => toggleColumnCollapse(column.id)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title={isCollapsed ? 'Expand column' : 'Collapse column'}
            aria-label={`Toggle collapse for ${column.title} column`}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <span className={`w-2 h-2 rounded-full ${theme.headerDot} shrink-0`} />
            <h3 className="text-sm font-bold text-white truncate">
              {column.title}
            </h3>
          </div>

          <span
            className={`px-2 py-0.2 rounded-full text-xs font-mono font-bold border ${theme.badge} shrink-0`}
          >
            {tasks.length}
          </span>
        </div>

        {!isCollapsed && (
          <button
            type="button"
            onClick={handleQuickAdd}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors shrink-0"
            title={`Add task in ${column.title}`}
            aria-label={`Add new task to ${column.title}`}
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Column Body: Cards List or Empty Placeholder */}
      {!isCollapsed && (
        <div className="flex-1 p-3 sm:p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[300px]">
          {tasks.length === 0 ? (
            <BoardEmptyState columnId={column.id} />
          ) : (
            tasks.map((task, index) => (
              <BoardTaskCard
                key={task.id}
                task={task}
                index={index}
                columnId={column.id}
                onDragStart={(id) => setDraggedTaskId(id)}
                onDragEnter={(idx) => setDragOverIndex(idx)}
              />
            ))
          )}
        </div>
      )}

      {/* Collapsed Vertical Indicator on Desktop */}
      {isCollapsed && (
        <div
          onClick={() => toggleColumnCollapse(column.id)}
          className="flex-1 py-8 flex flex-col items-center justify-between cursor-pointer text-slate-400 hover:text-white transition-colors"
          title="Click to expand column"
        >
          <div className="writing-mode-vertical rotate-180 text-xs font-bold uppercase tracking-wider py-4">
            {column.title} ({tasks.length})
          </div>
        </div>
      )}
    </div>
  );
}

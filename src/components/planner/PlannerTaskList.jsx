import React, { useState, useMemo } from 'react';
import PlannerTask from './PlannerTask';
import { usePlannerContext } from '../../context/PlannerContext';
import { useGoalsContext } from '../../context/GoalsContext';
import { parseTimeToMinutes } from '../../utils/plannerUtils';
import { SlidersHorizontal, X } from 'lucide-react';

export default function PlannerTaskList({ tasks, conflicts, currentTaskId }) {
  const { sortMode, setSortMode } = usePlannerContext();
  const { goals } = useGoalsContext();

  // Quick filter states for planner tasks (Requirement 32)
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [goalFilter, setGoalFilter] = useState('all');

  const categories = useMemo(() => {
    return Array.from(new Set(tasks.map((t) => t.category).filter(Boolean)));
  }, [tasks]);

  const priorityWeights = { high: 3, medium: 2, low: 1 };

  // Filter tasks (Requirement 32: priority, status, category, goal)
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      if (goalFilter !== 'all') {
        if (goalFilter === 'no_goal') {
          if (t.goalId) return false;
        } else if (t.goalId !== goalFilter) {
          return false;
        }
      }
      return true;
    });
  }, [tasks, statusFilter, priorityFilter, categoryFilter, goalFilter]);

  const hasActiveFilters =
    statusFilter !== 'all' ||
    priorityFilter !== 'all' ||
    categoryFilter !== 'all' ||
    goalFilter !== 'all';

  const resetFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setCategoryFilter('all');
    setGoalFilter('all');
  };

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortMode === 'priority') {
      const pA = priorityWeights[a.priority] || 0;
      const pB = priorityWeights[b.priority] || 0;
      return pB - pA;
    }
    if (sortMode === 'due_date') {
      const dateA = a.dueDate || '9999-99-99';
      const dateB = b.dueDate || '9999-99-99';
      return dateA.localeCompare(dateB);
    }
    if (sortMode === 'duration') {
      const durA = a.estimatedDuration || a.duration || 0;
      const durB = b.estimatedDuration || b.duration || 0;
      return durB - durA;
    }
    // Default: 'time'
    const timeA = parseTimeToMinutes(a.plannedStartTime || a.dueTime) ?? 9999;
    const timeB = parseTimeToMinutes(b.plannedStartTime || b.dueTime) ?? 9999;
    return timeA - timeB;
  });

  return (
    <div className="space-y-4">
      {/* Filter and Sort Options Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-[#11151F] border border-white/[0.06] text-xs">
        {/* Quick Filter Selectors (Requirement 32) */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3 text-[#7C3AED]" />
            <span>Filter:</span>
          </span>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#171C27] border border-white/[0.08] text-slate-300 rounded-lg px-2 py-1 focus:outline-none cursor-pointer text-xs"
          >
            <option value="all">Status: All</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-[#171C27] border border-white/[0.08] text-slate-300 rounded-lg px-2 py-1 focus:outline-none cursor-pointer text-xs"
          >
            <option value="all">Priority: All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#171C27] border border-white/[0.08] text-slate-300 rounded-lg px-2 py-1 focus:outline-none cursor-pointer text-xs"
            >
              <option value="all">Category: All</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          {goals && goals.length > 0 && (
            <select
              value={goalFilter}
              onChange={(e) => setGoalFilter(e.target.value)}
              className="bg-[#171C27] border border-white/[0.08] text-slate-300 rounded-lg px-2 py-1 focus:outline-none cursor-pointer text-xs"
            >
              <option value="all">Goal: All</option>
              <option value="no_goal">No Goal</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          )}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-[#c4b5fd] hover:text-white flex items-center gap-0.5 px-1.5 py-0.5 rounded transition-colors"
              title="Reset planner filters"
            >
              <X className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Sort Options Bar */}
        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
          <span className="text-slate-400 font-medium">Sort:</span>
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[#171C27] border border-white/[0.06]">
            {[
              { id: 'time', label: 'Time' },
              { id: 'priority', label: 'Priority' },
              { id: 'duration', label: 'Duration' },
              { id: 'due_date', label: 'Due Date' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSortMode(s.id)}
                className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all ${
                  sortMode === s.id
                    ? 'bg-[#7C3AED] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {sortedTasks.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs italic bg-[#11151F]/40 border border-white/[0.04] rounded-2xl">
            No planned tasks match the active filters.
          </div>
        ) : (
          sortedTasks.map((task) => (
            <PlannerTask
              key={task.id}
              task={task}
              isConflicting={conflicts?.conflictIds?.has(task.id)}
              isCurrentNow={task.id === currentTaskId}
            />
          ))
        )}
      </div>
    </div>
  );
}

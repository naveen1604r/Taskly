import React, { useState, useMemo } from 'react';
import Modal from '../common/Modal';
import { useTaskContext } from '../../context/TaskContext';
import { useFocusContext } from '../../context/FocusContext';
import { searchTasks } from '../../utils/searchUtils';
import { Search, Clock, Play, Flame, CheckCircle2, Circle } from 'lucide-react';

export default function FocusTaskSelector() {
  const { tasks } = useTaskContext();
  const { isTaskSelectorOpen, setIsTaskSelectorOpen, startFocus, currentTaskId } = useFocusContext();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'in_progress'
  const [priorityFilter, setPriorityFilter] = useState('all'); // 'all' | 'high' | 'medium' | 'low'
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = useMemo(() => {
    return Array.from(new Set(tasks.map((t) => t.category).filter(Boolean)));
  }, [tasks]);

  const eligibleTasks = useMemo(() => {
    // 1. Never show completed tasks by default (Requirement 33)
    let list = tasks.filter((t) => t.status !== 'completed');

    // 2. Status filter
    if (statusFilter !== 'all') {
      list = list.filter((t) => t.status === statusFilter);
    }

    // 3. Priority filter
    if (priorityFilter !== 'all') {
      list = list.filter((t) => t.priority === priorityFilter);
    }

    // 4. Category filter
    if (categoryFilter !== 'all') {
      list = list.filter((t) => t.category === categoryFilter);
    }

    // 5. Search utility (Requirement 33)
    if (search.trim()) {
      list = searchTasks(list, search.trim());
    }

    // Sort: High priority first, then recently updated
    return list.sort((a, b) => {
      const pWeights = { high: 3, medium: 2, low: 1 };
      const weightDiff = (pWeights[b.priority] || 0) - (pWeights[a.priority] || 0);
      if (weightDiff !== 0) return weightDiff;
      return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
    });
  }, [tasks, search, statusFilter, priorityFilter, categoryFilter]);

  if (!isTaskSelectorOpen) return null;

  const handleSelectTask = (taskId) => {
    setIsTaskSelectorOpen(false);
    startFocus(taskId);
  };

  return (
    <Modal
      isOpen={isTaskSelectorOpen}
      onClose={() => setIsTaskSelectorOpen(false)}
      title="Choose a Task to Focus On"
      subtitle="Select an active deliverable to start your Pomodoro session"
      maxWidth="max-w-lg"
    >
      <div className="space-y-3.5">
        {/* Search & Filter Controls */}
        <div className="space-y-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search active tasks..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#171C27] text-white placeholder-slate-500 rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none"
            />
          </div>

          {/* Quick Filter Buttons: Pending, In-Progress, High-Priority (Requirement 33) */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
              className={`px-2.5 py-1 rounded-lg border font-medium transition-all ${
                statusFilter === 'pending'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-[#171C27] border-white/[0.06] text-slate-400 hover:text-white'
              }`}
            >
              Pending
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'in_progress' ? 'all' : 'in_progress')}
              className={`px-2.5 py-1 rounded-lg border font-medium transition-all ${
                statusFilter === 'in_progress'
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                  : 'bg-[#171C27] border-white/[0.06] text-slate-400 hover:text-white'
              }`}
            >
              In Progress
            </button>
            <button
              type="button"
              onClick={() => setPriorityFilter(priorityFilter === 'high' ? 'all' : 'high')}
              className={`px-2.5 py-1 rounded-lg border font-medium transition-all ${
                priorityFilter === 'high'
                  ? 'bg-red-500/20 border-red-500 text-red-300'
                  : 'bg-[#171C27] border-white/[0.06] text-slate-400 hover:text-white'
              }`}
            >
              High Priority 🔥
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {eligibleTasks.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs italic">
              No matching active tasks found.
            </div>
          ) : (
            eligibleTasks.map((t) => {
              const estimated = Number(t.estimatedDuration || t.duration) || 60;
              const actual = Number(t.actualDuration) || 0;
              const isSelected = currentTaskId === t.id;

              return (
                <div
                  key={t.id}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#7C3AED]/15 border-[#7C3AED]/40'
                      : 'bg-[#171C27] border-white/[0.06] hover:border-white/[0.14]'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">{t.title}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span className="capitalize text-slate-300 font-medium">
                        {t.priority} Priority
                      </span>
                      <span>•</span>
                      <span>{t.category || 'General'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[#06B6D4]">
                        <Clock className="w-3 h-3" />
                        <span>Est: {estimated}m</span>
                      </span>
                      {actual > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-[#22C55E]">Actual: {actual}m</span>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectTask(t.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] text-white transition-colors flex items-center gap-1 shrink-0 shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Focus</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
}

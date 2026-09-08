import React, { useState } from 'react';
import { useGoalsContext } from '../../context/GoalsContext';
import { calculateMilestoneProgress } from '../../utils/goalUtils';
import { CheckCircle2, Circle, Plus, Trash2, Milestone as MilestoneIcon, Check } from 'lucide-react';

export default function MilestoneList({ goal }) {
  const { addMilestone, toggleMilestone, deleteMilestone } = useGoalsContext();

  const [newTitle, setNewTitle] = useState('');

  const milestones = goal.milestones || [];
  const progress = calculateMilestoneProgress(milestones);
  const completedCount = milestones.filter((m) => m.completed).length;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addMilestone(goal.id, newTitle.trim());
    setNewTitle('');
  };

  const formatCompletedDate = (iso) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MilestoneIcon className="w-4 h-4 text-[#06B6D4]" />
          <h4 className="text-sm font-bold text-white tracking-tight">Milestones</h4>
        </div>
        <div className="text-xs text-[#94A3B8] font-medium">
          <span className="text-white font-bold">{completedCount}</span> / {milestones.length} completed ({progress}%)
        </div>
      </div>

      {/* Mini Progress bar */}
      <div className="w-full h-2 bg-[#171C27] rounded-full overflow-hidden p-0.5 border border-white/[0.06]">
        <div
          className="h-full rounded-full bg-[#06B6D4] transition-all duration-300 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Add Milestone Form */}
      <form onSubmit={handleAdd} className="flex items-center gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a new milestone..."
          className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-[#171C27] text-white placeholder-slate-500 rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none"
        />
        <button
          type="submit"
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#7C3AED] hover:bg-[#6d28d9] text-white shadow-subtle flex items-center gap-1 transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </form>

      {/* Milestones List */}
      {milestones.length === 0 ? (
        <p className="text-xs text-slate-500 py-3 text-center italic">
          No milestones defined yet. Break this goal down into actionable milestones.
        </p>
      ) : (
        <div className="space-y-2">
          {milestones.map((m) => (
            <div
              key={m.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                m.completed
                  ? 'bg-[#171C27]/50 border-white/[0.04] opacity-80'
                  : 'bg-[#171C27] border-white/[0.08] hover:border-white/[0.15]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => toggleMilestone(goal.id, m.id)}
                  className="shrink-0 text-slate-400 hover:text-white transition-colors"
                  aria-label={m.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {m.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                  ) : (
                    <Circle className="w-4 h-4 text-[#94A3B8] hover:text-white" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <span
                    className={`text-xs sm:text-sm font-medium block truncate ${
                      m.completed ? 'text-slate-400 line-through' : 'text-slate-200'
                    }`}
                  >
                    {m.title}
                  </span>
                  {m.completed && m.completedAt && (
                    <span className="text-[10px] text-slate-500 block">
                      Completed {formatCompletedDate(m.completedAt)}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => deleteMilestone(goal.id, m.id)}
                className="p-1.5 text-slate-500 hover:text-[#EF4444] rounded-lg transition-colors ml-2"
                title="Remove milestone"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

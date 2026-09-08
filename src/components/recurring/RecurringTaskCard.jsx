import React, { useState } from 'react';
import Card from '../common/Card';
import RecurringTaskHistory from './RecurringTaskHistory';
import { useRecurringTaskContext } from '../../context/RecurringTaskContext';
import { useGoalsContext } from '../../context/GoalsContext';
import { useTaskContext } from '../../context/TaskContext';
import {
  getHumanRecurrenceSummary,
  getNextOccurrence,
  calculateRuleStats,
  parseLocalDate,
} from '../../utils/recurrenceUtils';
import { getTodayDateString } from '../../utils/taskStorage';
import {
  Repeat,
  Clock,
  Target,
  Play,
  Pause,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  FastForward,
  Calendar,
} from 'lucide-react';

export default function RecurringTaskCard({ rule }) {
  const {
    openEditModal,
    openDeleteConfirm,
    openPauseConfirm,
    resumeRecurringTask,
    openSkipConfirm,
  } = useRecurringTaskContext();
  const { goals } = useGoalsContext();
  const { tasks } = useTaskContext();

  const [showHistory, setShowHistory] = useState(false);

  const todayStr = getTodayDateString();
  const humanSummary = getHumanRecurrenceSummary(rule.recurrence);
  const nextDate = getNextOccurrence(rule, todayStr);
  const stats = calculateRuleStats(rule, tasks);
  const linkedGoal = goals?.find((g) => g.id === rule.goalId);

  // Status check: ended if endDate passed
  const isEnded = rule.recurrence?.endDate && rule.recurrence.endDate < todayStr;
  const statusLabel = isEnded ? 'Ended' : rule.enabled ? 'Active' : 'Paused';

  const formatNextDate = (dStr) => {
    if (!dStr) return 'No upcoming occurrence';
    if (dStr === todayStr) return 'Today';
    const tomorrowStr = new Date();
    tomorrowStr.setDate(tomorrowStr.getDate() + 1);
    const p = parseLocalDate(dStr);
    if (!p) return dStr;
    const d = new Date(p.year, p.month - 1, p.day);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
  };

  return (
    <Card className="flex flex-col justify-between border-white/[0.08] hover:border-white/[0.14] transition-all">
      <div className="space-y-3.5">
        {/* Top Header: Title & Status Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                  statusLabel === 'Active'
                    ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30'
                    : statusLabel === 'Paused'
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'bg-slate-500/15 text-slate-400 border-slate-500/30'
                }`}
              >
                {statusLabel === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />}
                {statusLabel}
              </span>

              <span className="text-xs text-slate-400 capitalize">
                {rule.priority} Priority • {rule.category}
              </span>
            </div>

            <h3 className="text-base font-bold text-white tracking-tight truncate">
              {rule.title}
            </h3>

            {rule.description && (
              <p className="text-xs text-[#94A3B8] line-clamp-1 mt-0.5">
                {rule.description}
              </p>
            )}
          </div>
        </div>

        {/* Recurrence Summary & Next Event Strip */}
        <div className="p-3 rounded-xl bg-[#171C27] border border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-[#c4b5fd] font-medium">
              <Repeat className="w-3.5 h-3.5 text-[#7C3AED] shrink-0" />
              <span>{humanSummary}</span>
            </div>

            {rule.plannedStartTime && (
              <span className="font-mono text-white font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#06B6D4]" />
                <span>{rule.plannedStartTime}</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] text-[11px]">
            <span className="text-slate-400">
              Next:{' '}
              <strong className="text-white font-semibold">
                {isEnded ? 'Recurrence ended' : formatNextDate(nextDate)}
              </strong>
            </span>

            {stats.completionRate !== null && (
              <span className="text-[#22C55E] font-medium">
                {stats.completionRate}% completion ({stats.completedOccurrences}/{stats.totalOccurrences})
              </span>
            )}
          </div>
        </div>

        {/* Metadata: Duration & Linked Goal */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#06B6D4]" />
            <span>{rule.estimatedDuration || 60}m duration</span>
          </span>

          {linkedGoal && (
            <span className="flex items-center gap-1 text-[#F59E0B]">
              <Target className="w-3 h-3" />
              <span className="truncate max-w-[140px]">{linkedGoal.title}</span>
            </span>
          )}
        </div>

        {/* Expandable Occurrence History */}
        {showHistory && <RecurringTaskHistory rule={rule} />}
      </div>

      {/* Action Footer */}
      <div className="pt-3 mt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <span>Occurrences</span>
          {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <div className="flex items-center gap-1.5">
          {/* Skip Next Occurrence */}
          {nextDate && rule.enabled && !isEnded && (
            <button
              type="button"
              onClick={() => openSkipConfirm(rule, nextDate)}
              className="px-2 py-1 rounded-lg text-xs font-semibold text-slate-300 hover:text-amber-400 bg-white/[0.04] hover:bg-white/[0.08] transition-colors flex items-center gap-1"
              title={`Skip next occurrence (${nextDate})`}
            >
              <FastForward className="w-3 h-3" />
              <span className="hidden sm:inline">Skip Next</span>
            </button>
          )}

          {/* Pause / Resume */}
          {!isEnded && (
            rule.enabled ? (
              <button
                type="button"
                onClick={() => openPauseConfirm(rule)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-white/[0.06] transition-colors"
                title="Pause recurring rule"
              >
                <Pause className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => resumeRecurringTask(rule.id)}
                className="p-1.5 rounded-lg text-[#22C55E] hover:bg-[#22C55E]/10 transition-colors"
                title="Resume recurring rule"
              >
                <Play className="w-4 h-4" />
              </button>
            )
          )}

          {/* Edit */}
          <button
            type="button"
            onClick={() => openEditModal(rule)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Edit recurring rule"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => openDeleteConfirm(rule)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
            title="Delete recurring rule (preserves existing tasks)"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}

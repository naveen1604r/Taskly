import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useHabitContext } from '../../context/HabitContext';
import { getTodayDateString } from '../../utils/taskStorage';
import {
  getHabitProgressForDate,
  calculateCurrentStreak,
  calculateLongestStreak,
} from '../../utils/habitUtils';
import {
  Flame,
  Check,
  Plus,
  Minus,
  RotateCcw,
  MoreVertical,
  Edit2,
  Trash2,
  Archive,
  Clock,
  ArrowRight,
  ListTodo,
  CheckCircle2,
  Droplet,
  BookOpen,
  Dumbbell,
  Code,
  Brain,
  Smile,
  Footprints,
  Moon,
  PenTool,
  Compass,
  Heart,
  Zap,
  Target,
  Coffee,
} from 'lucide-react';

const iconMap = {
  Droplet,
  BookOpen,
  Dumbbell,
  Code,
  Brain,
  Smile,
  Footprints,
  Moon,
  PenTool,
  Compass,
  Heart,
  Zap,
  Target,
  Coffee,
  Flame,
};

export default function HabitCard({ habit, dateStr = getTodayDateString() }) {
  const {
    habitLogs,
    incrementHabit,
    decrementHabit,
    toggleHabitComplete,
    undoHabitCompletion,
    openEditHabitModal,
    archiveHabit,
    deleteHabit,
    createTaskFromHabit,
  } = useHabitContext();

  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const progress = getHabitProgressForDate(habit, habitLogs, dateStr);
  const currentStreak = calculateCurrentStreak(habit, habitLogs);
  const longestStreak = calculateLongestStreak(habit, habitLogs);

  const IconComponent = iconMap[habit.icon] || Flame;
  const isBinary = (Number(habit.targetCount) || 1) === 1;

  const handleCompleteToggle = () => {
    toggleHabitComplete(habit.id, dateStr);
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    incrementHabit(habit.id, dateStr);
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    decrementHabit(habit.id, dateStr);
  };

  return (
    <div
      className={`relative p-4 sm:p-5 rounded-3xl border transition-all duration-200 text-xs flex flex-col justify-between group ${
        progress.completed
          ? 'bg-[#171C27] border-emerald-500/30 shadow-[0_0_20px_rgba(34,197,94,0.06)]'
          : progress.count > 0
          ? 'bg-[#171C27] border-amber-500/30'
          : 'bg-[#11151F] border-white/[0.06] hover:border-white/[0.14]'
      }`}
    >
      {/* Top Section */}
      <div className="space-y-3">
        {/* Header with Icon, Name & Menu */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 shadow-sm"
              style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
            >
              <IconComponent className="w-5 h-5 stroke-[2.2]" />
            </div>

            <div className="min-w-0 flex-1">
              <Link
                to={`/habits/${habit.id}`}
                className="font-bold text-sm text-white hover:text-[#c4b5fd] transition-colors truncate block"
              >
                {habit.name}
              </Link>

              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-lg bg-white/[0.06] text-[10px] text-slate-300 font-semibold">
                  {habit.category}
                </span>

                {habit.routineGroup && habit.routineGroup !== 'none' && (
                  <span className="px-2 py-0.5 rounded-lg bg-[#7C3AED]/15 text-[#c4b5fd] text-[10px] font-semibold capitalize border border-[#7C3AED]/20">
                    {habit.routineGroup}
                  </span>
                )}

                {habit.reminderEnabled && habit.reminderTime && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3 text-[#06B6D4]" />
                    <span>{habit.reminderTime}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Context Menu Button */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              aria-label="Habit options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-8 z-30 w-44 bg-[#11151F] border border-white/[0.1] rounded-2xl p-1.5 shadow-2xl space-y-0.5 animate-in zoom-in-95 duration-100"
                onClick={(e) => e.stopPropagation()}
              >
                <Link
                  to={`/habits/${habit.id}`}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] text-[11px] transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    openEditHabitModal(habit);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] text-[11px] transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Habit</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    createTaskFromHabit(habit.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] text-[11px] transition-colors"
                >
                  <ListTodo className="w-3.5 h-3.5 text-[#06B6D4]" />
                  <span>Create Task</span>
                </button>

                {progress.completed && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      undoHabitCompletion(habit.id, dateStr);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-amber-400 hover:bg-amber-500/10 text-[11px] transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Undo Today</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    archiveHabit(habit.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] text-[11px] transition-colors"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Archive</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setDeleteConfirm(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-[#EF4444] hover:bg-[#EF4444]/10 text-[11px] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Habit</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description Preview if present */}
        {habit.description && (
          <p className="text-slate-400 text-[11px] line-clamp-2 leading-relaxed">
            {habit.description}
          </p>
        )}
      </div>

      {/* Middle: Progress Bar */}
      <div className="space-y-1.5 my-3.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-slate-300">
            {progress.count} / {habit.targetCount} {habit.unit}
          </span>
          <span className="font-mono text-slate-400 font-bold">{progress.percentage}%</span>
        </div>

        <div className="w-full bg-[#11151F] h-2 rounded-full overflow-hidden border border-white/[0.04]">
          <div
            className="h-full transition-all duration-300 rounded-full"
            style={{
              width: `${progress.percentage}%`,
              backgroundColor: progress.completed ? '#22C55E' : habit.color || '#7C3AED',
            }}
          />
        </div>
      </div>

      {/* Bottom: Streak & Action Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
        {/* Streak Counter */}
        <div className="flex items-center gap-2">
          <div
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border transition-transform ${
              currentStreak > 0
                ? 'text-amber-400 bg-amber-500/10 border-amber-500/25'
                : 'text-slate-500 bg-white/[0.02] border-white/[0.04]'
            }`}
            title={`Best streak: ${longestStreak} days`}
          >
            <Flame className={`w-3.5 h-3.5 ${currentStreak > 0 ? 'fill-current animate-pulse' : ''}`} />
            <span>{currentStreak}d</span>
          </div>

          {longestStreak > 0 && longestStreak > currentStreak && (
            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
              Best: {longestStreak}d
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {isBinary ? (
            /* Binary Toggle Button */
            <button
              type="button"
              onClick={handleCompleteToggle}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 text-xs ${
                progress.completed
                  ? 'bg-[#22C55E] text-white shadow-[0_0_12px_rgba(34,197,94,0.4)]'
                  : 'bg-white/[0.06] hover:bg-[#7C3AED] text-slate-300 hover:text-white border border-white/[0.08]'
              }`}
              aria-label={`Mark ${habit.name} ${progress.completed ? 'incomplete' : 'complete'}`}
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{progress.completed ? 'Completed' : 'Complete'}</span>
            </button>
          ) : (
            /* Measurable Stepper Buttons [-] count [+] */
            <div className="flex items-center gap-1 bg-[#11151F] border border-white/[0.08] rounded-xl p-0.5">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={progress.count <= 0}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Decrease progress"
                aria-label="Decrease progress"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleCompleteToggle}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                  progress.completed
                    ? 'bg-[#22C55E] text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
                title={progress.completed ? 'Mark incomplete' : 'Quick complete target'}
              >
                {progress.completed ? '✓ Done' : `${progress.count}`}
              </button>

              <button
                type="button"
                onClick={handleIncrement}
                disabled={progress.completed}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Increase progress"
                aria-label="Increase progress"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setDeleteConfirm(false)}
        >
          <div
            className="w-full max-w-sm bg-[#11151F] border border-white/[0.1] rounded-3xl p-6 shadow-2xl space-y-4 text-xs animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-sm font-bold text-white">Delete Habit "{habit.name}"?</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              This will remove the habit and all of its historical completion logs. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={() => setDeleteConfirm(false)}
                className="px-3 py-1.5 rounded-xl bg-white/[0.06] text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteHabit(habit.id);
                  setDeleteConfirm(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#EF4444] text-white font-bold hover:bg-[#dc2626]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

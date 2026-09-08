import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useHabitContext } from '../context/HabitContext';
import { useGoalsContext } from '../context/GoalsContext';
import { useProjectContext } from '../context/ProjectContext';
import { getTodayDateString, getOffsetDateString } from '../utils/taskStorage';
import {
  getHabitProgressForDate,
  calculateCurrentStreak,
  calculateLongestStreak,
  calculateCompletionRate,
} from '../utils/habitUtils';

import HabitCalendar from '../components/habits/HabitCalendar';
import HabitModal from '../components/habits/HabitModal';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

import {
  Flame,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  Archive,
  Trophy,
  Percent,
  Check,
  Plus,
  Minus,
  RotateCcw,
  Target,
  FolderKanban,
  ListTodo,
} from 'lucide-react';

export default function HabitDetails() {
  const { habitId } = useParams();
  const navigate = useNavigate();
  const {
    getHabit,
    habitLogs,
    openEditHabitModal,
    archiveHabit,
    restoreHabit,
    deleteHabit,
    setHabitProgress,
    incrementHabit,
    decrementHabit,
    toggleHabitComplete,
    createTaskFromHabit,
  } = useHabitContext();

  const { goals = [] } = useGoalsContext() || {};
  const { getProject } = useProjectContext() || {};

  const todayStr = getTodayDateString();
  const [historyRange, setHistoryRange] = useState(30); // 7 | 30 | 90 | 365
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'calendar' | 'history'

  const habit = getHabit(habitId);

  // Redirect or not found
  if (!habit) {
    return (
      <div className="py-20 text-center space-y-4 text-xs">
        <Flame className="w-12 h-12 text-slate-600 mx-auto" />
        <h3 className="text-base font-bold text-white">Habit Not Found</h3>
        <p className="text-slate-400">The requested habit might have been removed or does not exist.</p>
        <Link to="/habits">
          <Button variant="secondary" size="sm" icon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Back to Habits
          </Button>
        </Link>
      </div>
    );
  }

  const linkedGoal = habit.goalId ? goals.find((g) => g.id === habit.goalId) : null;
  const linkedProject = habit.projectId ? getProject(habit.projectId) : null;

  const currentStreak = calculateCurrentStreak(habit, habitLogs);
  const longestStreak = calculateLongestStreak(habit, habitLogs);
  const completionRate30 = calculateCompletionRate(habit, habitLogs, 30);
  const progressToday = getHabitProgressForDate(habit, habitLogs, todayStr);

  // Total Lifetime Completions
  const totalCompletions = useMemo(() => {
    return habitLogs.filter((l) => l.habitId === habit.id && l.completed).length;
  }, [habitLogs, habit.id]);

  // Historical log list for the selected range
  const historyList = useMemo(() => {
    const logs = [];
    for (let i = 0; i < historyRange; i++) {
      const dStr = getOffsetDateString(-i);
      const p = getHabitProgressForDate(habit, habitLogs, dStr);
      logs.push({
        dateStr: dStr,
        ...p,
      });
    }
    return logs;
  }, [habit, habitLogs, historyRange]);

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${habit.name}" and its entire history?`)) {
      deleteHabit(habit.id);
      navigate('/habits');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-7 pb-20 animate-in fade-in duration-200 text-xs">
      {/* 1. Header with Breadcrumbs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div className="space-y-1">
          <Link
            to="/habits"
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Habits</span>
          </Link>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center border shadow-sm shrink-0"
              style={{ backgroundColor: `${habit.color}20`, borderColor: `${habit.color}40`, color: habit.color }}
            >
              <Flame className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {habit.name}
                </h2>
                {habit.archived && (
                  <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-400 font-bold text-[10px] border border-amber-500/30">
                    Archived
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                {habit.category} • {habit.routineGroup || 'Anytime'} • Target: {habit.targetCount} {habit.unit} ({typeof habit.frequency === 'string' ? habit.frequency : 'custom'})
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => createTaskFromHabit(habit.id)}
            icon={<ListTodo className="w-3.5 h-3.5 text-[#06B6D4]" />}
          >
            Create Task
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => openEditHabitModal(habit)}
            icon={<Edit2 className="w-3.5 h-3.5" />}
          >
            Edit
          </Button>

          {habit.archived ? (
            <Button variant="secondary" size="sm" onClick={() => restoreHabit(habit.id)}>
              Restore
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => archiveHabit(habit.id)}>
              Archive
            </Button>
          )}

          <button
            type="button"
            onClick={handleDelete}
            className="p-2 rounded-xl text-slate-400 hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
            title="Delete Habit"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Key Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#11151F] border border-white/[0.06] space-y-1">
          <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block">
            Current Streak
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-white font-mono">{currentStreak}</span>
            <span className="text-slate-400">days</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#11151F] border border-white/[0.06] space-y-1">
          <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider block">
            Best Streak
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-white font-mono">{longestStreak}</span>
            <span className="text-slate-400">days</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#11151F] border border-white/[0.06] space-y-1">
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
            30-Day Completion Rate
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-white font-mono">{completionRate30}%</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#11151F] border border-white/[0.06] space-y-1">
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
            Total Completions
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-white font-mono">{totalCompletions}</span>
            <span className="text-slate-400">times</span>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#11151F] border border-white/[0.08] rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
            activeTab === 'overview' ? 'bg-[#7C3AED] text-white shadow-glow-primary' : 'text-slate-400 hover:text-white'
          }`}
        >
          Overview & Today
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
            activeTab === 'calendar' ? 'bg-[#7C3AED] text-white shadow-glow-primary' : 'text-slate-400 hover:text-white'
          }`}
        >
          Heatmap Calendar
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
            activeTab === 'history' ? 'bg-[#7C3AED] text-white shadow-glow-primary' : 'text-slate-400 hover:text-white'
          }`}
        >
          Log History
        </button>
      </div>

      {/* 4. Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Today's Action Card + Description */}
          <div className="lg:col-span-2 space-y-6">
            <Card
              title="Today's Check-in"
              subtitle={`Target: ${habit.targetCount} ${habit.unit}`}
              action={
                <span className="text-[11px] font-mono text-slate-400">{todayStr}</span>
              }
            >
              <div className="p-4 rounded-2xl bg-[#171C27] border border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="font-bold text-white text-sm">
                    {progressToday.count} of {habit.targetCount} {habit.unit} completed
                  </span>
                  <div className="w-48 bg-[#11151F] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${progressToday.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Progress Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => decrementHabit(habit.id, todayStr)}
                    className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300"
                    title="Decrease"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleHabitComplete(habit.id, todayStr)}
                    className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                      progressToday.completed
                        ? 'bg-[#22C55E] text-white shadow-sm'
                        : 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>{progressToday.completed ? 'Completed ✓' : 'Mark Completed'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => incrementHabit(habit.id, todayStr)}
                    className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300"
                    title="Increase"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>

            {/* Description & Cue Context */}
            {habit.description && (
              <Card title="Habit Details & Routine Notes">
                <p className="text-slate-300 text-[12px] leading-relaxed whitespace-pre-wrap">
                  {habit.description}
                </p>
              </Card>
            )}
          </div>

          {/* Right 1 Col: Linked Deliverables & Details */}
          <div className="lg:col-span-1 space-y-6">
            <Card title="Connected Deliverables">
              <div className="space-y-3">
                {linkedGoal ? (
                  <div className="p-3 rounded-2xl bg-[#171C27] border border-white/[0.04] space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Linked Goal</span>
                    <Link
                      to="/goals"
                      className="font-bold text-white hover:text-[#c4b5fd] flex items-center gap-1.5 truncate block"
                    >
                      <Target className="w-3.5 h-3.5 text-[#06B6D4]" />
                      <span className="truncate">{linkedGoal.title}</span>
                    </Link>
                  </div>
                ) : (
                  <div className="text-slate-500 italic p-3">No connected strategic goal.</div>
                )}

                {linkedProject ? (
                  <div className="p-3 rounded-2xl bg-[#171C27] border border-white/[0.04] space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Linked Project</span>
                    <Link
                      to={`/projects/${linkedProject.id}`}
                      className="font-bold text-white hover:text-[#c4b5fd] flex items-center gap-1.5 truncate block"
                    >
                      <FolderKanban className="w-3.5 h-3.5 text-[#7C3AED]" />
                      <span className="truncate">{linkedProject.name}</span>
                    </Link>
                  </div>
                ) : (
                  <div className="text-slate-500 italic p-3">No connected project.</div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'calendar' && <HabitCalendar selectedHabitId={habit.id} />}

      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* History Range Filter */}
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <span className="font-bold text-white">Execution Log History</span>
            <div className="flex items-center gap-1 bg-[#11151F] border border-white/[0.08] rounded-xl p-1">
              {[
                { label: '7 Days', val: 7 },
                { label: '30 Days', val: 30 },
                { label: '90 Days', val: 90 },
                { label: 'All Time', val: 365 },
              ].map((r) => (
                <button
                  key={r.val}
                  type="button"
                  onClick={() => setHistoryRange(r.val)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    historyRange === r.val ? 'bg-[#7C3AED] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* History Table */}
          <div className="space-y-1.5">
            {historyList.map((item) => (
              <div
                key={item.dateStr}
                className="p-3 rounded-2xl bg-[#171C27] border border-white/[0.04] flex items-center justify-between gap-3 hover:border-white/[0.1] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.completed
                        ? 'bg-[#22C55E]'
                        : item.count > 0
                        ? 'bg-[#F59E0B]'
                        : 'bg-white/10'
                    }`}
                  />
                  <span className="font-mono text-slate-300 font-bold">{item.dateStr}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-400">
                    {item.count} / {habit.targetCount} {habit.unit}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-lg font-bold text-[10px] uppercase border ${
                      item.completed
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        : item.count > 0
                        ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                        : 'text-slate-500 bg-white/[0.02] border-white/[0.04]'
                    }`}
                  >
                    {item.completed ? 'Completed' : item.count > 0 ? 'Partial' : 'Missed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <HabitModal />
    </div>
  );
}

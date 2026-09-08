import React, { useState, useMemo } from 'react';
import { useHabitContext } from '../context/HabitContext';
import { getTodayDateString } from '../utils/taskStorage';
import {
  isHabitScheduledForDate,
  getHabitProgressForDate,
  calculateCurrentStreak,
  calculateCompletionRate,
} from '../utils/habitUtils';

import HabitSummary from '../components/habits/HabitSummary';
import HabitFilters from '../components/habits/HabitFilters';
import HabitCard from '../components/habits/HabitCard';
import HabitCalendar from '../components/habits/HabitCalendar';
import RoutineSection from '../components/habits/RoutineSection';
import WeeklyHabitReview from '../components/habits/WeeklyHabitReview';
import HabitModal from '../components/habits/HabitModal';
import Button from '../components/common/Button';

import {
  Flame,
  Plus,
  LayoutGrid,
  List,
  Calendar,
  Sparkles,
  CheckCircle2,
  Inbox,
  Clock,
} from 'lucide-react';

export default function Habits() {
  const {
    habits,
    habitLogs,
    activeHabits,
    archivedHabits,
    todaySummary,
    openCreateHabitModal,
  } = useHabitContext();

  const todayStr = getTodayDateString();

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list' | 'calendar' | 'routines'
  const [statusFilter, setStatusFilter] = useState('active'); // 'all' | 'active' | 'completed_today' | 'incomplete_today' | 'archived'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('custom');
  const [searchQuery, setSearchQuery] = useState('');

  // Counts for filter tabs
  const counts = useMemo(() => {
    let completedToday = 0;
    let incompleteToday = 0;

    activeHabits.forEach((h) => {
      const isSched = isHabitScheduledForDate(h, todayStr);
      if (isSched) {
        const p = getHabitProgressForDate(h, habitLogs, todayStr);
        if (p.completed) completedToday += 1;
        else incompleteToday += 1;
      }
    });

    return {
      all: habits.length,
      active: activeHabits.length,
      archived: archivedHabits.length,
      completedToday,
      incompleteToday,
    };
  }, [habits, activeHabits, archivedHabits, habitLogs, todayStr]);

  // Filtered and Sorted Habits
  const displayedHabits = useMemo(() => {
    let list = [...habits];

    // Status filter
    if (statusFilter === 'active') {
      list = list.filter((h) => !h.archived);
    } else if (statusFilter === 'archived') {
      list = list.filter((h) => h.archived);
    } else if (statusFilter === 'completed_today') {
      list = list.filter((h) => !h.archived && isHabitScheduledForDate(h, todayStr) && getHabitProgressForDate(h, habitLogs, todayStr).completed);
    } else if (statusFilter === 'incomplete_today') {
      list = list.filter((h) => !h.archived && isHabitScheduledForDate(h, todayStr) && !getHabitProgressForDate(h, habitLogs, todayStr).completed);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      list = list.filter((h) => h.category === categoryFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (h) =>
          h.name?.toLowerCase().includes(q) ||
          h.description?.toLowerCase().includes(q) ||
          h.category?.toLowerCase().includes(q)
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'streak') {
        return calculateCurrentStreak(b, habitLogs) - calculateCurrentStreak(a, habitLogs);
      }
      if (sortBy === 'rate') {
        return calculateCompletionRate(b, habitLogs, 30) - calculateCompletionRate(a, habitLogs, 30);
      }
      if (sortBy === 'created') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      return 0;
    });

    return list;
  }, [habits, habitLogs, statusFilter, categoryFilter, searchQuery, sortBy, todayStr]);

  return (
    <div className="space-y-6 sm:space-y-7 pb-20 animate-in fade-in duration-200">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c4b5fd] bg-[#7C3AED]/15 px-3 py-1 rounded-full border border-[#7C3AED]/25">
              <Flame className="w-3.5 h-3.5 text-[#7C3AED] fill-current" />
              Consistency Builder
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Habit Tracker
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Build consistency, one day at a time. Track routines, maintain streaks, and analyze habits.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-[#11151F] border border-white/[0.08] rounded-2xl p-1 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-xl transition-all ${
                viewMode === 'grid' ? 'bg-[#7C3AED] text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('routines')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all text-xs ${
                viewMode === 'routines' ? 'bg-[#7C3AED] text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Daily Routines"
            >
              Routines
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-xl transition-all ${
                viewMode === 'calendar' ? 'bg-[#7C3AED] text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Calendar Heatmap"
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => openCreateHabitModal()}
            icon={<Plus className="w-4 h-4" />}
            className="shadow-glow-primary"
          >
            Add Habit
          </Button>
        </div>
      </div>

      {/* 2. KPI Summary Bar */}
      <HabitSummary />

      {/* 3. Weekly Habit Review Insight Card */}
      <WeeklyHabitReview />

      {/* 4. Filter & Search Controls */}
      <HabitFilters
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        counts={counts}
      />

      {/* 5. Main View Rendering */}
      {viewMode === 'calendar' ? (
        <HabitCalendar />
      ) : viewMode === 'routines' ? (
        <RoutineSection dateStr={todayStr} />
      ) : (
        /* Grid View */
        displayedHabits.length === 0 ? (
          <div className="p-16 rounded-3xl bg-[#11151F]/40 border border-dashed border-white/[0.08] text-center space-y-3">
            <Flame className="w-10 h-10 text-slate-500 mx-auto stroke-[1.5]" />
            <div>
              <h4 className="text-sm font-bold text-white">
                {habits.length === 0 ? 'Build your first habit' : 'No habits found'}
              </h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-0.5">
                {habits.length === 0
                  ? 'Small daily actions become powerful routines. Start by creating your first daily habit.'
                  : 'Try adjusting your filters or search query.'}
              </p>
            </div>
            {habits.length === 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => openCreateHabitModal()}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Create First Habit
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {displayedHabits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} dateStr={todayStr} />
            ))}
          </div>
        )
      )}

      {/* Habit Create / Edit Modal */}
      <HabitModal />
    </div>
  );
}

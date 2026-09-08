import React, { useState, useMemo } from 'react';
import { useActivityContext } from '../context/ActivityContext';
import { useTaskContext } from '../context/TaskContext';
import ActivityStats from '../components/activity/ActivityStats';
import ActivityDateNavigation from '../components/activity/ActivityDateNavigation';
import ActivityFilters from '../components/activity/ActivityFilters';
import ActivityTimeline from '../components/activity/ActivityTimeline';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Plus, Activity as ActivityIcon, SearchX } from 'lucide-react';

export default function DailyActivity() {
  const {
    selectedDate,
    openCreateActivityModal,
    summary,
  } = useActivityContext();

  const { stats } = useTaskContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [relatedTaskFilter, setRelatedTaskFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Activities for the currently active selected date
  const dayActivities = summary.selectedDateActivities;

  // Extract dynamic categories present in activities
  const availableCategories = useMemo(() => {
    return Array.from(new Set(dayActivities.map((a) => a.category).filter(Boolean)));
  }, [dayActivities]);

  // Filter and sort activities for the active date
  const filteredActivities = useMemo(() => {
    let result = [...dayActivities];

    // 1. Search Query (title, description, category, notes)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.description && a.description.toLowerCase().includes(q)) ||
          (a.category && a.category.toLowerCase().includes(q)) ||
          (a.notes && a.notes.toLowerCase().includes(q))
      );
    }

    // 2. Category Filter
    if (categoryFilter !== 'all') {
      result = result.filter((a) => a.category === categoryFilter);
    }

    // 3. Duration Filter
    if (durationFilter !== 'all') {
      result = result.filter((a) => {
        const d = Number(a.duration) || 0;
        if (durationFilter === 'under30') return d < 30;
        if (durationFilter === '30to60') return d >= 30 && d <= 60;
        if (durationFilter === '60to120') return d > 60 && d <= 120;
        if (durationFilter === 'over120') return d > 120;
        return true;
      });
    }

    // 4. Related Task Filter
    if (relatedTaskFilter !== 'all') {
      if (relatedTaskFilter === 'has_task') {
        result = result.filter((a) => Boolean(a.relatedTaskId));
      } else if (relatedTaskFilter === 'no_task') {
        result = result.filter((a) => !a.relatedTaskId);
      }
    }

    // 5. Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        const timeA = a.startTime || '00:00';
        const timeB = b.startTime || '00:00';
        return timeB.localeCompare(timeA);
      }
      if (sortBy === 'oldest') {
        const timeA = a.startTime || '00:00';
        const timeB = b.startTime || '00:00';
        return timeA.localeCompare(timeB);
      }
      if (sortBy === 'longest') {
        return (Number(b.duration) || 0) - (Number(a.duration) || 0);
      }
      if (sortBy === 'shortest') {
        return (Number(a.duration) || 0) - (Number(b.duration) || 0);
      }
      return 0;
    });

    return result;
  }, [dayActivities, searchQuery, categoryFilter, durationFilter, relatedTaskFilter, sortBy]);

  const hasActivitiesForDay = dayActivities.length > 0;

  return (
    <div className="space-y-6 sm:space-y-7 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Daily Activity
          </h2>
          <p className="text-sm text-[#94A3B8] mt-1">
            Record what you actually did throughout your day.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => openCreateActivityModal(selectedDate)}
          icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
          className="shadow-glow-primary self-start sm:self-auto"
        >
          Add Activity
        </Button>
      </div>

      {/* 1. Today's Summary Cards */}
      <ActivityStats />

      {/* 2. Interactive Date Navigation */}
      <ActivityDateNavigation />

      {/* 3. Search & Filters */}
      {hasActivitiesForDay && (
        <ActivityFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          durationFilter={durationFilter}
          setDurationFilter={setDurationFilter}
          relatedTaskFilter={relatedTaskFilter}
          setRelatedTaskFilter={setRelatedTaskFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          availableCategories={availableCategories}
        />
      )}

      {/* 4. Timeline List or Empty States */}
      {!hasActivitiesForDay ? (
        // Empty State for Selected Date
        <Card className="border-dashed border-white/[0.12]">
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#06B6D4]/10 border border-[#06B6D4]/20 flex items-center justify-center text-[#06B6D4] mb-4 shadow-subtle">
              <ActivityIcon className="w-8 h-8 stroke-[1.75]" />
            </div>
            <h3 className="text-xl font-bold text-white">No activities recorded</h3>
            <p className="text-sm text-[#94A3B8] max-w-sm mt-1.5 mb-6">
              You haven't logged anything for this day yet. Start tracking your day by adding your first activity.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => openCreateActivityModal(selectedDate)}
              icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
              className="shadow-glow-primary"
            >
              Add Activity
            </Button>
          </div>
        </Card>
      ) : filteredActivities.length === 0 ? (
        // Empty State: Search or filter matched 0 items
        <Card className="border-dashed border-white/[0.12]">
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-white/[0.08] flex items-center justify-center text-[#94A3B8] mb-3">
              <SearchX className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-white">No matching activities</h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-xs mt-1 mb-5">
              Try changing your search or filters to locate recorded items.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setDurationFilter('all');
                setRelatedTaskFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </Card>
      ) : (
        // Timeline Display
        <ActivityTimeline
          activities={filteredActivities}
          totalMinutes={summary.selectedDateTotalMinutes}
          completedTasksCount={stats.todayCompleted}
        />
      )}
    </div>
  );
}

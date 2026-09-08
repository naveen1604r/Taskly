import React from 'react';
import { usePlannerContext } from '../../context/PlannerContext';
import { useTaskContext } from '../../context/TaskContext';
import Button from '../common/Button';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Plus,
  List,
  CalendarRange,
} from 'lucide-react';

export default function PlannerHeader() {
  const {
    selectedDate,
    setSelectedDate,
    goToToday,
    goToPreviousDay,
    goToNextDay,
    plannerView,
    setPlannerView,
  } = usePlannerContext();
  const { openCreateModal } = useTaskContext();

  const formatDateTitle = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Daily Planner
          </h2>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-[#06B6D4] bg-[#06B6D4]/10 border border-[#06B6D4]/20">
            <Clock className="w-3 h-3" />
            Time Blocking
          </span>
        </div>
        <p className="text-sm text-[#94A3B8] mt-1">
          Plan your day, allocate focus blocks, and prevent scheduling overload.
        </p>
      </div>

      {/* Navigation Controls & Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Date Navigation Strip */}
        <div className="flex items-center bg-[#11151F] border border-white/[0.08] rounded-xl p-1 shadow-subtle">
          <button
            type="button"
            onClick={goToPreviousDay}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={goToToday}
            className="px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
          >
            Today
          </button>

          <button
            type="button"
            onClick={goToNextDay}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Date Picker Input */}
          <div className="relative pl-1 border-l border-white/[0.08]">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2 py-1 text-xs bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* View Switcher: Timeline vs List */}
        <div className="flex items-center bg-[#11151F] border border-white/[0.08] rounded-xl p-1">
          <button
            type="button"
            onClick={() => setPlannerView('timeline')}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              plannerView === 'timeline'
                ? 'bg-[#7C3AED] text-white shadow-glow-primary'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Timeline View"
          >
            <CalendarRange className="w-4 h-4" />
            <span className="hidden sm:inline">Timeline</span>
          </button>

          <button
            type="button"
            onClick={() => setPlannerView('list')}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              plannerView === 'list'
                ? 'bg-[#7C3AED] text-white shadow-glow-primary'
                : 'text-slate-400 hover:text-white'
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">List</span>
          </button>
        </div>

        {/* Quick Add Task Button */}
        <Button
          variant="primary"
          size="md"
          onClick={openCreateModal}
          icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
        >
          Add Task
        </Button>
      </div>
    </div>
  );
}

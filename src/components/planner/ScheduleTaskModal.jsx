import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { usePlannerContext } from '../../context/PlannerContext';
import { useTaskContext } from '../../context/TaskContext';
import {
  getTasksForDate,
  calculateEndTime,
  formatTimeDisplay,
  formatDurationDisplay,
  getAvailableTimeSlots,
} from '../../utils/plannerUtils';
import { Clock, Calendar, Sparkles, Check, FileText } from 'lucide-react';

const durationPresets = [
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
  { label: '45 min', minutes: 45 },
  { label: '1 hour', minutes: 60 },
  { label: '1h 30m', minutes: 90 },
  { label: '2 hours', minutes: 120 },
  { label: '3 hours', minutes: 180 },
];

export default function ScheduleTaskModal() {
  const { tasks } = useTaskContext();
  const {
    schedulingTask,
    isScheduleModalOpen,
    closeScheduleModal,
    saveSchedule,
    selectedDate,
    workingHours,
  } = usePlannerContext();

  const [date, setDate] = useState(selectedDate);
  const [startTime, setStartTime] = useState('09:00');
  const [duration, setDuration] = useState(60);
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [customDurationInput, setCustomDurationInput] = useState('60');
  const [notes, setNotes] = useState('');

  // Sync state when task is opened
  useEffect(() => {
    if (schedulingTask) {
      setDate(schedulingTask.plannedDate || schedulingTask.dueDate || selectedDate);
      setStartTime(schedulingTask.plannedStartTime || schedulingTask.dueTime || '09:00');
      const dur = schedulingTask.estimatedDuration || schedulingTask.duration || 60;
      setDuration(dur);

      const isPreset = durationPresets.some((p) => p.minutes === dur);
      if (isPreset) {
        setIsCustomDuration(false);
      } else {
        setIsCustomDuration(true);
        setCustomDurationInput(String(dur));
      }

      setNotes(schedulingTask.planningNotes || '');
    }
  }, [schedulingTask, selectedDate]);

  if (!isScheduleModalOpen || !schedulingTask) return null;

  // Calculate End Time
  const endTime = calculateEndTime(startTime, duration);

  // Smart Available Time Slots suggestions for this task and date
  const dayTasks = getTasksForDate(tasks, date).filter((t) => t.id !== schedulingTask.id);
  const availableSlots = getAvailableTimeSlots(dayTasks, '06:00', '22:00', duration);

  const handleSubmit = (e) => {
    e.preventDefault();
    saveSchedule(schedulingTask.id, {
      plannedDate: date,
      plannedStartTime: startTime,
      estimatedDuration: duration,
      planningNotes: notes.trim(),
    });
  };

  return (
    <Modal
      isOpen={isScheduleModalOpen}
      onClose={closeScheduleModal}
      title="Schedule Task"
      subtitle={`Plan focus execution for "${schedulingTask.title}"`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Planned Date */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
            Planned Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#171C27] text-white rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none cursor-pointer"
          />
        </div>

        {/* Start Time & End Time Display */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-[#171C27] text-white rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
              Calculated End
            </label>
            <div className="w-full px-3 py-2 text-xs sm:text-sm bg-[#171C27]/60 text-slate-300 rounded-xl border border-white/[0.04] font-mono">
              {formatTimeDisplay(endTime) || '—'}
            </div>
          </div>
        </div>

        {/* Duration Presets */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
              Estimated Duration
            </label>
            <span className="text-xs font-bold text-[#06B6D4]">
              {formatDurationDisplay(duration)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {durationPresets.map((p) => {
              const isSelected = !isCustomDuration && duration === p.minutes;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setDuration(p.minutes);
                    setIsCustomDuration(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-[#7C3AED] text-white shadow-glow-primary'
                      : 'bg-[#171C27] text-slate-400 hover:text-white border border-white/[0.06]'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setIsCustomDuration(true)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                isCustomDuration
                  ? 'bg-[#7C3AED] text-white'
                  : 'bg-[#171C27] text-slate-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              Custom
            </button>
          </div>

          {/* Custom Duration Input */}
          {isCustomDuration && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                min="5"
                step="5"
                value={customDurationInput}
                onChange={(e) => {
                  setCustomDurationInput(e.target.value);
                  const m = parseInt(e.target.value, 10);
                  if (!isNaN(m) && m > 0) setDuration(m);
                }}
                className="w-32 px-3 py-1.5 text-xs bg-[#171C27] text-white rounded-lg border border-white/[0.1] focus:border-[#7C3AED] focus:outline-none"
              />
              <span className="text-xs text-slate-400">minutes</span>
            </div>
          )}
        </div>

        {/* Smart Available Time Suggestions */}
        {availableSlots.length > 0 && (
          <div className="p-3 rounded-xl bg-[#171C27]/70 border border-white/[0.06] space-y-2">
            <span className="text-[11px] font-semibold text-[#06B6D4] flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Suggested Open Slots</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {availableSlots.map((slot) => (
                <button
                  key={slot.start}
                  type="button"
                  onClick={() => setStartTime(slot.start)}
                  className="px-2 py-1 rounded-md bg-[#11151F] hover:bg-[#7C3AED]/20 text-[11px] font-medium text-slate-300 hover:text-white border border-white/[0.06] transition-colors font-mono"
                >
                  {slot.displayLabel}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Planning Note */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
            Planning Note <span className="text-[11px] text-slate-500 font-normal lowercase">(optional)</span>
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Focus on mobile responsive layout first"
            className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#171C27] text-white placeholder-slate-500 rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.06]">
          <Button variant="secondary" size="md" onClick={closeScheduleModal}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={<Check className="w-4 h-4" />}
          >
            Schedule Task
          </Button>
        </div>
      </form>
    </Modal>
  );
}

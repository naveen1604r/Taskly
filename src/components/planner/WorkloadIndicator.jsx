import React, { useState } from 'react';
import Card from '../common/Card';
import { useTaskContext } from '../../context/TaskContext';
import { usePlannerContext } from '../../context/PlannerContext';
import { getTasksForDate, calculateDailyWorkload } from '../../utils/plannerUtils';
import { BatteryCharging, AlertTriangle, Settings2, Check } from 'lucide-react';

export default function WorkloadIndicator() {
  const { tasks } = useTaskContext();
  const { selectedDate, workingHours, setWorkingHours } = usePlannerContext();

  const [isEditingHours, setIsEditingHours] = useState(false);
  const [customHours, setCustomHours] = useState(String(workingHours));

  const dayTasks = getTasksForDate(tasks, selectedDate);
  const workload = calculateDailyWorkload(dayTasks, workingHours);

  const presetHours = [1, 2, 4, 6, 8, 10];

  const handleSaveCustom = (e) => {
    e.preventDefault();
    const h = parseFloat(customHours);
    if (!isNaN(h) && h > 0 && h <= 24) {
      setWorkingHours(h);
      setIsEditingHours(false);
    }
  };

  return (
    <Card className="flex flex-col justify-between">
      <div className="space-y-3.5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/20">
              <BatteryCharging className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight">Today's Workload Capacity</h4>
              <p className="text-xs text-[#94A3B8]">
                {workload.plannedFormatted} planned / {workload.availableFormatted} available ({workingHours}h working window)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditingHours(!isEditingHours)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Configure working hours"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>

        {/* Working Hours inline config toggle */}
        {isEditingHours && (
          <div className="p-3 rounded-xl bg-[#171C27] border border-white/[0.08] space-y-2.5 animate-in fade-in duration-150">
            <span className="text-xs font-semibold text-white block">Configure Daily Working Hours</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {presetHours.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => {
                    setWorkingHours(h);
                    setIsEditingHours(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    workingHours === h
                      ? 'bg-[#7C3AED] text-white'
                      : 'bg-[#11151F] text-slate-400 hover:text-white border border-white/[0.06]'
                  }`}
                >
                  {h}h
                </button>
              ))}
            </div>

            {/* Custom hours form */}
            <form onSubmit={handleSaveCustom} className="flex items-center gap-2 pt-1">
              <input
                type="number"
                min="0.5"
                max="24"
                step="0.5"
                value={customHours}
                onChange={(e) => setCustomHours(e.target.value)}
                placeholder="Custom hours"
                className="w-24 px-2 py-1 text-xs bg-[#11151F] text-white rounded-lg border border-white/[0.1] focus:border-[#7C3AED] focus:outline-none"
              />
              <button
                type="submit"
                className="px-2.5 py-1 text-xs font-semibold bg-[#7C3AED] text-white rounded-lg hover:bg-[#6D28D9] transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                <span>Save</span>
              </button>
            </form>
          </div>
        )}

        {/* Progress Bar & Percentage */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300">Capacity Utilization</span>
            <span
              className={`font-bold ${
                workload.isOverloaded
                  ? 'text-[#EF4444]'
                  : workload.workloadPercentage >= 80
                  ? 'text-[#F59E0B]'
                  : 'text-[#22C55E]'
              }`}
            >
              {workload.workloadPercentage}%
            </span>
          </div>

          <div className="w-full h-3 bg-[#171C27] rounded-full overflow-hidden p-0.5 border border-white/[0.06]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                workload.isOverloaded
                  ? 'bg-gradient-to-r from-amber-500 to-[#EF4444]'
                  : workload.workloadPercentage >= 80
                  ? 'bg-gradient-to-r from-[#7C3AED] to-amber-500'
                  : 'bg-gradient-to-r from-[#7C3AED] to-[#06B6D4]'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, workload.workloadPercentage))}%` }}
            />
          </div>
        </div>

        {/* Overload Warning Banner */}
        {workload.isOverloaded && (
          <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/25 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
            <div className="text-xs text-slate-200 leading-snug">
              <strong className="text-[#EF4444] block font-semibold mb-0.5">Schedule Overloaded</strong>
              You have {workload.overloadFormatted} more planned than your {workload.availableFormatted} available working window.
              Consider rescheduling non-essential tasks.
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { useTaskContext } from '../../context/TaskContext';
import { usePlannerContext } from '../../context/PlannerContext';
import { CalendarCheck, Plus, CalendarPlus } from 'lucide-react';

export default function PlannerEmptyState({ onScheduleExisting }) {
  const { openCreateModal } = useTaskContext();

  return (
    <Card className="border-dashed border-white/[0.12]">
      <div className="py-14 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-center text-[#7C3AED] mb-3.5">
          <CalendarCheck className="w-7 h-7 stroke-[1.75]" />
        </div>

        <h3 className="text-base font-bold text-white tracking-tight">Your day is clear</h3>
        <p className="text-xs sm:text-sm text-[#94A3B8] max-w-sm mt-1 mb-5">
          You don't have any tasks planned for this day. Create a new task or allocate time blocks for unscheduled work.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={openCreateModal}
            icon={<Plus className="w-3.5 h-3.5 stroke-[2.5]" />}
          >
            Add Task
          </Button>

          {onScheduleExisting && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onScheduleExisting}
              icon={<CalendarPlus className="w-3.5 h-3.5" />}
            >
              Schedule Existing Task
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

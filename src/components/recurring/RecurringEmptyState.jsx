import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { useRecurringTaskContext } from '../../context/RecurringTaskContext';
import { Repeat, Plus } from 'lucide-react';

export default function RecurringEmptyState() {
  const { openCreateModal } = useRecurringTaskContext();

  return (
    <Card className="border-dashed border-white/[0.12]">
      <div className="py-14 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-center text-[#7C3AED] mb-3.5">
          <Repeat className="w-7 h-7 stroke-[1.75]" />
        </div>

        <h3 className="text-base font-bold text-white tracking-tight">No recurring tasks yet</h3>
        <p className="text-xs sm:text-sm text-[#94A3B8] max-w-sm mt-1 mb-5">
          Create routines for tasks you repeat regularly, such as daily morning studies, weekly workouts, or monthly reviews.
        </p>

        <Button
          variant="primary"
          size="sm"
          onClick={openCreateModal}
          icon={<Plus className="w-3.5 h-3.5 stroke-[2.5]" />}
        >
          Create Recurring Task
        </Button>
      </div>
    </Card>
  );
}

import React from 'react';
import Button from '../common/Button';
import { useTaskContext } from '../../context/TaskContext';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';

export default function WelcomeSection() {
  const { openCreateModal } = useTaskContext();

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#11151F] border border-white/[0.08] p-6 sm:p-7 shadow-card">
      {/* Subtle ambient gradient in background */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-[#7C3AED]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 bg-[#06B6D4]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div className="space-y-1.5">
          {/* Dynamic Date Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-[#c4b5fd] bg-[#7C3AED]/10 border border-[#7C3AED]/20">
            <CalendarIcon className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>{todayFormatted}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Good Morning 👋
          </h2>
          <p className="text-sm text-[#94A3B8]">
            Plan your day. Track your progress. Get things done.
          </p>
        </div>

        {/* Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="primary"
            size="lg"
            onClick={openCreateModal}
            icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
            className="shadow-glow-primary hover:scale-[1.02]"
          >
            Add Task
          </Button>
        </div>
      </div>
    </div>
  );
}

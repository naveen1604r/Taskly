import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import { useTaskContext } from '../../context/TaskContext';
import { useNotesContext } from '../../context/NotesContext';
import { useGoalsContext } from '../../context/GoalsContext';
import { usePlannerContext } from '../../context/PlannerContext';
import { useTemplateContext } from '../../context/TemplateContext';
import { useFocusContext } from '../../context/FocusContext';
import {
  Plus,
  FileText,
  Play,
  Calendar,
  Target,
  LayoutTemplate,
  KanbanSquare,
  Zap,
} from 'lucide-react';

export default function QuickActions() {
  const navigate = useNavigate();
  const { openCreateModal: openTaskModal } = useTaskContext();
  const { openCreateModal: openNoteModal } = useNotesContext();
  const { openCreateModal: openGoalModal } = useGoalsContext();
  const { openScheduleModal } = usePlannerContext();
  const { openCreateModal: openTemplateModal } = useTemplateContext();
  const { setIsTaskSelectorOpen } = useFocusContext();

  const actions = [
    {
      id: 'task',
      label: 'Add Task',
      icon: Plus,
      color: 'text-[#7C3AED] hover:bg-[#7C3AED]/20 border-[#7C3AED]/30',
      bg: 'bg-[#7C3AED]/10',
      onClick: openTaskModal,
    },
    {
      id: 'board',
      label: 'Task Board',
      icon: KanbanSquare,
      color: 'text-indigo-400 hover:bg-indigo-500/20 border-indigo-500/30',
      bg: 'bg-indigo-500/10',
      onClick: () => navigate('/board'),
    },
    {
      id: 'focus',
      label: 'Start Focus',
      icon: Play,
      color: 'text-[#06B6D4] hover:bg-[#06B6D4]/20 border-[#06B6D4]/30',
      bg: 'bg-[#06B6D4]/10',
      onClick: () => {
        if (setIsTaskSelectorOpen) setIsTaskSelectorOpen(true);
        navigate('/focus');
      },
    },
    {
      id: 'note',
      label: 'Add Note',
      icon: FileText,
      color: 'text-amber-400 hover:bg-amber-500/20 border-amber-500/30',
      bg: 'bg-amber-500/10',
      onClick: openNoteModal || (() => navigate('/notes')),
    },
    {
      id: 'plan',
      label: 'Plan Task',
      icon: Calendar,
      color: 'text-[#22C55E] hover:bg-[#22C55E]/20 border-[#22C55E]/30',
      bg: 'bg-[#22C55E]/10',
      onClick: openScheduleModal || (() => navigate('/planner')),
    },
    {
      id: 'goal',
      label: 'Add Goal',
      icon: Target,
      color: 'text-purple-400 hover:bg-purple-500/20 border-purple-500/30',
      bg: 'bg-purple-500/10',
      onClick: openGoalModal || (() => navigate('/goals')),
    },
  ];

  return (
    <Card
      title="Quick Actions"
      subtitle="One-click launchers for your daily operations"
      action={<Zap className="w-4 h-4 text-amber-400" />}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              type="button"
              onClick={act.onClick}
              className={`p-3 rounded-2xl border ${act.bg} ${act.color} transition-all flex flex-col items-center justify-center text-center gap-2 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]`}
            >
              <div className="p-2 rounded-xl bg-white/[0.06] group-hover:scale-110 transition-transform">
                <Icon className="w-4 h-4 shrink-0" />
              </div>
              <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                {act.label}
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

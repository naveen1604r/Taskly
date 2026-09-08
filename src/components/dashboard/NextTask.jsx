import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import { useTaskContext } from '../../context/TaskContext';
import { usePlannerContext } from '../../context/PlannerContext';
import { useFocusContext } from '../../context/FocusContext';
import { getNextTask } from '../../utils/dashboardUtils';
import { Sparkles, Play, Clock, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function NextTask() {
  const navigate = useNavigate();
  const { tasks } = useTaskContext();
  const { selectedDate, openScheduleModal } = usePlannerContext();
  const { startFocus } = useFocusContext();

  const nextInfo = getNextTask({ tasks, selectedDate });

  const handleStartFocus = (taskId) => {
    startFocus(taskId);
    navigate(`/focus?task=${taskId}`);
  };

  return (
    <Card
      title="Next Up"
      subtitle="Upcoming scheduled deliverable on your timeline"
      className="relative overflow-hidden border-[#7C3AED]/25 shadow-glow-primary/10"
      action={
        <Link
          to="/planner"
          className="text-xs font-semibold text-[#7C3AED] hover:text-[#c4b5fd] transition-colors flex items-center gap-1"
        >
          <span>Planner</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      {!nextInfo ? (
        <div className="py-8 text-center border border-dashed border-white/[0.08] rounded-2xl">
          <Calendar className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-white">No upcoming scheduled task</p>
          <p className="text-xs text-slate-400 mt-0.5 mb-3">Schedule tasks on your planner timeline to stay on track.</p>
          <Button
            variant="primary"
            size="sm"
            onClick={openScheduleModal || (() => navigate('/planner'))}
            icon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Plan a Task
          </Button>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#7C3AED]/15 via-[#171C27] to-[#11151F] border border-[#7C3AED]/30 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#c4b5fd] bg-[#7C3AED]/25 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-[#7C3AED]/40">
              <Sparkles className="w-3 h-3 text-[#7C3AED]" />
              {nextInfo.isUpcoming ? `Starts in ${nextInfo.startsIn}` : nextInfo.startsIn}
            </span>

            <span className="text-xs font-mono font-semibold text-slate-400">
              {nextInfo.task.plannedStartTime || nextInfo.task.dueTime || 'Planned'}
            </span>
          </div>

          <div>
            <Link
              to={`/tasks/${nextInfo.task.id}`}
              className="text-base sm:text-lg font-bold text-white hover:text-[#c4b5fd] transition-colors block truncate"
            >
              {nextInfo.task.title}
            </Link>
            {nextInfo.task.description && (
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {nextInfo.task.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/[0.08]">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-[#06B6D4]">
                <Clock className="w-3.5 h-3.5" />
                <span>Est: {nextInfo.task.estimatedDuration || 30} min</span>
              </span>
              <span className="capitalize text-slate-300 font-medium">
                {nextInfo.task.priority} Priority
              </span>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => handleStartFocus(nextInfo.task.id)}
              icon={<Play className="w-3.5 h-3.5 fill-current" />}
              className="shadow-glow-primary"
            >
              Start Focus
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

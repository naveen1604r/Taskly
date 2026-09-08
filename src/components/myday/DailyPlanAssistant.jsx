import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskContext } from '../../context/TaskContext';
import { useInboxContext } from '../../context/InboxContext';
import { useFocusContext } from '../../context/FocusContext';
import { generateDailyPlanSuggestions } from '../../utils/myDayUtils';
import {
  Sparkles,
  AlertTriangle,
  Lock,
  Clock,
  Inbox,
  CheckCircle2,
  X,
  Play,
  ArrowRight,
} from 'lucide-react';
import Button from '../common/Button';

export default function DailyPlanAssistant({ isOpen, onClose, tasks = [], workload = {} }) {
  const navigate = useNavigate();
  const { inboxItems } = useInboxContext();
  const { startFocus } = useFocusContext();

  if (!isOpen) return null;

  const suggestions = generateDailyPlanSuggestions({
    tasks,
    inboxItems,
    workload,
  });

  const handleExecuteAction = (sug) => {
    onClose();
    if (sug.actionType === 'navigate_inbox') {
      navigate('/inbox');
    } else if (sug.actionType === 'start_focus') {
      navigate('/focus');
    } else if (sug.actionType === 'schedule_tasks') {
      navigate('/planner');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-lg bg-[#11151F] border border-white/[0.1] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#7C3AED]/15 text-[#7C3AED] border border-[#7C3AED]/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Daily Plan Assistant</h3>
              <p className="text-xs text-slate-400">Deterministic workflow recommendations for today</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workload Brief */}
        <div className="p-3.5 rounded-2xl bg-[#171C27] border border-white/[0.04] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">
              Estimated Workload
            </span>
            <span className="text-sm font-bold text-white font-mono">
              {workload.formattedWorkload} / {workload.formattedAvailable} available
            </span>
          </div>
          <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${workload.color}`}>
            {workload.status}
          </span>
        </div>

        {/* Actionable Suggestions List */}
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {suggestions.map((sug) => (
            <div
              key={sug.id}
              className="p-3.5 rounded-2xl bg-[#171C27]/70 border border-white/[0.04] space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-white">{sug.title}</h4>
                <button
                  type="button"
                  onClick={() => handleExecuteAction(sug)}
                  className="px-2.5 py-1 rounded-xl bg-[#7C3AED]/15 hover:bg-[#7C3AED] text-[#c4b5fd] hover:text-white font-semibold transition-colors text-[11px] shrink-0 flex items-center gap-1"
                >
                  <span>{sug.actionLabel}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">{sug.desc}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-white/[0.08] flex justify-end">
          <Button variant="primary" size="sm" onClick={onClose}>
            Got It
          </Button>
        </div>
      </div>
    </div>
  );
}

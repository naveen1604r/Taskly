import React from 'react';
import { Link } from 'react-router-dom';
import { getTomorrowPreview } from '../../utils/myDayUtils';
import { useTaskContext } from '../../context/TaskContext';
import Card from '../common/Card';
import { Calendar, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function TomorrowPreview() {
  const { tasks } = useTaskContext();
  const preview = getTomorrowPreview(tasks);

  return (
    <Card
      title="Tomorrow's Plan Snapshot"
      subtitle={`Preview deliverables scheduled for ${preview.dateStr}`}
      action={
        <Link
          to="/planner"
          className="text-xs text-[#7C3AED] hover:text-[#c4b5fd] font-semibold transition-colors inline-flex items-center gap-1"
        >
          <span>Open Planner</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      <div className="space-y-3 text-xs">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#171C27] border border-white/[0.04]">
          <span className="font-bold text-white">
            {preview.totalCount} {preview.totalCount === 1 ? 'task planned' : 'tasks planned'}
          </span>
          <span className="font-mono text-cyan-400 font-bold">
            {preview.formattedDuration}
          </span>
        </div>

        {preview.tasks.length === 0 ? (
          <p className="text-slate-400 italic text-center py-4">
            Nothing planned yet for tomorrow. You can schedule deliverables ahead in the Planner or Calendar.
          </p>
        ) : (
          <div className="space-y-1.5">
            {preview.tasks.slice(0, 4).map((t) => (
              <div
                key={t.id}
                className="p-2.5 rounded-xl bg-[#171C27]/50 border border-white/[0.03] flex items-center justify-between"
              >
                <span className="font-semibold text-slate-300 truncate">{t.title}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {t.plannedStartTime || `${t.estimatedDuration || 30}m`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

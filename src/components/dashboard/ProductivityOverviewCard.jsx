import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import { useAnalyticsContext } from '../../context/AnalyticsContext';
import { BarChart3, ArrowRight, CheckCircle2, Clock, Target, Activity } from 'lucide-react';

export default function ProductivityOverviewCard() {
  const { metrics } = useAnalyticsContext();

  return (
    <Card
      title="Productivity Overview"
      subtitle="Weekly performance & focus velocity"
      action={
        <Link
          to="/analytics"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#7C3AED] hover:text-[#c4b5fd] transition-colors"
        >
          <span>View Analytics</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
      className="flex flex-col justify-between"
    >
      <div className="space-y-4">
        {/* Metric tiles */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-[#171C27] border border-white/[0.06]">
            <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
              <span>Tasks Done</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
            </div>
            <span className="text-xl font-bold text-white">{metrics.tasksCompleted}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#171C27] border border-white/[0.06]">
            <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
              <span>Focus Time</span>
              <Clock className="w-3.5 h-3.5 text-[#06B6D4]" />
            </div>
            <span className="text-xl font-bold text-white">{metrics.focusTimeFormatted}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#171C27] border border-white/[0.06]">
            <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
              <span>Goal Progress</span>
              <Target className="w-3.5 h-3.5 text-[#F59E0B]" />
            </div>
            <span className="text-xl font-bold text-white">{metrics.averageGoalProgress}%</span>
          </div>

          <div className="p-3 rounded-xl bg-[#171C27] border border-white/[0.06]">
            <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
              <span>Activities</span>
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-xl font-bold text-white">{metrics.activitiesCount}</span>
          </div>
        </div>

        {/* Footer Snapshot Link */}
        <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Completion Rate: <strong className="text-white">{metrics.completionRate !== null ? `${metrics.completionRate}%` : '—'}</strong>
          </span>
          <Link
            to="/analytics"
            className="text-[#06B6D4] hover:underline font-semibold flex items-center gap-1"
          >
            <span>Full report</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </Card>
  );
}

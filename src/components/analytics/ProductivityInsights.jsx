import React from 'react';
import Card from '../common/Card';
import { useAnalyticsContext } from '../../context/AnalyticsContext';
import { Sparkles, Calendar, Clock, Lightbulb, TrendingUp, AlertTriangle } from 'lucide-react';

export default function ProductivityInsights() {
  const { metrics } = useAnalyticsContext();
  const {
    insights = {},
    completionRate = 0,
    timeDifferenceMins = 0,
    taskTrendPercent = 0,
    focusTrendPercent = 0,
    overdueTasksCount = 0,
  } = metrics;

  // Deterministic insights generation (Requirement 23)
  const dynamicInsights = [];

  if (focusTrendPercent > 10) {
    dynamicInsights.push({
      text: 'Your deep work focus time increased noticeably compared with the previous period.',
      type: 'positive',
    });
  } else if (focusTrendPercent < -10) {
    dynamicInsights.push({
      text: 'Focus session duration decreased slightly. Consider scheduling dedicated focus blocks.',
      type: 'warning',
    });
  }

  if (completionRate >= 80) {
    dynamicInsights.push({
      text: "You're completing the vast majority of your planned deliverables on time.",
      type: 'positive',
    });
  } else if (completionRate < 50) {
    dynamicInsights.push({
      text: 'Completion rate is low. Try breaking complex deliverables into smaller subtasks.',
      type: 'warning',
    });
  }

  if (timeDifferenceMins > 60) {
    dynamicInsights.push({
      text: 'Tasks are taking longer than estimated. Consider adjusting initial estimates upward.',
      type: 'info',
    });
  } else if (timeDifferenceMins < -30) {
    dynamicInsights.push({
      text: 'You are finishing tasks ahead of schedule with strong execution efficiency.',
      type: 'positive',
    });
  }

  if (overdueTasksCount > 3) {
    dynamicInsights.push({
      text: 'Overdue deliverables increased. Consider rescheduling or re-prioritizing your queue.',
      type: 'warning',
    });
  }

  return (
    <Card
      title="Productivity Insights & Peak Output"
      subtitle="Data-driven behavioral insights and peak execution windows"
      action={<Sparkles className="w-4 h-4 text-[#7C3AED]" />}
    >
      <div className="space-y-4">
        {/* Peak day & Peak time indicators (Requirements 11 & 12) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-[#171C27] border border-white/[0.04] flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#7C3AED]/15 text-[#7C3AED] shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 font-semibold block">
                Peak Productive Day
              </span>
              <span className="text-sm sm:text-base font-bold text-white block truncate">
                {insights.peakDay || 'None'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#171C27] border border-white/[0.04] flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#06B6D4]/15 text-[#06B6D4] shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 font-semibold block">
                Peak Output Window
              </span>
              <span className="text-sm sm:text-base font-bold text-white block truncate">
                {insights.peakTime || 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Deterministic Insights List (Requirement 23) */}
        <div className="space-y-2 pt-1">
          <span className="text-xs font-bold text-white block">
            Generated Observations
          </span>

          {dynamicInsights.length === 0 ? (
            <p className="text-xs text-slate-400 italic">
              Continue logging tasks and focus sessions to unlock personalized observations.
            </p>
          ) : (
            <div className="space-y-2">
              {dynamicInsights.map((ins, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-xs ${
                    ins.type === 'positive'
                      ? 'bg-[#22C55E]/10 border-[#22C55E]/20 text-[#22C55E]'
                      : ins.type === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                      : 'bg-[#06B6D4]/10 border-[#06B6D4]/20 text-cyan-300'
                  }`}
                >
                  <Lightbulb className="w-4 h-4 shrink-0" />
                  <span className="font-medium">{ins.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isTaskBlocked } from '../../utils/dependencyUtils';
import { useTaskContext } from '../../context/TaskContext';
import { useInboxContext } from '../../context/InboxContext';
import { getTodayDateString } from '../../utils/taskStorage';
import Card from '../common/Card';
import { AlertOctagon, Lock, Clock, Inbox, ArrowRight } from 'lucide-react';

export default function NeedsAttention({ overdueTasks = [], todayTasks = [] }) {
  const navigate = useNavigate();
  const { tasks } = useTaskContext();
  const { stats } = useInboxContext();
  const todayStr = getTodayDateString();

  const blockedToday = todayTasks.filter((t) => isTaskBlocked(t, tasks) && t.status !== 'completed');
  const unscheduledHigh = todayTasks.filter(
    (t) => t.priority === 'high' && !t.plannedStartTime && t.status !== 'completed'
  );

  const attentionItems = [];

  if (overdueTasks.length > 0) {
    attentionItems.push({
      id: 'att-overdue',
      icon: Clock,
      title: `${overdueTasks.length} Overdue Task${overdueTasks.length > 1 ? 's' : ''}`,
      desc: 'Deliverables past their target deadline need immediate rescheduling or completion.',
      color: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
      actionLabel: 'Review',
      link: '/planner',
    });
  }

  if (blockedToday.length > 0) {
    attentionItems.push({
      id: 'att-blocked',
      icon: Lock,
      title: `${blockedToday.length} Blocked Deliverable${blockedToday.length > 1 ? 's' : ''}`,
      desc: 'Prerequisites must be finished before these tasks can proceed.',
      color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      actionLabel: 'View Blockers',
      link: '/board',
    });
  }

  if (stats.unprocessed > 0) {
    attentionItems.push({
      id: 'att-inbox',
      icon: Inbox,
      title: `${stats.unprocessed} Unprocessed Captures in Inbox`,
      desc: 'Triage quick thoughts before they pile up.',
      color: 'text-[#06B6D4] border-[#06B6D4]/30 bg-[#06B6D4]/10',
      actionLabel: 'Open Inbox',
      link: '/inbox',
    });
  }

  if (attentionItems.length === 0) return null;

  return (
    <Card
      title="Needs Attention"
      subtitle="Critical items requiring your immediate decision"
      action={<AlertOctagon className="w-4 h-4 text-[#EF4444]" />}
    >
      <div className="space-y-2.5 text-xs">
        {attentionItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="p-3 rounded-2xl bg-[#171C27] border border-white/[0.04] flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <div className={`p-2 rounded-xl border shrink-0 ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <h5 className="font-bold text-white">{item.title}</h5>
                  <p className="text-[11px] text-slate-400 leading-normal">{item.desc}</p>
                </div>
              </div>

              <Link
                to={item.link}
                className="px-2.5 py-1 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white font-semibold transition-colors shrink-0 flex items-center gap-1"
              >
                <span>{item.actionLabel}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

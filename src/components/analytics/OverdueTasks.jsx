import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import { useAnalyticsContext } from '../../context/AnalyticsContext';
import { getTodayDateString } from '../../utils/taskStorage';
import { AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function OverdueTasks() {
  const { metrics } = useAnalyticsContext();

  const overdueList = metrics.overdueTasksList || [];
  const todayStr = getTodayDateString();

  const calculateDaysOverdue = (dueDateStr) => {
    if (!dueDateStr) return 1;
    const d1 = new Date(dueDateStr);
    const d2 = new Date(todayStr);
    const diff = Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)));
    return diff;
  };

  return (
    <Card
      title="Overdue Tasks"
      subtitle={`${metrics.overdueTasksCount} overdue tasks requiring immediate attention`}
      action={
        <Link
          to="/tasks"
          className="text-xs font-semibold text-[#EF4444] hover:underline flex items-center gap-1"
        >
          <span>View all tasks</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
      className="flex flex-col justify-between"
    >
      {overdueList.length === 0 ? (
        <div className="py-8 flex flex-col items-center justify-center text-center">
          <CheckCircle2 className="w-8 h-8 text-[#22C55E] mb-2" />
          <h4 className="text-sm font-bold text-white">No overdue tasks!</h4>
          <p className="text-xs text-[#94A3B8] mt-0.5">All scheduled tasks are up-to-date.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {overdueList.map((task) => {
            const days = calculateDaysOverdue(task.dueDate);
            return (
              <div
                key={task.id}
                className="p-3 rounded-xl bg-[#171C27] border border-[#EF4444]/25 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-white truncate">
                    {task.title}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-[#EF4444] bg-[#EF4444]/15 border border-[#EF4444]/30 shrink-0">
                  {days} {days === 1 ? 'day' : 'days'} overdue
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

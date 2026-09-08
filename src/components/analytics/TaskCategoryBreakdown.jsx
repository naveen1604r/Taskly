import React from 'react';
import Card from '../common/Card';
import { useAnalyticsContext } from '../../context/AnalyticsContext';
import { Tag } from 'lucide-react';

export default function TaskCategoryBreakdown() {
  const { metrics } = useAnalyticsContext();

  const categories = metrics.taskCategories || [];
  const totalTasks = metrics.totalTasks || 0;

  return (
    <Card
      title="Tasks by Category"
      subtitle={`${categories.length} distinct categories represented`}
      className="flex flex-col justify-between"
    >
      {categories.length === 0 ? (
        <div className="py-10 text-center text-slate-500 italic text-xs">
          No categorical tasks found for this period.
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((item) => {
            const percent = totalTasks > 0 ? Math.round((item.count / totalTasks) * 100) : 0;

            return (
              <div key={item.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Tag className="w-3 h-3 text-[#7C3AED] shrink-0" />
                    <span className="font-semibold text-white truncate">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-slate-400 font-normal">({percent}%)</span>
                    <span className="font-bold text-slate-200">{item.count}</span>
                  </div>
                </div>

                <div className="w-full h-2 bg-[#171C27] rounded-full overflow-hidden p-0.5 border border-white/[0.04]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(item.count > 0 ? 6 : 0, percent))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

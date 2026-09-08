import React from 'react';
import Card from '../common/Card';
import { useAnalyticsContext } from '../../context/AnalyticsContext';
import { Activity, PieChart } from 'lucide-react';

const categoryColors = [
  'bg-[#7C3AED]',
  'bg-[#06B6D4]',
  'bg-[#22C55E]',
  'bg-[#F59E0B]',
  'bg-indigo-500',
  'bg-pink-500',
  'bg-slate-500',
];

export default function ActivityBreakdown() {
  const { metrics } = useAnalyticsContext();

  const categories = metrics.activityCategories || [];

  return (
    <Card
      title="Focus Time by Category"
      subtitle={`${metrics.focusTimeFormatted} total across ${categories.length} ${categories.length === 1 ? 'category' : 'categories'}`}
      className="flex flex-col justify-between"
    >
      {categories.length === 0 ? (
        <div className="py-12 text-center text-slate-500 italic text-xs">
          <Activity className="w-8 h-8 mx-auto mb-2 text-slate-600 stroke-[1.5]" />
          No activity data available for this period.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Multi-segment stacked bar */}
          <div className="w-full h-3 bg-[#171C27] rounded-full overflow-hidden flex border border-white/[0.06]">
            {categories.map((cat, idx) => (
              <div
                key={cat.category}
                className={`h-full ${categoryColors[idx % categoryColors.length]} transition-all duration-500`}
                style={{ width: `${Math.max(2, cat.percentage)}%` }}
                title={`${cat.category}: ${cat.formattedTime} (${cat.percentage}%)`}
              />
            ))}
          </div>

          {/* List of categories */}
          <div className="space-y-2.5">
            {categories.map((cat, idx) => (
              <div key={cat.category} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      categoryColors[idx % categoryColors.length]
                    }`}
                  />
                  <span className="font-semibold text-white truncate">{cat.category}</span>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-slate-400">
                  <span>{cat.percentage}%</span>
                  <span className="font-bold text-slate-200">{cat.formattedTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

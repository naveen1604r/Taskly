import React from 'react';
import Card from '../common/Card';
import { useTaskContext } from '../../context/TaskContext';
import { getCategoryStats } from '../../utils/dashboardUtils';
import { Tag } from 'lucide-react';

export default function CategoryStats() {
  const { tasks } = useTaskContext();
  const categories = getCategoryStats(tasks);

  return (
    <Card
      title="Category Productivity"
      subtitle="Execution rates segmented by operational domain"
      action={<Tag className="w-4 h-4 text-purple-400" />}
    >
      {categories.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400 italic">
          No categories assigned to tasks yet.
        </div>
      ) : (
        <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
          {categories.map((cat) => (
            <div key={cat.category} className="space-y-1 text-xs">
              <div className="flex items-center justify-between text-slate-300 font-medium">
                <span className="font-semibold text-white">{cat.category}</span>
                <span className="font-mono text-slate-400">
                  {cat.completed}/{cat.total} ({cat.percentage}%)
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#171C27] rounded-full overflow-hidden border border-white/[0.04]">
                <div
                  className="h-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] rounded-full"
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

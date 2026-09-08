import React from 'react';
import Card from '../common/Card';
import { useAnalyticsContext } from '../../context/AnalyticsContext';
import { Tag, Clock, CheckCircle2 } from 'lucide-react';

export default function CategoryAnalysis() {
  const { metrics } = useAnalyticsContext();
  const categories = metrics.categoryStats || [];

  return (
    <Card
      title="Category Deep Dive"
      subtitle="Deliverables volume, completion rates, and focus time by operational area"
      action={<Tag className="w-4 h-4 text-[#7C3AED]" />}
    >
      {categories.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400 italic">
          No category data for the selected range.
        </div>
      ) : (
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {categories.map((cat) => {
            const focusHours = Math.floor(cat.focusMinutes / 60);
            const focusMins = cat.focusMinutes % 60;
            const focusLabel = focusHours > 0 ? `${focusHours}h ${focusMins}m` : `${focusMins}m`;

            return (
              <div
                key={cat.category}
                className="p-3 rounded-2xl bg-[#171C27] border border-white/[0.04] space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{cat.category}</span>
                  <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-[#06B6D4]">
                      <Clock className="w-3 h-3" />
                      <span>{focusLabel} focus</span>
                    </span>
                    <span className="text-white font-bold">
                      {cat.completed}/{cat.total} ({cat.completionRate}%)
                    </span>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-[#11151F] rounded-full overflow-hidden border border-white/[0.04]">
                  <div
                    className="h-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] rounded-full transition-all duration-500"
                    style={{ width: `${cat.completionRate}%` }}
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

import React, { useState } from 'react';
import Card from '../common/Card';
import { useAnalyticsContext } from '../../context/AnalyticsContext';
import { Hourglass, Flame, Zap, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TopTasks() {
  const { metrics } = useAnalyticsContext();
  const topTasks = metrics.topTasks || {
    mostTimeConsuming: [],
    mostFocused: [],
    fastestCompleted: [],
  };

  const [activeTab, setActiveTab] = useState('consuming'); // 'consuming' | 'focused' | 'fastest'

  const tabs = [
    { id: 'consuming', label: 'Most Time Consuming', icon: Hourglass, data: topTasks.mostTimeConsuming },
    { id: 'focused', label: 'Most Focused', icon: Flame, data: topTasks.mostFocused },
    { id: 'fastest', label: 'Fastest Completed', icon: Zap, data: topTasks.fastestCompleted },
  ];

  const currentList = tabs.find((t) => t.id === activeTab)?.data || [];

  return (
    <Card
      title="Top Deliverables"
      subtitle="Highest duration, most focused, and fastest executed tasks"
    >
      <div className="space-y-3">
        {/* Tab Selector */}
        <div className="flex items-center gap-1 p-1 bg-[#171C27] rounded-xl border border-white/[0.06] text-xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#7C3AED] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Task List */}
        {currentList.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 italic">
            No task records for this segment.
          </div>
        ) : (
          <div className="space-y-2">
            {currentList.map((task, index) => {
              const duration = Number(task.actualDuration || task.estimatedDuration || task.duration) || 30;
              const h = Math.floor(duration / 60);
              const m = duration % 60;
              const durationLabel = h > 0 ? `${h}h ${m}m` : `${m}m`;

              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#171C27] border border-white/[0.04] text-xs hover:border-white/[0.1] transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="w-5 h-5 rounded-full bg-white/[0.06] text-slate-400 font-mono font-bold flex items-center justify-center text-[10px] shrink-0">
                      {index + 1}
                    </span>
                    <Link
                      to={`/tasks/${task.id}`}
                      className="font-semibold text-white hover:text-[#c4b5fd] truncate"
                    >
                      {task.title}
                    </Link>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400 shrink-0">
                    <span className="text-[#06B6D4] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{durationLabel}</span>
                    </span>
                    <span className="capitalize">{task.category || 'General'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

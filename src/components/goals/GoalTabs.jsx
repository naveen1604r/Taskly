import React from 'react';
import { useGoalsContext } from '../../context/GoalsContext';
import { Target, CheckCircle2, Archive } from 'lucide-react';

export default function GoalTabs({ activeTab, setActiveTab }) {
  const { stats } = useGoalsContext();

  const tabs = [
    {
      id: 'active',
      label: 'Active',
      count: stats.activeGoalsCount,
      icon: Target,
    },
    {
      id: 'completed',
      label: 'Completed',
      count: stats.completedGoalsCount,
      icon: CheckCircle2,
    },
    {
      id: 'archived',
      label: 'Archived',
      count: stats.archivedGoalsCount,
      icon: Archive,
    },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#11151F] border border-white/[0.08] w-fit">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              isActive
                ? 'bg-[#7C3AED] text-white shadow-glow-primary'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                isActive ? 'bg-white/20 text-white' : 'bg-[#171C27] text-slate-400'
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

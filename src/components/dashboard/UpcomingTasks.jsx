import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import { useTaskContext } from '../../context/TaskContext';
import { getUpcomingTasks } from '../../utils/dashboardUtils';
import { Calendar, Clock, CheckCircle2, Circle, ArrowRight } from 'lucide-react';

export default function UpcomingTasks() {
  const { tasks, toggleTaskStatus } = useTaskContext();
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'tomorrow' | 'thisWeek'

  const { today, tomorrow, thisWeek, totalUpcoming } = getUpcomingTasks(tasks);

  const tabList = [
    { id: 'today', label: 'Today', count: today.length, data: today },
    { id: 'tomorrow', label: 'Tomorrow', count: tomorrow.length, data: tomorrow },
    { id: 'thisWeek', label: 'This Week', count: thisWeek.length, data: thisWeek },
  ];

  const currentTabData = tabList.find((t) => t.id === activeTab)?.data || [];

  return (
    <Card
      title="Upcoming Tasks"
      subtitle="Scheduled horizon across the coming days"
      action={
        <Link
          to="/calendar"
          className="text-xs font-semibold text-[#7C3AED] hover:text-[#c4b5fd] transition-colors flex items-center gap-1"
        >
          <span>Calendar</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      {/* Tab Switcher */}
      <div className="flex items-center gap-1.5 p-1 bg-[#171C27] rounded-xl border border-white/[0.06] mb-3 text-xs">
        {tabList.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-[#7C3AED] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-white/[0.06]'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Task List */}
      {currentTabData.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs italic">
          No tasks scheduled for {activeTab === 'thisWeek' ? 'later this week' : activeTab}.
        </div>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {currentTabData.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#171C27] hover:bg-[#1f2635] border border-white/[0.06] transition-all text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => toggleTaskStatus(task.id)}
                  className="text-slate-500 hover:text-[#7C3AED] transition-colors"
                >
                  <Circle className="w-4 h-4" />
                </button>
                <Link
                  to={`/tasks/${task.id}`}
                  className="font-medium text-white hover:text-[#c4b5fd] truncate"
                >
                  {task.title}
                </Link>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400 shrink-0 font-mono">
                {task.dueTime && <span>{task.dueTime}</span>}
                <span className="capitalize">{task.priority}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

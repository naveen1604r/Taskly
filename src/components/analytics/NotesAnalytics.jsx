import React from 'react';
import Card from '../common/Card';
import { useAnalyticsContext } from '../../context/AnalyticsContext';
import { FileText, Pin, Archive, Calendar } from 'lucide-react';

export default function NotesAnalytics() {
  const { metrics, dateRange } = useAnalyticsContext();

  const noteStats = [
    { label: 'Total Notes', count: metrics.totalNotesCount, icon: FileText, color: 'text-indigo-400' },
    { label: `In ${dateRange.label}`, count: metrics.notesCreated, icon: Calendar, color: 'text-[#06B6D4]' },
    { label: 'Pinned Priority', count: metrics.pinnedNotesCount, icon: Pin, color: 'text-[#F59E0B]' },
    { label: 'Archived Notes', count: metrics.archivedNotesCount, icon: Archive, color: 'text-slate-400' },
  ];

  return (
    <Card
      title="Knowledge & Notes Overview"
      subtitle="Insights into captured study, design, and code thoughts"
      className="flex flex-col justify-between"
    >
      <div className="grid grid-cols-2 gap-3 py-1">
        {noteStats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="p-3 rounded-xl bg-[#171C27] border border-white/[0.06] flex items-center gap-3"
            >
              <div className="p-2 rounded-lg bg-white/[0.04] shrink-0">
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-[#94A3B8] block truncate">{item.label}</span>
                <span className="text-base font-bold text-white leading-none mt-0.5 block">
                  {item.count}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

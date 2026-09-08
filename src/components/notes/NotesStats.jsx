import React from 'react';
import { useNotesContext } from '../../context/NotesContext';
import { StatCardItem } from '../dashboard/StatCard';
import { FileText, Pin, Calendar, Archive } from 'lucide-react';

export default function NotesStats() {
  const { metrics } = useNotesContext();

  const cards = [
    {
      label: 'Total Notes',
      value: String(metrics.totalNotes),
      caption: 'All notebook entries',
      icon: FileText,
      accentColor: 'bg-[#7C3AED]/10 text-[#7C3AED] border-[#7C3AED]/20',
      badgeText: 'Total',
      badgeColor: 'bg-[#7C3AED]/15 text-[#c4b5fd]',
    },
    {
      label: 'Pinned',
      value: String(metrics.pinnedNotesCount),
      caption: 'Quick priority access',
      icon: Pin,
      accentColor: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
      badgeText: 'Pinned',
      badgeColor: 'bg-[#F59E0B]/15 text-[#F59E0B]',
    },
    {
      label: 'This Week',
      value: String(metrics.thisWeekNotesCount),
      caption: 'Created past 7 days',
      icon: Calendar,
      accentColor: 'bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/20',
      badgeText: 'Recent',
      badgeColor: 'bg-[#06B6D4]/15 text-[#06B6D4]',
    },
    {
      label: 'Archived',
      value: String(metrics.archivedNotesCount),
      caption: 'Stored reference notes',
      icon: Archive,
      accentColor: 'bg-slate-700/30 text-slate-300 border-white/[0.08]',
      badgeText: 'Saved',
      badgeColor: 'bg-slate-800 text-slate-300',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card) => (
        <StatCardItem key={card.label} {...card} />
      ))}
    </div>
  );
}

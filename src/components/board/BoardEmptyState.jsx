import React from 'react';
import { Circle, Play, CheckCircle2, Inbox } from 'lucide-react';

export default function BoardEmptyState({ columnId }) {
  const emptyConfigs = {
    pending: {
      title: 'Nothing waiting here',
      subtitle: 'All incoming deliverables are active or completed.',
      icon: Inbox,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    in_progress: {
      title: 'No active tasks',
      subtitle: 'Drag tasks here or start a focus session to begin execution.',
      icon: Play,
      color: 'text-[#06B6D4] bg-[#06B6D4]/10 border-[#06B6D4]/20',
    },
    completed: {
      title: 'No completed tasks yet',
      subtitle: 'Finished tasks will be collected and celebrated here.',
      icon: CheckCircle2,
      color: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20',
    },
  };

  const config = emptyConfigs[columnId] || emptyConfigs.pending;
  const Icon = config.icon;

  return (
    <div className="py-10 px-4 text-center border-2 border-dashed border-white/[0.06] rounded-2xl flex flex-col items-center justify-center">
      <div className={`p-2.5 rounded-2xl border mb-2.5 ${config.color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-xs sm:text-sm font-semibold text-white">{config.title}</p>
      <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">{config.subtitle}</p>
    </div>
  );
}

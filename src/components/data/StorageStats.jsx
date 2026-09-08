import React, { useMemo } from 'react';
import { getStorageStats } from '../../utils/dataManagerUtils';
import {
  HardDrive,
  CheckSquare,
  FolderKanban,
  FileText,
  Target,
  Repeat,
  LayoutTemplate,
  Flame,
  Bell,
  Activity,
  Settings,
  LayoutDashboard,
  Filter,
} from 'lucide-react';

const iconMap = {
  CheckSquare,
  FolderKanban,
  FileText,
  Target,
  Repeat,
  LayoutTemplate,
  Flame,
  Bell,
  Activity,
  Settings,
  LayoutDashboard,
  Filter,
};

export default function StorageStats() {
  const stats = useMemo(() => getStorageStats(), []);

  return (
    <div className="space-y-4">
      {/* Total Storage Summary Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#11151F] border border-white/[0.08] shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-[#7C3AED]/15 text-[#7C3AED] border border-[#7C3AED]/25">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Local Browser Storage</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Approximate space utilized by Taskly in your browser's persistent storage
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#171C27] px-4 py-2 rounded-2xl border border-white/[0.06] self-start sm:self-auto">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">
              Total Storage
            </span>
            <span className="text-base sm:text-lg font-bold text-white font-mono">
              {stats.formattedTotal}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {stats.categories.map((cat) => {
          const Icon = iconMap[cat.icon] || HardDrive;
          return (
            <div
              key={cat.id}
              className="p-3 rounded-2xl bg-[#11151F] border border-white/[0.06] hover:border-white/[0.12] transition-all flex flex-col justify-between space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 truncate max-w-[120px]">
                  {cat.label}
                </span>
                <div className="p-1.5 rounded-lg bg-white/[0.04] text-slate-400">
                  <Icon className="w-3.5 h-3.5 text-[#7C3AED]" />
                </div>
              </div>

              <div className="flex items-baseline justify-between pt-1 border-t border-white/[0.03]">
                <span className="text-lg font-bold text-white font-mono">
                  {cat.count} {cat.count === 1 ? 'item' : 'items'}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {cat.formattedSize}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

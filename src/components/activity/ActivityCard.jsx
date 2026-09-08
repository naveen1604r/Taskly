import React, { useState, useRef, useEffect } from 'react';
import { useActivityContext } from '../../context/ActivityContext';
import { useTaskContext } from '../../context/TaskContext';
import { formatDuration, formatTimeDisplay } from '../../utils/activityUtils';
import {
  Code,
  BookOpen,
  Palette,
  Briefcase,
  User,
  Users,
  Dumbbell,
  Tag,
  Clock,
  CheckSquare,
  MoreVertical,
  Edit2,
  Trash2,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

const categoryConfig = {
  Coding: { icon: Code, color: 'text-[#7C3AED] bg-[#7C3AED]/10 border-[#7C3AED]/20' },
  Study: { icon: BookOpen, color: 'text-[#06B6D4] bg-[#06B6D4]/10 border-[#06B6D4]/20' },
  'UI/UX': { icon: Palette, color: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20' },
  Work: { icon: Briefcase, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  Personal: { icon: User, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  Meeting: { icon: Users, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  Exercise: { icon: Dumbbell, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  Other: { icon: Sparkles, color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' },
};

export default function ActivityCard({ activity }) {
  const { openEditActivityModal, openDeleteActivityModal } = useActivityContext();
  const { tasks } = useTaskContext();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const catMeta = categoryConfig[activity.category] || {
    icon: Tag,
    color: 'text-[#7C3AED] bg-[#7C3AED]/10 border-[#7C3AED]/20',
  };
  const Icon = catMeta.icon;

  // Find related task if any
  const relatedTask = activity.relatedTaskId
    ? tasks.find((t) => t.id === activity.relatedTaskId)
    : null;

  // Time format
  const startFmt = formatTimeDisplay(activity.startTime);
  const endFmt = formatTimeDisplay(activity.endTime);
  const timeRange = startFmt && endFmt ? `${startFmt} → ${endFmt}` : startFmt || '';

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="relative p-4 sm:p-5 rounded-2xl bg-[#11151F] border border-white/[0.08] hover:border-white/[0.16] shadow-card hover:shadow-hover transition-all duration-200 group">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        {/* Left: Category Icon & Content */}
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          {/* Category Icon */}
          <div
            className={`p-2.5 rounded-xl border shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-105 ${catMeta.color}`}
          >
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <h4 className="text-base font-semibold text-white tracking-tight leading-snug">
              {activity.title}
            </h4>

            {activity.description && (
              <p className="text-xs sm:text-sm text-[#94A3B8] mt-1 leading-relaxed line-clamp-2">
                {activity.description}
              </p>
            )}

            {/* Time & Duration & Category Badges */}
            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-[#94A3B8]">
              {timeRange && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#171C27] border border-white/[0.08] text-slate-200 font-medium">
                  <Clock className="w-3 h-3 text-[#06B6D4]" />
                  <span>{timeRange}</span>
                </span>
              )}

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#171C27] border border-white/[0.08] text-slate-300">
                <span>⏱ {formatDuration(activity.duration)}</span>
              </span>

              {activity.category && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-[11px] font-semibold ${catMeta.color}`}>
                  {activity.category}
                </span>
              )}
            </div>

            {/* Related Task Badge */}
            {relatedTask && (
              <div className="mt-2.5 pt-2.5 border-t border-white/[0.04] flex items-center gap-1.5 text-xs text-[#94A3B8]">
                <CheckSquare className="w-3.5 h-3.5 text-[#22C55E]" />
                <span className="text-[11px] text-slate-400">Related Task:</span>
                <Link
                  to="/tasks"
                  className="font-medium text-[#c4b5fd] hover:text-white hover:underline truncate max-w-xs"
                  title={relatedTask.title}
                >
                  {relatedTask.title}
                </Link>
              </div>
            )}

            {/* Notes if any */}
            {activity.notes && (
              <p className="text-[11px] text-slate-400 italic mt-2 bg-[#171C27]/60 p-2 rounded-lg border border-white/[0.04]">
                Note: {activity.notes}
              </p>
            )}
          </div>
        </div>

        {/* Right: Three-Dot Menu */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors focus:outline-none"
            aria-label="More actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-36 bg-[#171C27] border border-white/[0.12] rounded-xl shadow-hover py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  openEditActivityModal(activity);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:text-white hover:bg-white/[0.06] transition-colors text-left"
              >
                <Edit2 className="w-3.5 h-3.5 text-[#06B6D4]" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  openDeleteActivityModal(activity);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors text-left"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

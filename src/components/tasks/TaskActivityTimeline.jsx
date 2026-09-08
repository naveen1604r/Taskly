import React, { useMemo } from 'react';
import { useFocusContext } from '../../context/FocusContext';
import { useActivityContext } from '../../context/ActivityContext';
import {
  Clock,
  Flame,
  CheckCircle2,
  Calendar,
  Sparkles,
  Layers,
  History,
} from 'lucide-react';

export default function TaskActivityTimeline({ task }) {
  const { focusSessions } = useFocusContext();
  const { activities } = useActivityContext();

  const timelineEvents = useMemo(() => {
    if (!task) return [];

    const events = [];

    // 1. Task Creation Event
    if (task.createdAt) {
      events.push({
        id: `created-${task.createdAt}`,
        type: 'task_created',
        title: 'Task created',
        description: `Created with "${task.priority}" priority in ${task.category || 'General'}`,
        timestamp: new Date(task.createdAt),
        icon: <Calendar className="w-3.5 h-3.5 text-[#06B6D4]" />,
        badge: 'Created',
        color: 'border-[#06B6D4]/30 bg-[#06B6D4]/10 text-[#06B6D4]',
      });
    }

    // 2. Task Completion Event
    if (task.completedAt) {
      events.push({
        id: `completed-${task.completedAt}`,
        type: 'task_completed',
        title: 'Task marked completed',
        description: 'Main task status updated to completed',
        timestamp: new Date(task.completedAt),
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />,
        badge: 'Completed',
        color: 'border-[#22C55E]/30 bg-[#22C55E]/10 text-[#22C55E]',
      });
    }

    // 3. Subtasks Created & Completed Events
    const subtasks = Array.isArray(task.subtasks) ? task.subtasks : [];
    subtasks.forEach((st) => {
      if (st.createdAt && st.createdAt !== task.createdAt) {
        events.push({
          id: `st-created-${st.id}`,
          type: 'subtask_created',
          title: `Subtask added: "${st.title}"`,
          description: `Checklist item added with ${st.priority || 'medium'} priority`,
          timestamp: new Date(st.createdAt),
          icon: <Layers className="w-3.5 h-3.5 text-[#7C3AED]" />,
          badge: 'Subtask',
          color: 'border-[#7C3AED]/30 bg-[#7C3AED]/10 text-[#c4b5fd]',
        });
      }

      if (st.completedAt) {
        events.push({
          id: `st-done-${st.id}`,
          type: 'subtask_completed',
          title: `Subtask completed: "${st.title}"`,
          description: 'Marked finished in checklist',
          timestamp: new Date(st.completedAt),
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />,
          badge: 'Done',
          color: 'border-[#22C55E]/30 bg-[#22C55E]/10 text-[#22C55E]',
        });
      }
    });

    // 4. Linked Focus Sessions
    const linkedFocus = Array.isArray(focusSessions)
      ? focusSessions.filter((s) => s.taskId === task.id)
      : [];
    linkedFocus.forEach((s) => {
      events.push({
        id: s.id || `focus-${s.startTime}`,
        type: 'focus_session',
        title: 'Focus session completed',
        description: `Dedicated ${s.duration} min deep focus session`,
        timestamp: new Date(s.endTime || s.startTime || s.createdAt || Date.now()),
        icon: <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />,
        badge: `${s.duration}m Focus`,
        color: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
      });
    });

    // 5. General ActivityContext logs linked to this task
    const linkedActivities = Array.isArray(activities)
      ? activities.filter((a) => a.relatedTaskId === task.id)
      : [];
    linkedActivities.forEach((a) => {
      events.push({
        id: a.id,
        type: 'activity_log',
        title: a.title,
        description: a.description || `Logged activity: ${a.duration} mins`,
        timestamp: new Date(a.createdAt || `${a.date}T${a.startTime || '12:00'}`),
        icon: <Clock className="w-3.5 h-3.5 text-slate-300" />,
        badge: 'Activity',
        color: 'border-white/[0.1] bg-[#171C27] text-slate-300',
      });
    });

    // Sort descending (newest first)
    events.sort((a, b) => b.timestamp - a.timestamp);

    return events;
  }, [task, focusSessions, activities]);

  // Format date helper
  const formatTimeAgo = (date) => {
    try {
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (diffMins < 1) return `Just now (${timeStr})`;
      if (diffMins < 60) return `${diffMins}m ago (${timeStr})`;
      if (diffHours < 24) return `Today at ${timeStr}`;
      if (diffDays === 1) return `Yesterday at ${timeStr}`;
      return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;
    } catch {
      return '';
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-[#11151F] border border-white/[0.08] shadow-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#06B6D4]" />
          <h3 className="text-sm font-semibold text-white">Activity Timeline</h3>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          {timelineEvents.length} {timelineEvents.length === 1 ? 'event' : 'events'}
        </span>
      </div>

      {timelineEvents.length === 0 ? (
        <div className="py-6 text-center text-slate-500 text-xs italic">
          No activity recorded yet for this task.
        </div>
      ) : (
        <div className="relative pl-6 border-l border-white/[0.08] space-y-4 my-2">
          {timelineEvents.map((event) => (
            <div key={event.id} className="relative group">
              {/* Dot on line */}
              <div className="absolute -left-[31px] top-1 w-5 h-5 rounded-full bg-[#11151F] border border-white/[0.12] flex items-center justify-center">
                {event.icon}
              </div>

              {/* Event Content */}
              <div className="p-3 rounded-xl bg-[#171C27] border border-white/[0.06] hover:border-white/[0.14] transition-all">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-semibold text-white truncate">
                    {event.title}
                  </span>
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0 ${event.color}`}
                  >
                    {event.badge}
                  </span>
                </div>

                {event.description && (
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {event.description}
                  </p>
                )}

                <div className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-500 font-mono">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{formatTimeAgo(event.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

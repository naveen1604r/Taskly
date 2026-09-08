import React, { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { useProjectContext } from '../../context/ProjectContext';
import { isTaskBlocked } from '../../utils/dependencyUtils';
import { getTodayDateString } from '../../utils/taskStorage';
import {
  Inbox,
  Clock,
  Calendar,
  Plus,
  Lock,
  CheckCircle2,
  FolderKanban,
  X,
  ChevronRight,
} from 'lucide-react';

export default function UnscheduledTasks({ isOpen, onClose, onTaskClick }) {
  const { tasks, updateTask } = useTaskContext();
  const { getProject } = useProjectContext();

  const [scheduleTaskId, setScheduleTaskId] = useState(null);
  const [scheduleDate, setScheduleDate] = useState(getTodayDateString());
  const [scheduleTime, setScheduleTime] = useState('09:00');

  if (!isOpen) return null;

  const unscheduledTasks = tasks.filter(
    (t) => !t.plannedDate && t.status !== 'completed'
  );

  const handleQuickSchedule = (taskId) => {
    updateTask(taskId, {
      plannedDate: scheduleDate,
      plannedStartTime: scheduleTime,
    });
    setScheduleTaskId(null);
  };

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md h-full bg-[#11151F] border-l border-white/[0.1] p-5 shadow-2xl flex flex-col space-y-4 animate-in slide-in-from-right duration-200 text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#7C3AED]/15 text-[#7C3AED]">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Unscheduled Deliverables</h3>
              <p className="text-xs text-slate-400">
                Drag items onto the calendar or schedule them directly
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
          {unscheduledTasks.length === 0 ? (
            <div className="py-16 text-center text-slate-500 italic space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#22C55E] mx-auto opacity-60" />
              <p>All active tasks are currently scheduled on your calendar.</p>
            </div>
          ) : (
            unscheduledTasks.map((task) => {
              const isBlocked = isTaskBlocked(task, tasks);
              const linkedProject = task.projectId ? getProject(task.projectId) : null;
              const duration = Number(task.estimatedDuration || task.duration) || 30;

              return (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', task.id);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  className="p-3 rounded-2xl bg-[#171C27] border border-white/[0.06] hover:border-white/[0.14] space-y-2 cursor-grab active:cursor-grabbing transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span
                        onClick={() => onTaskClick && onTaskClick(task)}
                        className="font-bold text-white hover:text-[#c4b5fd] cursor-pointer truncate block"
                      >
                        {task.title}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                        <span className="capitalize">{task.priority || 'medium'}</span>
                        <span>•</span>
                        <span>{duration}m</span>
                        {linkedProject && (
                          <>
                            <span>•</span>
                            <span className="text-[#7C3AED] truncate max-w-[100px]">
                              {linkedProject.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setScheduleTaskId(scheduleTaskId === task.id ? null : task.id)
                      }
                      className="px-2.5 py-1 rounded-xl bg-[#7C3AED]/15 hover:bg-[#7C3AED] text-[#c4b5fd] hover:text-white border border-[#7C3AED]/30 text-[11px] font-semibold transition-colors shrink-0"
                    >
                      Schedule
                    </button>
                  </div>

                  {/* Inline Schedule Controls */}
                  {scheduleTaskId === task.id && (
                    <div className="p-2.5 rounded-xl bg-[#11151F] border border-white/[0.08] space-y-2 pt-2 animate-in fade-in duration-100">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 font-semibold block">Date</label>
                          <input
                            type="date"
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            className="w-full bg-[#171C27] border border-white/[0.08] rounded-lg px-2 py-1 text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 font-semibold block">Time</label>
                          <input
                            type="time"
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                            className="w-full bg-[#171C27] border border-white/[0.08] rounded-lg px-2 py-1 text-white focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setScheduleTaskId(null)}
                          className="px-2 py-0.5 text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickSchedule(task.id)}
                          className="px-3 py-1 rounded-lg bg-[#7C3AED] text-white font-bold"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

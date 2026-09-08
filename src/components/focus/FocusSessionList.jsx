import React from 'react';
import Card from '../common/Card';
import { useFocusContext } from '../../context/FocusContext';
import { getSessionsForDate } from '../../utils/focusUtils';
import { getTodayDateString } from '../../utils/taskStorage';
import { CheckCircle2, Clock, Coffee, Flame, AlertCircle } from 'lucide-react';

export default function FocusSessionList() {
  const { focusSessions } = useFocusContext();
  const todayStr = getTodayDateString();

  const todaySessions = getSessionsForDate(focusSessions, todayStr);

  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <Card
      title="Today's Sessions"
      subtitle={`${todaySessions.length} recorded blocks today`}
      className="flex flex-col justify-between border-white/[0.08]"
    >
      {todaySessions.length === 0 ? (
        <div className="py-8 text-center text-slate-500 italic text-xs">
          No focus sessions recorded yet today.
        </div>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {todaySessions.map((s) => {
            const isFocus = s.sessionType === 'focus';
            const isDone = s.completed;

            return (
              <div
                key={s.id}
                className="p-2.5 rounded-xl bg-[#171C27] border border-white/[0.04] flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    className={`p-1.5 rounded-lg shrink-0 ${
                      isFocus
                        ? 'bg-[#7C3AED]/15 text-[#c4b5fd]'
                        : 'bg-[#06B6D4]/15 text-[#06B6D4]'
                    }`}
                  >
                    {isFocus ? <Flame className="w-3.5 h-3.5" /> : <Coffee className="w-3.5 h-3.5" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-white truncate">{s.taskTitle}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span className="capitalize font-medium text-slate-300">
                        {isFocus ? 'Focus Block' : 'Break'}
                      </span>
                      <span>•</span>
                      <span>{s.duration} min</span>
                      {s.startTime && (
                        <>
                          <span>•</span>
                          <span className="font-mono">{formatTime(s.startTime)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  {isDone ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#22C55E] font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Done</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Stopped</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

import React from 'react';
import Button from '../common/Button';
import { useFocusContext } from '../../context/FocusContext';
import {
  Play,
  Pause,
  Square,
  CheckCircle2,
  FastForward,
  RotateCcw,
  Coffee,
  Flame,
} from 'lucide-react';

export default function FocusControls() {
  const {
    timerMode,
    timerStatus,
    startFocus,
    pauseFocus,
    resumeFocus,
    advanceToBreak,
    skipBreak,
    advanceToFocus,
    resetFocus,
    setIsStopModalOpen,
    setIsCompleteModalOpen,
    selectedTask,
    setIsTaskSelectorOpen,
  } = useFocusContext();

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
      {/* 1. IDLE State */}
      {timerStatus === 'idle' && (
        <>
          <button
            type="button"
            onClick={() => {
              if (!selectedTask) {
                setIsTaskSelectorOpen(true);
              } else {
                startFocus();
              }
            }}
            className="px-8 py-3 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-sm sm:text-base transition-all shadow-glow-primary flex items-center gap-2"
            aria-label="Start focus session"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{selectedTask ? 'Start Focus' : 'Choose Task & Focus'}</span>
          </button>

          <button
            type="button"
            onClick={advanceToBreak}
            className="px-4 py-3 rounded-2xl bg-[#171C27] hover:bg-[#1f2635] text-slate-300 hover:text-white font-semibold text-xs sm:text-sm border border-white/[0.08] transition-all flex items-center gap-2"
            title="Take a quick break"
          >
            <Coffee className="w-4 h-4 text-[#06B6D4]" />
            <span>Take Break</span>
          </button>
        </>
      )}

      {/* 2. RUNNING State */}
      {timerStatus === 'running' && (
        <>
          <button
            type="button"
            onClick={pauseFocus}
            className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-all shadow-sm flex items-center gap-2"
            aria-label="Pause timer"
          >
            <Pause className="w-4 h-4 fill-current" />
            <span>Pause</span>
          </button>

          <button
            type="button"
            onClick={() => setIsStopModalOpen(true)}
            className="px-4 py-3 rounded-2xl bg-[#171C27] hover:bg-[#EF4444]/15 text-slate-300 hover:text-[#EF4444] border border-white/[0.08] hover:border-[#EF4444]/30 font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5"
            aria-label="Stop focus session"
          >
            <Square className="w-4 h-4" />
            <span>Stop</span>
          </button>

          {selectedTask && (
            <button
              type="button"
              onClick={() => setIsCompleteModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-1.5"
              aria-label="Complete task from focus mode"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Task</span>
            </button>
          )}
        </>
      )}

      {/* 3. PAUSED State */}
      {timerStatus === 'paused' && (
        <>
          <button
            type="button"
            onClick={resumeFocus}
            className="px-7 py-3 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-sm transition-all shadow-glow-primary flex items-center gap-2"
            aria-label="Resume timer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Resume</span>
          </button>

          <button
            type="button"
            onClick={() => setIsStopModalOpen(true)}
            className="px-4 py-3 rounded-2xl bg-[#171C27] hover:bg-[#EF4444]/15 text-slate-300 hover:text-[#EF4444] border border-white/[0.08] hover:border-[#EF4444]/30 font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5"
            aria-label="Stop focus session"
          >
            <Square className="w-4 h-4" />
            <span>Stop</span>
          </button>

          {selectedTask && (
            <button
              type="button"
              onClick={() => setIsCompleteModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-1.5"
              aria-label="Complete task from focus mode"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Task</span>
            </button>
          )}
        </>
      )}

      {/* 4. COMPLETED State */}
      {timerStatus === 'completed' && (
        <div className="flex flex-wrap items-center gap-2.5">
          {timerMode === 'focus' ? (
            <>
              <button
                type="button"
                onClick={advanceToBreak}
                className="px-6 py-3 rounded-2xl bg-[#06B6D4] hover:bg-cyan-600 text-white font-bold text-sm transition-all shadow-sm flex items-center gap-2"
              >
                <Coffee className="w-4 h-4" />
                <span>Start Break</span>
              </button>

              <button
                type="button"
                onClick={skipBreak}
                className="px-4 py-3 rounded-2xl bg-[#171C27] hover:bg-[#1f2635] text-slate-300 hover:text-white font-semibold text-xs sm:text-sm border border-white/[0.08] transition-all flex items-center gap-1.5"
              >
                <FastForward className="w-4 h-4" />
                <span>Skip Break</span>
              </button>

              {selectedTask && (
                <button
                  type="button"
                  onClick={() => setIsCompleteModalOpen(true)}
                  className="px-4 py-3 rounded-2xl bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Task</span>
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={advanceToFocus}
              className="px-7 py-3 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-sm transition-all shadow-glow-primary flex items-center gap-2"
            >
              <Flame className="w-4 h-4" />
              <span>Start Next Focus Block</span>
            </button>
          )}

          <button
            type="button"
            onClick={resetFocus}
            className="p-3 rounded-2xl bg-[#171C27] hover:bg-[#1f2635] text-slate-400 hover:text-white border border-white/[0.08] transition-all"
            title="Reset timer"
            aria-label="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

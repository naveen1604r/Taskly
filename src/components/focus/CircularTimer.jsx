import React from 'react';
import { formatFocusTime, calculateFocusProgress } from '../../utils/focusUtils';
import { Flame, Coffee, Sparkles } from 'lucide-react';

export default function CircularTimer({
  remainingSeconds,
  currentModeTotalSeconds,
  timerMode,
  timerStatus,
  currentSessionNumber,
  sessionsBeforeLongBreak = 4,
}) {
  const elapsed = Math.max(0, currentModeTotalSeconds - remainingSeconds);
  const progressPercent = calculateFocusProgress(elapsed, currentModeTotalSeconds);

  // SVG Geometry
  const size = 280;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Colors based on mode
  const modeConfig = {
    focus: {
      label: 'FOCUS BLOCK',
      color: '#7C3AED',
      glow: 'shadow-[0_0_30px_rgba(124,58,237,0.35)]',
      bgGlow: 'bg-[#7C3AED]/10 text-[#7C3AED] border-[#7C3AED]/30',
      icon: Flame,
    },
    shortBreak: {
      label: 'SHORT BREAK',
      color: '#06B6D4',
      glow: 'shadow-[0_0_30px_rgba(6,182,212,0.35)]',
      bgGlow: 'bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/30',
      icon: Coffee,
    },
    longBreak: {
      label: 'LONG BREAK',
      color: '#22C55E',
      glow: 'shadow-[0_0_30px_rgba(34,197,94,0.35)]',
      bgGlow: 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30',
      icon: Sparkles,
    },
  }[timerMode] || {
    label: 'FOCUS',
    color: '#7C3AED',
    glow: 'shadow-glow-primary',
    bgGlow: 'bg-[#7C3AED]/10 text-[#7C3AED] border-[#7C3AED]/30',
    icon: Flame,
  };

  const IconComponent = modeConfig.icon;

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      {/* SVG Circular Progress Meter */}
      <div className="relative flex items-center justify-center">
        <svg
          width={size}
          height={size}
          className="transform -rotate-90 transition-all duration-300"
          aria-label={`Timer countdown: ${formatFocusTime(remainingSeconds)} remaining`}
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#171C27"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Progress Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={modeConfig.color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none px-4">
          {/* Mode Pill */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border mb-2 ${modeConfig.bgGlow}`}
          >
            <IconComponent className="w-3.5 h-3.5" />
            <span>{modeConfig.label}</span>
          </span>

          {/* Large Countdown */}
          <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-mono my-1 drop-shadow-md">
            {formatFocusTime(remainingSeconds)}
          </div>

          {/* Session Counter */}
          <div className="text-xs font-medium text-slate-400 mt-1 flex items-center gap-1">
            <span>Session</span>
            <strong className="text-white font-semibold">{currentSessionNumber}</strong>
            <span>of</span>
            <strong className="text-slate-300">{sessionsBeforeLongBreak}</strong>
          </div>

          {/* Timer Status Tag */}
          <div className="mt-2 text-[11px] font-semibold uppercase tracking-wider">
            {timerStatus === 'running' && (
              <span className="text-[#22C55E] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                Active
              </span>
            )}
            {timerStatus === 'paused' && (
              <span className="text-amber-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Paused
              </span>
            )}
            {timerStatus === 'completed' && (
              <span className="text-[#06B6D4] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]" />
                Block Done
              </span>
            )}
            {timerStatus === 'idle' && (
              <span className="text-slate-500">Ready</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

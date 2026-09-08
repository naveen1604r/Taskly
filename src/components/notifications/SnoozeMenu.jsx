import React, { useState } from 'react';
import { Clock, Calendar, Check, X } from 'lucide-react';
import { getOffsetDateString } from '../../utils/taskStorage';

export default function SnoozeMenu({ isOpen, onClose, onSnooze }) {
  const [isCustom, setIsCustom] = useState(false);
  const [customDate, setCustomDate] = useState(() => getOffsetDateString(1));
  const [customTime, setCustomTime] = useState('09:00');

  if (!isOpen) return null;

  const quickOptions = [
    { id: '10m', label: '10 minutes' },
    { id: '30m', label: '30 minutes' },
    { id: '1h', label: '1 hour' },
    { id: 'tomorrow', label: 'Tomorrow morning (9:00 AM)' },
  ];

  const handleSelectQuick = (optId) => {
    onSnooze(optId);
    onClose();
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customDate) return;
    onSnooze('custom', customDate, customTime);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-[#11151F] border border-white/[0.1] rounded-3xl p-5 shadow-2xl space-y-3 animate-in zoom-in-95 duration-150 text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#06B6D4]" />
            <h4 className="font-bold text-white text-sm">Snooze Reminder</h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isCustom ? (
          <div className="space-y-1.5 pt-1">
            {quickOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectQuick(opt.id)}
                className="w-full text-left p-2.5 rounded-xl bg-[#171C27] hover:bg-[#7C3AED]/20 border border-white/[0.04] hover:border-[#7C3AED]/40 text-slate-300 hover:text-white font-medium transition-all flex items-center justify-between"
              >
                <span>{opt.label}</span>
                <Clock className="w-3.5 h-3.5 text-slate-500" />
              </button>
            ))}

            <button
              type="button"
              onClick={() => setIsCustom(true)}
              className="w-full text-left p-2.5 rounded-xl bg-[#171C27] hover:bg-white/[0.08] border border-white/[0.04] text-[#06B6D4] font-bold transition-all flex items-center justify-between mt-2"
            >
              <span>Custom Date & Time...</span>
              <Calendar className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="space-y-3 pt-1">
            <div>
              <label className="text-[10px] text-slate-400 font-semibold uppercase block">
                Snooze Date
              </label>
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                required
                className="w-full bg-[#171C27] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-semibold uppercase block">
                Snooze Time
              </label>
              <input
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                required
                className="w-full bg-[#171C27] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={() => setIsCustom(false)}
                className="text-slate-400 hover:text-white"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold transition-colors"
              >
                Confirm Snooze
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

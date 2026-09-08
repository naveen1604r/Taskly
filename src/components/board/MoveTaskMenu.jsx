import React, { useState, useRef, useEffect } from 'react';
import { useBoardContext } from '../../context/BoardContext';
import { MoreHorizontal, ArrowRightLeft, Check, Circle, CheckCircle2, Play } from 'lucide-react';

export default function MoveTaskMenu({ task, onOpenDetails, onEdit, onDelete }) {
  const { moveTaskStatus } = useBoardContext();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleMove = (targetStatus, e) => {
    e.stopPropagation();
    moveTaskStatus(task.id, targetStatus);
    setIsOpen(false);
  };

  const currentStatus = task.status || 'pending';

  return (
    <div ref={menuRef} className="relative inline-block" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
        aria-label="Task actions and status movement menu"
        aria-expanded={isOpen}
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1 w-48 bg-[#11151F] border border-white/[0.1] rounded-2xl p-1.5 shadow-2xl z-40 text-xs animate-in zoom-in-95 duration-100"
          role="menu"
        >
          <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-white/[0.04]">
            Move Status
          </div>

          <div className="space-y-0.5 my-1">
            <button
              type="button"
              onClick={(e) => handleMove('pending', e)}
              disabled={currentStatus === 'pending'}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-colors text-left ${
                currentStatus === 'pending'
                  ? 'bg-amber-500/10 text-amber-300 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <span>Pending</span>
              {currentStatus === 'pending' && <Check className="w-3.5 h-3.5 text-amber-400" />}
            </button>

            <button
              type="button"
              onClick={(e) => handleMove('in_progress', e)}
              disabled={currentStatus === 'in_progress'}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-colors text-left ${
                currentStatus === 'in_progress'
                  ? 'bg-cyan-500/10 text-cyan-300 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <span>In Progress</span>
              {currentStatus === 'in_progress' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
            </button>

            <button
              type="button"
              onClick={(e) => handleMove('completed', e)}
              disabled={currentStatus === 'completed'}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-colors text-left ${
                currentStatus === 'completed'
                  ? 'bg-emerald-500/10 text-emerald-300 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <span>Completed</span>
              {currentStatus === 'completed' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          </div>

          <div className="border-t border-white/[0.06] pt-1 mt-1 space-y-0.5">
            {onOpenDetails && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onOpenDetails();
                }}
                className="w-full px-2.5 py-1.5 rounded-xl text-left text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                View Details
              </button>
            )}

            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onEdit();
                }}
                className="w-full px-2.5 py-1.5 rounded-xl text-left text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                Edit Task
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onDelete();
                }}
                className="w-full px-2.5 py-1.5 rounded-xl text-left text-[#EF4444] hover:bg-[#EF4444]/15 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useFocusContext } from '../../context/FocusContext';
import { formatDurationMinutes } from '../../utils/focusUtils';
import { Square, AlertCircle, Save, Trash2 } from 'lucide-react';

export default function StopFocusModal() {
  const { isStopModalOpen, setIsStopModalOpen, stopFocus, elapsedSeconds, selectedTask } =
    useFocusContext();

  if (!isStopModalOpen) return null;

  const elapsedMins = Math.round(elapsedSeconds / 60);

  return (
    <Modal
      isOpen={isStopModalOpen}
      onClose={() => setIsStopModalOpen(false)}
      title="Stop this focus session?"
      subtitle={`Active time elapsed: ${formatDurationMinutes(elapsedMins)}`}
      maxWidth="max-w-md"
    >
      <div className="space-y-4 text-xs sm:text-sm text-slate-300">
        <div className="p-3.5 rounded-xl bg-[#171C27] border border-white/[0.06] space-y-1.5">
          <div className="font-semibold text-white truncate">
            Task: {selectedTask?.title || 'General Focus Block'}
          </div>
          <p className="text-xs text-slate-400">
            Would you like to save the time you've spent so far, or discard this session?
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsStopModalOpen(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>

          <button
            type="button"
            onClick={() => stopFocus(false)}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] border border-[#EF4444]/30 transition-colors flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Stop & Discard</span>
          </button>

          <button
            type="button"
            onClick={() => stopFocus(true)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] text-white transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Stop & Save</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

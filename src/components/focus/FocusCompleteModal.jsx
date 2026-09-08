import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useFocusContext } from '../../context/FocusContext';
import { formatDurationMinutes } from '../../utils/focusUtils';
import { CheckCircle2, Trophy } from 'lucide-react';

export default function FocusCompleteModal() {
  const { isCompleteModalOpen, setIsCompleteModalOpen, completeTaskFromFocus, elapsedSeconds, selectedTask } =
    useFocusContext();

  if (!isCompleteModalOpen || !selectedTask) return null;

  const elapsedMins = Math.max(1, Math.round(elapsedSeconds / 60));

  return (
    <Modal
      isOpen={isCompleteModalOpen}
      onClose={() => setIsCompleteModalOpen(false)}
      title="Complete this task?"
      subtitle="Finish focus session and mark deliverable completed"
      maxWidth="max-w-md"
    >
      <div className="space-y-4 text-xs sm:text-sm text-slate-300">
        <div className="p-4 rounded-xl bg-[#171C27] border border-white/[0.06] space-y-2">
          <div className="flex items-start gap-2.5">
            <Trophy className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-sm">{selectedTask.title}</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                This will save <strong className="text-[#22C55E]">{formatDurationMinutes(elapsedMins)}</strong> of active focus time to this task's actual duration and mark the task completed.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/[0.06]">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsCompleteModalOpen(false)}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={completeTaskFromFocus}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            Complete Task
          </Button>
        </div>
      </div>
    </Modal>
  );
}

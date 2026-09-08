import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useGoalsContext } from '../../context/GoalsContext';
import { AlertTriangle } from 'lucide-react';

export default function DeleteGoalDialog() {
  const { goalToDelete, closeDeleteGoalModal, deleteGoal } = useGoalsContext();

  if (!goalToDelete) return null;

  return (
    <Modal
      isOpen={Boolean(goalToDelete)}
      onClose={closeDeleteGoalModal}
      title="Delete Goal?"
      subtitle="This action cannot be undone."
      maxWidth="max-w-md"
    >
      <div className="space-y-5">
        <div className="flex items-start gap-4 p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20">
          <div className="p-2 rounded-lg bg-[#EF4444]/20 text-[#EF4444] shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-xs sm:text-sm text-slate-200">
            Are you sure you want to permanently delete{' '}
            <span className="font-semibold text-white">"{goalToDelete.title}"</span>?
            Associated milestones will be removed. Linked tasks will not be deleted.
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" size="md" onClick={closeDeleteGoalModal}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={() => deleteGoal(goalToDelete.id)}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}

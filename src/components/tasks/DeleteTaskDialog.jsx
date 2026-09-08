import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useTaskContext } from '../../context/TaskContext';
import { AlertTriangle } from 'lucide-react';

export default function DeleteTaskDialog() {
  const { taskToDelete, closeDeleteModal, deleteTask } = useTaskContext();

  if (!taskToDelete) return null;

  return (
    <Modal
      isOpen={Boolean(taskToDelete)}
      onClose={closeDeleteModal}
      title="Delete Task?"
      subtitle="This action cannot be undone."
      maxWidth="max-w-md"
    >
      <div className="space-y-5">
        <div className="flex items-start gap-4 p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20">
          <div className="p-2 rounded-lg bg-[#EF4444]/20 text-[#EF4444] shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-xs sm:text-sm text-slate-200">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-white">"{taskToDelete.title}"</span>? All
            associated progress will be removed.
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" size="md" onClick={closeDeleteModal}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={() => deleteTask(taskToDelete.id)}
          >
            Delete Task
          </Button>
        </div>
      </div>
    </Modal>
  );
}

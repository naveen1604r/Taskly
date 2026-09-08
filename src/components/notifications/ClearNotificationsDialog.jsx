import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useNotificationsContext } from '../../context/NotificationsContext';
import { AlertTriangle } from 'lucide-react';

export default function ClearNotificationsDialog() {
  const { isClearAllOpen, setIsClearAllOpen, clearAllNotifications } = useNotificationsContext();

  if (!isClearAllOpen) return null;

  return (
    <Modal
      isOpen={isClearAllOpen}
      onClose={() => setIsClearAllOpen(false)}
      title="Clear all notifications?"
      subtitle="All notification records will be permanently removed."
      maxWidth="max-w-md"
    >
      <div className="space-y-5">
        <div className="flex items-start gap-4 p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20">
          <div className="p-2 rounded-lg bg-[#EF4444]/20 text-[#EF4444] shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-xs sm:text-sm text-slate-200">
            Are you sure you want to permanently clear all notifications? Scheduled reminders will remain safe.
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" size="md" onClick={() => setIsClearAllOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" size="md" onClick={clearAllNotifications}>
            Clear All
          </Button>
        </div>
      </div>
    </Modal>
  );
}

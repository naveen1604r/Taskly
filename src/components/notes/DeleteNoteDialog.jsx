import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useNotesContext } from '../../context/NotesContext';
import { AlertTriangle } from 'lucide-react';

export default function DeleteNoteDialog() {
  const { noteToDelete, closeDeleteNoteModal, deleteNote } = useNotesContext();

  if (!noteToDelete) return null;

  return (
    <Modal
      isOpen={Boolean(noteToDelete)}
      onClose={closeDeleteNoteModal}
      title="Delete Note?"
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
            <span className="font-semibold text-white">"{noteToDelete.title}"</span>? All
            associated content and tags will be removed.
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" size="md" onClick={closeDeleteNoteModal}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={() => deleteNote(noteToDelete.id)}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}

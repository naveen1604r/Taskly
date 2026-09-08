import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useNotesContext } from '../../context/NotesContext';
import {
  Pin,
  Archive,
  ArchiveRestore,
  Edit2,
  Trash2,
  Calendar,
  Tag,
  Clock
} from 'lucide-react';

export default function NoteViewer() {
  const {
    viewingNote,
    closeViewNoteModal,
    openEditNoteModal,
    openDeleteNoteModal,
    togglePinNote,
    toggleArchiveNote,
  } = useNotesContext();

  if (!viewingNote) return null;

  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <Modal
      isOpen={Boolean(viewingNote)}
      onClose={closeViewNoteModal}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Header Title & Status Badges */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {viewingNote.pinned && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold text-[#F59E0B] bg-[#F59E0B]/15 border border-[#F59E0B]/30">
                <Pin className="w-3 h-3 fill-[#F59E0B]" />
                Pinned
              </span>
            )}
            {viewingNote.archived && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 border border-white/[0.08]">
                <Archive className="w-3 h-3" />
                Archived
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold text-[#c4b5fd] bg-[#7C3AED]/15 border border-[#7C3AED]/30">
              {viewingNote.category || 'General'}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
            {viewingNote.title}
          </h2>

          {/* Metadata dates */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#94A3B8] pt-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span>Created: {formatDate(viewingNote.createdAt)}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Updated: {formatDate(viewingNote.updatedAt || viewingNote.createdAt)}</span>
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/[0.08]" />

        {/* Note Content */}
        <div className="max-h-[50vh] overflow-y-auto pr-2 text-sm sm:text-base text-slate-200 leading-relaxed whitespace-pre-wrap font-normal">
          {viewingNote.content}
        </div>

        {/* Tags */}
        {viewingNote.tags && viewingNote.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs text-[#94A3B8] font-medium flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Tags:
            </span>
            {viewingNote.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium text-[#c4b5fd] bg-[#7C3AED]/15 px-2.5 py-0.5 rounded-lg border border-[#7C3AED]/25"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/[0.08]">
          <div className="flex items-center gap-2">
            {/* Pin Toggle */}
            <button
              type="button"
              onClick={() => togglePinNote(viewingNote.id)}
              className="p-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-[#171C27] hover:bg-[#1f2635] border border-white/[0.08] flex items-center gap-1.5 transition-all"
            >
              <Pin className={`w-3.5 h-3.5 ${viewingNote.pinned ? 'fill-[#F59E0B] text-[#F59E0B]' : ''}`} />
              <span>{viewingNote.pinned ? 'Unpin' : 'Pin'}</span>
            </button>

            {/* Archive Toggle */}
            <button
              type="button"
              onClick={() => toggleArchiveNote(viewingNote.id)}
              className="p-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-[#171C27] hover:bg-[#1f2635] border border-white/[0.08] flex items-center gap-1.5 transition-all"
            >
              {viewingNote.archived ? (
                <>
                  <ArchiveRestore className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Unarchive</span>
                </>
              ) : (
                <>
                  <Archive className="w-3.5 h-3.5 text-slate-400" />
                  <span>Archive</span>
                </>
              )}
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={() => openDeleteNoteModal(viewingNote)}
              className="p-2 rounded-xl text-xs font-medium text-[#EF4444] hover:bg-[#EF4444]/15 border border-[#EF4444]/20 flex items-center gap-1.5 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <Button variant="secondary" size="md" onClick={closeViewNoteModal}>
              Close
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<Edit2 className="w-3.5 h-3.5" />}
              onClick={() => {
                const target = viewingNote;
                closeViewNoteModal();
                openEditNoteModal(target);
              }}
            >
              Edit Note
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

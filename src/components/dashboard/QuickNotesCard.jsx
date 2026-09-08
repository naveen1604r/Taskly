import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import { useNotesContext } from '../../context/NotesContext';
import { truncateText, formatRelativeTime } from '../../utils/noteUtils';
import { ArrowRight, Pin, Plus, FileText } from 'lucide-react';

export default function QuickNotesCard() {
  const { notes, openCreateNoteModal, openViewNoteModal } = useNotesContext();

  // Active non-archived notes, pinned first, up to 3 items
  const activeNotes = notes.filter((n) => !n.archived);
  const displayNotes = [...activeNotes]
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
    })
    .slice(0, 3);

  return (
    <Card
      title="Quick Notes"
      subtitle={`${activeNotes.length} active notes recorded`}
      action={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCreateNoteModal}
            className="p-1 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors"
            title="Add Quick Note"
          >
            <Plus className="w-4 h-4 text-[#7C3AED]" />
          </button>
          <Link
            to="/notes"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#7C3AED] hover:text-[#c4b5fd] transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      }
      className="flex flex-col justify-between"
    >
      {displayNotes.length === 0 ? (
        <div className="py-8 flex flex-col items-center justify-center text-center">
          <FileText className="w-8 h-8 text-slate-500 mb-2" />
          <p className="text-sm font-semibold text-white">No notes yet</p>
          <p className="text-xs text-[#94A3B8] mt-0.5 mb-3">Capture your first idea or study reminder.</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={openCreateNoteModal}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Quick Note
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {displayNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => openViewNoteModal(note)}
              className="p-3.5 rounded-xl bg-[#171C27] border border-white/[0.08] hover:border-white/[0.18] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  {note.pinned && (
                    <Pin className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B] shrink-0" />
                  )}
                  <h4 className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-[#c4b5fd] transition-colors">
                    {note.title}
                  </h4>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {formatRelativeTime(note.updatedAt || note.createdAt)}
                </span>
              </div>

              <p className="text-xs text-[#94A3B8] line-clamp-2 leading-relaxed font-normal">
                {truncateText(note.content, 90)}
              </p>
            </div>
          ))}

          <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between">
            <button
              type="button"
              onClick={openCreateNoteModal}
              className="text-xs font-semibold text-[#06B6D4] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Quick Note</span>
            </button>
            <Link
              to="/notes"
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              View all notes →
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
}

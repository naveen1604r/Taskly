import React, { useState, useRef, useEffect } from 'react';
import { useNotesContext } from '../../context/NotesContext';
import { truncateText, formatRelativeTime } from '../../utils/noteUtils';
import {
  Pin,
  MoreVertical,
  Edit2,
  Trash2,
  Archive,
  ArchiveRestore,
  ExternalLink,
  Tag as TagIcon
} from 'lucide-react';

const categoryColorMap = {
  Coding: 'text-[#7C3AED] bg-[#7C3AED]/10 border-[#7C3AED]/20',
  Study: 'text-[#06B6D4] bg-[#06B6D4]/10 border-[#06B6D4]/20',
  'UI/UX': 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20',
  Work: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  Personal: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Interview: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  Ideas: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  General: 'text-slate-300 bg-slate-800 border-white/[0.08]',
  Other: 'text-slate-400 bg-slate-800/80 border-white/[0.08]',
};

export default function NoteCard({ note }) {
  const {
    openViewNoteModal,
    openEditNoteModal,
    openDeleteNoteModal,
    togglePinNote,
    toggleArchiveNote,
  } = useNotesContext();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const categoryStyle = categoryColorMap[note.category] || categoryColorMap.General;

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleCardClick = (e) => {
    // Avoid opening viewer if user clicked three-dot menu
    if (menuRef.current && menuRef.current.contains(e.target)) {
      return;
    }
    openViewNoteModal(note);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`relative flex flex-col justify-between p-5 rounded-2xl bg-[#11151F] border transition-all duration-200 cursor-pointer group hover:shadow-hover ${
        note.pinned
          ? 'border-[#F59E0B]/30 hover:border-[#F59E0B]/50 shadow-[0_0_15px_rgba(245,158,11,0.06)]'
          : 'border-white/[0.08] hover:border-white/[0.18]'
      }`}
    >
      <div>
        {/* Header: Pin Indicator & Title & Menu */}
        <div className="flex items-start justify-between gap-2.5 mb-2.5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {note.pinned && (
              <span
                className="shrink-0 text-[#F59E0B] p-1 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20"
                title="Pinned Note"
              >
                <Pin className="w-3.5 h-3.5 fill-[#F59E0B]" />
              </span>
            )}
            <h3 className="text-base font-bold text-white tracking-tight leading-snug truncate group-hover:text-[#c4b5fd] transition-colors">
              {note.title}
            </h3>
          </div>

          {/* Three-Dot Menu */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors"
              aria-label="Note options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-[#171C27] border border-white/[0.12] rounded-xl shadow-hover py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    openViewNoteModal(note);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:text-white hover:bg-white/[0.06] transition-colors text-left"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#06B6D4]" />
                  <span>View Details</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    openEditNoteModal(note);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:text-white hover:bg-white/[0.06] transition-colors text-left"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>Edit Note</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    togglePinNote(note.id);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:text-white hover:bg-white/[0.06] transition-colors text-left"
                >
                  <Pin className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>{note.pinned ? 'Unpin' : 'Pin to top'}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    toggleArchiveNote(note.id);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:text-white hover:bg-white/[0.06] transition-colors text-left"
                >
                  {note.archived ? (
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

                <div className="my-1 border-t border-white/[0.06]" />

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    openDeleteNoteModal(note);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Note</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Preview */}
        <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed line-clamp-4 font-normal">
          {truncateText(note.content, 140)}
        </p>
      </div>

      {/* Footer: Category, Tags & Updated time */}
      <div className="pt-4 mt-4 border-t border-white/[0.06] space-y-2.5">
        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center text-[10px] font-medium text-[#c4b5fd] bg-[#7C3AED]/10 px-2 py-0.5 rounded-md border border-[#7C3AED]/20"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-xs">
          {/* Category Badge */}
          <span className={`px-2.5 py-0.5 rounded-lg border text-[11px] font-semibold ${categoryStyle}`}>
            {note.category}
          </span>

          {/* Relative Updated Time */}
          <span className="text-[11px] text-slate-400">
            Updated {formatRelativeTime(note.updatedAt || note.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { useNotesContext } from '../context/NotesContext';
import NotesStats from '../components/notes/NotesStats';
import NotesTabs from '../components/notes/NotesTabs';
import NotesFilters from '../components/notes/NotesFilters';
import NoteCard from '../components/notes/NoteCard';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Plus, FileText, Pin, Archive, SearchX } from 'lucide-react';

export default function Notes() {
  const { notes, openCreateNoteModal, metrics } = useNotesContext();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pinned' | 'archived'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recently_updated');

  // Extract all categories dynamically present across notes
  const availableCategories = useMemo(() => {
    return Array.from(new Set(notes.map((n) => n.category).filter(Boolean)));
  }, [notes]);

  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    let result = [...notes];

    // 1. Tab filter
    if (activeTab === 'all') {
      result = result.filter((n) => !n.archived);
    } else if (activeTab === 'pinned') {
      result = result.filter((n) => n.pinned && !n.archived);
    } else if (activeTab === 'archived') {
      result = result.filter((n) => n.archived);
    }

    // 2. Search Query (title, content, category, tags)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          (n.category && n.category.toLowerCase().includes(q)) ||
          (n.tags && n.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // 3. Category Filter
    if (categoryFilter !== 'all') {
      result = result.filter((n) => n.category === categoryFilter);
    }

    // 4. Tag Filter
    if (tagFilter !== 'all') {
      result = result.filter(
        (n) => n.tags && n.tags.map((t) => t.toLowerCase()).includes(tagFilter.toLowerCase())
      );
    }

    // 5. Sorting
    result.sort((a, b) => {
      // In 'all' tab, keep pinned notes at the top unless explicit title sort
      if (activeTab === 'all' && sortBy.startsWith('recently')) {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
      }

      if (sortBy === 'recently_updated') {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      }
      if (sortBy === 'recently_created') {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      }
      if (sortBy === 'oldest') {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeA - timeB;
      }
      if (sortBy === 'title_asc') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'title_desc') {
        return b.title.localeCompare(a.title);
      }
      return 0;
    });

    return result;
  }, [notes, activeTab, searchQuery, categoryFilter, tagFilter, sortBy]);

  // Determine empty states
  const totalNotesInTab = useMemo(() => {
    if (activeTab === 'all') return notes.filter((n) => !n.archived).length;
    if (activeTab === 'pinned') return notes.filter((n) => n.pinned && !n.archived).length;
    if (activeTab === 'archived') return notes.filter((n) => n.archived).length;
    return 0;
  }, [notes, activeTab]);

  return (
    <div className="space-y-6 sm:space-y-7 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Notes
          </h2>
          <p className="text-sm text-[#94A3B8] mt-1">
            Capture ideas, information, and important thoughts in one place.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={openCreateNoteModal}
          icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
          className="shadow-glow-primary self-start sm:self-auto"
        >
          New Note
        </Button>
      </div>

      {/* 1. Dynamic Notes Statistics */}
      <NotesStats />

      {/* 2. Tabs: All Notes, Pinned, Archived */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <NotesTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* 3. Search & Filters */}
      {totalNotesInTab > 0 && (
        <NotesFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          tagFilter={tagFilter}
          setTagFilter={setTagFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          availableCategories={availableCategories}
          availableTags={metrics.allTags}
        />
      )}

      {/* 4. Notes Grid or Contextual Empty States */}
      {totalNotesInTab === 0 ? (
        // Tab Empty State
        <Card className="border-dashed border-white/[0.12]">
          <div className="py-20 flex flex-col items-center justify-center text-center">
            {activeTab === 'pinned' ? (
              <>
                <div className="w-16 h-16 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center text-[#F59E0B] mb-4 shadow-subtle">
                  <Pin className="w-8 h-8 stroke-[1.75]" />
                </div>
                <h3 className="text-xl font-bold text-white">No pinned notes</h3>
                <p className="text-sm text-[#94A3B8] max-w-sm mt-1.5 mb-6">
                  Pin important notes to access them quickly from this view.
                </p>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setActiveTab('all')}
                >
                  Browse All Notes
                </Button>
              </>
            ) : activeTab === 'archived' ? (
              <>
                <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-white/[0.08] flex items-center justify-center text-slate-400 mb-4 shadow-subtle">
                  <Archive className="w-8 h-8 stroke-[1.75]" />
                </div>
                <h3 className="text-xl font-bold text-white">No archived notes</h3>
                <p className="text-sm text-[#94A3B8] max-w-sm mt-1.5 mb-6">
                  Archived notes will appear here for safe keeping and reference.
                </p>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setActiveTab('all')}
                >
                  Return to Active Notes
                </Button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-center text-[#7C3AED] mb-4 shadow-subtle">
                  <FileText className="w-8 h-8 stroke-[1.75]" />
                </div>
                <h3 className="text-xl font-bold text-white">No notes yet</h3>
                <p className="text-sm text-[#94A3B8] max-w-sm mt-1.5 mb-6">
                  Capture your first idea, reminder, or piece of knowledge.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={openCreateNoteModal}
                  icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
                  className="shadow-glow-primary"
                >
                  Create Your First Note
                </Button>
              </>
            )}
          </div>
        </Card>
      ) : filteredNotes.length === 0 ? (
        // Search / Filter Empty State
        <Card className="border-dashed border-white/[0.12]">
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-white/[0.08] flex items-center justify-center text-[#94A3B8] mb-3">
              <SearchX className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-white">No matching notes</h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-xs mt-1 mb-5">
              Try another search or change your filters to find what you need.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setTagFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </Card>
      ) : (
        // Responsive Notes Grid: 3 columns desktop, 2 tablet, 1 mobile
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}

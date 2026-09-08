import React, { useState, useMemo } from 'react';
import { useInboxContext } from '../context/InboxContext';
import { filterAndSortInbox, INBOX_TYPES } from '../utils/inboxUtils';
import InboxItem from '../components/inbox/InboxItem';
import QuickCaptureModal from '../components/inbox/QuickCaptureModal';
import InboxProcessModal from '../components/inbox/InboxProcessModal';
import BulkActionBar from '../components/inbox/BulkActionBar';
import Button from '../components/common/Button';
import {
  Inbox as InboxIcon,
  Zap,
  Search,
  Filter,
  Sliders,
  CheckCircle2,
  Clock,
  Sparkles,
  Archive,
  X,
  AlertTriangle,
} from 'lucide-react';

export default function Inbox() {
  const { inboxItems, stats, openQuickCapture } = useInboxContext();

  const [statusTab, setStatusTab] = useState('unprocessed'); // 'unprocessed' | 'processed' | 'archived' | 'all'
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const [selectedIds, setSelectedIds] = useState([]);

  // Filter & Sort
  const displayedItems = useMemo(() => {
    return filterAndSortInbox(inboxItems, {
      status: statusTab,
      type: typeFilter,
      priority: priorityFilter,
      search: searchQuery,
      sortBy,
    });
  }, [inboxItems, statusTab, typeFilter, priorityFilter, searchQuery, sortBy]);

  const handleToggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === displayedItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayedItems.map((i) => i.id));
    }
  };

  return (
    <div className="space-y-6 sm:space-y-7 pb-20 animate-in fade-in duration-200">
      {/* 1. Header with Snapshot Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-[#7C3AED]/15 text-[#7C3AED] border border-[#7C3AED]/25">
              <InboxIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Productivity Inbox
                </h2>
                {stats.unprocessed > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#7C3AED] text-white text-[11px] font-bold">
                    {stats.unprocessed} waiting
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Capture now. Organize and triage deliverables into your workflow later.
              </p>
            </div>
          </div>
        </div>

        {/* Global Quick Capture Button */}
        <Button
          variant="primary"
          size="md"
          onClick={openQuickCapture}
          icon={<Zap className="w-4 h-4 fill-current" />}
          className="shadow-glow-primary self-start sm:self-auto"
        >
          Quick Capture (Q)
        </Button>
      </div>

      {/* 2. Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-[#11151F] border border-white/[0.06] space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Total Captures
          </span>
          <span className="text-xl font-black text-white font-mono">{stats.total}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#11151F] border border-white/[0.06] space-y-1">
          <span className="text-[10px] text-[#7C3AED] font-bold uppercase tracking-wider block">
            Unprocessed
          </span>
          <span className="text-xl font-black text-[#c4b5fd] font-mono">
            {stats.unprocessed}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#11151F] border border-white/[0.06] space-y-1">
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
            Processed Today
          </span>
          <span className="text-xl font-black text-emerald-400 font-mono">
            {stats.processedToday}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#11151F] border border-white/[0.06] space-y-1">
          <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">
            Needs Action
          </span>
          <span className="text-xl font-black text-rose-400 font-mono">
            {stats.needsAction}
          </span>
        </div>
      </div>

      {/* 3. Filter & Search Controls */}
      <div className="space-y-3">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-[#11151F] border border-white/[0.08] rounded-2xl text-xs">
            {[
              { id: 'unprocessed', label: 'Unprocessed', count: stats.unprocessed },
              { id: 'processed', label: 'Processed', count: stats.processed },
              { id: 'archived', label: 'Archived', count: stats.archived },
              { id: 'all', label: 'All', count: stats.total },
            ].map((tab) => {
              const isActive = statusTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#7C3AED] text-white shadow-glow-primary'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-white/[0.06] text-slate-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Select All Toggle */}
          {displayedItems.length > 0 && (
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              {selectedIds.length === displayedItems.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        {/* Secondary Filter Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search captures..."
              className="w-full bg-[#11151F] border border-white/[0.08] rounded-xl pl-8 pr-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#7C3AED]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-[#11151F] border border-white/[0.08] text-white rounded-xl px-2.5 py-1.5 focus:outline-none"
            >
              <option value="all">All Types</option>
              {INBOX_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-[#11151F] border border-white/[0.08] text-white rounded-xl px-2.5 py-1.5 focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#11151F] border border-white/[0.08] text-white rounded-xl px-2.5 py-1.5 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Priority</option>
              <option value="duration">Duration</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Inbox Items List */}
      {displayedItems.length === 0 ? (
        <div className="p-16 rounded-3xl bg-[#11151F]/40 border border-dashed border-white/[0.08] text-center space-y-3">
          <InboxIcon className="w-10 h-10 text-slate-500 mx-auto stroke-[1.5]" />
          <div>
            <h4 className="text-sm font-bold text-white">Inbox is clear!</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mt-0.5">
              {statusTab === 'unprocessed'
                ? 'All captures have been triaged and organized.'
                : 'No items match your selected filters.'}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={openQuickCapture}
            icon={<Zap className="w-3.5 h-3.5 fill-current" />}
          >
            Quick Capture (Q)
          </Button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {displayedItems.map((item) => (
            <InboxItem
              key={item.id}
              item={item}
              isSelected={selectedIds.includes(item.id)}
              onToggleSelect={handleToggleSelect}
            />
          ))}
        </div>
      )}

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds([])}
      />

      {/* Quick Capture Modal */}
      <QuickCaptureModal />

      {/* Process / Triage Modal */}
      <InboxProcessModal />
    </div>
  );
}

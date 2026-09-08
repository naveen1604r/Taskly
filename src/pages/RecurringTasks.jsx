import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import RecurringTaskCard from '../components/recurring/RecurringTaskCard';
import RecurringTaskModal from '../components/recurring/RecurringTaskModal';
import RecurringFilters from '../components/recurring/RecurringFilters';
import RecurringEmptyState from '../components/recurring/RecurringEmptyState';
import TemplateCard from '../components/templates/TemplateCard';
import TemplateModal from '../components/templates/TemplateModal';
import TemplateEmptyState from '../components/templates/TemplateEmptyState';
import { useRecurringTaskContext } from '../context/RecurringTaskContext';
import { useTemplateContext } from '../context/TemplateContext';
import { getNextOccurrence } from '../utils/recurrenceUtils';
import { getTodayDateString } from '../utils/taskStorage';
import {
  Repeat,
  Layers,
  Plus,
  AlertTriangle,
  FastForward,
  Pause,
  Trash2,
  Search,
} from 'lucide-react';

export default function RecurringTasks() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'templates' ? 'templates' : 'recurring';

  const {
    recurringTasks,
    openCreateModal: openCreateRecurringModal,
    isDeleteConfirmOpen,
    ruleToDelete,
    deleteRecurringTask,
    closeDeleteConfirm,
    isPauseConfirmOpen,
    ruleToPause,
    pauseRecurringTask,
    closePauseConfirm,
    isSkipConfirmOpen,
    skipTarget,
    skipOccurrence,
    closeSkipConfirm,
  } = useRecurringTaskContext();

  const {
    templates,
    openCreateTemplateModal,
  } = useTemplateContext();

  const todayStr = getTodayDateString();

  // Recurring filters & search
  const [filter, setFilter] = useState('all'); // all, active, paused, ended
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('next'); // next, name, created

  // Template search & filter
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateCategory, setTemplateCategory] = useState('all');

  const setTab = (tabName) => {
    setSearchParams(tabName === 'templates' ? { tab: 'templates' } : {});
  };

  // Filter & Sort recurring tasks
  const filteredRecurring = useMemo(() => {
    return recurringTasks
      .filter((rule) => {
        // Status filter
        const isEnded = rule.recurrence?.endDate && rule.recurrence.endDate < todayStr;
        if (filter === 'active' && (!rule.enabled || isEnded)) return false;
        if (filter === 'paused' && (rule.enabled || isEnded)) return false;
        if (filter === 'ended' && !isEnded) return false;

        // Search
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = rule.title.toLowerCase().includes(q);
          const matchDesc = rule.description?.toLowerCase().includes(q);
          const matchCat = rule.category?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchCat) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sort === 'name') {
          return a.title.localeCompare(b.title);
        }
        if (sort === 'created') {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        // Next date
        const nextA = getNextOccurrence(a, todayStr) || '9999-99-99';
        const nextB = getNextOccurrence(b, todayStr) || '9999-99-99';
        return nextA.localeCompare(nextB);
      });
  }, [recurringTasks, filter, search, sort, todayStr]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      if (templateCategory !== 'all' && tpl.category !== templateCategory) return false;
      if (templateSearch.trim()) {
        const q = templateSearch.toLowerCase();
        const matchName = tpl.name.toLowerCase().includes(q);
        const matchTitle = tpl.title.toLowerCase().includes(q);
        const matchDesc = tpl.description?.toLowerCase().includes(q);
        if (!matchName && !matchTitle && !matchDesc) return false;
      }
      return true;
    });
  }, [templates, templateCategory, templateSearch]);

  const handleApplyPreset = (preset) => {
    openCreateRecurringModal({
      ...preset,
      recurrence: {
        ...preset.recurrence,
        startDate: todayStr,
      },
    });
  };

  return (
    <div className="space-y-6 sm:space-y-7 pb-14">
      {/* 1. Header with Tab Navigation & Action Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Recurring Tasks & Routines
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-[#7C3AED] bg-[#7C3AED]/10 border border-[#7C3AED]/20">
              <Repeat className="w-3 h-3" />
              Automation
            </span>
          </div>
          <p className="text-sm text-[#94A3B8] mt-1">
            Automate tasks that repeat regularly and manage reusable blueprints.
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-2.5">
          {activeTab === 'recurring' ? (
            <Button
              variant="primary"
              size="md"
              onClick={openCreateRecurringModal}
              icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
            >
              Create Recurring Task
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={openCreateTemplateModal}
              icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
            >
              Create Task Template
            </Button>
          )}
        </div>
      </div>

      {/* 2. Primary Tabs: Recurring Tasks vs Task Templates */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-1">
        <button
          type="button"
          onClick={() => setTab('recurring')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'recurring'
              ? 'border-[#7C3AED] text-white'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Repeat className="w-4 h-4" />
          <span>Recurring Tasks</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#7C3AED]/20 text-[#c4b5fd]">
            {recurringTasks.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTab('templates')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'templates'
              ? 'border-[#06B6D4] text-white'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Task Templates</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#06B6D4]/20 text-[#06B6D4]">
            {templates.length}
          </span>
        </button>
      </div>

      {/* 3. Tab Content */}
      {activeTab === 'recurring' ? (
        <div className="space-y-6">
          {/* Recurring Filters, Presets, Search & Sort */}
          <RecurringFilters
            filter={filter}
            setFilter={setFilter}
            search={search}
            setSearch={setSearch}
            sort={sort}
            setSort={setSort}
            onApplyPreset={handleApplyPreset}
          />

          {/* Grid of Recurring Task Cards */}
          {filteredRecurring.length === 0 ? (
            <RecurringEmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredRecurring.map((rule) => (
                <RecurringTaskCard key={rule.id} rule={rule} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Task Templates Tab */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#11151F] text-white placeholder-slate-500 rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none"
              />
            </div>

            <span className="text-xs text-slate-400 font-medium">
              {filteredTemplates.length} {filteredTemplates.length === 1 ? 'template' : 'templates'} available
            </span>
          </div>

          {filteredTemplates.length === 0 ? (
            <TemplateEmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredTemplates.map((tpl) => (
                <TemplateCard key={tpl.id} template={tpl} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog: Pause Recurring Rule */}
      {isPauseConfirmOpen && ruleToPause && (
        <Modal
          isOpen={isPauseConfirmOpen}
          onClose={closePauseConfirm}
          title="Pause Recurring Task?"
          subtitle={`"${ruleToPause.title}"`}
          maxWidth="max-w-sm"
        >
          <div className="space-y-3.5 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5">
              <Pause className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                Future occurrences will stop being generated. Existing tasks already created will not be deleted.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/[0.06]">
              <Button variant="secondary" size="sm" onClick={closePauseConfirm}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => pauseRecurringTask(ruleToPause.id)}
              >
                Pause Task
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Dialog: Delete Recurring Rule */}
      {isDeleteConfirmOpen && ruleToDelete && (
        <Modal
          isOpen={isDeleteConfirmOpen}
          onClose={closeDeleteConfirm}
          title="Delete Recurring Rule?"
          subtitle={`"${ruleToDelete.title}"`}
          maxWidth="max-w-sm"
        >
          <div className="space-y-3.5 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/25 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
              <div>
                Future occurrences will no longer be generated. Existing task instances in your task list will remain untouched.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/[0.06]">
              <Button variant="secondary" size="sm" onClick={closeDeleteConfirm}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => deleteRecurringTask(ruleToDelete.id)}
              >
                Delete Rule
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Dialog: Skip One Occurrence */}
      {isSkipConfirmOpen && skipTarget && (
        <Modal
          isOpen={isSkipConfirmOpen}
          onClose={closeSkipConfirm}
          title="Skip This Occurrence?"
          subtitle={`Skip "${skipTarget.rule.title}" on ${skipTarget.dateStr}`}
          maxWidth="max-w-sm"
        >
          <div className="space-y-3.5 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-[#06B6D4]/10 border border-[#06B6D4]/25 flex items-start gap-2.5">
              <FastForward className="w-4 h-4 text-[#06B6D4] shrink-0 mt-0.5" />
              <div>
                Only this occurrence on {skipTarget.dateStr} will be skipped. Future occurrences will continue normally.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/[0.06]">
              <Button variant="secondary" size="sm" onClick={closeSkipConfirm}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => skipOccurrence(skipTarget.rule.id, skipTarget.dateStr)}
              >
                Skip Occurrence
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modals */}
      <RecurringTaskModal />
      <TemplateModal />
    </div>
  );
}

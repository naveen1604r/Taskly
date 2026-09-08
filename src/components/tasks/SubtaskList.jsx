import React, { useState, useEffect, useMemo } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import SubtaskItem from './SubtaskItem';
import SubtaskModal from './SubtaskModal';
import TaskChecklistFilters from './TaskChecklistFilters';
import { areAllSubtasksCompleted, calculateSubtaskProgress } from '../../utils/taskUtils';
import { Plus, CheckCircle2, ListTodo, AlertCircle, Sparkles } from 'lucide-react';
import Button from '../common/Button';

const STORAGE_VIEW_KEY = 'taskly_subtask_view_mode';

export default function SubtaskList({ task }) {
  const {
    addSubtask,
    updateSubtask,
    deleteSubtask,
    toggleSubtask,
    reorderSubtasks,
    setTaskStatus,
    showToast,
  } = useTaskContext();

  // Search, Filter, Sort, View states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'remaining' | 'completed'
  const [sortBy, setSortBy] = useState('manual'); // 'manual' | 'priority' | 'status' | 'date'
  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_VIEW_KEY) || 'list';
    } catch {
      return 'list';
    }
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subtaskToEdit, setSubtaskToEdit] = useState(null);

  // Quick inline add state
  const [quickTitle, setQuickTitle] = useState('');

  // Main task completion prompt state (Requirement 4)
  const [showCompletionPrompt, setShowCompletionPrompt] = useState(false);

  // Save viewMode preference in localStorage
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem(STORAGE_VIEW_KEY, mode);
    } catch {
      // ignore
    }
  };

  const subtasks = Array.isArray(task?.subtasks) ? task.subtasks : [];
  const progress = calculateSubtaskProgress(task);

  // Check if all subtasks completed upon toggle
  const handleToggleSubtask = (subtaskId) => {
    const nextCompleted = toggleSubtask(task.id, subtaskId);

    // After toggling, inspect if now all subtasks are completed
    // We check what the state will be: if nextCompleted is true and all other subtasks were completed
    setTimeout(() => {
      const currentTask = task;
      if (!currentTask) return;
      const currentSubtasks = Array.isArray(currentTask.subtasks) ? currentTask.subtasks : [];
      // Calculate how many are completed including this toggle
      const completedCount = currentSubtasks.filter((st) =>
        st.id === subtaskId ? nextCompleted : Boolean(st.completed)
      ).length;

      if (
        currentSubtasks.length > 0 &&
        completedCount === currentSubtasks.length &&
        currentTask.status !== 'completed'
      ) {
        setShowCompletionPrompt(true);
      }
    }, 50);
  };

  // Reorder up
  const handleMoveUp = (index) => {
    if (index <= 0) return;
    const newItems = [...subtasks];
    const temp = newItems[index - 1];
    newItems[index - 1] = newItems[index];
    newItems[index] = temp;
    reorderSubtasks(task.id, newItems);
  };

  // Reorder down
  const handleMoveDown = (index) => {
    if (index >= subtasks.length - 1) return;
    const newItems = [...subtasks];
    const temp = newItems[index + 1];
    newItems[index + 1] = newItems[index];
    newItems[index] = temp;
    reorderSubtasks(task.id, newItems);
  };

  // Add via inline quick input
  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (quickTitle.trim()) {
      addSubtask(task.id, {
        title: quickTitle.trim(),
        priority: 'medium',
      });
      setQuickTitle('');
    }
  };

  // Open modal for new subtask
  const handleOpenAddModal = () => {
    setSubtaskToEdit(null);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (subtaskId, updates) => {
    updateSubtask(task.id, subtaskId, updates);
  };

  const handleModalSubmit = (data) => {
    if (subtaskToEdit) {
      updateSubtask(task.id, subtaskToEdit.id, data);
    } else {
      addSubtask(task.id, data);
    }
  };

  // Main task completion prompt handlers (Requirement 4)
  const handleMarkMainTaskComplete = () => {
    setTaskStatus(task.id, 'completed');
    setShowCompletionPrompt(false);
    showToast('Task marked as completed! 🎉', 'success');
  };

  const handleKeepTaskOpen = () => {
    setShowCompletionPrompt(false);
  };

  // Priority weight mapping
  const priorityWeights = {
    high: 3,
    medium: 2,
    low: 1,
  };

  // Filtered & Sorted subtasks
  const processedSubtasks = useMemo(() => {
    let list = [...subtasks];

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((st) => st.title.toLowerCase().includes(q));
    }

    // 2. Status Filter
    if (filterTab === 'completed') {
      list = list.filter((st) => Boolean(st.completed));
    } else if (filterTab === 'remaining') {
      list = list.filter((st) => !st.completed);
    }

    // 3. Sorting
    if (sortBy === 'priority') {
      list.sort((a, b) => {
        const weightA = priorityWeights[a.priority] || 2;
        const weightB = priorityWeights[b.priority] || 2;
        return weightB - weightA;
      });
    } else if (sortBy === 'status') {
      list.sort((a, b) => {
        if (a.completed === b.completed) return 0;
        return a.completed ? 1 : -1;
      });
    } else if (sortBy === 'date') {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    // 'manual' keeps the original array order

    return list;
  }, [subtasks, searchQuery, filterTab, sortBy]);

  const counts = {
    all: subtasks.length,
    completed: progress.completed,
    remaining: progress.remaining,
  };

  return (
    <div className="p-5 rounded-2xl bg-[#11151F] border border-white/[0.08] shadow-card space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-[#7C3AED]" />
          <div>
            <h3 className="text-base font-semibold text-white">Subtasks & Checklist</h3>
            <p className="text-xs text-slate-400">
              {progress.completed} of {progress.total} items completed
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleOpenAddModal}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Subtask
        </Button>
      </div>

      {/* Requirement 4: Interactive Main Task Completion Confirmation Banner */}
      {showCompletionPrompt && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#7C3AED]/20 via-[#22C55E]/15 to-[#06B6D4]/15 border border-[#22C55E]/40 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#22C55E] shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">
                All subtasks are completed. Mark this task as completed?
              </p>
              <p className="text-xs text-slate-300 mt-0.5">
                You’ve finished every checklist item. You can complete the parent task or keep it open.
              </p>
              <div className="flex items-center gap-2.5 mt-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleMarkMainTaskComplete}
                  icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                >
                  Mark Complete
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleKeepTaskOpen}
                >
                  Keep Task Open
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Inline Form */}
      <form onSubmit={handleQuickAdd} className="flex items-center gap-2">
        <input
          type="text"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder="+ Add subtask (press Enter to create)..."
          className="flex-1 bg-[#171C27] border border-white/[0.08] focus:border-[#7C3AED] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 transition-all"
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!quickTitle.trim()}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Add
        </Button>
      </form>

      {/* Checklist Search, Filter Tabs, Sort, & Mode Switcher */}
      {subtasks.length > 0 && (
        <TaskChecklistFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterTab={filterTab}
          onFilterTabChange={setFilterTab}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          counts={counts}
        />
      )}

      {/* Subtasks List / Checklist */}
      {subtasks.length === 0 ? (
        <div className="py-8 text-center border-2 border-dashed border-white/[0.06] rounded-xl">
          <ListTodo className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-white">No subtasks yet</p>
          <p className="text-xs text-slate-400 mt-1 mb-3">
            Break this task down into manageable, actionable checkpoints.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleOpenAddModal}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            + Add First Subtask
          </Button>
        </div>
      ) : processedSubtasks.length === 0 ? (
        <div className="py-6 text-center text-slate-400 text-xs border border-white/[0.04] rounded-xl bg-[#171C27]/40">
          No subtasks match your filter or search query.
        </div>
      ) : (
        <div className="space-y-2">
          {processedSubtasks.map((st, idx) => (
            <SubtaskItem
              key={st.id}
              subtask={st}
              index={idx}
              totalCount={processedSubtasks.length}
              onToggle={handleToggleSubtask}
              onEdit={handleOpenEditModal}
              onDelete={(id) => deleteSubtask(task.id, id)}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              isCompact={viewMode === 'compact'}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Subtask Modal */}
      <SubtaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSubtaskToEdit(null);
        }}
        onSubmit={handleModalSubmit}
        initialData={subtaskToEdit}
        title={subtaskToEdit ? 'Edit Subtask' : 'Add Subtask'}
      />
    </div>
  );
}

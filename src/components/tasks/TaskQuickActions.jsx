import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskContext } from '../../context/TaskContext';
import { useFocusContext } from '../../context/FocusContext';
import {
  Edit2,
  Flame,
  CheckCircle2,
  Play,
  Copy,
  Trash2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import Button from '../common/Button';

export default function TaskQuickActions({ task }) {
  const navigate = useNavigate();
  const {
    openEditModal,
    setTaskStatus,
    duplicateTaskById,
    deleteTask,
    showToast,
  } = useTaskContext();
  const { startFocus } = useFocusContext();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!task) return null;

  const isCompleted = task.status === 'completed';
  const isInProgress = task.status === 'in_progress';

  const handleStartFocus = () => {
    startFocus(task.id);
    navigate(`/focus?task=${task.id}`);
  };

  const handleToggleComplete = () => {
    if (isCompleted) {
      setTaskStatus(task.id, 'pending');
      showToast('Task marked as pending', 'info');
    } else {
      setTaskStatus(task.id, 'completed');
      showToast('Task completed 🎉', 'success');
    }
  };

  const handleMarkInProgress = () => {
    setTaskStatus(task.id, 'in_progress');
    showToast('Task in progress', 'info');
  };

  const handleDuplicate = () => {
    const duplicated = duplicateTaskById(task.id);
    if (duplicated) {
      navigate(`/tasks/${duplicated.id}`);
    }
  };

  const handleDeleteConfirm = () => {
    deleteTask(task.id);
    setShowDeleteConfirm(false);
    navigate('/tasks');
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* 1. Start Focus */}
      <Button
        variant="primary"
        size="sm"
        onClick={handleStartFocus}
        icon={<Flame className="w-3.5 h-3.5 text-amber-300" />}
      >
        Start Focus
      </Button>

      {/* 2. Complete / Reopen */}
      <Button
        variant={isCompleted ? 'secondary' : 'secondary'}
        size="sm"
        onClick={handleToggleComplete}
        icon={
          isCompleted ? (
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
          )
        }
      >
        {isCompleted ? 'Reopen Task' : 'Complete Task'}
      </Button>

      {/* 3. Mark In Progress (if not already in progress or completed) */}
      {!isInProgress && !isCompleted && (
        <Button
          variant="secondary"
          size="sm"
          onClick={handleMarkInProgress}
          icon={<Play className="w-3.5 h-3.5 text-[#06B6D4]" />}
        >
          In Progress
        </Button>
      )}

      {/* 4. Edit Task */}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => openEditModal(task)}
        icon={<Edit2 className="w-3.5 h-3.5 text-slate-300" />}
      >
        Edit
      </Button>

      {/* 5. Duplicate Task */}
      <Button
        variant="secondary"
        size="sm"
        onClick={handleDuplicate}
        icon={<Copy className="w-3.5 h-3.5 text-slate-300" />}
      >
        Duplicate
      </Button>

      {/* 6. Delete Task with Dialog */}
      <Button
        variant="danger"
        size="sm"
        onClick={() => setShowDeleteConfirm(true)}
        icon={<Trash2 className="w-3.5 h-3.5" />}
      >
        Delete
      </Button>

      {/* Delete Confirmation Modal (Requirement 18) */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md bg-[#11151F] border border-white/[0.1] rounded-2xl p-6 shadow-hover space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444]">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-white">Delete this task?</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Are you sure you want to delete <strong className="text-white">"{task.title}"</strong>?
                </p>
                <div className="p-2.5 mt-2.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[11px] text-[#fca5a5]">
                  ⚠️ Warning: All associated subtasks ({task.subtasks?.length || 0}), task-specific notes, and tracked data will also be permanently removed.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteConfirm}
                icon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Delete Task
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

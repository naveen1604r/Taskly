import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useGoalsContext } from '../../context/GoalsContext';
import { useTaskContext } from '../../context/TaskContext';
import { CheckSquare, Square, Search, Link2 } from 'lucide-react';

export default function LinkTaskModal() {
  const { taskLinkGoal, closeLinkTaskModal, setGoalRelatedTasks } = useGoalsContext();
  const { tasks } = useTaskContext();

  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (taskLinkGoal) {
      setSelectedIds(taskLinkGoal.relatedTaskIds || []);
      setSearchTerm('');
    }
  }, [taskLinkGoal]);

  if (!taskLinkGoal) return null;

  const toggleSelect = (taskId) => {
    setSelectedIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleSave = () => {
    setGoalRelatedTasks(taskLinkGoal.id, selectedIds);
  };

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal
      isOpen={Boolean(taskLinkGoal)}
      onClose={closeLinkTaskModal}
      title="Link Tasks to Goal"
      subtitle={`Select tasks related to "${taskLinkGoal.title}"`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search existing tasks..."
            className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-[#171C27] text-white placeholder-slate-500 rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none"
          />
        </div>

        {/* Task Selection List */}
        <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
          {filteredTasks.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center italic">
              No tasks found. Create tasks first in the Tasks page.
            </p>
          ) : (
            filteredTasks.map((task) => {
              const isChecked = selectedIds.includes(task.id);
              return (
                <div
                  key={task.id}
                  onClick={() => toggleSelect(task.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                    isChecked
                      ? 'bg-[#7C3AED]/10 border-[#7C3AED]/30 text-white'
                      : 'bg-[#171C27] border-white/[0.06] text-slate-300 hover:border-white/[0.14]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      className="shrink-0 text-[#7C3AED]"
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-[#7C3AED]" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold truncate">
                        {task.title}
                      </p>
                      <p className="text-[10px] text-[#94A3B8]">
                        Status: <span className="text-slate-300">{task.status}</span> • Priority: {task.priority}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
          <span className="text-xs text-[#94A3B8]">
            {selectedIds.length} {selectedIds.length === 1 ? 'task' : 'tasks'} selected
          </span>
          <div className="flex items-center gap-2.5">
            <Button variant="secondary" size="sm" onClick={closeLinkTaskModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Link2 className="w-3.5 h-3.5" />}
              onClick={handleSave}
            >
              Save Linked Tasks
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

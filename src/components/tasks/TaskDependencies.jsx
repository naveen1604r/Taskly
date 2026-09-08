import React, { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import {
  isTaskBlocked,
  getBlockingTasks,
  getDependentTasks,
  getTaskDependencies,
} from '../../utils/dependencyUtils';
import DependencyList from './DependencyList';
import DependencySelector from './DependencySelector';
import BlockingTasks from './BlockingTasks';
import { Link2, Plus, Lock, CheckCircle2 } from 'lucide-react';
import Button from '../common/Button';

export default function TaskDependencies({ task }) {
  const { tasks, updateTask } = useTaskContext();
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  if (!task) return null;

  const isBlocked = isTaskBlocked(task, tasks);
  const blockingTasks = getBlockingTasks(task, tasks);
  const dependentTasks = getDependentTasks(task.id, tasks);
  const resolvedDependencies = getTaskDependencies(task, tasks);

  const handleAddDependency = (newDepId) => {
    const current = Array.isArray(task.dependencyIds) ? task.dependencyIds : [];
    if (!current.includes(newDepId)) {
      updateTask(task.id, {
        dependencyIds: [...current, newDepId],
      });
    }
    setIsSelectorOpen(false);
  };

  const handleRemoveDependency = (depIdToRemove) => {
    const current = Array.isArray(task.dependencyIds) ? task.dependencyIds : [];
    updateTask(task.id, {
      dependencyIds: current.filter((id) => id !== depIdToRemove),
    });
  };

  return (
    <div className="space-y-4">
      {/* Dependency Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#11151F] border border-white/[0.08]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-[#7C3AED]/15 text-[#7C3AED] shrink-0">
            <Link2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">Workflow Dependencies</h4>
              {isBlocked ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#F59E0B] bg-[#F59E0B]/15 px-2 py-0.5 rounded-full border border-[#F59E0B]/30">
                  <Lock className="w-3 h-3" />
                  <span>Blocked ({blockingTasks.length} waiting)</span>
                </span>
              ) : resolvedDependencies.length > 0 ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#22C55E] bg-[#22C55E]/15 px-2 py-0.5 rounded-full border border-[#22C55E]/30">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Unblocked & Ready</span>
                </span>
              ) : null}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Prerequisite tasks that must be completed before this deliverable can start.
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsSelectorOpen(true)}
          icon={<Plus className="w-3.5 h-3.5" />}
          className="self-start sm:self-auto shrink-0"
        >
          Add Dependency
        </Button>
      </div>

      {/* Blocked By List */}
      <DependencyList
        dependencies={resolvedDependencies}
        onRemoveDependency={handleRemoveDependency}
      />

      {/* Downstream Blocked Tasks */}
      <BlockingTasks dependentTasks={dependentTasks} />

      {/* Dependency Selection Modal */}
      <DependencySelector
        taskId={task.id}
        currentDependencyIds={task.dependencyIds || []}
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        onAddDependency={handleAddDependency}
      />
    </div>
  );
}

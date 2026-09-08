import React, { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { useActivityContext } from '../../context/ActivityContext';
import { cleanDemoTasks, isDemoTask } from '../../utils/taskStorage';
import DataConfirmationModal from './DataConfirmationModal';
import Card from '../common/Card';
import Button from '../common/Button';
import { Sparkles, Trash2, AlertCircle, Wrench, CheckCircle2 } from 'lucide-react';

export default function DemoDataCleanup() {
  const { tasks, removeDemoTasks, showToast } = useTaskContext();
  const { logActivity } = useActivityContext() || {};

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDevResetOpen, setIsDevResetOpen] = useState(false);

  const demoTasksCount = (tasks || []).filter(isDemoTask).length;

  const handleConfirmRemoveDemo = () => {
    if (removeDemoTasks) {
      const removedCount = removeDemoTasks();
      if (logActivity) {
        logActivity({
          title: `Removed ${removedCount} demo / sample tasks`,
          category: 'Data',
        });
      }
    }
    setIsConfirmOpen(false);
  };

  const handleDevReset = () => {
    // Only remove known demo keys, NEVER use localStorage.clear()
    try {
      const remainingTasks = cleanDemoTasks(tasks);
      localStorage.setItem('taskly_tasks', JSON.stringify(remainingTasks));
      localStorage.removeItem('taskly_recurring_tasks'); // Reset recurring rules to clean empty state

      if (showToast) showToast('Development demo data reset completed', 'success');
      if (logActivity) {
        logActivity({
          title: 'Development reset: cleared demo tasks and default recurring rules',
          category: 'Data',
        });
      }
    } catch (e) {
      console.error('Failed dev reset:', e);
    }

    setIsDevResetOpen(false);
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  return (
    <div className="space-y-4">
      {/* 1. Safe Demo Tasks Removal */}
      <Card
        title="Demo & Sample Task Cleanup"
        subtitle="Safely purge automatically generated demo tasks and duplicate routine instances"
        action={
          demoTasksCount > 0 ? (
            <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-400 font-mono font-bold text-[11px] border border-amber-500/25">
              {demoTasksCount} demo tasks detected
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 font-mono font-bold text-[11px] border border-emerald-500/25 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Clean</span>
            </span>
          )
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-300 leading-relaxed">
            If hundreds of sample tasks or recurring routine instances appeared automatically, you can clean them safely.
            This operation identifies and removes only demo, seed, and generated duplicate items while keeping all your manually created deliverables completely untouched.
          </p>

          <div className="p-3.5 rounded-2xl bg-[#171C27] border border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-white block">Remove Demo / Sample Tasks</span>
              <span className="text-slate-400 text-[11px]">
                {demoTasksCount > 0
                  ? `Found ${demoTasksCount} demo/duplicate tasks out of ${tasks.length} total tasks.`
                  : 'No demo or sample tasks currently present in your workspace.'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsConfirmOpen(true)}
              disabled={demoTasksCount === 0}
              className="px-3.5 py-1.5 rounded-xl bg-[#EF4444] hover:bg-[#dc2626] disabled:opacity-40 disabled:hover:bg-[#EF4444] disabled:cursor-not-allowed text-white font-bold transition-all flex items-center gap-1.5 shrink-0 text-xs shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Demo Tasks</span>
            </button>
          </div>
        </div>
      </Card>

      {/* 2. Development-Only Reset Option (Visible ONLY when import.meta.env.DEV is true) */}
      {import.meta.env.DEV && (
        <Card
          title="Development Environment Tools"
          subtitle="Developer-only reset utilities (hidden in production builds)"
          action={
            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold text-[10px] border border-purple-500/30">
              DEV ONLY
            </span>
          }
        >
          <div className="space-y-3 text-xs">
            <p className="text-slate-300">
              Reset known demo storage keys without affecting user settings or triggering full browser storage loss.
            </p>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#171C27] border border-purple-500/20">
              <div>
                <span className="font-bold text-white block">Reset Demo Data</span>
                <span className="text-slate-400 text-[11px]">
                  Purges demo tasks and resets recurring rule seeds to 0. Does not use localStorage.clear().
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsDevResetOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors text-xs shrink-0 flex items-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Reset Demo Data</span>
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Confirmation Modal for Demo Tasks Removal */}
      <DataConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmRemoveDemo}
        title="Remove Demo Tasks?"
        description="This will remove only tasks identified as demo/sample/generated data. Legitimate tasks manually created by you will be preserved."
        confirmButtonText="Remove Demo Tasks"
        confirmButtonVariant="danger"
      />

      {/* Confirmation Modal for Dev Reset */}
      <DataConfirmationModal
        isOpen={isDevResetOpen}
        onClose={() => setIsDevResetOpen(false)}
        onConfirm={handleDevReset}
        title="Reset Demo Data (DEV)?"
        description="This will reset demo task data and empty the recurring rule template list to start fresh from 0. User settings will be preserved."
        confirmButtonText="Reset Demo Data"
        confirmButtonVariant="danger"
      />
    </div>
  );
}

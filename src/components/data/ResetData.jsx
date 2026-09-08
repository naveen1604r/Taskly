import React, { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { useActivityContext } from '../../context/ActivityContext';
import { clearTasklyCategory, CATEGORY_DEFINITIONS } from '../../utils/dataManagerUtils';
import DataConfirmationModal from './DataConfirmationModal';
import Card from '../common/Card';
import {
  Trash2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

const clearableCategories = [
  { id: 'tasks', label: 'Clear Tasks & Subtasks', desc: 'Removes all tasks and subtasks from your board and views.' },
  { id: 'projects', label: 'Clear Projects', desc: 'Removes all projects. Tasks will remain as unassigned deliverables.' },
  { id: 'notes', label: 'Clear Notes', desc: 'Removes all notes, quick memos, and associated tag links.' },
  { id: 'goals', label: 'Clear Goals', desc: 'Removes all strategic goals and progress milestones.' },
  { id: 'focusSessions', label: 'Clear Focus History', desc: 'Clears Pomodoro timer sessions and focus metrics.' },
  { id: 'notifications', label: 'Clear Notifications', desc: 'Empties notification inbox and alert logs.' },
  { id: 'activity', label: 'Clear Activity History', desc: 'Wipes the daily activity timeline.' },
];

export default function ResetData() {
  const { showToast } = useTaskContext();
  const { logActivity } = useActivityContext();

  const [categoryToClear, setCategoryToClear] = useState(null);

  const handleConfirmClear = () => {
    if (!categoryToClear) return;

    clearTasklyCategory(categoryToClear.id);
    if (showToast) showToast(`Cleared ${categoryToClear.label}`, 'success');
    if (logActivity) {
      logActivity({
        title: `Cleared category: ${categoryToClear.label}`,
        category: 'Data',
      });
    }

    setCategoryToClear(null);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <>
      <Card
        title="Reset Specific Data"
        subtitle="Selectively wipe specific data categories while keeping the rest intact"
        action={<RotateCcw className="w-4 h-4 text-[#F59E0B]" />}
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-300">
            Need to start fresh on a particular section? Clear specific categories below. A safety snapshot is automatically created before any data is removed.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {clearableCategories.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-[#171C27] border border-white/[0.04] flex flex-col justify-between space-y-2"
              >
                <div>
                  <h5 className="font-bold text-white">{item.label}</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/[0.03] flex justify-end">
                  <button
                    type="button"
                    onClick={() => setCategoryToClear(item)}
                    className="px-2.5 py-1 rounded-xl bg-[#EF4444]/10 hover:bg-[#EF4444] text-[#EF4444] hover:text-white border border-[#EF4444]/25 text-[11px] font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear Data</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <DataConfirmationModal
        isOpen={Boolean(categoryToClear)}
        onClose={() => setCategoryToClear(null)}
        onConfirm={handleConfirmClear}
        title={`Clear ${categoryToClear?.label}?`}
        description={`This action will permanently delete all stored data in "${categoryToClear?.label}". A safety snapshot will be preserved.`}
        confirmButtonText="Yes, Clear Data"
        confirmButtonVariant="danger"
      />
    </>
  );
}

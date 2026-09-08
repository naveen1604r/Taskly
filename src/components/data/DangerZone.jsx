import React, { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { useActivityContext } from '../../context/ActivityContext';
import { clearAllTasklyData, createBackup, downloadBackup } from '../../utils/dataManagerUtils';
import Button from '../common/Button';
import { AlertOctagon, Trash2, Download, X } from 'lucide-react';

export default function DangerZone() {
  const { showToast } = useTaskContext();
  const { logActivity } = useActivityContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmPhrase, setConfirmPhrase] = useState('');

  const handleExportFirst = () => {
    const backup = createBackup();
    downloadBackup(backup);
    if (showToast) showToast('Backup downloaded. You may now safely reset.', 'success');
  };

  const handleExecuteResetAll = () => {
    if (confirmPhrase.toLowerCase() !== 'delete all') {
      if (showToast) showToast('Please type "delete all" to confirm', 'error');
      return;
    }

    clearAllTasklyData();
    if (showToast) showToast('All Taskly data wiped cleanly', 'success');
    if (logActivity) {
      logActivity({
        title: 'Performed full Taskly data reset',
        category: 'Data',
      });
    }

    setIsModalOpen(false);
    setTimeout(() => {
      window.location.href = '/';
    }, 500);
  };

  return (
    <>
      <div className="p-5 sm:p-6 rounded-3xl bg-[#EF4444]/5 border border-[#EF4444]/25 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Danger Zone</h4>
              <p className="text-xs text-slate-400">
                Irreversible destructive actions
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#11151F] border border-[#EF4444]/20 text-xs">
          <div className="space-y-1 max-w-lg">
            <span className="font-bold text-white block">Delete All Taskly Data</span>
            <p className="text-slate-400 leading-relaxed">
              Permanently removes all tasks, projects, notes, goals, focus sessions, and settings from this browser. Only Taskly storage keys are removed.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setConfirmPhrase('');
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#EF4444] hover:bg-[#dc2626] text-white font-bold transition-colors flex items-center gap-2 self-start sm:self-auto shrink-0 shadow-lg shadow-[#EF4444]/20"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset Everything</span>
          </button>
        </div>
      </div>

      {/* Extreme Confirmation Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-[#11151F] border border-[#EF4444]/40 rounded-3xl p-6 shadow-2xl space-y-4 text-xs animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40">
                  <AlertOctagon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Delete All Taskly Data?</h3>
                  <p className="text-xs text-slate-400">Irreversible browser storage wipe</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-slate-200 space-y-2 leading-relaxed">
              <p className="font-bold text-[#EF4444]">
                ⚠️ Warning: This will permanently erase your data from this browser!
              </p>
              <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-slate-300">
                <li>All Tasks, Projects, and Subtasks</li>
                <li>All Notes, Goals, and Routines</li>
                <li>All Focus Timer records and Daily Activity logs</li>
                <li>All custom preferences and dashboard layouts</li>
              </ul>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#171C27] border border-white/[0.06]">
              <span className="text-slate-300">Recommended: download a backup first</span>
              <button
                type="button"
                onClick={handleExportFirst}
                className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white font-semibold transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-[#06B6D4]" />
                <span>Export Backup</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block">
                Type <span className="text-[#EF4444] font-mono">delete all</span> to confirm:
              </label>
              <input
                type="text"
                value={confirmPhrase}
                onChange={(e) => setConfirmPhrase(e.target.value)}
                placeholder="delete all"
                className="w-full bg-[#171C27] border border-[#EF4444]/40 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-[#EF4444]"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/[0.06]">
              <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <button
                type="button"
                onClick={handleExecuteResetAll}
                disabled={confirmPhrase.toLowerCase() !== 'delete all'}
                className="px-4 py-2 rounded-xl bg-[#EF4444] hover:bg-[#dc2626] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition-colors"
              >
                Permanently Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

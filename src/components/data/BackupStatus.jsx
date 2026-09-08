import React, { useState, useEffect } from 'react';
import { useSettingsContext } from '../../context/SettingsContext';
import { useTaskContext } from '../../context/TaskContext';
import { useActivityContext } from '../../context/ActivityContext';
import {
  getBackupMetadata,
  hasSafetyBackup,
  restoreSafetyBackup,
  isBackupReminderOverdue,
} from '../../utils/dataManagerUtils';
import Card from '../common/Card';
import Button from '../common/Button';
import {
  Clock,
  RotateCcw,
  BellRing,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function BackupStatus({ onExportClick }) {
  const { settings, updateSettings } = useSettingsContext();
  const { showToast } = useTaskContext();
  const { logActivity } = useActivityContext();

  const [metadata, setMetadata] = useState(() => getBackupMetadata());
  const [canUndo, setCanUndo] = useState(() => hasSafetyBackup());
  const [isUndoModalOpen, setIsUndoModalOpen] = useState(false);

  // Backup reminder interval
  const backupReminder = settings?.preferences?.backupReminder || 'monthly';

  const isOverdue = isBackupReminderOverdue(backupReminder, metadata.lastExportAt);

  const handleReminderChange = (freq) => {
    updateSettings('preferences', { backupReminder: freq });
    if (showToast) showToast(`Backup reminder set to ${freq}`, 'success');
  };

  const handleUndoRestore = () => {
    const result = restoreSafetyBackup();
    if (result.success) {
      if (showToast) showToast('Safety snapshot restored successfully', 'success');
      if (logActivity) {
        logActivity({
          title: 'Undid last restore: restored pre-import safety backup',
          category: 'Data',
        });
      }
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      if (showToast) showToast(result.error || 'Failed to undo restore', 'error');
    }
  };

  return (
    <Card
      title="Backup Activity & Safety"
      subtitle="Track your latest exports, undo previous restores, and configure backup alerts"
      action={<Clock className="w-4 h-4 text-[#06B6D4]" />}
    >
      <div className="space-y-4 text-xs">
        {/* Overdue Backup Reminder Banner */}
        {isOverdue && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                It's been a while since your last backup. Export a fresh backup to protect your deliverables.
              </span>
            </div>
            {onExportClick && (
              <button
                type="button"
                onClick={onExportClick}
                className="px-3 py-1 rounded-xl bg-amber-500 text-black font-bold shrink-0 self-start sm:self-auto hover:bg-amber-400 transition-colors"
              >
                Backup Now
              </button>
            )}
          </div>
        )}

        {/* Timestamps Snapshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#171C27] border border-white/[0.04] space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">
              Last Backup Export
            </span>
            <span className="text-sm font-bold text-white font-mono">
              {metadata.lastExportAt
                ? new Date(metadata.lastExportAt).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Never exported'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#171C27] border border-white/[0.04] space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">
              Last Data Import
            </span>
            <span className="text-sm font-bold text-cyan-400 font-mono">
              {metadata.lastImportAt
                ? new Date(metadata.lastImportAt).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }) + ` (${metadata.lastImportType || 'merge'})`
                : 'Never imported'}
            </span>
          </div>
        </div>

        {/* Reminder Interval & Undo Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-white/[0.04]">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 block">
              Backup Reminder Frequency
            </label>
            <div className="flex items-center gap-1.5">
              {[
                { id: 'off', label: 'Off' },
                { id: 'weekly', label: 'Weekly' },
                { id: 'biweekly', label: 'Every 2 Weeks' },
                { id: 'monthly', label: 'Monthly' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleReminderChange(opt.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    backupReminder === opt.id
                      ? 'bg-[#7C3AED] text-white shadow-xs'
                      : 'bg-[#171C27] text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {canUndo && (
            <div className="self-start sm:self-auto">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleUndoRestore}
                icon={<RotateCcw className="w-3.5 h-3.5 text-cyan-400" />}
              >
                Undo Last Restore
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

import React, { useState, useRef } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { useActivityContext } from '../../context/ActivityContext';
import {
  validateBackupFile,
  replaceBackupData,
  mergeBackupData,
} from '../../utils/dataManagerUtils';
import ImportPreview from './ImportPreview';
import Card from '../common/Card';
import Button from '../common/Button';
import { Upload, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

export default function ImportBackup() {
  const { showToast } = useTaskContext();
  const { logActivity } = useActivityContext();

  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [importError, setImportError] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const processFile = (file) => {
    if (!file) return;

    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      setImportError('Please select a valid .json file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const parsed = JSON.parse(text);
        const result = validateBackupFile(parsed);

        if (!result.isValid) {
          setImportError(result.error || 'Failed to validate Taskly backup file.');
          if (showToast) showToast(result.error || 'Invalid backup file', 'error');
          return;
        }

        setImportError('');
        setValidationResult(result);
        setIsPreviewOpen(true);
      } catch (err) {
        setImportError('Invalid JSON format: Could not parse file contents.');
        if (showToast) showToast('Failed to parse JSON file', 'error');
      }
    };
    reader.onerror = () => {
      setImportError('Failed to read file from disk.');
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const handleConfirmImport = ({ data, selectedCategories, importMode, conflictStrategy }) => {
    try {
      if (importMode === 'replace') {
        replaceBackupData(data, selectedCategories);
        if (showToast) showToast('Taskly data successfully restored from backup', 'success');
        if (logActivity) {
          logActivity({
            title: `Restored Taskly data from backup (${selectedCategories.length} categories replaced)`,
            category: 'Data',
          });
        }
      } else {
        mergeBackupData(data, selectedCategories, conflictStrategy);
        if (showToast) showToast('Backup merged successfully with current data', 'success');
        if (logActivity) {
          logActivity({
            title: `Merged Taskly backup with strategy "${conflictStrategy}"`,
            category: 'Data',
          });
        }
      }

      setIsPreviewOpen(false);

      // Force soft reload to sync all contexts
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (e) {
      console.error('Import execution failed:', e);
      if (showToast) showToast('Import execution failed: ' + e.message, 'error');
    }
  };

  return (
    <>
      <Card
        title="Import & Restore Backup"
        subtitle="Upload a Taskly JSON backup to restore or merge your data"
        action={<Upload className="w-4 h-4 text-[#7C3AED]" />}
      >
        <div className="space-y-4 text-xs">
          {/* Error Banner */}
          {importError && (
            <div className="p-3 rounded-2xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{importError}</span>
              </div>
              <button
                type="button"
                onClick={() => setImportError('')}
                className="underline hover:text-white"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
            id="taskly-backup-file-input"
            aria-label="Upload Taskly backup JSON"
          />

          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-[#7C3AED] bg-[#7C3AED]/10 scale-[0.99]'
                : 'border-white/[0.1] hover:border-white/[0.25] bg-[#171C27]/40 hover:bg-[#171C27]/80'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-[#7C3AED]/15 text-[#7C3AED] mx-auto mb-3 flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-white mb-1">
              Click to browse or drag & drop backup file
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Accepts valid Taskly JSON backup files (<span className="font-mono text-slate-300">.json</span>).
              You will preview the contents before anything is modified.
            </p>
          </div>
        </div>
      </Card>

      {/* Import Preview Modal */}
      <ImportPreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        validationResult={validationResult}
        onConfirmImport={handleConfirmImport}
      />
    </>
  );
}

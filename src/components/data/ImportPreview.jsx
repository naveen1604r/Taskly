import React, { useState } from 'react';
import {
  X,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Layers,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import Button from '../common/Button';
import { CATEGORY_DEFINITIONS } from '../../utils/dataManagerUtils';

export default function ImportPreview({
  isOpen,
  onClose,
  validationResult,
  onConfirmImport,
}) {
  if (!isOpen || !validationResult) return null;

  const { preview, warnings = [], normalizedData, includedData } = validationResult;

  const [importMode, setImportMode] = useState('merge'); // 'merge' | 'replace'
  const [conflictStrategy, setConflictStrategy] = useState('keep_existing'); // 'keep_existing' | 'replace_existing' | 'create_copy'
  const [selectedCategories, setSelectedCategories] = useState(() =>
    Object.keys(preview.categories || {})
  );

  const handleToggleCategory = (catId) => {
    if (selectedCategories.includes(catId)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  const handleExecute = () => {
    onConfirmImport({
      data: normalizedData,
      selectedCategories,
      importMode,
      conflictStrategy,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-2xl bg-[#11151F] border border-white/[0.1] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150 text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#7C3AED]/15 text-[#7C3AED] border border-[#7C3AED]/30">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Backup Preview & Inspection</h3>
              <p className="text-xs text-slate-400">
                Inspect backup payload and choose your import strategy
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {/* Metadata Snapshot */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-[#171C27] border border-white/[0.04]">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                Exported Date
              </span>
              <span className="font-mono text-white text-xs font-bold">
                {preview.exportedAt ? new Date(preview.exportedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown'}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                Backup Version
              </span>
              <span className="font-mono text-cyan-400 text-xs font-bold">
                v{preview.version}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                Total Records
              </span>
              <span className="font-mono text-emerald-400 text-xs font-bold">
                {preview.totalRecords} entries
              </span>
            </div>
          </div>

          {/* Warnings list if any */}
          {warnings.length > 0 && (
            <div className="p-3 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Validation Notes</span>
              </div>
              <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                {warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Categories Contained in Backup */}
          <div className="space-y-2">
            <span className="font-semibold text-slate-300 block">
              Categories Included in Backup (Select which to import):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.keys(preview.categories || {}).map((catId) => {
                const count = preview.categories[catId];
                const def = CATEGORY_DEFINITIONS.find((c) => c.id === catId);
                const isSelected = selectedCategories.includes(catId);

                return (
                  <button
                    key={catId}
                    type="button"
                    onClick={() => handleToggleCategory(catId)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#7C3AED]/15 border-[#7C3AED]/40 text-white'
                        : 'bg-[#171C27]/50 border-white/[0.04] text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <span className="font-semibold truncate mr-2">{def?.label || catId}</span>
                    <span className="font-mono text-[11px] px-1.5 py-0.2 rounded-md bg-white/[0.06] text-white">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Import Mode Selector */}
          <div className="space-y-2 pt-2 border-t border-white/[0.06]">
            <span className="font-semibold text-slate-300 block">Import Mode</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setImportMode('merge')}
                className={`p-3 rounded-2xl border text-left transition-all space-y-1 ${
                  importMode === 'merge'
                    ? 'bg-[#06B6D4]/15 border-[#06B6D4]/40 text-white'
                    : 'bg-[#171C27] border-white/[0.06] text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Merge With Existing</span>
                  {importMode === 'merge' && <CheckCircle2 className="w-4 h-4 text-[#06B6D4]" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Safely combine imported items with your existing data without deleting current records.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setImportMode('replace')}
                className={`p-3 rounded-2xl border text-left transition-all space-y-1 ${
                  importMode === 'replace'
                    ? 'bg-[#EF4444]/15 border-[#EF4444]/40 text-white'
                    : 'bg-[#171C27] border-white/[0.06] text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Replace Existing Data</span>
                  {importMode === 'replace' && <AlertTriangle className="w-4 h-4 text-[#EF4444]" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Overwrites selected categories with the backup data. Existing records in those categories will be replaced.
                </p>
              </button>
            </div>
          </div>

          {/* Merge Conflict Resolution Strategy */}
          {importMode === 'merge' && (
            <div className="space-y-2 p-3 rounded-2xl bg-[#171C27] border border-white/[0.04]">
              <span className="font-semibold text-slate-300 block">
                ID Conflict Resolution Strategy:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'keep_existing', label: 'Keep Existing', desc: 'Preserves current items' },
                  { id: 'replace_existing', label: 'Replace Matches', desc: 'Updates matching IDs' },
                  { id: 'create_copy', label: 'Create Copies', desc: 'Creates new duplicate IDs' },
                ].map((strat) => (
                  <button
                    key={strat.id}
                    type="button"
                    onClick={() => setConflictStrategy(strat.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      conflictStrategy === strat.id
                        ? 'bg-[#7C3AED]/20 border-[#7C3AED] text-white'
                        : 'bg-[#11151F] border-white/[0.04] text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="font-bold block text-xs">{strat.label}</span>
                    <span className="text-[10px] text-slate-400">{strat.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Replace Warning Banner */}
          {importMode === 'replace' && (
            <div className="p-3 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] space-y-1">
              <span className="font-bold block">⚠️ Strong Confirmation:</span>
              <p className="text-[11px] leading-relaxed">
                All existing items in the selected categories will be replaced. A safety snapshot will be taken automatically so you can undo if necessary.
              </p>
            </div>
          )}

          {/* Safety Guarantee Notice */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px]">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Automatic safety backup will be created before writing changes.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2.5 shrink-0">
          <Button variant="ghost" size="sm" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExecute}
            disabled={selectedCategories.length === 0}
            className={
              importMode === 'replace'
                ? 'bg-[#EF4444] hover:bg-[#dc2626] text-white font-bold'
                : 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold'
            }
          >
            {importMode === 'replace' ? 'Replace & Restore' : 'Merge Backup'}
          </Button>
        </div>
      </div>
    </div>
  );
}

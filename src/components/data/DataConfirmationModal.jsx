import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from '../common/Button';

export default function DataConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  description = 'Are you sure you want to proceed?',
  warningText = null,
  confirmButtonText = 'Proceed',
  confirmButtonVariant = 'danger',
  icon = AlertTriangle,
}) {
  if (!isOpen) return null;

  const IconComp = icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md bg-[#11151F] border border-white/[0.1] rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/25">
              <IconComp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{title}</h3>
              <p className="text-xs text-slate-400">Confirmation required</p>
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

        <p className="text-slate-300 leading-relaxed">{description}</p>

        {warningText && (
          <div className="p-3 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] leading-relaxed">
            {warningText}
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.06]">
          <Button variant="ghost" size="sm" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            variant={confirmButtonVariant === 'danger' ? 'primary' : 'primary'}
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={
              confirmButtonVariant === 'danger'
                ? 'bg-[#EF4444] hover:bg-[#dc2626] text-white font-bold'
                : 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold'
            }
          >
            {confirmButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
}

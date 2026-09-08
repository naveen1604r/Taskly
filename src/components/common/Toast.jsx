import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />,
    error: <AlertCircle className="w-5 h-5 text-[#EF4444]" />,
    info: <Info className="w-5 h-5 text-[#06B6D4]" />,
  };

  const borders = {
    success: 'border-[#22C55E]/30',
    error: 'border-[#EF4444]/30',
    info: 'border-[#06B6D4]/30',
  };

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 bg-[#171C27] border rounded-2xl shadow-hover animate-in slide-in-from-bottom-5 duration-200 ${
        borders[toast.type] || borders.success
      }`}
    >
      <div className="shrink-0">{icons[toast.type] || icons.success}</div>
      <div className="text-sm font-medium text-white pr-2">{toast.message}</div>
      <button
        type="button"
        onClick={onDismiss}
        className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
        aria-label="Dismiss toast"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

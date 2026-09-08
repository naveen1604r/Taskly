import React from 'react';
import Card from '../common/Card';
import { Keyboard } from 'lucide-react';

export default function KeyboardShortcuts() {
  const shortcuts = [
    { key: 'N', description: 'Create new task from any screen' },
    { key: '/', description: 'Focus search input bar' },
    { key: 'Esc', description: 'Close open modal, dropdown, or viewer' },
    { key: 'G', description: 'Quick jump to Goals & Milestones' },
    { key: 'C', description: 'Quick jump to Calendar matrix' },
    { key: 'A', description: 'Quick jump to Productivity Analytics' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-white tracking-tight">Keyboard Shortcuts</h3>
        <p className="text-xs text-[#94A3B8] mt-0.5">
          Accelerate your daily productivity workflow with direct keyboard triggers.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {shortcuts.map((sc) => (
          <div
            key={sc.key}
            className="p-3.5 rounded-xl bg-[#11151F] border border-white/[0.06] flex items-center justify-between gap-3"
          >
            <span className="text-xs text-slate-300 font-medium">{sc.description}</span>
            <kbd className="px-2.5 py-1 rounded-lg bg-[#171C27] border border-white/[0.12] text-xs font-mono font-bold text-white shadow-subtle shrink-0">
              {sc.key}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  );
}

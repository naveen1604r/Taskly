import React from 'react';
import { CATEGORY_DEFINITIONS } from '../../utils/dataManagerUtils';
import { CheckSquare, Square } from 'lucide-react';

export default function ExportCategorySelector({
  selectedCategories = [],
  onChange,
}) {
  const allCategoryIds = CATEGORY_DEFINITIONS.map((c) => c.id);

  const handleToggle = (id) => {
    if (selectedCategories.includes(id)) {
      onChange(selectedCategories.filter((c) => c !== id));
    } else {
      onChange([...selectedCategories, id]);
    }
  };

  const handleSelectAll = () => {
    onChange(allCategoryIds);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-300">
          Select Data Categories ({selectedCategories.length}/{allCategoryIds.length})
        </span>
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-[#7C3AED] hover:text-[#c4b5fd] font-semibold transition-colors"
          >
            Select All
          </button>
          <span className="text-slate-600">•</span>
          <button
            type="button"
            onClick={handleClearAll}
            className="text-slate-400 hover:text-white font-semibold transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {CATEGORY_DEFINITIONS.map((cat) => {
          const isSelected = selectedCategories.includes(cat.id);

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleToggle(cat.id)}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left text-xs transition-all ${
                isSelected
                  ? 'bg-[#7C3AED]/10 border-[#7C3AED]/30 text-white'
                  : 'bg-[#171C27] border-white/[0.04] text-slate-400 hover:text-white hover:border-white/[0.1]'
              }`}
            >
              {isSelected ? (
                <CheckSquare className="w-4 h-4 text-[#7C3AED] shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-slate-500 shrink-0" />
              )}
              <span className="font-semibold truncate">{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

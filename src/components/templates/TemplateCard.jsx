import React from 'react';
import Card from '../common/Card';
import { useTemplateContext } from '../../context/TemplateContext';
import { useGoalsContext } from '../../context/GoalsContext';
import { Clock, Target, PlayCircle, Edit2, Trash2, Layers } from 'lucide-react';

export default function TemplateCard({ template }) {
  const { useTemplate, openEditTemplateModal, deleteTemplate } = useTemplateContext();
  const { goals } = useGoalsContext();

  const linkedGoal = goals?.find((g) => g.id === template.goalId);

  return (
    <Card className="flex flex-col justify-between border-white/[0.08] hover:border-white/[0.14] transition-all">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-[#06B6D4] bg-[#06B6D4]/15 border border-[#06B6D4]/30">
                <Layers className="w-2.5 h-2.5" />
                Template
              </span>
              <span className="text-xs text-slate-400 capitalize">
                {template.priority} Priority • {template.category}
              </span>
            </div>

            <h3 className="text-base font-bold text-white tracking-tight truncate">
              {template.name}
            </h3>
            <p className="text-xs text-[#06B6D4] font-medium truncate mt-0.5">
              Prefills: "{template.title}"
            </p>
          </div>
        </div>

        {template.description && (
          <p className="text-xs text-[#94A3B8] line-clamp-2">
            {template.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-1">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#06B6D4]" />
            <span>{template.estimatedDuration || 60}m duration</span>
          </span>

          {linkedGoal && (
            <span className="flex items-center gap-1 text-[#F59E0B]">
              <Target className="w-3 h-3" />
              <span className="truncate max-w-[140px]">{linkedGoal.title}</span>
            </span>
          )}

          {template.usageCount > 0 && (
            <span className="text-[11px] text-slate-500">
              Used {template.usageCount} {template.usageCount === 1 ? 'time' : 'times'}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 mt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => useTemplate(template)}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] text-white transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <PlayCircle className="w-3.5 h-3.5" />
          <span>Use Template</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => openEditTemplateModal(template)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Edit template"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => deleteTemplate(template.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
            title="Delete template"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}

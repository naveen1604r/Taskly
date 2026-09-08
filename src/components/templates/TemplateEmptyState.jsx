import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { useTemplateContext } from '../../context/TemplateContext';
import { Layers, Plus } from 'lucide-react';

export default function TemplateEmptyState() {
  const { openCreateTemplateModal } = useTemplateContext();

  return (
    <Card className="border-dashed border-white/[0.12]">
      <div className="py-14 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#06B6D4]/10 border border-[#06B6D4]/20 flex items-center justify-center text-[#06B6D4] mb-3.5">
          <Layers className="w-7 h-7 stroke-[1.75]" />
        </div>

        <h3 className="text-base font-bold text-white tracking-tight">No task templates yet</h3>
        <p className="text-xs sm:text-sm text-[#94A3B8] max-w-sm mt-1 mb-5">
          Save common tasks as templates to create them faster without retyping titles, durations, and details.
        </p>

        <Button
          variant="primary"
          size="sm"
          onClick={openCreateTemplateModal}
          icon={<Plus className="w-3.5 h-3.5 stroke-[2.5]" />}
        >
          Create Template
        </Button>
      </div>
    </Card>
  );
}

import React, { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { useActivityContext } from '../../context/ActivityContext';
import { createBackup, downloadBackup, CATEGORY_DEFINITIONS } from '../../utils/dataManagerUtils';
import ExportCategorySelector from './ExportCategorySelector';
import Card from '../common/Card';
import Button from '../common/Button';
import { Download, Sliders, CheckCircle2, FileJson } from 'lucide-react';

export default function ExportData() {
  const { showToast } = useTaskContext();
  const { logActivity } = useActivityContext();

  const [isCustomMode, setIsCustomMode] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(() =>
    CATEGORY_DEFINITIONS.map((c) => c.id)
  );

  const handleExportAll = () => {
    const backup = createBackup();
    downloadBackup(backup);
    if (showToast) showToast('Complete Taskly backup exported successfully', 'success');
    if (logActivity) {
      logActivity({
        title: 'Exported complete Taskly backup JSON',
        category: 'Data',
      });
    }
  };

  const handleExportSelected = () => {
    if (selectedCategories.length === 0) {
      if (showToast) showToast('Please select at least one data category to export', 'error');
      return;
    }

    const backup = createBackup(selectedCategories);
    downloadBackup(backup);
    if (showToast) {
      showToast(`Exported ${selectedCategories.length} selected categories`, 'success');
    }
    if (logActivity) {
      logActivity({
        title: `Exported ${selectedCategories.length} selected data categories JSON`,
        category: 'Data',
      });
    }
  };

  return (
    <Card
      title="Export Data"
      subtitle="Download a clean JSON backup of your Taskly data"
      action={<FileJson className="w-4 h-4 text-[#7C3AED]" />}
    >
      <div className="space-y-4 text-xs">
        <p className="text-slate-300 leading-relaxed">
          Create an uncompressed JSON file of your tasks, projects, notes, and preferences. You can use this file anytime to restore your data or migrate to another device.
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <Button
            variant="primary"
            size="md"
            onClick={handleExportAll}
            icon={<Download className="w-4 h-4 stroke-[2.5]" />}
          >
            Export All Data
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => setIsCustomMode(!isCustomMode)}
            icon={<Sliders className="w-4 h-4" />}
          >
            {isCustomMode ? 'Hide Selection' : 'Export Selected Data'}
          </Button>
        </div>

        {/* Category Selector Drawer */}
        {isCustomMode && (
          <div className="p-4 rounded-2xl bg-[#171C27]/60 border border-white/[0.06] space-y-4 animate-in fade-in duration-150">
            <ExportCategorySelector
              selectedCategories={selectedCategories}
              onChange={setSelectedCategories}
            />

            <div className="flex justify-end pt-2 border-t border-white/[0.04]">
              <Button
                variant="primary"
                size="sm"
                onClick={handleExportSelected}
                disabled={selectedCategories.length === 0}
                icon={<Download className="w-3.5 h-3.5" />}
              >
                Export {selectedCategories.length} Selected
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

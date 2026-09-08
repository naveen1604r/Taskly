import React from 'react';
import { useSettingsContext } from '../../context/SettingsContext';

export default function TaskSettings() {
  const { settings, updateSetting } = useSettingsContext();
  const { showCompletedTasks, showTaskDescriptions, autoSortTasks } = settings.tasks;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-white tracking-tight">Task Preferences</h3>
        <p className="text-xs text-[#94A3B8] mt-0.5">
          Control how tasks are displayed, organized, and sorted in your workspace.
        </p>
      </div>

      <div className="space-y-4">
        {/* Show Completed Tasks */}
        <div className="p-4 rounded-xl bg-[#11151F] border border-white/[0.06] flex items-center justify-between gap-4">
          <div>
            <h5 className="text-sm font-semibold text-white">Show Completed Tasks</h5>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Keep finished tasks visible in default task views. When disabled, they can still be viewed under Completed filters.
            </p>
          </div>

          <button
            type="button"
            onClick={() => updateSetting('tasks', 'showCompletedTasks', !showCompletedTasks)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              showCompletedTasks ? 'bg-[#7C3AED]' : 'bg-slate-700'
            }`}
            role="switch"
            aria-checked={showCompletedTasks}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                showCompletedTasks ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Show Task Descriptions */}
        <div className="p-4 rounded-xl bg-[#11151F] border border-white/[0.06] flex items-center justify-between gap-4">
          <div>
            <h5 className="text-sm font-semibold text-white">Show Task Descriptions</h5>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Display description text previews on task cards. Full descriptions remain in the editor.
            </p>
          </div>

          <button
            type="button"
            onClick={() => updateSetting('tasks', 'showTaskDescriptions', !showTaskDescriptions)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              showTaskDescriptions ? 'bg-[#7C3AED]' : 'bg-slate-700'
            }`}
            role="switch"
            aria-checked={showTaskDescriptions}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                showTaskDescriptions ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Auto Sort Tasks */}
        <div className="p-4 rounded-xl bg-[#11151F] border border-white/[0.06] flex items-center justify-between gap-4">
          <div>
            <h5 className="text-sm font-semibold text-white">Auto-Sort Tasks</h5>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Automatically order tasks by Priority (High → Low), then Due Date, then Created Date.
            </p>
          </div>

          <button
            type="button"
            onClick={() => updateSetting('tasks', 'autoSortTasks', !autoSortTasks)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              autoSortTasks ? 'bg-[#7C3AED]' : 'bg-slate-700'
            }`}
            role="switch"
            aria-checked={autoSortTasks}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                autoSortTasks ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

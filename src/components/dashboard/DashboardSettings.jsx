import React from 'react';
import { useDashboardContext, widgetMetadata } from '../../context/DashboardContext';
import { Sliders, X, ArrowUp, ArrowDown, Eye, EyeOff, RotateCcw } from 'lucide-react';
import Button from '../common/Button';

export default function DashboardSettings() {
  const {
    isSettingsOpen,
    closeSettings,
    widgetVisibility,
    widgetOrder,
    toggleWidget,
    moveWidgetUp,
    moveWidgetDown,
    resetDashboard,
  } = useDashboardContext();

  if (!isSettingsOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={closeSettings}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dashboard-settings-title"
    >
      <div
        className="w-full max-w-xl bg-[#11151F] border border-white/[0.1] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#7C3AED]" />
            <div>
              <h3 id="dashboard-settings-title" className="text-base font-bold text-white">
                Customize Dashboard
              </h3>
              <p className="text-xs text-slate-400">
                Show, hide, and reorder widgets to fit your daily flow
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetDashboard}
              className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1 mr-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={closeSettings}
              className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Widget Reorder & Toggle List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
          {widgetOrder.map((widgetId, index) => {
            const meta = widgetMetadata[widgetId] || { title: widgetId, description: '' };
            const isVisible = widgetVisibility[widgetId] ?? true;

            return (
              <div
                key={widgetId}
                className={`flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all text-xs ${
                  isVisible
                    ? 'bg-[#171C27] border-white/[0.08] text-white'
                    : 'bg-[#171C27]/40 border-white/[0.03] text-slate-500'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => toggleWidget(widgetId)}
                    className={`p-1.5 rounded-xl border transition-colors ${
                      isVisible
                        ? 'bg-[#7C3AED]/20 border-[#7C3AED]/40 text-[#c4b5fd]'
                        : 'bg-white/[0.04] border-white/[0.06] text-slate-500'
                    }`}
                    title={isVisible ? 'Hide widget' : 'Show widget'}
                  >
                    {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <span className="font-bold block truncate">{meta.title}</span>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {meta.description}
                    </span>
                  </div>
                </div>

                {/* Reorder Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveWidgetUp(widgetId)}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 hover:text-white transition-colors"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => moveWidgetDown(widgetId)}
                    disabled={index === widgetOrder.length - 1}
                    className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 hover:text-white transition-colors"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end shrink-0">
          <Button variant="primary" size="sm" onClick={closeSettings}>
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { useSettingsContext } from '../../context/SettingsContext';
import { Moon, Sun, Laptop, Check } from 'lucide-react';

const accentColors = [
  { id: 'purple', name: 'Purple', hex: '#7C3AED', ring: 'ring-[#7C3AED]' },
  { id: 'blue', name: 'Blue', hex: '#2563EB', ring: 'ring-[#2563EB]' },
  { id: 'cyan', name: 'Cyan', hex: '#06B6D4', ring: 'ring-[#06B6D4]' },
  { id: 'green', name: 'Green', hex: '#10B981', ring: 'ring-[#10B981]' },
  { id: 'orange', name: 'Orange', hex: '#F97316', ring: 'ring-[#F97316]' },
  { id: 'pink', name: 'Pink', hex: '#EC4899', ring: 'ring-[#EC4899]' },
  { id: 'red', name: 'Red', hex: '#EF4444', ring: 'ring-[#EF4444]' },
];

export default function AppearanceSettings() {
  const { settings, updateSetting } = useSettingsContext();
  const { theme = 'dark', accentColor = 'purple', compactMode = false, animations = true } = settings.appearance || {};

  const themes = [
    { id: 'dark', label: 'Dark', desc: 'Deep obsidian theme optimized for focus', icon: Moon },
    { id: 'light', label: 'Light', desc: 'Clean, crisp daylight aesthetic', icon: Sun },
    { id: 'system', label: 'System', desc: 'Follows your operating system preference', icon: Laptop },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-[var(--text-primary)] tracking-tight">Appearance & Theme</h3>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          Personalize the look and feel of Taskly across all devices.
        </p>
      </div>

      {/* 1. Theme Selection */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Interface Theme
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {themes.map((t) => {
            const Icon = t.icon;
            const isSelected = theme === t.id;

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => updateSetting('appearance', 'theme', t.id)}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-[var(--bg-secondary)] border-accent shadow-glow-primary'
                    : 'bg-[var(--bg-surface)] border-[var(--border-primary)] hover:border-accent/40'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-3 right-3 w-4 h-4 rounded-full bg-accent text-[var(--accent-foreground)] flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
                <div className="p-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] w-fit mb-3">
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">{t.label}</h4>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-snug">{t.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Accent Color */}
      <div className="space-y-3 pt-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Accent Color
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {accentColors.map((acc) => {
            const isSelected = (accentColor || 'purple').toLowerCase() === acc.id;

            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => updateSetting('appearance', 'accentColor', acc.id)}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-2 ${
                  isSelected
                    ? 'bg-[var(--bg-secondary)] border-accent ring-2 shadow-glow-primary'
                    : 'bg-[var(--bg-surface)] border-[var(--border-primary)] hover:border-accent/40'
                }`}
                style={isSelected ? { borderColor: acc.hex, boxShadow: `0 0 15px -3px ${acc.hex}60` } : {}}
              >
                <span
                  className={`w-7 h-7 rounded-full shadow-md flex items-center justify-center ${
                    acc.id === 'cyan' ? 'text-[#0F172A]' : 'text-white'
                  }`}
                  style={{ backgroundColor: acc.hex }}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </span>
                <span className="text-xs font-semibold text-[var(--text-primary)]">{acc.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Toggles: Compact Mode & Animations */}
      <div className="space-y-3 pt-2 divide-y divide-[var(--border-secondary)] border-t border-[var(--border-primary)]">
        {/* Compact Mode */}
        <div className="pt-3.5 flex items-center justify-between gap-4">
          <div>
            <h5 className="text-sm font-semibold text-[var(--text-primary)]">Compact Mode</h5>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Reduce card padding and list spacing for high-density information display.
            </p>
          </div>

          <button
            type="button"
            onClick={() => updateSetting('appearance', 'compactMode', !compactMode)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              compactMode ? 'bg-accent' : 'bg-slate-400 dark:bg-slate-700'
            }`}
            role="switch"
            aria-checked={compactMode}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                compactMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Animations */}
        <div className="pt-3.5 flex items-center justify-between gap-4">
          <div>
            <h5 className="text-sm font-semibold text-[var(--text-primary)]">Interface Animations</h5>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Enable smooth transitions, hover effects, and micro-interactions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => updateSetting('appearance', 'animations', !animations)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              animations ? 'bg-accent' : 'bg-slate-400 dark:bg-slate-700'
            }`}
            role="switch"
            aria-checked={animations}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                animations ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

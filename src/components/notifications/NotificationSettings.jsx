import React from 'react';
import { useNotificationsContext } from '../../context/NotificationsContext';
import Card from '../common/Card';
import Button from '../common/Button';
import {
  Bell,
  Clock,
  Moon,
  Volume2,
  VolumeX,
  Laptop,
  CheckCircle2,
  Trash2,
  Shield,
  Sliders,
  Sun,
  Sunset,
} from 'lucide-react';

export default function NotificationSettings() {
  const { settings, updateSettings, requestDesktopPermission, clearAllNotifications } =
    useNotificationsContext();

  const handleToggle = (key) => {
    updateSettings({ [key]: !settings[key] });
  };

  const handleNestedToggle = (parentKey, childKey) => {
    updateSettings({
      [parentKey]: {
        ...settings[parentKey],
        [childKey]: !settings[parentKey]?.[childKey],
      },
    });
  };

  const handleNestedChange = (parentKey, childKey, value) => {
    updateSettings({
      [parentKey]: {
        ...settings[parentKey],
        [childKey]: value,
      },
    });
  };

  const isDesktopSupported = typeof window !== 'undefined' && 'Notification' in window;
  const desktopPermission = isDesktopSupported ? Notification.permission : 'unsupported';

  return (
    <div className="space-y-6 text-xs animate-in fade-in duration-200">
      {/* 1. Desktop & Audio Preferences */}
      <Card
        title="Delivery & Sound"
        subtitle="Configure browser notifications and audio alerts"
        action={<Laptop className="w-4 h-4 text-[#7C3AED]" />}
      >
        <div className="space-y-3">
          {/* Desktop Permission */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#171C27] border border-white/[0.04]">
            <div className="space-y-0.5">
              <span className="font-bold text-white block">Desktop Notifications</span>
              <p className="text-[11px] text-slate-400">
                Receive browser alert banners when tasks or reminders trigger.
              </p>
              <span className="font-mono text-[10px] text-slate-500 block">
                Status: {desktopPermission}
              </span>
            </div>

            <Button
              variant={settings.desktopNotifications ? 'secondary' : 'primary'}
              size="sm"
              onClick={requestDesktopPermission}
            >
              {settings.desktopNotifications ? 'Enabled ✓' : 'Enable Desktop Alerts'}
            </Button>
          </div>

          {/* Sound Toggle */}
          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#171C27] border border-white/[0.04] cursor-pointer">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                {settings.notificationSound ? (
                  <Volume2 className="w-4 h-4 text-[#06B6D4]" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
                <span className="font-bold text-white">Audio Chime</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Play a subtle chime sound when an in-app notification arrives.
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.notificationSound ?? false}
              onChange={() => handleToggle('notificationSound')}
              className="w-4 h-4 accent-[#7C3AED] rounded"
            />
          </label>
        </div>
      </Card>

      {/* 2. Quiet Hours */}
      <Card
        title="Quiet Hours (Do Not Disturb)"
        subtitle="Mute non-urgent notifications during your downtime"
        action={<Moon className="w-4 h-4 text-[#06B6D4]" />}
      >
        <div className="space-y-3.5">
          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#171C27] border border-white/[0.04] cursor-pointer">
            <div className="space-y-0.5">
              <span className="font-bold text-white block">Enable Quiet Hours</span>
              <p className="text-[11px] text-slate-400">
                Queues notifications and delivers them once quiet hours end.
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.quietHours?.enabled ?? false}
              onChange={() => handleNestedToggle('quietHours', 'enabled')}
              className="w-4 h-4 accent-[#7C3AED] rounded"
            />
          </label>

          {settings.quietHours?.enabled && (
            <div className="p-3.5 rounded-2xl bg-[#171C27]/60 border border-white/[0.04] space-y-3 animate-in fade-in duration-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                    Quiet Start Time
                  </label>
                  <input
                    type="time"
                    value={settings.quietHours?.start || '22:00'}
                    onChange={(e) => handleNestedChange('quietHours', 'start', e.target.value)}
                    className="w-full bg-[#11151F] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                    Quiet End Time
                  </label>
                  <input
                    type="time"
                    value={settings.quietHours?.end || '07:00'}
                    onChange={(e) => handleNestedChange('quietHours', 'end', e.target.value)}
                    className="w-full bg-[#11151F] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center justify-between pt-1 cursor-pointer">
                <span className="text-slate-300">Allow Urgent Notifications to bypass quiet hours</span>
                <input
                  type="checkbox"
                  checked={settings.quietHours?.allowUrgent ?? true}
                  onChange={() => handleNestedToggle('quietHours', 'allowUrgent')}
                  className="w-4 h-4 accent-[#7C3AED] rounded"
                />
              </label>
            </div>
          )}
        </div>
      </Card>

      {/* 3. Category Notification Toggles */}
      <Card
        title="Notification Categories"
        subtitle="Control which deliverables generate in-app alerts"
        action={<Sliders className="w-4 h-4 text-[#F59E0B]" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            { id: 'taskDue', label: 'Tasks Due Today / Start Time', desc: 'Alerts when scheduled tasks start' },
            { id: 'taskOverdue', label: 'Overdue Task Alerts', desc: 'Alerts when deliverables pass due date' },
            { id: 'projectDeadlines', label: 'Project Milestones', desc: 'Deadlines and blocked dependencies' },
            { id: 'goalDue', label: 'Strategic Goal Reminders', desc: 'Upcoming goal target dates' },
            { id: 'focusSession', label: 'Focus & Timer Milestones', desc: 'Pomodoro completion and break timers' },
            { id: 'recurringTasks', label: 'Recurring Routine Alerts', desc: 'Alerts on scheduled occurrences' },
            { id: 'backupReminders', label: 'Data Backup Alerts', desc: 'Periodic backup export reminders' },
            { id: 'systemAlerts', label: 'System & Feature Updates', desc: 'App synchronization alerts' },
          ].map((cat) => (
            <label
              key={cat.id}
              className="flex items-start justify-between p-3 rounded-2xl bg-[#171C27] border border-white/[0.04] cursor-pointer space-x-3"
            >
              <div>
                <span className="font-bold text-white block">{cat.label}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">{cat.desc}</p>
              </div>
              <input
                type="checkbox"
                checked={settings[cat.id] ?? true}
                onChange={() => handleToggle(cat.id)}
                className="w-4 h-4 accent-[#7C3AED] rounded mt-1 shrink-0"
              />
            </label>
          ))}
        </div>
      </Card>

      {/* 4. History Retention & Danger Zone */}
      <Card
        title="History Retention & Cleanup"
        subtitle="Manage automatic purging and clear notification inbox"
        action={<Trash2 className="w-4 h-4 text-[#EF4444]" />}
      >
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#171C27] border border-white/[0.04]">
            <div>
              <span className="font-bold text-white block">Notification History Retention</span>
              <p className="text-[11px] text-slate-400">
                Automatically purge older notifications to keep memory clean.
              </p>
            </div>
            <select
              value={settings.historyRetention || '60_days'}
              onChange={(e) => updateSettings({ historyRetention: e.target.value })}
              className="bg-[#11151F] border border-white/[0.08] text-white rounded-xl px-3 py-1.5 focus:outline-none"
            >
              <option value="30_days">Keep 30 Days</option>
              <option value="60_days">Keep 60 Days</option>
              <option value="90_days">Keep 90 Days</option>
              <option value="forever">Keep Forever</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
            <span className="text-slate-400">Clear all inbox notifications</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={clearAllNotifications}
              className="text-[#EF4444] hover:bg-[#EF4444]/10"
            >
              Clear Entire Inbox
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

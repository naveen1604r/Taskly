import React from 'react';
import Card from '../common/Card';
import { ShieldCheck, Lock, HardDrive, EyeOff, Globe } from 'lucide-react';

export default function DataPrivacyInfo() {
  const points = [
    {
      icon: HardDrive,
      title: '100% Local Storage',
      desc: 'All tasks, notes, goals, and timer metrics are stored solely within your local browser storage.',
    },
    {
      icon: EyeOff,
      title: 'Zero Tracking or Telemetry',
      desc: 'No personal information or productivity metrics are sent to remote analytics servers.',
    },
    {
      icon: Lock,
      title: 'User-Controlled Backups',
      desc: 'Your backup files are clean JSON documents that remain on your personal machine.',
    },
    {
      icon: Globe,
      title: 'Private & Offline Capable',
      desc: 'Taskly functions fully offline without needing an active internet connection or account login.',
    },
  ];

  return (
    <Card
      title="Privacy & Data Ownership"
      subtitle="How Taskly protects your productivity records and privacy"
      action={<ShieldCheck className="w-4 h-4 text-[#22C55E]" />}
    >
      <div className="space-y-4 text-xs">
        <div className="p-3.5 rounded-2xl bg-[#171C27] border border-white/[0.04] text-slate-300 leading-relaxed">
          Taskly is built with a <strong>privacy-first, client-only architecture</strong>. Your data never leaves your computer unless you explicitly export a backup JSON file.
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {points.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-[#171C27]/50 border border-white/[0.03] space-y-1"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-[#7C3AED]" />
                  <span className="font-bold text-white">{p.title}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal pl-6">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-slate-500 italic">
          * Note: Clearing your browser cache or site data may remove your local records. We recommend exporting periodic backups.
        </p>
      </div>
    </Card>
  );
}

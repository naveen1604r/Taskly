import React from 'react';
import { CheckCircle2, ShieldCheck, Cpu, Heart } from 'lucide-react';

export default function AboutTaskly() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-white tracking-tight">About Taskly</h3>
        <p className="text-xs text-[#94A3B8] mt-0.5">
          Application metadata, version details, and architectural foundations.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-[#11151F] border border-white/[0.08] space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#06B6D4] flex items-center justify-center text-white font-extrabold shadow-glow-primary">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white tracking-tight">Taskly</h4>
            <p className="text-xs text-[#94A3B8]">Modern Daily Productivity & Execution Workspace</p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          A focused personal productivity application designed for managing daily tasks, logging real activity timelines,
          capturing knowledge notes, tracking milestones toward high-level goals, and monitoring productivity analytics.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-[#171C27] border border-white/[0.06]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Version</span>
            <span className="text-sm font-bold text-white mt-0.5 block">1.0.0</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#171C27] border border-white/[0.06]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Engine</span>
            <span className="text-sm font-bold text-[#06B6D4] mt-0.5 block">React 19 + Vite</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#171C27] border border-white/[0.06]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Storage</span>
            <span className="text-sm font-bold text-[#22C55E] mt-0.5 block">Local-First (Browser)</span>
          </div>
        </div>

        <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs text-[#94A3B8]">
          <span>Crafted for maximum developer and daily focus momentum.</span>
          <span className="flex items-center gap-1">
            <span>Built with precision</span>
            <Heart className="w-3 h-3 text-[#EF4444] fill-[#EF4444]" />
          </span>
        </div>
      </div>
    </div>
  );
}

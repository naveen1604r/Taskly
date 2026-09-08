import React, { useRef } from 'react';
import StorageStats from './StorageStats';
import BackupStatus from './BackupStatus';
import ExportData from './ExportData';
import ImportBackup from './ImportBackup';
import ResetData from './ResetData';
import DemoDataCleanup from './DemoDataCleanup';
import DangerZone from './DangerZone';
import DataPrivacyInfo from './DataPrivacyInfo';
import { Database } from 'lucide-react';

export default function DataManagement() {
  const exportRef = useRef(null);

  const scrollToExport = () => {
    exportRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 sm:space-y-7 pb-8 animate-in fade-in duration-200">
      {/* 1. Header */}
      <div className="border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#c4b5fd] bg-[#7C3AED]/15 px-2.5 py-0.5 rounded-md border border-[#7C3AED]/25">
            <Database className="w-3.5 h-3.5 text-[#7C3AED]" />
            Data Management Center
          </span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Backup, Restore & Storage
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Export full or selective JSON backups, restore data safely, and manage local browser storage.
        </p>
      </div>

      {/* 2. Storage Overview & Metrics */}
      <StorageStats />

      {/* 3. Backup Status & Reminders */}
      <BackupStatus onExportClick={scrollToExport} />

      {/* 4. Export Data (Full & Selective) */}
      <div ref={exportRef}>
        <ExportData />
      </div>

      {/* 5. Import & Preview Backup */}
      <ImportBackup />

      {/* 6. Privacy & Data Ownership */}
      <DataPrivacyInfo />

      {/* 7. Demo & Sample Task Cleanup (Requirement 13 & 14) */}
      <DemoDataCleanup />

      {/* 8. Reset Specific Data */}
      <ResetData />

      {/* 9. Danger Zone (Reset All) */}
      <DangerZone />
    </div>
  );
}

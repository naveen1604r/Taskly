import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import TaskModal from '../tasks/TaskModal';
import DeleteTaskDialog from '../tasks/DeleteTaskDialog';
import ActivityModal from '../activity/ActivityModal';
import DeleteActivityDialog from '../activity/DeleteActivityDialog';
import NoteModal from '../notes/NoteModal';
import NoteViewer from '../notes/NoteViewer';
import DeleteNoteDialog from '../notes/DeleteNoteDialog';
import GoalModal from '../goals/GoalModal';
import GoalDetails from '../goals/GoalDetails';
import LinkTaskModal from '../goals/LinkTaskModal';
import DeleteGoalDialog from '../goals/DeleteGoalDialog';
import ReminderModal from '../notifications/ReminderModal';
import ClearNotificationsDialog from '../notifications/ClearNotificationsDialog';
import SearchOverlay from '../search/SearchOverlay';
import Toast from '../common/Toast';
import { useTaskContext } from '../../context/TaskContext';
import { useGlobalShortcuts } from '../../hooks/useGlobalShortcuts';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast, dismissToast } = useTaskContext();

  // Active keyboard shortcuts: N (new task), / (search), G (goals), C (calendar), A (analytics)
  useGlobalShortcuts();

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200">
      {/* Navigation Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Modals, Search & Notifications */}
      <SearchOverlay />
      <TaskModal />
      <DeleteTaskDialog />
      <ActivityModal />
      <DeleteActivityDialog />
      <NoteModal />
      <NoteViewer />
      <DeleteNoteDialog />
      <GoalModal />
      <GoalDetails />
      <LinkTaskModal />
      <DeleteGoalDialog />
      <ReminderModal />
      <ClearNotificationsDialog />
      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}

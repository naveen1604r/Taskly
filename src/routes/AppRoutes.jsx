import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Dashboard from '../pages/Dashboard';
import MyDay from '../pages/MyDay';
import Inbox from '../pages/Inbox';
import Tasks from '../pages/Tasks';
import Focus from '../pages/Focus';
import Habits from '../pages/Habits';
import HabitDetails from '../pages/HabitDetails';
import DailyPlanner from '../pages/DailyPlanner';
import RecurringTasks from '../pages/RecurringTasks';
import TaskTemplates from '../pages/TaskTemplates';
import DailyActivity from '../pages/DailyActivity';
import Notes from '../pages/Notes';
import Calendar from '../pages/Calendar';
import Goals from '../pages/Goals';
import Notifications from '../pages/Notifications';
import Analytics from '../pages/Analytics';
import Settings from '../pages/Settings';
import TaskDetails from '../components/tasks/TaskDetails';
import GlobalSearch from '../components/search/GlobalSearch';
import TaskBoard from '../components/board/TaskBoard';
import Projects from '../pages/Projects';
import ProjectDetails from '../pages/ProjectDetails';
import Login from '../pages/Login';
import Register from '../pages/Register';
import NotFound from '../pages/NotFound';
import ProtectedRoute from '../components/auth/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* 1. Public Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* 2. Protected Workspace Routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="my-day" element={<MyDay />} />
        <Route path="inbox" element={<Inbox />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="tasks/:taskId" element={<TaskDetails />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:projectId" element={<ProjectDetails />} />
        <Route path="board" element={<TaskBoard />} />
        <Route path="search" element={<GlobalSearch />} />
        <Route path="focus" element={<Focus />} />
        <Route path="habits" element={<Habits />} />
        <Route path="habits/:habitId" element={<HabitDetails />} />
        <Route path="planner" element={<DailyPlanner />} />
        <Route path="recurring" element={<RecurringTasks />} />
        <Route path="templates" element={<TaskTemplates />} />
        <Route path="activity" element={<DailyActivity />} />
        <Route path="notes" element={<Notes />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="goals" element={<Goals />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="settings/data" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

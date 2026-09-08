import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { TaskProvider } from './context/TaskContext';
import { SettingsProvider } from './context/SettingsContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { ActivityProvider } from './context/ActivityContext';
import { InboxProvider } from './context/InboxContext';
import { NotesProvider } from './context/NotesContext';
import { GoalsProvider } from './context/GoalsContext';
import { ProjectProvider } from './context/ProjectContext';
import { HabitProvider } from './context/HabitContext';
import { RecurringTaskProvider } from './context/RecurringTaskContext';
import { TemplateProvider } from './context/TemplateContext';
import { FocusProvider } from './context/FocusContext';
import { BoardProvider } from './context/BoardContext';
import { PlannerProvider } from './context/PlannerContext';
import { AnalyticsProvider } from './context/AnalyticsContext';
import { SearchProvider } from './context/SearchContext';
import { DashboardProvider } from './context/DashboardContext';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TaskProvider>
        <SettingsProvider>
          <GoalsProvider>
            <NotificationsProvider>
              <ActivityProvider>
                <InboxProvider>
                  <NotesProvider>
                    <ProjectProvider>
                      <HabitProvider>
                        <RecurringTaskProvider>
                          <TemplateProvider>
                            <FocusProvider>
                              <BoardProvider>
                                <PlannerProvider>
                                  <AnalyticsProvider>
                                    <SearchProvider>
                                      <DashboardProvider>
                                        <AppRoutes />
                                      </DashboardProvider>
                                    </SearchProvider>
                                  </AnalyticsProvider>
                                </PlannerProvider>
                              </BoardProvider>
                            </FocusProvider>
                          </TemplateProvider>
                        </RecurringTaskProvider>
                      </HabitProvider>
                    </ProjectProvider>
                  </NotesProvider>
                </InboxProvider>
              </ActivityProvider>
            </NotificationsProvider>
          </GoalsProvider>
        </SettingsProvider>
      </TaskProvider>
    </AuthProvider>
  </BrowserRouter>
);
}

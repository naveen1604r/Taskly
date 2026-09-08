import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useTaskContext } from './TaskContext';
import { useActivityContext } from './ActivityContext';
import { useAuthContext } from './AuthContext';
import { api } from '../services/api';
import {
  PROJECT_STORAGE_KEY,
  calculateProjectProgress,
} from '../utils/projectUtils';

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const { tasks, updateTask } = useTaskContext();
  const { logActivity } = useActivityContext() || {};
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuthContext();

  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // Fetch projects from backend API
  const fetchProjects = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setProjects([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await api.projects.getAll();
      if (response.success && response.data?.projects) {
        setProjects(response.data.projects);
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error('Failed to load projects from server:', err);
      setError(err.message || 'Unable to load projects');
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (!isAuthLoading) {
      fetchProjects();
    }
  }, [isAuthLoading, fetchProjects]);

  // Add Project
  const addProject = useCallback(
    async (projectData) => {
      try {
        setIsCreating(true);
        setError(null);

        const response = await api.projects.create({
          name: projectData.name?.trim(),
          description: projectData.description?.trim() || '',
          color: projectData.color || '#7C3AED',
          icon: projectData.icon || 'Folder',
          status: projectData.status || 'active',
          priority: projectData.priority || 'medium',
          startDate: projectData.startDate || null,
          dueDate: projectData.dueDate || null,
          goalId: projectData.goalId || null,
        });

        if (response.success && response.data?.project) {
          const newProject = response.data.project;
          setProjects((prev) => [newProject, ...prev]);

          if (logActivity) {
            logActivity({
              title: `Created project "${newProject.name}"`,
              category: 'Projects',
              relatedTaskId: null,
            });
          }

          return newProject;
        }
        throw new Error(response.message || 'Failed to create project');
      } catch (err) {
        console.error('Failed to add project:', err);
        setError(err.message || 'Unable to save project');
        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    [logActivity]
  );

  // Update Project
  const updateProject = useCallback(
    async (id, updates) => {
      try {
        setIsUpdating(true);
        setError(null);

        const response = await api.projects.update(id, updates);
        if (response.success && response.data?.project) {
          const updated = response.data.project;
          setProjects((prev) =>
            prev.map((p) => (String(p.id) === String(id) ? updated : p))
          );

          if (logActivity) {
            logActivity({
              title: `Updated project "${updated.name || id}"`,
              category: 'Projects',
              relatedTaskId: null,
            });
          }

          return updated;
        }
        throw new Error(response.message || 'Failed to update project');
      } catch (err) {
        console.error('Failed to update project:', err);
        setError(err.message || 'Unable to update project');
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [logActivity]
  );

  // Delete Project (Unassigns tasks, does NOT delete tasks)
  const deleteProject = useCallback(
    async (id) => {
      try {
        setIsDeleting(true);
        setError(null);

        const projectToDelete = projects.find((p) => String(p.id) === String(id));
        const response = await api.projects.delete(id);

        if (response.success) {
          setProjects((prev) => prev.filter((p) => String(p.id) !== String(id)));

          // Synchronize local task context so unassigned state is immediately reflected
          tasks.forEach((t) => {
            if (String(t.projectId) === String(id)) {
              updateTask(t.id, { projectId: null });
            }
          });

          if (logActivity && projectToDelete) {
            logActivity({
              title: `Deleted project "${projectToDelete.name}" (tasks unassigned)`,
              category: 'Projects',
              relatedTaskId: null,
            });
          }

          return true;
        }
        throw new Error(response.message || 'Failed to delete project');
      } catch (err) {
        console.error('Failed to delete project:', err);
        setError(err.message || 'Unable to delete project');
        throw err;
      } finally {
        setIsDeleting(false);
      }
    },
    [projects, tasks, updateTask, logActivity]
  );

  // Archive Project
  const archiveProject = useCallback(
    async (id) => {
      try {
        const response = await api.projects.archive(id);
        if (response.success && response.data?.project) {
          const updated = response.data.project;
          setProjects((prev) =>
            prev.map((p) => (String(p.id) === String(id) ? updated : p))
          );

          if (logActivity) {
            logActivity({
              title: `Archived project "${updated.name || id}"`,
              category: 'Projects',
            });
          }
          return updated;
        }
      } catch (err) {
        console.error('Failed to archive project:', err);
        throw err;
      }
    },
    [logActivity]
  );

  // Complete Project
  const completeProject = useCallback(
    async (id) => {
      try {
        const response = await api.projects.complete(id);
        if (response.success && response.data?.project) {
          const updated = response.data.project;
          setProjects((prev) =>
            prev.map((p) => (String(p.id) === String(id) ? updated : p))
          );

          if (logActivity) {
            logActivity({
              title: `Marked project "${updated.name || id}" as completed 🎉`,
              category: 'Projects',
            });
          }
          return updated;
        }
      } catch (err) {
        console.error('Failed to complete project:', err);
        throw err;
      }
    },
    [logActivity]
  );

  // Restore Project
  const restoreProject = useCallback(
    async (id) => {
      try {
        const response = await api.projects.restore(id);
        if (response.success && response.data?.project) {
          const updated = response.data.project;
          setProjects((prev) =>
            prev.map((p) => (String(p.id) === String(id) ? updated : p))
          );

          if (logActivity) {
            logActivity({
              title: `Restored project "${updated.name || id}" to active`,
              category: 'Projects',
            });
          }
          return updated;
        }
      } catch (err) {
        console.error('Failed to restore project:', err);
        throw err;
      }
    },
    [logActivity]
  );

  // Helpers
  const getProject = useCallback(
    (id) => {
      return projects.find((p) => String(p.id) === String(id)) || null;
    },
    [projects]
  );

  const getActiveProjects = useCallback(() => {
    return projects.filter((p) => p.status === 'active');
  }, [projects]);

  const getArchivedProjects = useCallback(() => {
    return projects.filter((p) => p.status === 'archived');
  }, [projects]);

  const getCompletedProjects = useCallback(() => {
    return projects.filter((p) => p.status === 'completed');
  }, [projects]);

  const getProjectProgress = useCallback(
    (projectId) => {
      return calculateProjectProgress(projectId, tasks);
    },
    [tasks]
  );

  const openCreateModal = () => {
    setEditingProject(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setEditingProject(null);
    setIsCreateModalOpen(false);
  };

  const value = {
    projects,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    addProject,
    updateProject,
    deleteProject,
    archiveProject,
    completeProject,
    restoreProject,
    getProject,
    getActiveProjects,
    getArchivedProjects,
    getCompletedProjects,
    getProjectProgress,
    isCreateModalOpen,
    editingProject,
    openCreateModal,
    openEditModal,
    closeCreateModal,
    refreshProjects: fetchProjects,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjectContext() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
}

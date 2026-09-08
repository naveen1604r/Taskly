import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTaskContext } from './TaskContext';
import { useAuthContext } from './AuthContext';
import {
  loadTemplatesFromStorage,
  saveTemplatesToStorage,
  createTemplateBlueprintFromTask,
} from '../utils/templateUtils';

const TemplateContext = createContext(null);

export function TemplateProvider({ children }) {
  const { openCreateModal, showToast } = useTaskContext();
  const { isAuthenticated } = useAuthContext();
  const [templates, setTemplates] = useState(() => (isAuthenticated ? loadTemplatesFromStorage() : []));

  // Modal dialog states
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setTemplates([]);
    } else {
      setTemplates(loadTemplatesFromStorage());
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      saveTemplatesToStorage(templates);
    }
  }, [templates, isAuthenticated]);

  // Actions
  const addTemplate = (data) => {
    const newTemplate = {
      id: `template-${Date.now()}`,
      name: data.name.trim(),
      title: data.title.trim(),
      description: data.description?.trim() || '',
      priority: data.priority || 'medium',
      category: data.category || 'General',
      estimatedDuration: Number(data.estimatedDuration) || 60,
      goalId: data.goalId || null,
      usageCount: 0,
      lastUsedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTemplates((prev) => [newTemplate, ...prev]);
    showToast('Task template created', 'success');
    closeTemplateModal();
    return newTemplate;
  };

  const updateTemplate = (id, data) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t))
    );
    showToast('Task template updated', 'success');
    closeTemplateModal();
  };

  const deleteTemplate = (id) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    showToast('Task template deleted', 'info');
  };

  const createTemplateFromTask = (task, templateName) => {
    const newTpl = createTemplateBlueprintFromTask(task, templateName);
    setTemplates((prev) => [newTpl, ...prev]);
    showToast(`Template "${newTpl.name}" created from task`, 'success');
    return newTpl;
  };

  const useTemplate = (template) => {
    // 1. Track usage count and timestamp
    setTemplates((prev) =>
      prev.map((t) => {
        if (t.id === template.id) {
          return {
            ...t,
            usageCount: (t.usageCount || 0) + 1,
            lastUsedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );

    // 2. Open TaskModal prefilled with blueprint
    openCreateModal({
      title: template.title,
      description: template.description || '',
      priority: template.priority || 'medium',
      category: template.category || 'General',
      duration: template.estimatedDuration || 60,
      durationUnit: 'minutes',
      goalId: template.goalId || null,
    });
  };

  // Modal helpers
  const openCreateTemplateModal = () => {
    setEditingTemplate(null);
    setIsTemplateModalOpen(true);
  };

  const openEditTemplateModal = (tpl) => {
    setEditingTemplate(tpl);
    setIsTemplateModalOpen(true);
  };

  const closeTemplateModal = () => {
    setEditingTemplate(null);
    setIsTemplateModalOpen(false);
  };

  const value = {
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    createTemplateFromTask,
    useTemplate,
    isTemplateModalOpen,
    editingTemplate,
    openCreateTemplateModal,
    openEditTemplateModal,
    closeTemplateModal,
  };

  return (
    <TemplateContext.Provider value={value}>
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplateContext() {
  const context = useContext(TemplateContext);
  if (!context) {
    return {
      templates: [],
      addTemplate: () => null,
      updateTemplate: () => {},
      deleteTemplate: () => {},
      createTemplateFromTask: () => null,
      useTemplate: () => {},
      isTemplateModalOpen: false,
      editingTemplate: null,
      openCreateTemplateModal: () => {},
      openEditTemplateModal: () => {},
      closeTemplateModal: () => {},
    };
  }
  return context;
}

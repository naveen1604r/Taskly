import React from 'react';

/**
 * React-safe match highlighting utility
 * Splits text into matching and non-matching segments
 * Returns an array of React spans with highlighted <mark> tags
 */
export const highlightMatch = (text, query) => {
  if (!text) return '';
  if (!query || !query.trim()) return text;

  const trimmedQuery = query.trim();
  const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = String(text).split(regex);

  return parts.map((part, index) =>
    regex.test(part)
      ? React.createElement(
          'mark',
          {
            key: index,
            className: 'bg-[#7C3AED]/30 text-[#c4b5fd] font-bold rounded px-0.5',
          },
          part
        )
      : part
  );
};

/**
 * Search Tasks
 * Searches title, description, category, tags
 */
export const searchTasks = (tasks = [], query = '') => {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();

  return tasks.filter((t) => {
    const titleMatch = t.title?.toLowerCase().includes(q);
    const descMatch = t.description?.toLowerCase().includes(q);
    const categoryMatch = t.category?.toLowerCase().includes(q);
    const tagMatch = Array.isArray(t.tags) && t.tags.some((tag) => tag.toLowerCase().includes(q));

    return titleMatch || descMatch || categoryMatch || tagMatch;
  });
};

/**
 * Search Subtasks
 * Returns matching subtasks linked with their parent task
 */
export const searchSubtasks = (tasks = [], query = '') => {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();
  const results = [];

  tasks.forEach((task) => {
    const subtasks = Array.isArray(task.subtasks) ? task.subtasks : [];
    subtasks.forEach((st) => {
      if (st.title?.toLowerCase().includes(q)) {
        results.push({
          subtask: st,
          parentTask: task,
        });
      }
    });
  });

  return results;
};

/**
 * Search Notes
 * Searches note title, content, tags, category
 */
export const searchNotes = (notes = [], query = '') => {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();

  return notes
    .filter((n) => {
      const titleMatch = n.title?.toLowerCase().includes(q);
      const contentMatch = n.content?.toLowerCase().includes(q);
      const categoryMatch = n.category?.toLowerCase().includes(q);
      const tagMatch = Array.isArray(n.tags) && n.tags.some((tag) => tag.toLowerCase().includes(q));

      return titleMatch || contentMatch || categoryMatch || tagMatch;
    })
    .map((n) => {
      // Create a contextual snippet around matching text if found in content
      let preview = n.content || '';
      if (preview.length > 100) {
        const idx = preview.toLowerCase().indexOf(q);
        if (idx > 30) {
          preview = '...' + preview.substring(idx - 20, idx + 80) + '...';
        } else {
          preview = preview.substring(0, 100) + '...';
        }
      }
      return {
        ...n,
        preview,
      };
    });
};

/**
 * Search Goals
 * Searches goal title, description, category
 */
export const searchGoals = (goals = [], query = '') => {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();

  return goals.filter((g) => {
    const titleMatch = g.title?.toLowerCase().includes(q);
    const descMatch = g.description?.toLowerCase().includes(q);
    const categoryMatch = g.category?.toLowerCase().includes(q);

    return titleMatch || descMatch || categoryMatch;
  });
};

/**
 * Search Projects
 * Searches project name, description
 */
export const searchProjects = (projects = [], query = '') => {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();

  return projects.filter((p) => {
    const nameMatch = p.name?.toLowerCase().includes(q);
    const descMatch = p.description?.toLowerCase().includes(q);
    return nameMatch || descMatch;
  });
};

/**
 * Search Inbox Items
 */
export const searchInbox = (inboxItems = [], query = '') => {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();

  return inboxItems.filter((i) => {
    const titleMatch = i.title?.toLowerCase().includes(q);
    const descMatch = i.description?.toLowerCase().includes(q);
    const catMatch = i.category?.toLowerCase().includes(q);
    const tagMatch = Array.isArray(i.tags) && i.tags.some((tag) => tag.toLowerCase().includes(q));
    const typeMatch = i.type?.toLowerCase().includes(q);

    return titleMatch || descMatch || catMatch || tagMatch || typeMatch;
  });
};

/**
 * Search Habits
 * Searches habit name, description, category, routine group, frequency
 */
export const searchHabits = (habits = [], query = '') => {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();

  return habits.filter((h) => {
    const nameMatch = h.name?.toLowerCase().includes(q);
    const descMatch = h.description?.toLowerCase().includes(q);
    const catMatch = h.category?.toLowerCase().includes(q);
    const routineMatch = h.routineGroup?.toLowerCase().includes(q);
    const freqMatch = typeof h.frequency === 'string' && h.frequency.toLowerCase().includes(q);

    return nameMatch || descMatch || catMatch || routineMatch || freqMatch;
  });
};

/**
 * Global Search Across All Entity Domains
 */
export const searchAll = ({
  tasks = [],
  notes = [],
  goals = [],
  projects = [],
  inboxItems = [],
  habits = [],
  query = '',
}) => {
  if (!query || !query.trim()) {
    return {
      tasks: [],
      subtasks: [],
      notes: [],
      goals: [],
      projects: [],
      inbox: [],
      habits: [],
      totalCount: 0,
    };
  }

  const foundTasks = searchTasks(tasks, query);
  const foundSubtasks = searchSubtasks(tasks, query);
  const foundNotes = searchNotes(notes, query);
  const foundGoals = searchGoals(goals, query);
  const foundProjects = searchProjects(projects, query);
  const foundInbox = searchInbox(inboxItems, query);
  const foundHabits = searchHabits(habits, query);

  const totalCount =
    foundTasks.length +
    foundSubtasks.length +
    foundNotes.length +
    foundGoals.length +
    foundProjects.length +
    foundInbox.length +
    foundHabits.length;

  return {
    tasks: foundTasks,
    subtasks: foundSubtasks,
    notes: foundNotes,
    goals: foundGoals,
    projects: foundProjects,
    inbox: foundInbox,
    habits: foundHabits,
    totalCount,
  };
};

/**
 * Get Search Suggestions (auto-complete terms)
 */
export const getSearchSuggestions = ({
  tasks = [],
  notes = [],
  goals = [],
  projects = [],
  query = '',
  limit = 5,
}) => {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();
  const suggestions = new Set();

  tasks.forEach((t) => {
    if (t.title?.toLowerCase().includes(q)) suggestions.add(t.title);
    if (Array.isArray(t.tags)) {
      t.tags.forEach((tag) => {
        if (tag.toLowerCase().includes(q)) suggestions.add(`#${tag}`);
      });
    }
  });

  projects.forEach((p) => {
    if (p.name?.toLowerCase().includes(q)) suggestions.add(p.name);
  });

  notes.forEach((n) => {
    if (n.title?.toLowerCase().includes(q)) suggestions.add(n.title);
  });

  goals.forEach((g) => {
    if (g.title?.toLowerCase().includes(q)) suggestions.add(g.title);
  });

  return Array.from(suggestions).slice(0, limit);
};

import React from 'react';
import SearchResultItem from './SearchResultItem';
import { CheckSquare, ListTodo, FileText, Target, FolderKanban, Flame } from 'lucide-react';

export default function SearchResults({ results, query, onSelect }) {
  const {
    tasks = [],
    subtasks = [],
    notes = [],
    goals = [],
    projects = [],
    habits = [],
    totalCount = 0,
  } = results;

  if (totalCount === 0) return null;

  return (
    <div className="space-y-6">
      {/* 1. Projects Section (Step 19) */}
      {projects.length > 0 && (
        <section aria-labelledby="search-projects-heading" className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-[#7C3AED]" />
              <h3
                id="search-projects-heading"
                className="text-xs font-bold uppercase tracking-wider text-slate-300"
              >
                Projects
              </h3>
            </div>
            <span className="text-[11px] font-mono font-semibold text-slate-400 bg-[#171C27] px-2 py-0.5 rounded-md border border-white/[0.06]">
              {projects.length}
            </span>
          </div>
          <div className="space-y-2">
            {projects.map((project) => (
              <SearchResultItem
                key={project.id}
                type="project"
                item={project}
                query={query}
                onSelect={onSelect}
              />
            ))}
          </div>
        </section>
      )}

      {/* 2. Tasks Section */}
      {tasks.length > 0 && (
        <section aria-labelledby="search-tasks-heading" className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#7C3AED]" />
              <h3
                id="search-tasks-heading"
                className="text-xs font-bold uppercase tracking-wider text-slate-300"
              >
                Tasks
              </h3>
            </div>
            <span className="text-[11px] font-mono font-semibold text-slate-400 bg-[#171C27] px-2 py-0.5 rounded-md border border-white/[0.06]">
              {tasks.length}
            </span>
          </div>
          <div className="space-y-2">
            {tasks.map((task) => (
              <SearchResultItem
                key={task.id}
                type="task"
                item={task}
                query={query}
                onSelect={onSelect}
              />
            ))}
          </div>
        </section>
      )}

      {/* 3. Subtasks Section */}
      {subtasks.length > 0 && (
        <section aria-labelledby="search-subtasks-heading" className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-[#06B6D4]" />
              <h3
                id="search-subtasks-heading"
                className="text-xs font-bold uppercase tracking-wider text-slate-300"
              >
                Subtasks
              </h3>
            </div>
            <span className="text-[11px] font-mono font-semibold text-slate-400 bg-[#171C27] px-2 py-0.5 rounded-md border border-white/[0.06]">
              {subtasks.length}
            </span>
          </div>
          <div className="space-y-2">
            {subtasks.map((subtask) => (
              <SearchResultItem
                key={subtask.id}
                type="subtask"
                item={subtask}
                query={query}
                onSelect={onSelect}
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. Notes Section */}
      {notes.length > 0 && (
        <section aria-labelledby="search-notes-heading" className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#F59E0B]" />
              <h3
                id="search-notes-heading"
                className="text-xs font-bold uppercase tracking-wider text-slate-300"
              >
                Notes
              </h3>
            </div>
            <span className="text-[11px] font-mono font-semibold text-slate-400 bg-[#171C27] px-2 py-0.5 rounded-md border border-white/[0.06]">
              {notes.length}
            </span>
          </div>
          <div className="space-y-2">
            {notes.map((note) => (
              <SearchResultItem
                key={note.id}
                type="note"
                item={note}
                query={query}
                onSelect={onSelect}
              />
            ))}
          </div>
        </section>
      )}

      {/* 5. Goals Section */}
      {goals.length > 0 && (
        <section aria-labelledby="search-goals-heading" className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#22C55E]" />
              <h3
                id="search-goals-heading"
                className="text-xs font-bold uppercase tracking-wider text-slate-300"
              >
                Goals
              </h3>
            </div>
            <span className="text-[11px] font-mono font-semibold text-slate-400 bg-[#171C27] px-2 py-0.5 rounded-md border border-white/[0.06]">
              {goals.length}
            </span>
          </div>
          <div className="space-y-2">
            {goals.map((goal) => (
              <SearchResultItem
                key={goal.id}
                type="goal"
                item={goal}
                query={query}
                onSelect={onSelect}
              />
            ))}
          </div>
        </section>
      )}

      {/* 6. Habits Section (Step 24) */}
      {habits.length > 0 && (
        <section aria-labelledby="search-habits-heading" className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <h3
                id="search-habits-heading"
                className="text-xs font-bold uppercase tracking-wider text-slate-300"
              >
                Habits & Routines
              </h3>
            </div>
            <span className="text-[11px] font-mono font-semibold text-slate-400 bg-[#171C27] px-2 py-0.5 rounded-md border border-white/[0.06]">
              {habits.length}
            </span>
          </div>
          <div className="space-y-2">
            {habits.map((habit) => (
              <SearchResultItem
                key={habit.id}
                type="habit"
                item={habit}
                query={query}
                onSelect={onSelect}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

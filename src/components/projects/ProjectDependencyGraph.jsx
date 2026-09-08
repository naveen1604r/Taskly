import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTaskContext } from '../../context/TaskContext';
import { isTaskBlocked } from '../../utils/dependencyUtils';
import {
  CheckCircle2,
  Lock,
  Play,
  Circle,
  ArrowDown,
  ArrowRight,
  GitCommit,
  Network,
} from 'lucide-react';
import Card from '../common/Card';

export default function ProjectDependencyGraph({ project }) {
  const { tasks } = useTaskContext();

  const projectTasks = useMemo(() => {
    return tasks.filter((t) => t.projectId === project.id);
  }, [tasks, project.id]);

  // Find root tasks (tasks that do not depend on any task in this project)
  const taskMap = useMemo(() => new Map(projectTasks.map((t) => [t.id, t])), [projectTasks]);

  const dependencyEdges = useMemo(() => {
    const edges = [];
    projectTasks.forEach((targetTask) => {
      if (Array.isArray(targetTask.dependencyIds)) {
        targetTask.dependencyIds.forEach((sourceId) => {
          const sourceTask = taskMap.get(sourceId);
          if (sourceTask) {
            edges.push({
              source: sourceTask,
              target: targetTask,
            });
          }
        });
      }
    });
    return edges;
  }, [projectTasks, taskMap]);

  return (
    <Card
      title="Workflow & Dependency Graph"
      subtitle="Visual representation of task prerequisites and delivery sequence"
      action={<Network className="w-4 h-4 text-[#7C3AED]" />}
    >
      {projectTasks.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400 italic">
          No tasks linked to this project yet.
        </div>
      ) : dependencyEdges.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400 space-y-2 bg-[#171C27]/50 rounded-2xl border border-white/[0.04] p-4">
          <p className="font-semibold text-white">All tasks are currently independent.</p>
          <p>Link task dependencies to visualize the step-by-step critical path.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Dependency Chains Flow */}
          <div className="p-4 rounded-2xl bg-[#171C27]/40 border border-white/[0.06] overflow-x-auto">
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 min-w-fit py-2">
              {dependencyEdges.map((edge, index) => {
                const isSourceDone = edge.source.status === 'completed';
                const isTargetBlocked = isTaskBlocked(edge.target, tasks);
                const isTargetDone = edge.target.status === 'completed';

                return (
                  <div
                    key={`${edge.source.id}-${edge.target.id}-${index}`}
                    className="flex flex-col md:flex-row items-center gap-2.5"
                  >
                    {/* Source Task Node */}
                    <Link
                      to={`/tasks/${edge.source.id}`}
                      className={`p-3 rounded-2xl border transition-all text-xs max-w-[200px] w-full text-center group ${
                        isSourceDone
                          ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-white'
                          : 'bg-[#11151F] border-white/[0.1] text-white hover:border-[#7C3AED]'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        {isSourceDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        <span className="font-bold truncate group-hover:text-[#c4b5fd]">
                          {edge.source.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {isSourceDone ? 'Completed' : 'Prerequisite'}
                      </span>
                    </Link>

                    {/* Arrow Connector */}
                    <div className="flex items-center justify-center text-[#7C3AED] my-1 md:my-0">
                      <ArrowDown className="w-4 h-4 md:hidden" />
                      <ArrowRight className="w-4 h-4 hidden md:block" />
                    </div>

                    {/* Target Task Node */}
                    <Link
                      to={`/tasks/${edge.target.id}`}
                      className={`p-3 rounded-2xl border transition-all text-xs max-w-[200px] w-full text-center group ${
                        isTargetDone
                          ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-white'
                          : isTargetBlocked
                          ? 'bg-[#F59E0B]/10 border-[#F59E0B]/30 text-white'
                          : 'bg-[#11151F] border-white/[0.1] text-white hover:border-[#7C3AED]'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        {isTargetDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                        ) : isTargetBlocked ? (
                          <Lock className="w-3.5 h-3.5 text-[#F59E0B]" />
                        ) : (
                          <Play className="w-3.5 h-3.5 text-[#06B6D4]" />
                        )}
                        <span className="font-bold truncate group-hover:text-[#c4b5fd]">
                          {edge.target.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono">
                        {isTargetDone ? (
                          <span className="text-[#22C55E]">Completed</span>
                        ) : isTargetBlocked ? (
                          <span className="text-[#F59E0B]">Blocked</span>
                        ) : (
                          <span className="text-[#06B6D4]">Ready</span>
                        )}
                      </span>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

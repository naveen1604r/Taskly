import React, { useState, useMemo } from 'react';
import Card from '../common/Card';
import { useTaskContext } from '../../context/TaskContext';
import { useAnalyticsContext } from '../../context/AnalyticsContext';
import { filterEntitiesByRange } from '../../utils/analyticsUtils';
import { ArrowUpDown, Search, Link as LinkIcon, CheckCircle2, Circle, Play, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AnalyticsTable() {
  const { tasks } = useTaskContext();
  const { dateRange, analyticsFilters } = useAnalyticsContext();

  const [tableSearch, setTableSearch] = useState('');
  const [sortField, setSortField] = useState('title');
  const [sortAsc, setSortAsc] = useState(true);

  // Filter tasks in range
  const { rangeTasks } = useMemo(() => {
    return filterEntitiesByRange({
      tasks,
      sessions: [],
      activities: [],
      goals: [],
      dateRange,
      filters: analyticsFilters,
    });
  }, [tasks, dateRange, analyticsFilters]);

  // Search and Sort
  const processedTasks = useMemo(() => {
    let result = [...rangeTasks];
    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q) ||
          t.priority?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';

      if (sortField === 'estimated') {
        valA = Number(a.estimatedDuration || a.duration) || 0;
        valB = Number(b.estimatedDuration || b.duration) || 0;
      } else if (sortField === 'actual') {
        valA = Number(a.actualDuration) || 0;
        valB = Number(b.actualDuration) || 0;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return result;
  }, [rangeTasks, tableSearch, sortField, sortAsc]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <Card
      title="Detailed Deliverables Report"
      subtitle="Granular task execution metrics with estimate variance analysis"
      action={
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            placeholder="Search report..."
            className="bg-[#171C27] border border-white/[0.08] rounded-xl pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7C3AED]"
          />
        </div>
      }
    >
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/[0.08] text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('title')}>
                <div className="flex items-center gap-1">
                  <span>Task</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('category')}>
                <div className="flex items-center gap-1">
                  <span>Category</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('priority')}>
                <div className="flex items-center gap-1">
                  <span>Priority</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('status')}>
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('estimated')}>
                <div className="flex items-center gap-1">
                  <span>Estimated</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('actual')}>
                <div className="flex items-center gap-1">
                  <span>Actual</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3">Variance</th>
              <th className="py-2.5 px-3">Subtasks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {processedTasks.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-8 text-center text-slate-400 italic">
                  No deliverables match the selected date range and filter criteria.
                </td>
              </tr>
            ) : (
              processedTasks.map((t) => {
                const est = Number(t.estimatedDuration || t.duration) || 30;
                const act = Number(t.actualDuration) || (t.status === 'completed' ? est : 0);
                const diff = act - est;
                const subTotal = Array.isArray(t.subtasks) ? t.subtasks.length : 0;
                const subDone = Array.isArray(t.subtasks) ? t.subtasks.filter((st) => st.completed).length : 0;

                return (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-3 max-w-[200px]">
                      <Link
                        to={`/tasks/${t.id}`}
                        className="font-medium text-white hover:text-[#c4b5fd] truncate block"
                      >
                        {t.title}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{t.category || 'General'}</td>
                    <td className="py-2.5 px-3">
                      <span className="capitalize font-semibold text-slate-300">{t.priority || 'medium'}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`capitalize text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          t.status === 'completed'
                            ? 'bg-[#22C55E]/15 text-[#22C55E]'
                            : t.status === 'in_progress'
                            ? 'bg-[#06B6D4]/15 text-[#06B6D4]'
                            : 'bg-amber-500/15 text-amber-300'
                        }`}
                      >
                        {t.status === 'in_progress' ? 'In Progress' : t.status || 'Pending'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{est}m</td>
                    <td className="py-2.5 px-3 font-mono text-[#06B6D4]">{act}m</td>
                    <td
                      className={`py-2.5 px-3 font-mono font-bold ${
                        diff > 0 ? 'text-[#F59E0B]' : diff < 0 ? 'text-[#22C55E]' : 'text-slate-400'
                      }`}
                    >
                      {diff > 0 ? `+${diff}m` : diff < 0 ? `${diff}m` : '0m'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">
                      {subTotal > 0 ? `${subDone}/${subTotal}` : '—'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import { useAnalyticsContext } from '../../context/AnalyticsContext';
import { formatMinutesToDisplay } from '../../utils/analyticsUtils';
import { Calendar, ChevronRight } from 'lucide-react';

export default function DailyBreakdown() {
  const { metrics, dateRange } = useAnalyticsContext();
  const navigate = useNavigate();

  const dailyData = metrics.dailyData || [];

  const handleRowClick = (dateStr) => {
    // Navigate to calendar with this date
    navigate('/calendar');
  };

  return (
    <Card
      title="Daily Productivity Breakdown"
      subtitle={`Day-by-day record of accomplishments covering ${dateRange.label}`}
      className="overflow-hidden"
    >
      {dailyData.length === 0 ? (
        <div className="py-10 text-center text-slate-500 italic text-xs">
          No breakdown data for the selected range.
        </div>
      ) : (
        <div className="overflow-x-auto -mx-5 sm:mx-0">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4 text-center">Tasks Done</th>
                <th className="py-2.5 px-4 text-center">Activities</th>
                <th className="py-2.5 px-4 text-center">Focus Time</th>
                <th className="py-2.5 px-4 text-right">Calendar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {dailyData.map((row) => (
                <tr
                  key={row.date}
                  onClick={() => handleRowClick(row.date)}
                  className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                >
                  {/* Date */}
                  <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">
                    <span>{row.shortLabel}</span>
                    <span className="text-slate-500 ml-1.5 font-normal">({row.weekday})</span>
                  </td>

                  {/* Tasks Done */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md font-bold ${
                        row.tasksDone > 0
                          ? 'bg-[#22C55E]/15 text-[#22C55E]'
                          : 'bg-slate-800/60 text-slate-500'
                      }`}
                    >
                      {row.tasksDone}
                    </span>
                  </td>

                  {/* Activities */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md font-bold ${
                        row.activityCount > 0
                          ? 'bg-[#7C3AED]/15 text-[#c4b5fd]'
                          : 'bg-slate-800/60 text-slate-500'
                      }`}
                    >
                      {row.activityCount}
                    </span>
                  </td>

                  {/* Focus Time */}
                  <td className="py-3 px-4 text-center whitespace-nowrap font-medium text-slate-300">
                    {formatMinutesToDisplay(row.focusMinutes)}
                  </td>

                  {/* Link action */}
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center text-[11px] text-slate-400 group-hover:text-[#06B6D4] transition-colors">
                      <span>View</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

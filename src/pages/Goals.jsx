import React, { useState, useMemo } from 'react';
import { useGoalsContext } from '../context/GoalsContext';
import GoalStats from '../components/goals/GoalStats';
import GoalTabs from '../components/goals/GoalTabs';
import GoalFilters from '../components/goals/GoalFilters';
import GoalCard from '../components/goals/GoalCard';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Plus, Target, CheckCircle2, Archive, SearchX } from 'lucide-react';

export default function Goals() {
  const { goals, openCreateGoalModal } = useGoalsContext();

  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'completed' | 'archived'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recently_updated');

  // Extract all categories dynamically present across goals
  const availableCategories = useMemo(() => {
    return Array.from(new Set(goals.map((g) => g.category).filter(Boolean)));
  }, [goals]);

  // Priority weight mapping
  const priorityWeights = {
    high: 3,
    medium: 2,
    low: 1,
  };

  // Filter and sort goals
  const filteredGoals = useMemo(() => {
    let result = [...goals];

    // 1. Tab Status Filter
    if (activeTab === 'active') {
      result = result.filter((g) => g.status === 'active');
    } else if (activeTab === 'completed') {
      result = result.filter((g) => g.status === 'completed');
    } else if (activeTab === 'archived') {
      result = result.filter((g) => g.status === 'archived');
    }

    // 2. Search Query (title, description, category)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          (g.description && g.description.toLowerCase().includes(q)) ||
          (g.category && g.category.toLowerCase().includes(q))
      );
    }

    // 3. Category Filter
    if (categoryFilter !== 'all') {
      result = result.filter((g) => g.category === categoryFilter);
    }

    // 4. Priority Filter
    if (priorityFilter !== 'all') {
      result = result.filter((g) => g.priority === priorityFilter);
    }

    // 5. Sorting
    result.sort((a, b) => {
      if (sortBy === 'recently_updated') {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      }
      if (sortBy === 'recently_created') {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      }
      if (sortBy === 'target_date') {
        const dateA = a.targetDate || '9999-99-99';
        const dateB = b.targetDate || '9999-99-99';
        return dateA.localeCompare(dateB);
      }
      if (sortBy === 'progress') {
        return (Number(b.progress) || 0) - (Number(a.progress) || 0);
      }
      if (sortBy === 'priority') {
        const weightA = priorityWeights[a.priority] || 0;
        const weightB = priorityWeights[b.priority] || 0;
        return weightB - weightA;
      }
      if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }, [goals, activeTab, searchQuery, categoryFilter, priorityFilter, sortBy]);

  const totalGoalsInTab = useMemo(() => {
    return goals.filter((g) => g.status === activeTab).length;
  }, [goals, activeTab]);

  return (
    <div className="space-y-6 sm:space-y-7 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Goals
          </h2>
          <p className="text-sm text-[#94A3B8] mt-1">
            Turn your plans into measurable progress.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={openCreateGoalModal}
          icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
          className="shadow-glow-primary self-start sm:self-auto"
        >
          Create Goal
        </Button>
      </div>

      {/* 1. Dynamic Statistics */}
      <GoalStats />

      {/* 2. Tabs: Active, Completed, Archived */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <GoalTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* 3. Search & Filters */}
      {totalGoalsInTab > 0 && (
        <GoalFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          availableCategories={availableCategories}
        />
      )}

      {/* 4. Goals Cards Grid or Contextual Empty States */}
      {totalGoalsInTab === 0 ? (
        <Card className="border-dashed border-white/[0.12]">
          <div className="py-20 flex flex-col items-center justify-center text-center">
            {activeTab === 'completed' ? (
              <>
                <div className="w-16 h-16 rounded-2xl bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-center text-[#22C55E] mb-4 shadow-subtle">
                  <CheckCircle2 className="w-8 h-8 stroke-[1.75]" />
                </div>
                <h3 className="text-xl font-bold text-white">No completed goals yet</h3>
                <p className="text-sm text-[#94A3B8] max-w-sm mt-1.5 mb-6">
                  Complete your active milestones to celebrate your achievements here.
                </p>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setActiveTab('active')}
                >
                  View Active Goals
                </Button>
              </>
            ) : activeTab === 'archived' ? (
              <>
                <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-white/[0.08] flex items-center justify-center text-slate-400 mb-4 shadow-subtle">
                  <Archive className="w-8 h-8 stroke-[1.75]" />
                </div>
                <h3 className="text-xl font-bold text-white">No archived goals</h3>
                <p className="text-sm text-[#94A3B8] max-w-sm mt-1.5 mb-6">
                  Completed or inactive goals archived for later review will appear here.
                </p>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setActiveTab('active')}
                >
                  Return to Active Goals
                </Button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-center text-[#7C3AED] mb-4 shadow-subtle">
                  <Target className="w-8 h-8 stroke-[1.75]" />
                </div>
                <h3 className="text-xl font-bold text-white">No goals yet</h3>
                <p className="text-sm text-[#94A3B8] max-w-sm mt-1.5 mb-6">
                  Set your first meaningful goal and start tracking your progress.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={openCreateGoalModal}
                  icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
                  className="shadow-glow-primary"
                >
                  Create Your First Goal
                </Button>
              </>
            )}
          </div>
        </Card>
      ) : filteredGoals.length === 0 ? (
        <Card className="border-dashed border-white/[0.12]">
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-white/[0.08] flex items-center justify-center text-[#94A3B8] mb-3">
              <SearchX className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-white">No matching goals</h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-xs mt-1 mb-5">
              Try changing your search or filters to locate specific objectives.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setPriorityFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </Card>
      ) : (
        // Responsive Grid (2-3 cards desktop, 2 tablet, 1 mobile)
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  );
}

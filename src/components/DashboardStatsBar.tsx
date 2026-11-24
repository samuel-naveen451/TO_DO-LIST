import { CheckCircle2 } from 'lucide-react';
import type { CategoryBreakdownItem, DashboardStats, TaskCategory } from '../types/task';

interface DashboardStatsBarProps {
  stats: DashboardStats;
  categoryBreakdown: CategoryBreakdownItem[];
  activeCategory: TaskCategory | 'all';
  onSelectCategory: (category: TaskCategory | 'all') => void;
}

const CATEGORY_BAR_COLORS: Record<TaskCategory, { bar: string; dot: string }> = {
  Work: { bar: 'bg-blue-600', dot: 'bg-blue-600' },
  Study: { bar: 'bg-amber-500', dot: 'bg-amber-500' },
  Personal: { bar: 'bg-emerald-600', dot: 'bg-emerald-600' },
  Other: { bar: 'bg-slate-400', dot: 'bg-slate-400' },
};

export function DashboardStatsBar({
  stats,
  categoryBreakdown,
  activeCategory,
  onSelectCategory,
}: DashboardStatsBarProps) {
  const isAllDone = stats.total > 0 && stats.completionPercentage === 100;
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (stats.completionPercentage / 100) * circumference;

  return (
    <section
      aria-label="Task summary"
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Animated SVG Completion Ring */}
        <div className="flex items-center gap-4 lg:pr-6 lg:border-r lg:border-slate-200">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
            <svg
              className="h-16 w-16 -rotate-90"
              viewBox="0 0 64 64"
              aria-hidden="true"
            >
              <circle
                cx="32"
                cy="32"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-slate-100"
              />
              <circle
                cx="32"
                cy="32"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={`transition-all duration-500 ease-out ${
                  isAllDone ? 'text-emerald-600' : 'text-blue-600'
                }`}
              />
            </svg>
            <span className="absolute font-mono text-xs font-semibold text-slate-900 tabular-nums">
              {stats.completionPercentage}%
            </span>
          </div>

          <div>
            <p className="font-display text-sm font-semibold text-slate-900">
              {isAllDone ? 'All Caught Up' : 'Daily Momentum'}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {isAllDone ? (
                <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Every task is completed
                </span>
              ) : (
                `${stats.pending} ${stats.pending === 1 ? 'task' : 'tasks'} remaining`
              )}
            </p>
          </div>
        </div>

        {/* 4-column numeric stats */}
        <div className="grid flex-1 grid-cols-2 gap-5 sm:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-slate-200">
          <div className="lg:px-6">
            <p className="text-xs font-medium text-slate-500">Total Tasks</p>
            <p
              data-testid="stat-total"
              className="mt-1 font-mono text-2xl font-semibold tracking-tight text-slate-900 tabular-nums sm:text-3xl"
            >
              {stats.total}
            </p>
          </div>

          <div className="lg:px-6">
            <p className="text-xs font-medium text-slate-500">Completed</p>
            <p
              data-testid="stat-completed"
              className="mt-1 font-mono text-2xl font-semibold tracking-tight text-emerald-700 tabular-nums sm:text-3xl"
            >
              {stats.completed}
            </p>
          </div>

          <div className="lg:px-6">
            <p className="text-xs font-medium text-slate-500">Pending</p>
            <p
              data-testid="stat-pending"
              className="mt-1 font-mono text-2xl font-semibold tracking-tight text-amber-700 tabular-nums sm:text-3xl"
            >
              {stats.pending}
            </p>
          </div>

          <div className="lg:pl-6">
            <p className="text-xs font-medium text-slate-500">Completion Rate</p>
            <p
              data-testid="stat-percentage"
              className="mt-1 font-mono text-2xl font-semibold tracking-tight text-blue-700 tabular-nums sm:text-3xl"
            >
              {stats.completionPercentage}%
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar & Interactive Category Breakdown */}
      <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 lg:grid-cols-2 lg:gap-8">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <span className="font-medium text-slate-700">Overall Completion</span>
            <span className="font-mono tabular-nums text-slate-500">
              {stats.completed} of {stats.total} tasks completed ({stats.completionPercentage}%)
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="Overall task completion"
            aria-valuenow={stats.completionPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100"
          >
            <div
              className={`h-full rounded-full transition-all duration-300 ease-out ${
                isAllDone ? 'bg-emerald-600' : 'bg-blue-600'
              }`}
              style={{ width: `${stats.completionPercentage}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <span className="font-medium text-slate-700">Category Mix</span>
            <span className="text-[11px] text-slate-400">
              Click a category to filter
            </span>
          </div>

          <div
            aria-label="Category distribution"
            className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-slate-100"
          >
            {stats.total > 0 &&
              categoryBreakdown.map((item) =>
                item.count > 0 ? (
                  <div
                    key={item.category}
                    className={`h-full transition-all duration-300 ${CATEGORY_BAR_COLORS[item.category].bar}`}
                    style={{ width: `${(item.count / stats.total) * 100}%` }}
                  />
                ) : null
              )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            {categoryBreakdown.map((item) => {
              const isSelected = activeCategory === item.category;
              return (
                <button
                  key={item.category}
                  type="button"
                  onClick={() =>
                    onSelectCategory(isSelected ? 'all' : item.category)
                  }
                  aria-pressed={isSelected}
                  className={`inline-flex items-center gap-1.5 rounded px-1 py-0.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    isSelected
                      ? 'bg-slate-100 font-semibold text-slate-900'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`h-2 w-2 rounded-xs ${CATEGORY_BAR_COLORS[item.category].dot}`}
                  />
                  <span>{item.category}</span>
                  <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

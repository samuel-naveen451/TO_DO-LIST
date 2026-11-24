import { ArrowUpDown, Columns3, LayoutList, Search, X } from 'lucide-react';
import { CATEGORY_OPTIONS } from '../utils/tasks';
import type { TaskCategory, TaskFilter, TaskSort, ViewMode } from '../types/task';

interface TaskToolbarProps {
  activeFilter: TaskFilter;
  onChangeFilter: (filter: TaskFilter) => void;
  categoryFilter: TaskCategory | 'all';
  onChangeCategoryFilter: (category: TaskCategory | 'all') => void;
  searchQuery: string;
  onChangeSearchQuery: (query: string) => void;
  sortBy: TaskSort;
  onChangeSortBy: (sort: TaskSort) => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
  counts: {
    all: number;
    pending: number;
    completed: number;
    high: number;
  };
}

const FILTER_TABS: { key: TaskFilter; label: string }[] = [
  { key: 'all', label: 'All Tasks' },
  { key: 'pending', label: 'Pending' },
  { key: 'completed', label: 'Completed' },
  { key: 'high', label: 'High Priority' },
];

export function TaskToolbar({
  activeFilter,
  onChangeFilter,
  categoryFilter,
  onChangeCategoryFilter,
  searchQuery,
  onChangeSearchQuery,
  sortBy,
  onChangeSortBy,
  viewMode,
  onChangeViewMode,
  searchInputRef,
  counts,
}: TaskToolbarProps) {
  return (
    <section aria-label="Filter and search tasks" className="space-y-3">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Segmented filter bar */}
        <div
          role="group"
          aria-label="Status and priority filters"
          className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1 sm:inline-flex sm:items-center"
        >
          {FILTER_TABS.map((tab) => {
            const isSelected = activeFilter === tab.key;
            const count = counts[tab.key];
            return (
              <button
                key={tab.key}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onChangeFilter(tab.key)}
                className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 sm:py-1.5 ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* List / Board view toggle */}
        <div
          role="group"
          aria-label="View layout"
          className="inline-flex self-start rounded-lg bg-slate-100 p-1 sm:self-auto"
        >
          <button
            type="button"
            aria-pressed={viewMode === 'list'}
            onClick={() => onChangeViewMode('list')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
              viewMode === 'list'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutList className="h-3.5 w-3.5" aria-hidden="true" />
            <span>List</span>
          </button>
          <button
            type="button"
            aria-pressed={viewMode === 'board'}
            onClick={() => onChangeViewMode('board')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
              viewMode === 'board'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Columns3 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Board</span>
          </button>
        </div>
      </div>

      {/* Search, category, and sort controls */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <label htmlFor="task-search-input" className="sr-only">
            Search tasks by title
          </label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            ref={searchInputRef}
            id="task-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onChangeSearchQuery(e.target.value)}
            placeholder="Search tasks by title... (/)"
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
          />
          {searchQuery.length > 0 && (
            <button
              type="button"
              onClick={() => onChangeSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:flex sm:items-center">
          <div>
            <label htmlFor="category-filter-select" className="sr-only">
              Filter by category
            </label>
            <select
              id="category-filter-select"
              aria-label="Filter by category"
              value={categoryFilter}
              onChange={(e) => onChangeCategoryFilter(e.target.value as TaskCategory | 'all')}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 transition-colors focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
            >
              <option value="all">All Categories</option>
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <label htmlFor="task-sort-select" className="sr-only">
              Sort tasks
            </label>
            <ArrowUpDown
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <select
              id="task-sort-select"
              aria-label="Sort tasks"
              value={sortBy}
              onChange={(e) => onChangeSortBy(e.target.value as TaskSort)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-sm text-slate-700 transition-colors focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
            >
              <option value="dueDateAndPriority">Due Date & Priority</option>
              <option value="dueDateAsc">Due Date (Earliest)</option>
              <option value="dueDateDesc">Due Date (Latest)</option>
              <option value="priorityDesc">Priority (High to Low)</option>
              <option value="priorityAsc">Priority (Low to High)</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}

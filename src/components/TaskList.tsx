import { ClipboardList, Plus, RotateCcw } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { TaskItem } from './TaskItem';
import { TaskBoard } from './TaskBoard';
import type { Task, TaskPriority, ViewMode } from '../types/task';

interface TaskListProps {
  tasks: Task[];
  totalTaskCount: number;
  viewMode: ViewMode;
  activeFocusTaskId: string | null;
  onToggleComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onRequestDelete: (task: Task) => void;
  onStartFocus: (task: Task) => void;
  onChangePriority: (taskId: string, nextPriority: TaskPriority) => void;
  onOpenAddModal: () => void;
  onResetFilters: () => void;
}

export function TaskList({
  tasks,
  totalTaskCount,
  viewMode,
  activeFocusTaskId,
  onToggleComplete,
  onEdit,
  onRequestDelete,
  onStartFocus,
  onChangePriority,
  onOpenAddModal,
  onResetFilters,
}: TaskListProps) {
  if (totalTaskCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <ClipboardList className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="mt-4 font-display text-base font-semibold text-slate-900">
          No tasks yet
        </h3>
        <p className="mt-1.5 max-w-sm text-sm text-slate-500">
          Your task list is empty. Add your first task with a due date, priority, and category to start tracking progress.
        </p>
        <button
          type="button"
          onClick={onOpenAddModal}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-xs transition-colors duration-150 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add First Task</span>
        </button>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-14 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          <ClipboardList className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="mt-4 font-display text-base font-semibold text-slate-900">
          No matching tasks
        </h3>
        <p className="mt-1.5 max-w-sm text-sm text-slate-500">
          No tasks match the active filter or search term. Reset your filters to view all saved tasks.
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          <span>Reset Filters</span>
        </button>
      </div>
    );
  }

  if (viewMode === 'board') {
    return (
      <TaskBoard
        tasks={tasks}
        activeFocusTaskId={activeFocusTaskId}
        onToggleComplete={onToggleComplete}
        onEdit={onEdit}
        onRequestDelete={onRequestDelete}
        onStartFocus={onStartFocus}
        onChangePriority={onChangePriority}
      />
    );
  }

  return (
    <div data-testid="task-list" className="space-y-3">
      <AnimatePresence initial={false}>
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <TaskItem
              task={task}
              isFocusing={activeFocusTaskId === task.id}
              onToggleComplete={onToggleComplete}
              onEdit={onEdit}
              onRequestDelete={onRequestDelete}
              onStartFocus={onStartFocus}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

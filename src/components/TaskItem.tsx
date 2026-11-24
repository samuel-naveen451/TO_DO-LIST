import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  Briefcase,
  Calendar,
  CheckCircle2,
  Circle,
  Layers,
  Minus,
  Pencil,
  Play,
  Trash2,
  User,
} from 'lucide-react';
import { formatDueDate } from '../utils/tasks';
import type { Task, TaskCategory, TaskPriority } from '../types/task';

interface TaskItemProps {
  task: Task;
  isFocusing: boolean;
  onToggleComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onRequestDelete: (task: Task) => void;
  onStartFocus: (task: Task) => void;
}

const PRIORITY_STYLES: Record<
  TaskPriority,
  { classes: string; label: string }
> = {
  High: {
    classes: 'border-red-200 bg-red-50 text-red-700',
    label: 'High Priority',
  },
  Medium: {
    classes: 'border-amber-200 bg-amber-50 text-amber-800',
    label: 'Medium Priority',
  },
  Low: {
    classes: 'border-slate-200 bg-slate-50 text-slate-600',
    label: 'Low Priority',
  },
};

function PriorityIcon({ priority }: { priority: TaskPriority }) {
  if (priority === 'High') {
    return <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />;
  }
  if (priority === 'Medium') {
    return <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />;
  }
  return <Minus className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />;
}

function CategoryIcon({ category }: { category: TaskCategory }) {
  switch (category) {
    case 'Work':
      return <Briefcase className="h-3.5 w-3.5 shrink-0 text-blue-600" aria-hidden="true" />;
    case 'Study':
      return <BookOpen className="h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden="true" />;
    case 'Personal':
      return <User className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />;
    default:
      return <Layers className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />;
  }
}

export function TaskItem({
  task,
  isFocusing,
  onToggleComplete,
  onEdit,
  onRequestDelete,
  onStartFocus,
}: TaskItemProps) {
  const dueInfo = formatDueDate(task.dueDate, task.completed);
  const priorityStyle = PRIORITY_STYLES[task.priority];

  const dueToneClass =
    dueInfo.tone === 'overdue'
      ? 'text-red-600 font-medium'
      : dueInfo.tone === 'today'
        ? 'text-amber-700 font-medium'
        : 'text-slate-500';

  return (
    <article
      data-testid={`task-item-${task.id}`}
      className={`group rounded-xl border bg-white p-4 shadow-2xs transition-colors duration-150 sm:p-5 ${
        isFocusing
          ? 'border-blue-400 ring-2 ring-blue-600/10'
          : task.completed
            ? 'border-slate-200/80 bg-slate-50/50'
            : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => onToggleComplete(task.id)}
          aria-pressed={task.completed}
          aria-label={
            task.completed
              ? `Mark "${task.title}" as pending`
              : `Mark "${task.title}" as completed`
          }
          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          {task.completed ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
          ) : (
            <Circle className="h-5 w-5" aria-hidden="true" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2 sm:gap-4">
            <h3
              className={`min-w-0 flex-1 pt-1.5 text-base font-semibold leading-snug break-words ${
                task.completed ? 'text-slate-400 line-through' : 'text-slate-900'
              }`}
            >
              {task.title}
            </h3>

            <div className="flex items-center gap-0.5 shrink-0">
              {!task.completed && (
                <button
                  type="button"
                  onClick={() => onStartFocus(task)}
                  aria-label={`Start focus timer for "${task.title}"`}
                  title="Start 25m focus timer"
                  className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    isFocusing
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <Play className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                onClick={() => onEdit(task)}
                aria-label={`Edit "${task.title}"`}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onRequestDelete(task)}
                aria-label={`Delete "${task.title}"`}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors duration-150 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {task.description && (
            <p
              className={`mt-1 text-sm leading-relaxed break-words ${
                task.completed ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              {task.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
            <span
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-medium whitespace-nowrap ${priorityStyle.classes}`}
            >
              <PriorityIcon priority={task.priority} />
              <span>{priorityStyle.label}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 font-medium text-slate-600">
              <CategoryIcon category={task.category} />
              <span>{task.category}</span>
            </span>

            <span className={`inline-flex items-center gap-1.5 font-mono tabular-nums ${dueToneClass}`}>
              <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{dueInfo.label}</span>
            </span>

            <span
              className={`font-medium ${
                task.completed ? 'text-emerald-700' : 'text-slate-600'
              }`}
            >
              {task.completed ? 'Completed' : 'Pending'}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

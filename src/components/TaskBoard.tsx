import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Circle,
  Minus,
  Pencil,
  Play,
  Trash2,
} from 'lucide-react';
import { formatDueDate, groupTasksByPriority } from '../utils/tasks';
import type { Task, TaskPriority } from '../types/task';

interface TaskBoardProps {
  tasks: Task[];
  activeFocusTaskId: string | null;
  onToggleComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onRequestDelete: (task: Task) => void;
  onStartFocus: (task: Task) => void;
  onChangePriority: (taskId: string, nextPriority: TaskPriority) => void;
}

const COLUMNS: {
  priority: TaskPriority;
  title: string;
  headerBg: string;
  badgeText: string;
}[] = [
  {
    priority: 'High',
    title: 'High Priority',
    headerBg: 'bg-red-50/70 border-red-200/80',
    badgeText: 'text-red-700',
  },
  {
    priority: 'Medium',
    title: 'Medium Priority',
    headerBg: 'bg-amber-50/70 border-amber-200/80',
    badgeText: 'text-amber-800',
  },
  {
    priority: 'Low',
    title: 'Low Priority',
    headerBg: 'bg-slate-100/80 border-slate-200',
    badgeText: 'text-slate-700',
  },
];

function ColumnIcon({ priority }: { priority: TaskPriority }) {
  if (priority === 'High') {
    return <AlertCircle className="h-4 w-4 text-red-600" aria-hidden="true" />;
  }
  if (priority === 'Medium') {
    return <ArrowUpRight className="h-4 w-4 text-amber-600" aria-hidden="true" />;
  }
  return <Minus className="h-4 w-4 text-slate-500" aria-hidden="true" />;
}

export function TaskBoard({
  tasks,
  activeFocusTaskId,
  onToggleComplete,
  onEdit,
  onRequestDelete,
  onStartFocus,
  onChangePriority,
}: TaskBoardProps) {
  const grouped = groupTasksByPriority(tasks);

  return (
    <div
      data-testid="task-board"
      className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-start"
    >
      {COLUMNS.map((col) => {
        const columnTasks = grouped[col.priority];
        const canPromote = col.priority !== 'High';
        const canDemote = col.priority !== 'Low';
        const promoteTarget: TaskPriority = col.priority === 'Low' ? 'Medium' : 'High';
        const demoteTarget: TaskPriority = col.priority === 'High' ? 'Medium' : 'Low';

        return (
          <section
            key={col.priority}
            aria-label={`${col.title} column`}
            className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5"
          >
            <div
              className={`flex items-center justify-between rounded-lg border px-3 py-2 ${col.headerBg}`}
            >
              <div className="flex items-center gap-2">
                <ColumnIcon priority={col.priority} />
                <h3 className={`font-display text-sm font-semibold ${col.badgeText}`}>
                  {col.title}
                </h3>
              </div>
              <span className="font-mono text-xs font-medium text-slate-600 tabular-nums">
                {columnTasks.length}
              </span>
            </div>

            <div className="mt-3 space-y-2.5">
              {columnTasks.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 bg-white/60 px-4 py-8 text-center text-xs text-slate-400">
                  No {col.priority.toLowerCase()} priority tasks
                </div>
              ) : (
                columnTasks.map((task) => {
                  const dueInfo = formatDueDate(task.dueDate, task.completed);
                  const isFocusing = activeFocusTaskId === task.id;

                  return (
                    <article
                      key={task.id}
                      className={`rounded-xl border bg-white p-3.5 shadow-2xs transition-colors ${
                        isFocusing
                          ? 'border-blue-400 ring-2 ring-blue-600/10'
                          : task.completed
                            ? 'border-slate-200/80 bg-white/70'
                            : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <button
                          type="button"
                          onClick={() => onToggleComplete(task.id)}
                          aria-pressed={task.completed}
                          aria-label={
                            task.completed
                              ? `Mark "${task.title}" as pending`
                              : `Mark "${task.title}" as completed`
                          }
                          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" aria-hidden="true" />
                          ) : (
                            <Circle className="h-4.5 w-4.5" aria-hidden="true" />
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <h4
                            className={`text-sm font-semibold leading-snug break-words ${
                              task.completed ? 'text-slate-400 line-through' : 'text-slate-900'
                            }`}
                          >
                            {task.title}
                          </h4>

                          {task.description && (
                            <p
                              className={`mt-1 line-clamp-2 text-xs leading-relaxed ${
                                task.completed ? 'text-slate-400' : 'text-slate-600'
                              }`}
                            >
                              {task.description}
                            </p>
                          )}

                          <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-500">
                            <span className="font-medium text-slate-600">{task.category}</span>
                            <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                              <Calendar className="h-3 w-3 shrink-0" aria-hidden="true" />
                              <span>{dueInfo.label}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
                        <div className="flex items-center gap-1">
                          {canPromote && (
                            <button
                              type="button"
                              onClick={() => onChangePriority(task.id, promoteTarget)}
                              aria-label={`Move "${task.title}" to ${promoteTarget} priority`}
                              title={`Move to ${promoteTarget} priority`}
                              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                            >
                              <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          )}
                          {canDemote && (
                            <button
                              type="button"
                              onClick={() => onChangePriority(task.id, demoteTarget)}
                              aria-label={`Move "${task.title}" to ${demoteTarget} priority`}
                              title={`Move to ${demoteTarget} priority`}
                              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                            >
                              <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {!task.completed && (
                            <button
                              type="button"
                              onClick={() => onStartFocus(task)}
                              aria-label={`Start focus timer for "${task.title}"`}
                              className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                                isFocusing
                                  ? 'bg-blue-50 text-blue-600'
                                  : 'text-slate-400 hover:bg-blue-50 hover:text-blue-600'
                              }`}
                            >
                              <Play className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onEdit(task)}
                            aria-label={`Edit "${task.title}"`}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRequestDelete(task)}
                            aria-label={`Delete "${task.title}"`}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

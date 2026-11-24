import { useState } from 'react';
import { Plus } from 'lucide-react';
import { CATEGORY_OPTIONS, PRIORITY_OPTIONS, validateTaskInput } from '../utils/tasks';
import type { TaskCategory, TaskFormInput, TaskPriority } from '../types/task';

interface QuickAddBarProps {
  onQuickAdd: (input: TaskFormInput) => void;
}

export function QuickAddBar({ onQuickAdd }: QuickAddBarProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [category, setCategory] = useState<TaskCategory>('Work');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const input: TaskFormInput = {
      title,
      description: '',
      dueDate: '',
      priority,
      category,
      completed: false,
    };

    const validation = validateTaskInput(input);
    if (validation.title) {
      setError(validation.title);
      return;
    }

    onQuickAdd(input);
    setTitle('');
    setError(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Quick add task"
      className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs sm:p-3.5"
    >
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="flex-1">
          <label htmlFor="quick-add-input" className="sr-only">
            Quick add task title
          </label>
          <input
            id="quick-add-input"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Quick add a task and press Enter..."
            aria-invalid={Boolean(error)}
            className={`h-10 w-full rounded-lg border px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 ${
              error
                ? 'border-red-400 focus:border-red-600 focus:ring-red-600/15'
                : 'border-slate-200 bg-slate-50/70 focus:border-blue-600 focus:bg-white focus:ring-blue-600/15'
            }`}
          />
        </div>

        <div className="flex items-center gap-2">
          <div>
            <label htmlFor="quick-add-priority" className="sr-only">
              Quick add priority
            </label>
            <select
              id="quick-add-priority"
              aria-label="Quick add priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 transition-colors focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="quick-add-category" className="sr-only">
              Quick add category
            </label>
            <select
              id="quick-add-category"
              aria-label="Quick add category"
              value={category}
              onChange={(e) => setCategory(e.target.value as TaskCategory)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 transition-colors focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 text-xs font-medium text-white transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Quick Add</span>
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}

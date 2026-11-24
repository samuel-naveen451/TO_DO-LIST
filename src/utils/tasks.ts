import type {
  CategoryBreakdownItem,
  DashboardStats,
  Task,
  TaskCategory,
  TaskFilter,
  TaskFormInput,
  TaskPriority,
  TaskSort,
} from '../types/task';

export const STORAGE_KEY = 'dayboard_tasks_v1';

export const PRIORITY_OPTIONS: readonly TaskPriority[] = ['Low', 'Medium', 'High'];
export const CATEGORY_OPTIONS: readonly TaskCategory[] = ['Personal', 'Work', 'Study', 'Other'];

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};

export const SEED_TASKS: Task[] = [
  {
    id: 'seed-1',
    title: 'Finalize Q4 product roadmap presentation',
    description: 'Align milestone dates with engineering leads and update the revenue forecast slide.',
    dueDate: '2026-11-24',
    priority: 'High',
    category: 'Work',
    completed: false,
    createdAt: '2026-11-20T09:00:00.000Z',
    updatedAt: '2026-11-20T09:00:00.000Z',
  },
  {
    id: 'seed-2',
    title: 'Review distributed systems lecture notes',
    description: 'Summarize consensus protocols and Raft state machine replication examples.',
    dueDate: '2026-11-25',
    priority: 'Medium',
    category: 'Study',
    completed: false,
    createdAt: '2026-11-21T14:30:00.000Z',
    updatedAt: '2026-11-21T14:30:00.000Z',
  },
  {
    id: 'seed-3',
    title: 'Schedule annual dental checkup',
    description: 'Call the downtown clinic for a morning slot next week.',
    dueDate: '2026-11-28',
    priority: 'Low',
    category: 'Personal',
    completed: false,
    createdAt: '2026-11-22T10:15:00.000Z',
    updatedAt: '2026-11-22T10:15:00.000Z',
  },
  {
    id: 'seed-4',
    title: 'Submit monthly expense report',
    description: 'Attach travel receipts and software subscription invoices in the finance portal.',
    dueDate: '2026-11-23',
    priority: 'High',
    category: 'Work',
    completed: true,
    createdAt: '2026-11-19T08:00:00.000Z',
    updatedAt: '2026-11-23T11:20:00.000Z',
  },
  {
    id: 'seed-5',
    title: 'Organize home workspace cables',
    description: 'Label power adapters and mount the under-desk cable tray.',
    dueDate: '2026-11-30',
    priority: 'Low',
    category: 'Other',
    completed: true,
    createdAt: '2026-11-18T16:45:00.000Z',
    updatedAt: '2026-11-22T18:10:00.000Z',
  },
];

export function computeDashboardStats(tasks: Task[]): DashboardStats {
  const total = tasks.length;
  if (total === 0) {
    return {
      total: 0,
      completed: 0,
      pending: 0,
      completionPercentage: 0,
    };
  }
  const completed = tasks.reduce((count, task) => (task.completed ? count + 1 : count), 0);
  const pending = total - completed;
  const completionPercentage = Math.round((completed / total) * 100);
  return {
    total,
    completed,
    pending,
    completionPercentage,
  };
}

export interface TaskValidationErrors {
  title?: string;
}

export function validateTaskInput(input: TaskFormInput): TaskValidationErrors {
  const errors: TaskValidationErrors = {};
  if (!input.title || input.title.trim().length === 0) {
    errors.title = 'Task title is required.';
  } else if (input.title.trim().length > 140) {
    errors.title = 'Task title must be 140 characters or fewer.';
  }
  return errors;
}

export function filterTasks(
  tasks: Task[],
  filter: TaskFilter,
  searchQuery: string,
  categoryFilter: TaskCategory | 'all' = 'all'
): Task[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return tasks.filter((task) => {
    if (filter === 'pending' && task.completed) {
      return false;
    }
    if (filter === 'completed' && !task.completed) {
      return false;
    }
    if (filter === 'high' && task.priority !== 'High') {
      return false;
    }
    if (categoryFilter !== 'all' && task.category !== categoryFilter) {
      return false;
    }
    if (normalizedQuery.length > 0 && !task.title.toLowerCase().includes(normalizedQuery)) {
      return false;
    }
    return true;
  });
}

function compareDueDatesAsc(aDate: string, bDate: string): number {
  if (!aDate && !bDate) return 0;
  if (!aDate) return 1; // undated goes after dated
  if (!bDate) return -1;
  return aDate.localeCompare(bDate);
}

function compareDueDatesDesc(aDate: string, bDate: string): number {
  if (!aDate && !bDate) return 0;
  if (!aDate) return 1; // undated still goes last
  if (!bDate) return -1;
  return bDate.localeCompare(aDate);
}

export function sortTasks(tasks: Task[], sortBy: TaskSort): Task[] {
  const copy = [...tasks];
  copy.sort((a, b) => {
    switch (sortBy) {
      case 'dueDateAsc': {
        const dateDiff = compareDueDatesAsc(a.dueDate, b.dueDate);
        if (dateDiff !== 0) return dateDiff;
        return PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
      }
      case 'dueDateDesc': {
        const dateDiff = compareDueDatesDesc(a.dueDate, b.dueDate);
        if (dateDiff !== 0) return dateDiff;
        return PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
      }
      case 'priorityDesc': {
        const priorityDiff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return compareDueDatesAsc(a.dueDate, b.dueDate);
      }
      case 'priorityAsc': {
        const priorityDiff = PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return compareDueDatesAsc(a.dueDate, b.dueDate);
      }
      case 'dueDateAndPriority':
      default: {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        const dateDiff = compareDueDatesAsc(a.dueDate, b.dueDate);
        if (dateDiff !== 0) return dateDiff;
        const priorityDiff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.createdAt.localeCompare(a.createdAt);
      }
    }
  });
  return copy;
}

export function getLocalTodayIso(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDueDate(
  dueDate: string,
  completed: boolean = false,
  todayIso: string = getLocalTodayIso()
): { label: string; tone: 'overdue' | 'today' | 'upcoming' | 'none' } {
  if (!dueDate) {
    return { label: 'No due date', tone: 'none' };
  }

  const [yearStr, monthStr, dayStr] = dueDate.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  let formatted = dueDate;
  if (year && month && day) {
    const dt = new Date(year, month - 1, day);
    formatted = dt.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  if (!completed && dueDate < todayIso) {
    return { label: `Overdue · ${formatted}`, tone: 'overdue' };
  }
  if (!completed && dueDate === todayIso) {
    return { label: `Due today · ${formatted}`, tone: 'today' };
  }
  return { label: formatted, tone: 'upcoming' };
}

export function createTaskRecord(
  input: TaskFormInput,
  id: string = generateTaskId(),
  nowIso: string = new Date().toISOString()
): Task {
  return {
    id,
    title: input.title.trim(),
    description: input.description.trim(),
    dueDate: input.dueDate,
    priority: input.priority,
    category: input.category,
    completed: Boolean(input.completed),
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

export function updateTaskRecord(
  existing: Task,
  input: TaskFormInput,
  nowIso: string = new Date().toISOString()
): Task {
  return {
    ...existing,
    title: input.title.trim(),
    description: input.description.trim(),
    dueDate: input.dueDate,
    priority: input.priority,
    category: input.category,
    completed: input.completed !== undefined ? input.completed : existing.completed,
    updatedAt: nowIso,
  };
}

export function generateTaskId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function isValidTask(candidate: unknown): candidate is Task {
  if (!candidate || typeof candidate !== 'object') return false;
  const obj = candidate as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.dueDate === 'string' &&
    (obj.priority === 'Low' || obj.priority === 'Medium' || obj.priority === 'High') &&
    (obj.category === 'Personal' ||
      obj.category === 'Work' ||
      obj.category === 'Study' ||
      obj.category === 'Other') &&
    typeof obj.completed === 'boolean' &&
    typeof obj.createdAt === 'string' &&
    typeof obj.updatedAt === 'string'
  );
}

export function loadTasksFromStorage(
  storage: Pick<Storage, 'getItem' | 'setItem'> | null
): Task[] {
  if (!storage) {
    return SEED_TASKS;
  }

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw === null) {
      storage.setItem(STORAGE_KEY, JSON.stringify(SEED_TASKS));
      return SEED_TASKS;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return SEED_TASKS;
    }
    return parsed.filter(isValidTask);
  } catch {
    return SEED_TASKS;
  }
}

export function saveTasksToStorage(
  storage: Pick<Storage, 'setItem'> | null,
  tasks: Task[]
): void {
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Ignore storage quota errors silently
  }
}

export function computeCategoryBreakdown(tasks: Task[]): CategoryBreakdownItem[] {
  const counts: Record<TaskCategory, number> = {
    Work: 0,
    Study: 0,
    Personal: 0,
    Other: 0,
  };

  for (const task of tasks) {
    counts[task.category] += 1;
  }

  const total = tasks.length;
  const order: TaskCategory[] = ['Work', 'Study', 'Personal', 'Other'];
  return order.map((category) => ({
    category,
    count: counts[category],
    percentage: total > 0 ? Math.round((counts[category] / total) * 100) : 0,
  }));
}

export function formatCountdown(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function groupTasksByPriority(
  tasks: Task[]
): Record<TaskPriority, Task[]> {
  const grouped: Record<TaskPriority, Task[]> = {
    High: [],
    Medium: [],
    Low: [],
  };

  for (const task of tasks) {
    grouped[task.priority].push(task);
  }

  return grouped;
}

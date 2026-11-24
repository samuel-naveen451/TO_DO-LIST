import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeCategoryBreakdown,
  computeDashboardStats,
  createTaskRecord,
  filterTasks,
  formatCountdown,
  formatDueDate,
  groupTasksByPriority,
  loadTasksFromStorage,
  saveTasksToStorage,
  SEED_TASKS,
  sortTasks,
  STORAGE_KEY,
  updateTaskRecord,
  validateTaskInput,
} from './tasks';
import type { Task } from '../types/task';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 't-1',
    title: 'Sample task',
    description: 'Details',
    dueDate: '2026-11-25',
    priority: 'Medium',
    category: 'Work',
    completed: false,
    createdAt: '2026-11-20T10:00:00.000Z',
    updatedAt: '2026-11-20T10:00:00.000Z',
    ...overrides,
  };
}

test('computeDashboardStats returns zeroed stats when task list is empty', () => {
  assert.deepEqual(computeDashboardStats([]), {
    total: 0,
    completed: 0,
    pending: 0,
    completionPercentage: 0,
  });
});

test('computeDashboardStats computes total, completed, pending, and rounded percentage', () => {
  const tasks = [
    makeTask({ id: '1', completed: true }),
    makeTask({ id: '2', completed: false }),
    makeTask({ id: '3', completed: true }),
  ];
  assert.deepEqual(computeDashboardStats(tasks), {
    total: 3,
    completed: 2,
    pending: 1,
    completionPercentage: 67,
  });
});

test('validateTaskInput requires non-empty title', () => {
  assert.equal(
    validateTaskInput({
      title: '   ',
      description: '',
      dueDate: '',
      priority: 'Low',
      category: 'Personal',
    }).title,
    'Task title is required.'
  );

  assert.deepEqual(
    validateTaskInput({
      title: '  Buy groceries  ',
      description: '',
      dueDate: '',
      priority: 'Low',
      category: 'Personal',
    }),
    {}
  );
});

test('filterTasks supports status, high priority, category, and title search', () => {
  const tasks = [
    makeTask({ id: '1', title: 'Write quarterly report', priority: 'High', category: 'Work', completed: false }),
    makeTask({ id: '2', title: 'Read design book', priority: 'Low', category: 'Study', completed: true }),
    makeTask({ id: '3', title: 'Prepare tax documents', priority: 'High', category: 'Personal', completed: true }),
  ];

  assert.equal(filterTasks(tasks, 'all', '').length, 3);
  assert.deepEqual(
    filterTasks(tasks, 'pending', '').map((t) => t.id),
    ['1']
  );
  assert.deepEqual(
    filterTasks(tasks, 'completed', '').map((t) => t.id),
    ['2', '3']
  );
  assert.deepEqual(
    filterTasks(tasks, 'high', '').map((t) => t.id),
    ['1', '3']
  );
  assert.deepEqual(
    filterTasks(tasks, 'all', 'QUARTERLY').map((t) => t.id),
    ['1']
  );
  assert.deepEqual(
    filterTasks(tasks, 'high', '', 'Personal').map((t) => t.id),
    ['3']
  );
});

test('sortTasks orders by due date and priority accurately', () => {
  const tasks = [
    makeTask({ id: 'undated-high', dueDate: '', priority: 'High', completed: false }),
    makeTask({ id: 'later-low', dueDate: '2026-11-30', priority: 'Low', completed: false }),
    makeTask({ id: 'sooner-med', dueDate: '2026-11-24', priority: 'Medium', completed: false }),
    makeTask({ id: 'sooner-high', dueDate: '2026-11-24', priority: 'High', completed: false }),
    makeTask({ id: 'done-urgent', dueDate: '2026-11-20', priority: 'High', completed: true }),
  ];

  assert.deepEqual(
    sortTasks(tasks, 'dueDateAndPriority').map((t) => t.id),
    ['sooner-high', 'sooner-med', 'later-low', 'undated-high', 'done-urgent']
  );

  assert.deepEqual(
    sortTasks(tasks, 'priorityDesc').map((t) => t.id),
    ['done-urgent', 'sooner-high', 'undated-high', 'sooner-med', 'later-low']
  );

  assert.deepEqual(
    sortTasks(tasks, 'dueDateAsc').map((t) => t.id),
    ['done-urgent', 'sooner-high', 'sooner-med', 'later-low', 'undated-high']
  );

  assert.deepEqual(
    sortTasks(tasks, 'dueDateDesc').map((t) => t.id),
    ['later-low', 'sooner-high', 'sooner-med', 'done-urgent', 'undated-high']
  );
});

test('formatDueDate detects overdue, due today, upcoming, and undated', () => {
  assert.equal(formatDueDate('', false, '2026-11-23').tone, 'none');
  assert.equal(formatDueDate('2026-11-22', false, '2026-11-23').tone, 'overdue');
  assert.equal(formatDueDate('2026-11-22', true, '2026-11-23').tone, 'upcoming');
  assert.equal(formatDueDate('2026-11-23', false, '2026-11-23').tone, 'today');
  assert.equal(formatDueDate('2026-11-28', false, '2026-11-23').tone, 'upcoming');
});

test('createTaskRecord and updateTaskRecord trim inputs and preserve timestamps', () => {
  const created = createTaskRecord(
    {
      title: '  Draft proposal  ',
      description: '  Outline scope  ',
      dueDate: '2026-12-01',
      priority: 'High',
      category: 'Work',
    },
    'custom-id',
    '2026-11-23T12:00:00.000Z'
  );
  assert.equal(created.id, 'custom-id');
  assert.equal(created.title, 'Draft proposal');
  assert.equal(created.description, 'Outline scope');
  assert.equal(created.completed, false);

  const updated = updateTaskRecord(
    created,
    {
      title: 'Final proposal',
      description: 'Ready for review',
      dueDate: '2026-12-02',
      priority: 'Medium',
      category: 'Work',
      completed: true,
    },
    '2026-11-23T13:00:00.000Z'
  );
  assert.equal(updated.createdAt, '2026-11-23T12:00:00.000Z');
  assert.equal(updated.updatedAt, '2026-11-23T13:00:00.000Z');
  assert.equal(updated.completed, true);
  assert.equal(updated.priority, 'Medium');
});

test('loadTasksFromStorage seeds on first visit and preserves empty list after deletions', () => {
  const store = new Map<string, string>();
  const mockStorage = {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };

  // First load seeds initial tasks
  const initial = loadTasksFromStorage(mockStorage);
  assert.equal(initial.length, SEED_TASKS.length);
  assert.ok(store.has(STORAGE_KEY));

  // Deleting all tasks saves [] and persists empty state on reload
  saveTasksToStorage(mockStorage, []);
  const afterClear = loadTasksFromStorage(mockStorage);
  assert.deepEqual(afterClear, []);
});

test('computeCategoryBreakdown counts and computes percentages per category', () => {
  const tasks = [
    makeTask({ id: '1', category: 'Work' }),
    makeTask({ id: '2', category: 'Work' }),
    makeTask({ id: '3', category: 'Study' }),
    makeTask({ id: '4', category: 'Personal' }),
  ];

  assert.deepEqual(computeCategoryBreakdown(tasks), [
    { category: 'Work', count: 2, percentage: 50 },
    { category: 'Study', count: 1, percentage: 25 },
    { category: 'Personal', count: 1, percentage: 25 },
    { category: 'Other', count: 0, percentage: 0 },
  ]);

  assert.deepEqual(computeCategoryBreakdown([]), [
    { category: 'Work', count: 0, percentage: 0 },
    { category: 'Study', count: 0, percentage: 0 },
    { category: 'Personal', count: 0, percentage: 0 },
    { category: 'Other', count: 0, percentage: 0 },
  ]);
});

test('formatCountdown formats seconds cleanly and clamps negatives', () => {
  assert.equal(formatCountdown(1500), '25:00');
  assert.equal(formatCountdown(65), '01:05');
  assert.equal(formatCountdown(0), '00:00');
  assert.equal(formatCountdown(-10), '00:00');
});

test('groupTasksByPriority groups tasks into High, Medium, and Low buckets', () => {
  const tasks = [
    makeTask({ id: '1', priority: 'Low' }),
    makeTask({ id: '2', priority: 'High' }),
    makeTask({ id: '3', priority: 'Medium' }),
    makeTask({ id: '4', priority: 'High' }),
  ];

  const grouped = groupTasksByPriority(tasks);
  assert.deepEqual(grouped.High.map((t) => t.id), ['2', '4']);
  assert.deepEqual(grouped.Medium.map((t) => t.id), ['3']);
  assert.deepEqual(grouped.Low.map((t) => t.id), ['1']);
});

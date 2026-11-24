import { useEffect, useMemo, useRef, useState } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardStatsBar } from './components/DashboardStatsBar';
import { FocusBanner } from './components/FocusBanner';
import { QuickAddBar } from './components/QuickAddBar';
import { TaskToolbar } from './components/TaskToolbar';
import { TaskList } from './components/TaskList';
import { TaskFormModal } from './components/TaskFormModal';
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog';
import { ToastNotification } from './components/ToastNotification';
import {
  computeCategoryBreakdown,
  computeDashboardStats,
  createTaskRecord,
  filterTasks,
  loadTasksFromStorage,
  saveTasksToStorage,
  sortTasks,
  updateTaskRecord,
} from './utils/tasks';
import type {
  Task,
  TaskCategory,
  TaskFilter,
  TaskFormInput,
  TaskPriority,
  TaskSort,
  ToastMessage,
  ViewMode,
} from './types/task';

const DEFAULT_FOCUS_SECONDS = 25 * 60;

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() =>
    loadTasksFromStorage(typeof window !== 'undefined' ? window.localStorage : null)
  );
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<TaskSort>('dueDateAndPriority');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Focus timer state (25-minute countdown attached to a pending task)
  const [focusTaskId, setFocusTaskId] = useState<string | null>(null);
  const [focusSecondsLeft, setFocusSecondsLeft] = useState(DEFAULT_FOCUS_SECONDS);
  const [isFocusRunning, setIsFocusRunning] = useState(false);

  const toastTimerRef = useRef<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    saveTasksToStorage(typeof window !== 'undefined' ? window.localStorage : null, tasks);
  }, [tasks]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // Focus countdown interval
  useEffect(() => {
    if (!focusTaskId || !isFocusRunning) return;
    const interval = window.setInterval(() => {
      setFocusSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsFocusRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [focusTaskId, isFocusRunning]);

  // Global keyboard shortcuts: "/" focuses search, "n" opens Add Task modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isFormOpen || taskToDelete) return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target?.isContentEditable
      ) {
        return;
      }

      if (event.key === '/' && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        searchInputRef.current?.focus();
      } else if (
        (event.key === 'n' || event.key === 'N') &&
        !event.metaKey &&
        !event.ctrlKey
      ) {
        event.preventDefault();
        setEditingTask(null);
        setIsFormOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFormOpen, taskToDelete]);

  const showToast = (message: string) => {
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast({ id: String(Date.now()), message });
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 3500);
  };

  const stats = useMemo(() => computeDashboardStats(tasks), [tasks]);
  const categoryBreakdown = useMemo(() => computeCategoryBreakdown(tasks), [tasks]);

  const activeFocusTask = useMemo(
    () => tasks.find((t) => t.id === focusTaskId && !t.completed) ?? null,
    [tasks, focusTaskId]
  );

  const filterCounts = useMemo(
    () => ({
      all: tasks.length,
      pending: tasks.filter((t) => !t.completed).length,
      completed: tasks.filter((t) => t.completed).length,
      high: tasks.filter((t) => t.priority === 'High').length,
    }),
    [tasks]
  );

  const visibleTasks = useMemo(() => {
    const filtered = filterTasks(tasks, activeFilter, searchQuery, categoryFilter);
    return sortTasks(filtered, sortBy);
  }, [tasks, activeFilter, searchQuery, categoryFilter, sortBy]);

  const handleOpenAddModal = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const handleSaveTask = (input: TaskFormInput) => {
    if (editingTask) {
      setTasks((prev) =>
        prev.map((item) =>
          item.id === editingTask.id ? updateTaskRecord(item, input) : item
        )
      );
      showToast('Task updated successfully.');
    } else {
      const created = createTaskRecord(input);
      setTasks((prev) => [created, ...prev]);
      showToast('Task added to your list.');
    }
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const handleQuickAdd = (input: TaskFormInput) => {
    const created = createTaskRecord(input);
    setTasks((prev) => [created, ...prev]);
    showToast('Task added to your list.');
  };

  const handleToggleComplete = (taskId: string) => {
    let nextCompletedState = false;
    setTasks((prev) =>
      prev.map((item) => {
        if (item.id !== taskId) return item;
        nextCompletedState = !item.completed;
        return {
          ...item,
          completed: nextCompletedState,
          updatedAt: new Date().toISOString(),
        };
      })
    );
    if (nextCompletedState && focusTaskId === taskId) {
      setFocusTaskId(null);
      setIsFocusRunning(false);
    }
    showToast(nextCompletedState ? 'Task marked as completed.' : 'Task marked as pending.');
  };

  const handleChangePriority = (taskId: string, nextPriority: TaskPriority) => {
    setTasks((prev) =>
      prev.map((item) =>
        item.id === taskId
          ? { ...item, priority: nextPriority, updatedAt: new Date().toISOString() }
          : item
      )
    );
    showToast(`Priority updated to ${nextPriority}.`);
  };

  const handleStartFocus = (task: Task) => {
    if (focusTaskId === task.id) {
      setIsFocusRunning((prev) => !prev);
      return;
    }
    setFocusTaskId(task.id);
    setFocusSecondsLeft(DEFAULT_FOCUS_SECONDS);
    setIsFocusRunning(true);
    showToast(`Focus timer started for "${task.title}".`);
  };

  const handleConfirmDelete = () => {
    if (!taskToDelete) return;
    const deletedId = taskToDelete.id;
    setTasks((prev) => prev.filter((item) => item.id !== deletedId));
    if (focusTaskId === deletedId) {
      setFocusTaskId(null);
      setIsFocusRunning(false);
    }
    setTaskToDelete(null);
    showToast('Task deleted permanently.');
  };

  const handleResetFilters = () => {
    setActiveFilter('all');
    setCategoryFilter('all');
    setSearchQuery('');
  };

  return (
    <div id="top" className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <Navbar
        activeFilter={activeFilter}
        onSelectFilter={setActiveFilter}
        onOpenAddModal={handleOpenAddModal}
      />

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl [text-wrap:balance]">
              Daily Task Overview
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Organize priorities, run focus sprints, and track daily completion.
            </p>
          </div>
          <p className="font-mono text-xs text-slate-500 tabular-nums">
            Showing {visibleTasks.length} of {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </p>
        </div>

        <DashboardStatsBar
          stats={stats}
          categoryBreakdown={categoryBreakdown}
          activeCategory={categoryFilter}
          onSelectCategory={setCategoryFilter}
        />

        {activeFocusTask && (
          <FocusBanner
            task={activeFocusTask}
            secondsLeft={focusSecondsLeft}
            isRunning={isFocusRunning}
            onToggleRun={() => setIsFocusRunning((prev) => !prev)}
            onReset={() => {
              setFocusSecondsLeft(DEFAULT_FOCUS_SECONDS);
              setIsFocusRunning(false);
            }}
            onCompleteTask={() => handleToggleComplete(activeFocusTask.id)}
            onStop={() => {
              setFocusTaskId(null);
              setIsFocusRunning(false);
            }}
          />
        )}

        <QuickAddBar onQuickAdd={handleQuickAdd} />

        <TaskToolbar
          activeFilter={activeFilter}
          onChangeFilter={setActiveFilter}
          categoryFilter={categoryFilter}
          onChangeCategoryFilter={setCategoryFilter}
          searchQuery={searchQuery}
          onChangeSearchQuery={setSearchQuery}
          sortBy={sortBy}
          onChangeSortBy={setSortBy}
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          searchInputRef={searchInputRef}
          counts={filterCounts}
        />

        <TaskList
          tasks={visibleTasks}
          totalTaskCount={tasks.length}
          viewMode={viewMode}
          activeFocusTaskId={activeFocusTask?.id ?? null}
          onToggleComplete={handleToggleComplete}
          onEdit={handleOpenEditModal}
          onRequestDelete={setTaskToDelete}
          onStartFocus={handleStartFocus}
          onChangePriority={handleChangePriority}
          onOpenAddModal={handleOpenAddModal}
          onResetFilters={handleResetFilters}
        />
      </main>

      <TaskFormModal
        isOpen={isFormOpen}
        editingTask={editingTask}
        onClose={handleCloseFormModal}
        onSubmit={handleSaveTask}
      />

      <DeleteConfirmDialog
        task={taskToDelete}
        onCancel={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      <ToastNotification toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

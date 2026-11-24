export type TaskPriority = 'Low' | 'Medium' | 'High';

export type TaskCategory = 'Personal' | 'Work' | 'Study' | 'Other';

export type TaskFilter = 'all' | 'pending' | 'completed' | 'high';

export type TaskSort =
  | 'dueDateAndPriority'
  | 'dueDateAsc'
  | 'dueDateDesc'
  | 'priorityDesc'
  | 'priorityAsc';

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD or ''
  priority: TaskPriority;
  category: TaskCategory;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFormInput {
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  category: TaskCategory;
  completed?: boolean;
}

export type ViewMode = 'list' | 'board';

export interface CategoryBreakdownItem {
  category: TaskCategory;
  count: number;
  percentage: number;
}

export interface DashboardStats {
  total: number;
  completed: number;
  pending: number;
  completionPercentage: number;
}

export interface ToastMessage {
  id: string;
  message: string;
}

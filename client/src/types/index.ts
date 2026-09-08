export type UserRole = 'ADMIN' | 'MEMBER';
export type ProjectMemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';
export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';
export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  id?: string;
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  title?: string;
  department?: string;
  createdAt?: string;
}

export interface ProjectMember {
  user: User;
  role: ProjectMemberRole;
  joinedAt: string;
}

export interface Project {
  _id: string;
  name: string;
  key: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate?: string;
  deadline?: string;
  owner: User;
  members: ProjectMember[];
  archived: boolean;
  tags: string[];
  totalTasks?: number;
  completedTasks?: number;
  overdueTasks?: number;
  progress?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  project: string | { _id: string; name: string; key: string; status: ProjectStatus };
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: User;
  reporter: User;
  dueDate?: string;
  labels: string[];
  order: number;
  completedAt?: string;
  commentsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  task: string;
  author: User;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  _id: string;
  project: { _id: string; name: string; key: string };
  task?: { _id: string; title: string };
  user: User;
  action: string;
  message: string;
  details?: Record<string, any>;
  createdAt: string;
}

export interface DashboardMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  planningProjects: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  reviewTasks: number;
  overdueTasks: number;
  completionRate: number;
}

export interface DistributionItem {
  name: string;
  count: number;
  key?: string;
  color: string;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  statusDistribution: DistributionItem[];
  priorityDistribution: DistributionItem[];
  recentProjects: Array<{
    _id: string;
    name: string;
    key: string;
    status: ProjectStatus;
    priority: ProjectPriority;
    deadline?: string;
    totalTasks: number;
    completedTasks: number;
    progress: number;
  }>;
  myTasks: Task[];
  recentActivities: Activity[];
}

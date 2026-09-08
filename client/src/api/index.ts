import api from './client';
import {
  User,
  Project,
  Task,
  Comment,
  Activity,
  DashboardData,
  ProjectStatus,
  ProjectPriority,
  TaskStatus,
  TaskPriority,
  ProjectMemberRole,
} from '../types';

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await api.post<{ success: boolean; data: { user: User; token: string } }>(
      '/auth/login',
      credentials
    );
    return res.data.data;
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    title?: string;
    department?: string;
  }) => {
    const res = await api.post<{ success: boolean; data: { user: User; token: string } }>(
      '/auth/register',
      userData
    );
    return res.data.data;
  },

  getMe: async () => {
    const res = await api.get<{ success: boolean; data: { user: User } }>('/auth/me');
    return res.data.data.user;
  },

  updateProfile: async (data: Partial<User>) => {
    const res = await api.put<{ success: boolean; data: { user: User } }>(
      '/auth/profile',
      data
    );
    return res.data.data.user;
  },

  searchUsers: async (q: string) => {
    const res = await api.get<{ success: boolean; data: { users: User[] } }>(
      `/auth/users?q=${encodeURIComponent(q)}`
    );
    return res.data.data.users;
  },
};

export const projectsApi = {
  getAll: async (params?: {
    status?: string;
    priority?: string;
    search?: string;
    archived?: boolean;
  }) => {
    const res = await api.get<{ success: boolean; data: { projects: Project[] } }>(
      '/projects',
      { params }
    );
    return res.data.data.projects;
  },

  getById: async (id: string) => {
    const res = await api.get<{ success: boolean; data: { project: Project } }>(
      `/projects/${id}`
    );
    return res.data.data.project;
  },

  create: async (data: {
    name: string;
    key: string;
    description?: string;
    status?: ProjectStatus;
    priority?: ProjectPriority;
    startDate?: string;
    deadline?: string;
    tags?: string[];
  }) => {
    const res = await api.post<{ success: boolean; data: { project: Project } }>(
      '/projects',
      data
    );
    return res.data.data.project;
  },

  update: async (id: string, data: Partial<Project>) => {
    const res = await api.put<{ success: boolean; data: { project: Project } }>(
      `/projects/${id}`,
      data
    );
    return res.data.data.project;
  },

  delete: async (id: string) => {
    const res = await api.delete<{ success: boolean; data: { deletedId: string } }>(
      `/projects/${id}`
    );
    return res.data.data;
  },

  getMembers: async (projectId: string) => {
    const res = await api.get<{ success: boolean; data: { members: any[] } }>(
      `/projects/${projectId}/members`
    );
    return res.data.data.members;
  },

  addMember: async (
    projectId: string,
    data: { email?: string; userId?: string; role?: ProjectMemberRole }
  ) => {
    const res = await api.post<{ success: boolean; data: { members: any[] } }>(
      `/projects/${projectId}/members`,
      data
    );
    return res.data.data.members;
  },

  updateMemberRole: async (
    projectId: string,
    memberId: string,
    role: ProjectMemberRole
  ) => {
    const res = await api.put<{ success: boolean; data: { members: any[] } }>(
      `/projects/${projectId}/members/${memberId}`,
      { role }
    );
    return res.data.data.members;
  },

  removeMember: async (projectId: string, memberId: string) => {
    const res = await api.delete<{ success: boolean; data: { members: any[] } }>(
      `/projects/${projectId}/members/${memberId}`
    );
    return res.data.data.members;
  },

  getActivities: async (projectId: string) => {
    const res = await api.get<{ success: boolean; data: { activities: Activity[] } }>(
      `/projects/${projectId}/activities`
    );
    return res.data.data.activities;
  },
};

export const tasksApi = {
  getByProject: async (
    projectId: string,
    params?: { status?: string; priority?: string; assignee?: string; search?: string }
  ) => {
    const res = await api.get<{ success: boolean; data: { tasks: Task[] } }>(
      `/projects/${projectId}/tasks`,
      { params }
    );
    return res.data.data.tasks;
  },

  getById: async (id: string) => {
    const res = await api.get<{ success: boolean; data: { task: Task } }>(
      `/tasks/${id}`
    );
    return res.data.data.task;
  },

  create: async (
    projectId: string,
    data: {
      title: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      assignee?: string;
      dueDate?: string;
      labels?: string[];
      order?: number;
    }
  ) => {
    const res = await api.post<{ success: boolean; data: { task: Task } }>(
      `/projects/${projectId}/tasks`,
      data
    );
    return res.data.data.task;
  },

  update: async (id: string, data: Partial<Task>) => {
    const res = await api.put<{ success: boolean; data: { task: Task } }>(
      `/tasks/${id}`,
      data
    );
    return res.data.data.task;
  },

  updateStatus: async (id: string, status: TaskStatus, order?: number) => {
    const res = await api.patch<{ success: boolean; data: { task: Task } }>(
      `/tasks/${id}/status`,
      { status, order }
    );
    return res.data.data.task;
  },

  delete: async (id: string) => {
    const res = await api.delete<{ success: boolean; data: { deletedId: string } }>(
      `/tasks/${id}`
    );
    return res.data.data;
  },

  getComments: async (taskId: string) => {
    const res = await api.get<{ success: boolean; data: { comments: Comment[] } }>(
      `/tasks/${taskId}/comments`
    );
    return res.data.data.comments;
  },

  addComment: async (taskId: string, content: string) => {
    const res = await api.post<{ success: boolean; data: { comment: Comment } }>(
      `/tasks/${taskId}/comments`,
      { content }
    );
    return res.data.data.comment;
  },

  deleteComment: async (commentId: string) => {
    const res = await api.delete<{ success: boolean; data: { deletedId: string } }>(
      `/comments/${commentId}`
    );
    return res.data.data;
  },
};

export const dashboardApi = {
  getStats: async () => {
    const res = await api.get<{ success: boolean; data: DashboardData }>(
      '/dashboard/stats'
    );
    return res.data.data;
  },
};

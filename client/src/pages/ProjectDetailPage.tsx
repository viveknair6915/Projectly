import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Kanban,
  List,
  Users,
  Activity as ActivityIcon,
  Plus,
  Edit2,
  Trash2,
  UserPlus,
  ArrowLeft,
  Calendar,
  Layers,
  Clock,
  Search,
  Filter,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi, tasksApi } from '../api';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { Avatar } from '../components/common/Avatar';
import { Button } from '../components/common/Button';
import { Skeleton, CardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { CreateTaskModal } from '../components/modals/CreateTaskModal';
import { TaskDetailModal } from '../components/modals/TaskDetailModal';
import { EditProjectModal } from '../components/modals/EditProjectModal';
import { InviteMemberModal } from '../components/modals/InviteMemberModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';
import { Task, TaskStatus, TaskPriority, ProjectMemberRole } from '../types';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'kanban' | 'list' | 'members' | 'activity'>('kanban');

  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isInviteMemberOpen, setIsInviteMemberOpen] = useState(false);
  const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false);
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<Task | null>(null);

  const [taskSearch, setTaskSearch] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('ALL');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<string>('ALL');

  const {
    data: project,
    isLoading: isLoadingProject,
    error: projectError,
  } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.getById(id!),
    enabled: !!id,
  });

  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks', id],
    queryFn: () => tasksApi.getByProject(id!),
    enabled: !!id,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities', id],
    queryFn: () => projectsApi.getActivities(id!),
    enabled: !!id && activeTab === 'activity',
  });

  const deleteProjectMutation = useMutation({
    mutationFn: () => projectsApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      showToast('Project deleted successfully', 'success');
      navigate('/projects');
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to delete project', 'error');
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: ProjectMemberRole }) =>
      projectsApi.updateMemberRole(id!, memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      showToast('Member role updated', 'success');
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to update role', 'error');
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => projectsApi.removeMember(id!, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      showToast('Member removed from project', 'success');
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to remove member', 'error');
    },
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      tasksApi.updateStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      showToast('Task status updated', 'success');
    },
  });

  if (isLoadingProject) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="p-12 text-center glass-panel rounded-2xl">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-100">Project Not Found</h3>
        <p className="text-sm text-slate-400 mt-1 mb-6">
          The requested project might have been removed or you may lack permissions.
        </p>
        <Link to="/projects">
          <Button size="sm" variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  const isOwner = user?._id === project.owner?._id;
  const currentMember = project.members?.find((m) => m.user?._id === user?._id);
  const isAdminOrOwner = isOwner || currentMember?.role === 'ADMIN';

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      !taskSearch ||
      t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
      t.description?.toLowerCase().includes(taskSearch.toLowerCase());
    const matchesStatus =
      taskStatusFilter === 'ALL' || t.status === taskStatusFilter;
    const matchesPriority =
      taskPriorityFilter === 'ALL' || t.priority === taskPriorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">

      <div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Projects</span>
        </Link>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-brand-500/20 text-brand-300 border border-brand-500/30">
                {project.key}
              </span>
              <StatusBadge status={project.status} size="md" />
              <PriorityBadge priority={project.priority} size="md" />
              {project.deadline && (
                <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-800">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Target: {new Date(project.deadline).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {project.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                {project.description || 'No description provided.'}
              </p>
            </div>

            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:items-end gap-4 min-w-[260px]">
            <div className="w-full sm:w-64 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <ProgressBar progress={project.progress || 0} size="md" />
              <div className="flex justify-between items-center text-xs text-slate-400 mt-2 font-medium">
                <span>
                  {project.completedTasks || 0} of {project.totalTasks || 0} Tasks
                </span>
                <span className="text-brand-400 font-semibold">
                  {project.progress || 0}% Complete
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setIsCreateTaskOpen(true)}
              >
                Add Task
              </Button>

              {isAdminOrOwner && (
                <Button
                  size="sm"
                  variant="secondary"
                  leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                  onClick={() => setIsInviteMemberOpen(true)}
                >
                  Invite
                </Button>
              )}

              {isAdminOrOwner && (
                <button
                  onClick={() => setIsEditProjectOpen(true)}
                  className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/80 transition-colors"
                  title="Edit Project"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}

              {isOwner && (
                <button
                  onClick={() => setIsDeleteProjectOpen(true)}
                  className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800/60 hover:bg-rose-500/10 rounded-lg border border-slate-700/80 transition-colors"
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-slate-800 pb-1">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'kanban'
                ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Kanban className="w-4 h-4" />
            <span>Kanban Board</span>
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'list'
                ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Task List</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
              {tasks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'members'
                ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Team ({project.members?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'activity'
                ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <ActivityIcon className="w-4 h-4" />
            <span>Activity</span>
          </button>
        </div>
      </div>

      <div>

        {activeTab === 'kanban' && (
          <div>
            {isLoadingTasks ? (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-96 rounded-2xl" />
                ))}
              </div>
            ) : (
              <KanbanBoard
                tasks={tasks}
                projectId={project._id}
                members={project.members || []}
              />
            )}
          </div>
        )}

        {activeTab === 'list' && (
          <div className="space-y-4">

            <div className="flex flex-wrap items-center justify-between gap-3 glass-card p-3 rounded-xl border border-slate-800">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search task title..."
                    value={taskSearch}
                    onChange={(e) => setTaskSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-[#090d16] border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <select
                  value={taskStatusFilter}
                  onChange={(e) => setTaskStatusFilter(e.target.value)}
                  className="bg-[#090d16] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="REVIEW">Review</option>
                  <option value="DONE">Done</option>
                </select>

                <select
                  value={taskPriorityFilter}
                  onChange={(e) => setTaskPriorityFilter(e.target.value)}
                  className="bg-[#090d16] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <span className="text-xs text-slate-400">
                Showing {filteredTasks.length} of {tasks.length} tasks
              </span>
            </div>

            {filteredTasks.length === 0 ? (
              <EmptyState
                title="No tasks match criteria"
                description="Try clearing search filters or add a new task to this project."
                actionText="Create Task"
                onAction={() => setIsCreateTaskOpen(true)}
                actionIcon={<Plus className="w-4 h-4" />}
              />
            ) : (
              <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Task</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Priority</th>
                        <th className="py-3 px-4">Assignee</th>
                        <th className="py-3 px-4">Due Date</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredTasks.map((t) => (
                        <tr
                          key={t._id}
                          className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                          onClick={() => setSelectedTaskForModal(t)}
                        >
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-100 group-hover:text-brand-300 transition-colors">
                              {t.title}
                            </span>
                            {t.labels && t.labels.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {t.labels.slice(0, 2).map((l, i) => (
                                  <span
                                    key={i}
                                    className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400"
                                  >
                                    #{l}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td
                            className="py-3 px-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <select
                              value={t.status}
                              onChange={(e) =>
                                updateTaskStatusMutation.mutate({
                                  taskId: t._id,
                                  status: e.target.value as TaskStatus,
                                })
                              }
                              className="bg-[#090d16] border border-slate-700/80 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                            >
                              <option value="TODO">To Do</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="REVIEW">Review</option>
                              <option value="DONE">Done</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <PriorityBadge priority={t.priority} size="sm" />
                          </td>
                          <td className="py-3 px-4">
                            {t.assignee ? (
                              <div className="flex items-center gap-1.5">
                                <Avatar
                                  name={t.assignee.name}
                                  src={t.assignee.avatarUrl}
                                  size="xs"
                                />
                                <span className="text-slate-300 font-medium">
                                  {t.assignee.name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-500 italic">Unassigned</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {t.dueDate ? (
                              <span
                                className={`text-xs ${
                                  t.status !== 'DONE' &&
                                  new Date(t.dueDate) < new Date()
                                    ? 'text-rose-400 font-semibold'
                                    : 'text-slate-400'
                                }`}
                              >
                                {new Date(t.dueDate).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="text-xs text-brand-400 group-hover:underline">
                              View Details
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base font-semibold text-slate-100">
                  Project Collaborators
                </h3>
                <p className="text-xs text-slate-400">
                  Team members with access to tasks and discussions in this project.
                </p>
              </div>

              {isAdminOrOwner && (
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<UserPlus className="w-4 h-4" />}
                  onClick={() => setIsInviteMemberOpen(true)}
                >
                  Add Member
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.members?.map((m) => {
                const isProjectOwner = project.owner?._id === m.user?._id;
                const canModify =
                  isAdminOrOwner &&
                  !isProjectOwner &&
                  m.user?._id !== user?._id;

                return (
                  <div
                    key={m.user?._id}
                    className="glass-card p-4 rounded-xl border border-slate-800 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar
                        name={m.user?.name}
                        src={m.user?.avatarUrl}
                        size="md"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-semibold text-slate-100">
                            {m.user?.name}
                          </h4>
                          {isProjectOwner && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                              Owner
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{m.user?.email}</p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {m.user?.title || 'Contributor'} • {m.user?.department || 'Engineering'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {isProjectOwner ? (
                        <span className="text-xs font-semibold text-brand-400">
                          Project Owner
                        </span>
                      ) : canModify ? (
                        <select
                          value={m.role}
                          onChange={(e) =>
                            updateRoleMutation.mutate({
                              memberId: m.user._id,
                              role: e.target.value as ProjectMemberRole,
                            })
                          }
                          className="bg-[#090d16] border border-slate-700/80 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                        >
                          <option value="MEMBER">Member</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium px-2 py-0.5 rounded bg-slate-800">
                          {m.role}
                        </span>
                      )}

                      {canModify && (
                        <button
                          onClick={() => removeMemberMutation.mutate(m.user._id)}
                          className="text-[11px] text-rose-400 hover:text-rose-300 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">
              Project Audit History
            </h3>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {activities.map((act) => (
                <div
                  key={act._id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs"
                >
                  <Avatar name={act.user?.name} src={act.user?.avatarUrl} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-200">
                      <span className="font-semibold text-white">{act.user?.name}</span>{' '}
                      {act.message.replace(act.user?.name || '', '').trim()}
                    </p>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {new Date(act.createdAt).toLocaleDateString()} at{' '}
                      {new Date(act.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}

              {activities.length === 0 && (
                <p className="text-xs text-slate-500 py-6 text-center italic">
                  No activity events recorded for this project yet.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        projectId={project._id}
        members={project.members || []}
      />

      <EditProjectModal
        isOpen={isEditProjectOpen}
        onClose={() => setIsEditProjectOpen(false)}
        project={project}
      />

      <InviteMemberModal
        isOpen={isInviteMemberOpen}
        onClose={() => setIsInviteMemberOpen(false)}
        projectId={project._id}
        existingMemberIds={project.members?.map((m) => m.user?._id) || []}
      />

      <ConfirmModal
        isOpen={isDeleteProjectOpen}
        onClose={() => setIsDeleteProjectOpen(false)}
        onConfirm={() => deleteProjectMutation.mutate()}
        title={`Delete Project (${project.key})`}
        message={`Are you sure you want to permanently delete "${project.name}"? This action cannot be undone.`}
        confirmText="Delete Project"
        isLoading={deleteProjectMutation.isPending}
      />

      {selectedTaskForModal && (
        <TaskDetailModal
          isOpen={true}
          onClose={() => setSelectedTaskForModal(null)}
          task={selectedTaskForModal}
          members={project.members || []}
          projectId={project._id}
        />
      )}
    </div>
  );
};

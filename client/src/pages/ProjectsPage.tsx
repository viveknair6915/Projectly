import React, { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Calendar,
  Layers,
  MoreVertical,
  Edit2,
  Trash2,
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../api';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { Avatar } from '../components/common/Avatar';
import { Button } from '../components/common/Button';
import { Skeleton, CardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { EditProjectModal } from '../components/modals/EditProjectModal';
import { useToast } from '../components/common/Toast';
import { Project, ProjectStatus, ProjectPriority } from '../types';
import { useAuth } from '../context/AuthContext';

export const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const { onOpenCreateProject } = useOutletContext<{ onOpenCreateProject: () => void }>();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', { status: statusFilter, priority: priorityFilter, search: searchTerm }],
    queryFn: () =>
      projectsApi.getAll({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        priority: priorityFilter !== 'ALL' ? priorityFilter : undefined,
        search: searchTerm ? searchTerm : undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      showToast('Project deleted successfully', 'success');
      setProjectToDelete(null);
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to delete project', 'error');
    },
  });

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Projects</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your team's initiatives, sprint backlogs, and track overall progress.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={onOpenCreateProject}
        >
          New Project
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 items-center justify-between glass-card p-3 rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by name, key..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#090d16] border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#090d16] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PLANNING">Planning</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-[#090d16] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        <div className="flex items-center gap-1 self-end md:self-auto bg-slate-900/80 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md text-xs transition-colors ${
              viewMode === 'grid'
                ? 'bg-slate-800 text-brand-400 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-md text-xs transition-colors ${
              viewMode === 'table'
                ? 'bg-slate-800 text-brand-400 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="w-10 h-10 text-brand-400" />}
          title="No projects found"
          description="Create your first project to start organizing your team's work, tasks, and deliverables."
          actionText="Create New Project"
          onAction={onOpenCreateProject}
          actionIcon={<Plus className="w-4 h-4" />}
        />
      ) : viewMode === 'grid' ? (
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => {
            const isOwner = user?._id === project.owner?._id;

            return (
              <div
                key={project._id}
                className="group glass-card rounded-2xl border border-slate-800/80 hover:border-slate-700/80 p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl relative"
              >
                <div>
                  
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                        {project.key}
                      </span>
                      <PriorityBadge priority={project.priority} size="sm" />
                    </div>

                    <div className="flex items-center gap-1">
                      <StatusBadge status={project.status} size="sm" />
                      <button
                        onClick={() => setProjectToEdit(project)}
                        className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                        title="Edit Project"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {isOwner && (
                        <button
                          onClick={() => setProjectToDelete(project)}
                          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <Link to={`/projects/${project._id}`} className="block group">
                    <h3 className="text-base font-semibold text-slate-100 group-hover:text-brand-400 transition-colors line-clamp-1 mb-1.5">
                      {project.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed min-h-[32px]">
                      {project.description || 'No description provided.'}
                    </p>
                  </Link>

                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {project.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-3">
                  <ProgressBar progress={project.progress || 0} size="sm" />

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {project.completedTasks || 0}/{project.totalTasks || 0} Tasks
                      </span>
                    </div>

                    <div className="flex items-center -space-x-1.5">
                      {project.members?.slice(0, 4).map((m) => (
                        <Avatar
                          key={m.user?._id}
                          name={m.user?.name}
                          src={m.user?.avatarUrl}
                          size="xs"
                          className="border border-[#0f172a]"
                        />
                      ))}
                      {project.members && project.members.length > 4 && (
                        <span className="w-5 h-5 rounded-full bg-slate-800 border border-[#0f172a] text-[9px] flex items-center justify-center font-bold text-slate-300">
                          +{project.members.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Project</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Progress</th>
                  <th className="py-3.5 px-4">Tasks</th>
                  <th className="py-3.5 px-4">Team</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {projects.map((project) => (
                  <tr
                    key={project._id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/projects/${project._id}`}
                        className="flex items-center gap-2.5"
                      >
                        <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300">
                          {project.key}
                        </span>
                        <span className="font-semibold text-slate-100 group-hover:text-brand-300 transition-colors">
                          {project.name}
                        </span>
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={project.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={project.priority} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 w-40">
                      <ProgressBar progress={project.progress || 0} showLabel={false} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <span>
                        {project.completedTasks || 0} / {project.totalTasks || 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center -space-x-1">
                        {project.members?.slice(0, 3).map((m) => (
                          <Avatar
                            key={m.user?._id}
                            name={m.user?.name}
                            src={m.user?.avatarUrl}
                            size="xs"
                            className="border border-[#0f172a]"
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setProjectToEdit(project)}
                          className="p-1 text-slate-400 hover:text-slate-200 rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {user?._id === project.owner?._id && (
                          <button
                            onClick={() => setProjectToDelete(project)}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {projectToEdit && (
        <EditProjectModal
          isOpen={true}
          onClose={() => setProjectToEdit(null)}
          project={projectToEdit}
        />
      )}

      {projectToDelete && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setProjectToDelete(null)}
          onConfirm={() => deleteMutation.mutate(projectToDelete._id)}
          title={`Delete Project (${projectToDelete.key})`}
          message={`Are you sure you want to permanently delete "${projectToDelete.name}"? All associated tasks, Kanban cards, comments, and audit records will be removed.`}
          confirmText="Delete Project"
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

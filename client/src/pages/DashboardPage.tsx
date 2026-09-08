import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Activity as ActivityIcon,
  Layers,
  Plus,
  Flame,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { Avatar } from '../components/common/Avatar';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { useAuth } from '../context/AuthContext';
import { DistributionItem, ProjectStatus, ProjectPriority, Activity } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { onOpenCreateProject } = useOutletContext<{ onOpenCreateProject: () => void }>();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getStats(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center glass-panel rounded-2xl">
        <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-200">
          Failed to load dashboard metrics
        </h3>
        <p className="text-xs text-slate-400 mt-1 mb-4">
          Please verify your connection to the server.
        </p>
        <Button size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const {
    metrics,
    statusDistribution,
    priorityDistribution,
    recentProjects,
    myTasks,
    recentActivities,
  } = data;

  return (
    <div className="space-y-8">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome back, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Here's what is happening across your teams and projects today.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={onOpenCreateProject}
        >
          Create Project
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Projects
            </span>
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {metrics.activeProjects}
            </span>
            <span className="text-xs text-slate-400">
              of {metrics.totalProjects} total
            </span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>{metrics.completedProjects} successfully completed</span>
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Tasks
            </span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {metrics.totalTasks}
            </span>
            <span className="text-xs text-slate-400">
              ({metrics.inProgressTasks} in progress)
            </span>
          </div>
          <p className="text-[11px] text-sky-400 mt-2 flex items-center gap-1 font-medium">
            <Clock className="w-3 h-3" />
            <span>{metrics.todoTasks} awaiting start</span>
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Completion Rate
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-400">
              {metrics.completionRate}%
            </span>
            <span className="text-xs text-slate-400">
              {metrics.completedTasks} tasks done
            </span>
          </div>
          <div className="mt-2.5">
            <ProgressBar progress={metrics.completionRate} showLabel={false} size="sm" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Overdue Tasks
            </span>
            <div
              className={`p-2 rounded-xl ${
                metrics.overdueTasks > 0
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`text-3xl font-bold ${
                metrics.overdueTasks > 0 ? 'text-rose-400' : 'text-slate-300'
              }`}
            >
              {metrics.overdueTasks}
            </span>
            <span className="text-xs text-slate-400">past deadline</span>
          </div>
          <p
            className={`text-[11px] mt-2 flex items-center gap-1 font-medium ${
              metrics.overdueTasks > 0 ? 'text-rose-400' : 'text-slate-400'
            }`}
          >
            {metrics.overdueTasks > 0 ? 'Action required immediately' : 'All milestones on schedule'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="glass-card p-6 rounded-2xl border border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 mb-1">
            Task Pipeline Distribution
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Real-time status of all tasks across current active projects.
          </p>

          <div className="space-y-4">
            {statusDistribution.map((item) => {
              const pct =
                metrics.totalTasks > 0
                  ? Math.round((item.count / metrics.totalTasks) * 100)
                  : 0;
              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-300">{item.name}</span>
                    <span className="text-slate-400">
                      <span className="font-semibold text-white">{item.count}</span> ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 mb-1">
            Task Priority Allocation
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Workload distribution categorized by urgency level.
          </p>

          <div className="space-y-4">
            {priorityDistribution.map((item) => {
              const pct =
                metrics.totalTasks > 0
                  ? Math.round((item.count / metrics.totalTasks) * 100)
                  : 0;
              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-slate-300">{item.name}</span>
                    </div>
                    <span className="text-slate-400">
                      <span className="font-semibold text-white">{item.count}</span> ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-200">
              Active Projects Overview
            </h3>
            <Link
              to="/projects"
              className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentProjects.map((proj) => (
              <Link
                key={proj._id}
                to={`/projects/${proj._id}`}
                className="block p-4 rounded-xl bg-[#0e1627] hover:bg-[#121c33] border border-slate-800/80 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                      {proj.key}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-100 hover:text-brand-300 transition-colors">
                      {proj.name}
                    </h4>
                  </div>
                  <StatusBadge status={proj.status} size="sm" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center mt-3">
                  <ProgressBar progress={proj.progress} size="sm" />
                  <div className="flex items-center justify-between text-xs text-slate-400 sm:justify-end gap-4">
                    <span>
                      {proj.completedTasks}/{proj.totalTasks} Tasks
                    </span>
                    {proj.deadline && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {new Date(proj.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}

            {recentProjects.length === 0 && (
              <p className="text-xs text-slate-500 py-6 text-center italic">
                No projects found. Create your first project to get started!
              </p>
            )}
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800/80">
          <div className="flex items-center gap-2 mb-4">
            <ActivityIcon className="w-4 h-4 text-brand-400" />
            <h3 className="text-sm font-semibold text-slate-200">
              Audit Stream & Activity
            </h3>
          </div>

          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
            {recentActivities.map((act) => (
              <div key={act._id} className="flex items-start gap-3 text-xs">
                <Avatar name={act.user?.name} src={act.user?.avatarUrl} size="xs" />
                <div className="min-w-0 flex-1">
                  <p className="text-slate-300 leading-snug">
                    <span className="font-semibold text-slate-100">{act.user?.name}</span>{' '}
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

            {recentActivities.length === 0 && (
              <p className="text-xs text-slate-500 py-6 text-center italic">
                No recent activity logged yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

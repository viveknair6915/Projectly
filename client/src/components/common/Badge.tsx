import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  Flame,
  ArrowUp,
  ArrowRight,
  ArrowDown,
} from 'lucide-react';
import { ProjectStatus, ProjectPriority, TaskStatus, TaskPriority } from '../../types';

interface StatusBadgeProps {
  status: TaskStatus | ProjectStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1 font-medium';

  switch (status) {

    case 'TODO':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-slate-800/80 text-slate-300 border border-slate-700 ${sizeClasses}`}
        >
          <Clock className="w-3 h-3 text-slate-400" />
          <span>To Do</span>
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20 ${sizeClasses}`}
        >
          <PlayCircle className="w-3 h-3 text-sky-400 animate-pulse" />
          <span>In Progress</span>
        </span>
      );
    case 'REVIEW':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 ${sizeClasses}`}
        >
          <AlertCircle className="w-3 h-3 text-amber-400" />
          <span>In Review</span>
        </span>
      );
    case 'DONE':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${sizeClasses}`}
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>Done</span>
        </span>
      );

    case 'PLANNING':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 ${sizeClasses}`}
        >
          <Clock className="w-3 h-3 text-purple-400" />
          <span>Planning</span>
        </span>
      );
    case 'ACTIVE':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Active</span>
        </span>
      );
    case 'ON_HOLD':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 ${sizeClasses}`}
        >
          <PauseCircle className="w-3 h-3 text-amber-400" />
          <span>On Hold</span>
        </span>
      );
    case 'COMPLETED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20 ${sizeClasses}`}
        >
          <CheckCircle2 className="w-3 h-3 text-teal-400" />
          <span>Completed</span>
        </span>
      );
    default:
      return <span className={`rounded-full bg-slate-800 text-slate-300 ${sizeClasses}`}>{status}</span>;
  }
};

interface PriorityBadgeProps {
  priority: TaskPriority | ProjectPriority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1 font-medium';

  switch (priority) {
    case 'URGENT':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-md font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 ${sizeClasses}`}
        >
          <Flame className="w-3 h-3 text-rose-400" />
          <span>Urgent</span>
        </span>
      );
    case 'HIGH':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-md font-medium bg-orange-500/15 text-orange-400 border border-orange-500/25 ${sizeClasses}`}
        >
          <ArrowUp className="w-3 h-3 text-orange-400" />
          <span>High</span>
        </span>
      );
    case 'MEDIUM':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-md font-medium bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 ${sizeClasses}`}
        >
          <ArrowRight className="w-3 h-3 text-yellow-400" />
          <span>Medium</span>
        </span>
      );
    case 'LOW':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-md font-medium bg-slate-800 text-slate-400 border border-slate-700 ${sizeClasses}`}
        >
          <ArrowDown className="w-3 h-3 text-slate-400" />
          <span>Low</span>
        </span>
      );
    default:
      return <span className={`rounded bg-slate-800 text-slate-400 ${sizeClasses}`}>{priority}</span>;
  }
};

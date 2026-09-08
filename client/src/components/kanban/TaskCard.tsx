import React from 'react';
import { Calendar, MessageSquare, AlertCircle } from 'lucide-react';
import { Task } from '../../types';
import { PriorityBadge } from '../common/Badge';
import { Avatar } from '../common/Avatar';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  onDragStart,
}) => {
  const isOverdue =
    task.status !== 'DONE' &&
    task.dueDate &&
    new Date(task.dueDate) < new Date();

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task._id)}
      onClick={onClick}
      className="group relative bg-[#131d33] hover:bg-[#182440] border border-slate-700/60 hover:border-slate-600 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all duration-150 cursor-grab active:cursor-grabbing select-none"
    >

      <div className="flex items-center justify-between gap-2 mb-2">
        <PriorityBadge priority={task.priority} size="sm" />

        {task.dueDate && (
          <div
            className={`flex items-center gap-1 text-[11px] font-medium ${
              isOverdue
                ? 'text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20'
                : 'text-slate-400'
            }`}
          >
            {isOverdue ? (
              <AlertCircle className="w-3 h-3 text-rose-400" />
            ) : (
              <Calendar className="w-3 h-3 text-slate-400" />
            )}
            <span>
              {new Date(task.dueDate).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        )}
      </div>

      <h4 className="text-xs font-semibold text-slate-100 group-hover:text-brand-300 transition-colors line-clamp-2 mb-2.5 leading-snug">
        {task.title}
      </h4>

      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.labels.slice(0, 3).map((lbl, idx) => (
            <span
              key={idx}
              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
            >
              #{lbl}
            </span>
          ))}
          {task.labels.length > 3 && (
            <span className="text-[10px] px-1 py-0.5 text-slate-400">
              +{task.labels.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5">
          {task.assignee ? (
            <div className="flex items-center gap-1.5">
              <Avatar
                name={task.assignee.name}
                src={task.assignee.avatarUrl}
                size="xs"
              />
              <span className="text-[11px] text-slate-400 truncate max-w-[90px]">
                {task.assignee.name.split(' ')[0]}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 italic">Unassigned</span>
          )}
        </div>

        {task.commentsCount !== undefined && task.commentsCount > 0 && (
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <MessageSquare className="w-3 h-3" />
            <span>{task.commentsCount}</span>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Plus, Clock, PlayCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Task, TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
  onDropTask: (taskId: string, targetStatus: TaskStatus) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  title,
  tasks,
  onTaskClick,
  onAddTask,
  onDropTask,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const getColumnHeader = () => {
    switch (status) {
      case 'TODO':
        return {
          icon: <Clock className="w-4 h-4 text-slate-400" />,
          color: 'border-slate-700/60',
          badge: 'bg-slate-800 text-slate-300',
        };
      case 'IN_PROGRESS':
        return {
          icon: <PlayCircle className="w-4 h-4 text-sky-400 animate-pulse" />,
          color: 'border-sky-500/40',
          badge: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
        };
      case 'REVIEW':
        return {
          icon: <AlertCircle className="w-4 h-4 text-amber-400" />,
          color: 'border-amber-500/40',
          badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
        };
      case 'DONE':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
          color: 'border-emerald-500/40',
          badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
        };
    }
  };

  const config = getColumnHeader();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onDropTask(taskId, status);
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col flex-1 min-w-[280px] sm:min-w-[300px] bg-[#0c1322] border rounded-2xl p-3 transition-colors duration-200 ${
        isDragOver
          ? 'border-brand-500 bg-[#121c35] ring-2 ring-brand-500/30'
          : 'border-slate-800/80'
      }`}
    >

      <div className="flex items-center justify-between px-2 py-2 mb-2">
        <div className="flex items-center gap-2">
          {config.icon}
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            {title}
          </h3>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-semibold ${config.badge}`}
          >
            {tasks.length}
          </span>
        </div>

        <button
          onClick={() => onAddTask(status)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={`Add task to ${title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[150px] p-1">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onClick={() => onTaskClick(task)}
            onDragStart={handleDragStart}
          />
        ))}

        {tasks.length === 0 && (
          <div
            className={`h-24 border border-dashed rounded-xl flex items-center justify-center text-xs transition-colors ${
              isDragOver
                ? 'border-brand-500 text-brand-300 bg-brand-500/5'
                : 'border-slate-800 text-slate-400'
            }`}
          >
            <span>{isDragOver ? 'Release to drop here' : 'No tasks in this stage'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

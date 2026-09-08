import React, { useState } from 'react';
import { Task, TaskStatus, ProjectMember } from '../../types';
import { KanbanColumn } from './KanbanColumn';
import { TaskDetailModal } from '../modals/TaskDetailModal';
import { CreateTaskModal } from '../modals/CreateTaskModal';
import { tasksApi } from '../../api';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useToast } from '../common/Toast';

interface KanbanBoardProps {
  tasks: Task[];
  projectId: string;
  members: ProjectMember[];
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  projectId,
  members,
}) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createModalStatus, setCreateModalStatus] = useState<TaskStatus | null>(null);

  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const statusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      tasksApi.updateStatus(taskId, status),
    onMutate: async ({ taskId, status }) => {

      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] });

      const previousTasks = queryClient.getQueryData<Task[]>(['tasks', projectId]);

      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          ['tasks', projectId],
          previousTasks.map((t) =>
            t._id === taskId ? { ...t, status } : t
          )
        );
      }

      return { previousTasks };
    },
    onError: (err, variables, context) => {

      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', projectId], context.previousTasks);
      }
      showToast('Failed to update task position', 'error');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const handleDropTask = (taskId: string, targetStatus: TaskStatus) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === targetStatus) return;

    statusMutation.mutate({ taskId, status: targetStatus });
  };

  const columns: { status: TaskStatus; title: string }[] = [
    { status: 'TODO', title: 'To Do' },
    { status: 'IN_PROGRESS', title: 'In Progress' },
    { status: 'REVIEW', title: 'In Review' },
    { status: 'DONE', title: 'Done' },
  ];

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1">
        {columns.map((col) => (
          <KanbanColumn
            key={col.status}
            status={col.status}
            title={col.title}
            tasks={tasks.filter((t) => t.status === col.status)}
            onTaskClick={(task) => setSelectedTask(task)}
            onAddTask={(status) => setCreateModalStatus(status)}
            onDropTask={handleDropTask}
          />
        ))}
      </div>

      <TaskDetailModal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        members={members}
        projectId={projectId}
      />

      {createModalStatus && (
        <CreateTaskModal
          isOpen={true}
          onClose={() => setCreateModalStatus(null)}
          projectId={projectId}
          defaultStatus={createModalStatus}
          members={members}
        />
      )}
    </>
  );
};

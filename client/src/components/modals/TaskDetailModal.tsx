import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { ConfirmModal } from '../common/ConfirmModal';
import { useToast } from '../common/Toast';
import { useAuth } from '../../context/AuthContext';
import { tasksApi } from '../../api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Task, TaskStatus, TaskPriority, ProjectMember, Comment } from '../../types';
import {
  Calendar,
  Clock,
  Trash2,
  MessageSquare,
  Send,
  User as UserIcon,
  Tag,
  Save,
  CheckCircle2,
} from 'lucide-react';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  members: ProjectMember[];
  projectId: string;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  members,
  projectId,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [labels, setLabels] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setAssigneeId(task.assignee?._id || '');
      setDueDate(
        task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
      );
      setLabels(task.labels?.join(', ') || '');
    }
  }, [task]);

  const { data: comments = [], isLoading: isLoadingComments } = useQuery({
    queryKey: ['comments', task?._id],
    queryFn: () => tasksApi.getComments(task!._id),
    enabled: !!task?._id && isOpen,
  });

  const updateTaskMutation = useMutation({
    mutationFn: (updates: Partial<Task>) => tasksApi.update(task!._id, updates),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      showToast('Task updated successfully', 'success');
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to update task', 'error');
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => tasksApi.addComment(task!._id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', task?._id] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      setCommentText('');
      showToast('Comment posted', 'success');
    },
    onError: () => {
      showToast('Failed to post comment', 'error');
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => tasksApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', task?._id] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      showToast('Comment deleted', 'success');
    },
    onError: () => {
      showToast('Failed to delete comment', 'error');
    },
  });

  const handleDeleteTask = async () => {
    if (!task) return;
    setIsDeletingTask(true);
    try {
      await tasksApi.delete(task._id);
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      showToast('Task deleted successfully', 'success');
      setShowDeleteConfirm(false);
      onClose();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete task', 'error');
    } finally {
      setIsDeletingTask(false);
    }
  };

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    const parsedLabels = labels
      ? labels
          .split(',')
          .map((l) => l.trim())
          .filter(Boolean)
      : [];

    updateTaskMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assignee: assigneeId ? (assigneeId as any) : null,
      dueDate: dueDate ? (dueDate as any) : null,
      labels: parsedLabels,
    });
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addCommentMutation.mutate(commentText.trim());
  };

  if (!task) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Task Overview"
        description="Inspect details, assignees, and collaborate with team members."
        maxWidth="2xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-4">
            <form onSubmit={handleSaveDetails} className="space-y-4">
              <Input
                label="Task Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Task details and deliverables..."
                  className="w-full bg-[#131d33] border border-slate-700/80 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Due Date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
                <Input
                  label="Labels (comma-separated)"
                  value={labels}
                  onChange={(e) => setLabels(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete Task
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                  isLoading={updateTaskMutation.isPending}
                >
                  Save Changes
                </Button>
              </div>
            </form>

            <div className="pt-6 border-t border-slate-800/80 space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-400" />
                <h4 className="text-sm font-semibold text-slate-200">
                  Comments & Discussion ({comments.length})
                </h4>
              </div>

              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {isLoadingComments ? (
                  <p className="text-xs text-slate-500 italic">Loading comments...</p>
                ) : comments.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    No comments yet. Start the conversation below!
                  </p>
                ) : (
                  comments.map((c) => (
                    <div
                      key={c._id}
                      className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <Avatar name={c.author?.name} src={c.author?.avatarUrl} size="xs" />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-200">
                              {c.author?.name}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(c.createdAt).toLocaleDateString()} at{' '}
                              {new Date(c.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {c.content}
                          </p>
                        </div>
                      </div>

                      {user?._id === c.author?._id && (
                        <button
                          onClick={() => deleteCommentMutation.mutate(c._id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors shrink-0"
                          title="Delete Comment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleCommentSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 bg-[#131d33] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="secondary"
                  disabled={!commentText.trim() || addCommentMutation.isPending}
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                >
                  Post
                </Button>
              </form>
            </div>
          </div>

          <div className="space-y-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800/80 h-fit">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Task Properties
            </h4>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-[#131d33] border border-slate-700/80 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-[#131d33] border border-slate-700/80 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Assignee</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full bg-[#131d33] border border-slate-700/80 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user._id} value={m.user._id}>
                    {m.user.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Reporter</span>
              <div className="flex items-center gap-2">
                <Avatar name={task.reporter?.name} src={task.reporter?.avatarUrl} size="xs" />
                <span className="text-xs font-medium text-slate-300">
                  {task.reporter?.name}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p>Created: {new Date(task.createdAt).toLocaleDateString()}</p>
              {task.completedAt && (
                <p className="text-emerald-400">
                  Completed: {new Date(task.completedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"? All task comments and data will be permanently removed.`}
        confirmText="Delete Task"
        isLoading={isDeletingTask}
      />
    </>
  );
};

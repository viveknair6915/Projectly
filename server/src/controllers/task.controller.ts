import { Response } from 'express';
import { z } from 'zod';
import { Task, TaskStatus, TaskPriority } from '../models/Task';
import { Project } from '../models/Project';
import { Comment } from '../models/Comment';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import { logActivity } from '../services/activity.service';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  assignee: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  labels: z.array(z.string()).optional(),
  order: z.number().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assignee: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  labels: z.array(z.string()).optional(),
  order: z.number().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']),
  order: z.number().optional(),
});

export const getProjectTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { status, priority, assignee, search } = req.query;

    const query: any = { project: projectId };

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (priority && priority !== 'ALL') {
      query.priority = priority;
    }

    if (assignee && assignee !== 'ALL') {
      if (assignee === 'UNASSIGNED') {
        query.assignee = { $exists: false };
      } else {
        query.assignee = assignee;
      }
    }

    if (search) {
      const s = String(search).trim();
      query.$and = [
        ...(query.$and || []),
        {
          $or: [
            { title: { $regex: s, $options: 'i' } },
            { description: { $regex: s, $options: 'i' } },
          ],
        },
      ];
    }

    const tasks = await Task.find(query)
      .populate('assignee', 'name email avatarUrl title')
      .populate('reporter', 'name email avatarUrl title')
      .sort({ order: 1, createdAt: -1 });

    sendSuccess(res, { tasks });
  } catch (error) {
    sendError(res, 'Error fetching tasks', 500, error);
  }
};

export const getTaskById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id)
      .populate('assignee', 'name email avatarUrl title')
      .populate('reporter', 'name email avatarUrl title')
      .populate('project', 'name key status');

    if (!task) {
      sendError(res, 'Task not found', 404);
      return;
    }

    const commentsCount = await Comment.countDocuments({ task: task._id });

    sendSuccess(res, { task: { ...task.toObject(), commentsCount } });
  } catch (error) {
    sendError(res, 'Error fetching task', 500, error);
  }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    if (!req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const project = await Project.findById(projectId);
    if (!project) {
      sendError(res, 'Project not found', 404);
      return;
    }

    const { title, description, status, priority, assignee, dueDate, labels, order } = req.body;

    const taskCount = await Task.countDocuments({ project: projectId, status: status || 'TODO' });

    const task = await Task.create({
      title,
      description: description || '',
      project: projectId,
      status: status || 'TODO',
      priority: priority || 'MEDIUM',
      assignee: assignee || undefined,
      reporter: req.user._id,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      labels: labels || [],
      order: order !== undefined ? order : taskCount,
      completedAt: status === 'DONE' ? new Date() : undefined,
    });

    await logActivity({
      projectId,
      taskId: task._id,
      userId: req.user._id,
      action: 'TASK_CREATED',
      message: `${req.user.name} created task "${task.title}"`,
    });

    const populated = await Task.findById(task._id)
      .populate('assignee', 'name email avatarUrl title')
      .populate('reporter', 'name email avatarUrl title');

    sendSuccess(res, { task: populated }, 'Task created successfully', 201);
  } catch (error) {
    sendError(res, 'Error creating task', 500, error);
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const updates = req.body;

    if (updates.dueDate) {
      updates.dueDate = new Date(updates.dueDate);
    } else if (updates.dueDate === null) {
      updates.dueDate = undefined;
    }

    if (updates.assignee === null) {
      updates.assignee = undefined;
    }

    if (updates.status === 'DONE') {
      updates.completedAt = new Date();
    } else if (updates.status && updates.status !== 'DONE') {
      updates.completedAt = undefined;
    }

    const task = await Task.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate('assignee', 'name email avatarUrl title')
      .populate('reporter', 'name email avatarUrl title');

    if (!task) {
      sendError(res, 'Task not found', 404);
      return;
    }

    await logActivity({
      projectId: task.project,
      taskId: task._id,
      userId: req.user._id,
      action: 'TASK_UPDATED',
      message: `${req.user.name} updated task "${task.title}"`,
    });

    sendSuccess(res, { task }, 'Task updated successfully');
  } catch (error) {
    sendError(res, 'Error updating task', 500, error);
  }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, order } = req.body;
    if (!req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const completedAt = status === 'DONE' ? new Date() : undefined;

    const task = await Task.findByIdAndUpdate(
      id,
      {
        $set: {
          status,
          order: order !== undefined ? order : 0,
          completedAt,
        },
      },
      { new: true }
    )
      .populate('assignee', 'name email avatarUrl title')
      .populate('reporter', 'name email avatarUrl title');

    if (!task) {
      sendError(res, 'Task not found', 404);
      return;
    }

    await logActivity({
      projectId: task.project,
      taskId: task._id,
      userId: req.user._id,
      action: 'TASK_STATUS_CHANGED',
      message: `${req.user.name} moved "${task.title}" to ${status}`,
      details: { newStatus: status },
    });

    sendSuccess(res, { task }, 'Task status updated');
  } catch (error) {
    sendError(res, 'Error updating task status', 500, error);
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const task = await Task.findById(id);
    if (!task) {
      sendError(res, 'Task not found', 404);
      return;
    }

    await Comment.deleteMany({ task: task._id });
    await Task.findByIdAndDelete(id);

    await logActivity({
      projectId: task.project,
      userId: req.user._id,
      action: 'TASK_DELETED',
      message: `${req.user.name} deleted task "${task.title}"`,
    });

    sendSuccess(res, { deletedId: id }, 'Task deleted successfully');
  } catch (error) {
    sendError(res, 'Error deleting task', 500, error);
  }
};

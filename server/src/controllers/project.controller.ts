import { Response } from 'express';
import { z } from 'zod';
import mongoose from 'express';
import { Project, IProject } from '../models/Project';
import { Task } from '../models/Task';
import { Comment } from '../models/Comment';
import { Activity } from '../models/Activity';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import { logActivity } from '../services/activity.service';

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters').max(100),
  key: z.string().min(2, 'Project key must be at least 2 characters').max(10).toUpperCase(),
  description: z.string().optional(),
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED']).default('ACTIVE'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  startDate: z.string().optional(),
  deadline: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().optional(),
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  startDate: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  archived: z.boolean().optional(),
});

const enrichProjectsWithStats = async (projects: any[]) => {
  const projectIds = projects.map((p) => p._id);

  const taskCounts = await Task.aggregate([
    { $match: { project: { $in: projectIds } } },
    {
      $group: {
        _id: '$project',
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'DONE'] }, 1, 0] },
        },
        overdue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ['$status', 'DONE'] },
                  { $lt: ['$dueDate', new Date()] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  const statsMap = new Map<string, { total: number; completed: number; overdue: number }>();
  taskCounts.forEach((tc) => {
    statsMap.set(tc._id.toString(), {
      total: tc.total,
      completed: tc.completed,
      overdue: tc.overdue,
    });
  });

  return projects.map((p) => {
    const pObj = p.toObject ? p.toObject() : p;
    const stats = statsMap.get(pObj._id.toString()) || { total: 0, completed: 0, overdue: 0 };
    const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    return {
      ...pObj,
      totalTasks: stats.total,
      completedTasks: stats.completed,
      overdueTasks: stats.overdue,
      progress,
    };
  });
};

export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const { status, priority, search, archived } = req.query;
    const userId = req.user._id;

    const query: any = {
      $or: [{ owner: userId }, { 'members.user': userId }],
    };

    if (archived !== undefined) {
      query.archived = archived === 'true';
    } else {
      query.archived = false;
    }

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (priority && priority !== 'ALL') {
      query.priority = priority;
    }

    if (search) {
      const s = String(search).trim();
      query.$and = [
        ...(query.$and || []),
        {
          $or: [
            { name: { $regex: s, $options: 'i' } },
            { key: { $regex: s, $options: 'i' } },
            { description: { $regex: s, $options: 'i' } },
          ],
        },
      ];
    }

    const projects = await Project.find(query)
      .populate('owner', 'name email avatarUrl title')
      .populate('members.user', 'name email avatarUrl title')
      .sort({ updatedAt: -1 });

    const enriched = await enrichProjectsWithStats(projects);
    sendSuccess(res, { projects: enriched });
  } catch (error) {
    sendError(res, 'Error fetching projects', 500, error);
  }
};

export const getProjectById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id)
      .populate('owner', 'name email avatarUrl title department')
      .populate('members.user', 'name email avatarUrl title department');

    if (!project) {
      sendError(res, 'Project not found', 404);
      return;
    }

    const [enriched] = await enrichProjectsWithStats([project]);
    sendSuccess(res, { project: enriched });
  } catch (error) {
    sendError(res, 'Error fetching project details', 500, error);
  }
};

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const { name, key, description, status, priority, startDate, deadline, tags } = req.body;

    const existingKey = await Project.findOne({ key: key.toUpperCase() });
    if (existingKey) {
      sendError(res, `Project with key "${key.toUpperCase()}" already exists`, 409);
      return;
    }

    const project = await Project.create({
      name,
      key: key.toUpperCase(),
      description: description || '',
      status: status || 'ACTIVE',
      priority: priority || 'MEDIUM',
      startDate: startDate ? new Date(startDate) : undefined,
      deadline: deadline ? new Date(deadline) : undefined,
      tags: tags || [],
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: 'OWNER',
          joinedAt: new Date(),
        },
      ],
    });

    await logActivity({
      projectId: project._id,
      userId: req.user._id,
      action: 'PROJECT_CREATED',
      message: `${req.user.name} created project "${project.name}" (${project.key})`,
    });

    const populated = await Project.findById(project._id)
      .populate('owner', 'name email avatarUrl title')
      .populate('members.user', 'name email avatarUrl title');

    sendSuccess(res, { project: populated }, 'Project created successfully', 201);
  } catch (error) {
    sendError(res, 'Error creating project', 500, error);
  }
};

export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.startDate) updates.startDate = new Date(updates.startDate);
    if (updates.deadline) updates.deadline = new Date(updates.deadline);

    const project = await Project.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate('owner', 'name email avatarUrl title')
      .populate('members.user', 'name email avatarUrl title');

    if (!project) {
      sendError(res, 'Project not found', 404);
      return;
    }

    if (req.user) {
      await logActivity({
        projectId: project._id,
        userId: req.user._id,
        action: 'PROJECT_UPDATED',
        message: `${req.user.name} updated project details`,
        details: updates,
      });
    }

    const [enriched] = await enrichProjectsWithStats([project]);
    sendSuccess(res, { project: enriched }, 'Project updated successfully');
  } catch (error) {
    sendError(res, 'Error updating project', 500, error);
  }
};

export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      sendError(res, 'Project not found', 404);
      return;
    }

    if (req.user && project.owner.toString() !== req.user._id.toString()) {
      sendError(res, 'Only the project owner can delete this project', 403);
      return;
    }

    const tasks = await Task.find({ project: project._id }).select('_id');
    const taskIds = tasks.map((t) => t._id);

    await Comment.deleteMany({ task: { $in: taskIds } });
    await Task.deleteMany({ project: project._id });
    await Activity.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(id);

    sendSuccess(res, { deletedId: id }, 'Project and all associated data deleted successfully');
  } catch (error) {
    sendError(res, 'Error deleting project', 500, error);
  }
};

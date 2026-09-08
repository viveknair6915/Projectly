import { Response } from 'express';
import { Project } from '../models/Project';
import { Task } from '../models/Task';
import { Activity } from '../models/Activity';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';

export const getDashboardStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const userId = req.user._id;

    const userProjects = await Project.find({
      $or: [{ owner: userId }, { 'members.user': userId }],
      archived: false,
    }).select('_id name key status priority deadline createdAt');

    const projectIds = userProjects.map((p) => p._id);

    const totalProjects = userProjects.length;
    const activeProjects = userProjects.filter((p) => p.status === 'ACTIVE').length;
    const completedProjects = userProjects.filter((p) => p.status === 'COMPLETED').length;
    const planningProjects = userProjects.filter((p) => p.status === 'PLANNING').length;

    const tasks = await Task.find({ project: { $in: projectIds } });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'DONE').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const todoTasks = tasks.filter((t) => t.status === 'TODO').length;
    const reviewTasks = tasks.filter((t) => t.status === 'REVIEW').length;

    const now = new Date();
    const overdueTasks = tasks.filter(
      (t) => t.status !== 'DONE' && t.dueDate && new Date(t.dueDate) < now
    ).length;

    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const statusDistribution = [
      { name: 'To Do', count: todoTasks, key: 'TODO', color: '#94a3b8' },
      { name: 'In Progress', count: inProgressTasks, key: 'IN_PROGRESS', color: '#38bdf8' },
      { name: 'Review', count: reviewTasks, key: 'REVIEW', color: '#f59e0b' },
      { name: 'Completed', count: completedTasks, key: 'DONE', color: '#10b981' },
    ];

    const priorityDistribution = [
      {
        name: 'Urgent',
        count: tasks.filter((t) => t.priority === 'URGENT').length,
        color: '#ef4444',
      },
      {
        name: 'High',
        count: tasks.filter((t) => t.priority === 'HIGH').length,
        color: '#f97316',
      },
      {
        name: 'Medium',
        count: tasks.filter((t) => t.priority === 'MEDIUM').length,
        color: '#eab308',
      },
      {
        name: 'Low',
        count: tasks.filter((t) => t.priority === 'LOW').length,
        color: '#64748b',
      },
    ];

    const recentProjects = await Promise.all(
      userProjects.slice(0, 5).map(async (project) => {
        const pTasks = tasks.filter(
          (t) => t.project.toString() === project._id.toString()
        );
        const pTotal = pTasks.length;
        const pDone = pTasks.filter((t) => t.status === 'DONE').length;
        const progress = pTotal > 0 ? Math.round((pDone / pTotal) * 100) : 0;
        return {
          _id: project._id,
          name: project.name,
          key: project.key,
          status: project.status,
          priority: project.priority,
          deadline: project.deadline,
          totalTasks: pTotal,
          completedTasks: pDone,
          progress,
        };
      })
    );

    const myTasks = await Task.find({
      project: { $in: projectIds },
      assignee: userId,
      status: { $ne: 'DONE' },
    })
      .populate('project', 'name key')
      .sort({ dueDate: 1, priority: -1 })
      .limit(6);

    const recentActivities = await Activity.find({
      project: { $in: projectIds },
    })
      .populate('user', 'name avatarUrl title')
      .populate('project', 'name key')
      .sort({ createdAt: -1 })
      .limit(10);

    sendSuccess(res, {
      metrics: {
        totalProjects,
        activeProjects,
        completedProjects,
        planningProjects,
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        reviewTasks,
        overdueTasks,
        completionRate,
      },
      statusDistribution,
      priorityDistribution,
      recentProjects,
      myTasks,
      recentActivities,
    });
  } catch (error) {
    sendError(res, 'Error calculating dashboard statistics', 500, error);
  }
};

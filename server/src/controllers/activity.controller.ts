import { Response } from 'express';
import { Activity } from '../models/Activity';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';

export const getProjectActivities = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { projectId } = req.params;
    const activities = await Activity.find({ project: projectId })
      .populate('user', 'name avatarUrl title')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .limit(30);

    sendSuccess(res, { activities });
  } catch (error) {
    sendError(res, 'Error fetching activities', 500, error);
  }
};

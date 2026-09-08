import mongoose from 'mongoose';
import { Activity, ActivityAction } from '../models/Activity';

interface LogActivityParams {
  projectId: string | mongoose.Types.ObjectId;
  taskId?: string | mongoose.Types.ObjectId;
  userId: string | mongoose.Types.ObjectId;
  action: ActivityAction;
  message: string;
  details?: Record<string, any>;
}

export const logActivity = async (params: LogActivityParams): Promise<void> => {
  try {
    await Activity.create({
      project: params.projectId,
      task: params.taskId,
      user: params.userId,
      action: params.action,
      message: params.message,
      details: params.details || {},
    });
  } catch (error) {
    console.error('[Activity Logger Error]', error);
  }
};

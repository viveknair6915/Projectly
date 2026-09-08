import { Response } from 'express';
import { z } from 'zod';
import { Comment } from '../models/Comment';
import { Task } from '../models/Task';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import { logActivity } from '../services/activity.service';

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(2000),
});

export const getTaskComments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    const comments = await Comment.find({ task: taskId })
      .populate('author', 'name email avatarUrl title department')
      .sort({ createdAt: 1 });

    sendSuccess(res, { comments });
  } catch (error) {
    sendError(res, 'Error fetching comments', 500, error);
  }
};

export const createComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    if (!req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const task = await Task.findById(taskId);
    if (!task) {
      sendError(res, 'Task not found', 404);
      return;
    }

    const { content } = req.body;

    const comment = await Comment.create({
      task: taskId,
      author: req.user._id,
      content,
    });

    await logActivity({
      projectId: task.project,
      taskId: task._id,
      userId: req.user._id,
      action: 'COMMENT_ADDED',
      message: `${req.user.name} commented on "${task.title}"`,
    });

    const populated = await Comment.findById(comment._id).populate(
      'author',
      'name email avatarUrl title department'
    );

    sendSuccess(res, { comment: populated }, 'Comment added successfully', 201);
  } catch (error) {
    sendError(res, 'Error creating comment', 500, error);
  }
};

export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      sendError(res, 'Comment not found', 404);
      return;
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      sendError(res, 'You can only delete your own comments', 403);
      return;
    }

    await Comment.findByIdAndDelete(id);
    sendSuccess(res, { deletedId: id }, 'Comment deleted');
  } catch (error) {
    sendError(res, 'Error deleting comment', 500, error);
  }
};

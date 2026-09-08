import { Router } from 'express';
import {
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  updateTaskSchema,
  updateStatusSchema,
} from '../controllers/task.controller';
import {
  getTaskComments,
  createComment,
  createCommentSchema,
} from '../controllers/comment.controller';
import { protect } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();

router.use(protect);

router.get('/:id', getTaskById);
router.put('/:id', validateBody(updateTaskSchema), updateTask);
router.patch('/:id/status', validateBody(updateStatusSchema), updateTaskStatus);
router.delete('/:id', deleteTask);

router.get('/:taskId/comments', getTaskComments);
router.post('/:taskId/comments', validateBody(createCommentSchema), createComment);

export default router;

import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  createProjectSchema,
  updateProjectSchema,
} from '../controllers/project.controller';
import {
  getProjectMembers,
  addProjectMember,
  updateMemberRole,
  removeProjectMember,
  addMemberSchema,
  updateRoleSchema,
} from '../controllers/member.controller';
import { getProjectActivities } from '../controllers/activity.controller';
import {
  getProjectTasks,
  createTask,
  createTaskSchema,
} from '../controllers/task.controller';
import { protect, requireProjectRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();

router.use(protect);

router.get('/', getProjects);
router.post('/', validateBody(createProjectSchema), createProject);

router.get('/:id', getProjectById);
router.put('/:id', requireProjectRole('ADMIN'), validateBody(updateProjectSchema), updateProject);
router.delete('/:id', requireProjectRole('OWNER'), deleteProject);

router.get('/:projectId/members', requireProjectRole('MEMBER'), getProjectMembers);
router.post(
  '/:projectId/members',
  requireProjectRole('ADMIN'),
  validateBody(addMemberSchema),
  addProjectMember
);
router.put(
  '/:projectId/members/:memberId',
  requireProjectRole('ADMIN'),
  validateBody(updateRoleSchema),
  updateMemberRole
);
router.delete(
  '/:projectId/members/:memberId',
  requireProjectRole('ADMIN'),
  removeProjectMember
);

router.get('/:projectId/tasks', requireProjectRole('MEMBER'), getProjectTasks);
router.post(
  '/:projectId/tasks',
  requireProjectRole('MEMBER'),
  validateBody(createTaskSchema),
  createTask
);

router.get('/:projectId/activities', requireProjectRole('MEMBER'), getProjectActivities);

export default router;

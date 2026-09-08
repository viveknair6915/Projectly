import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  searchUsers,
  registerSchema,
  loginSchema,
  updateProfileSchema,
} from '../controllers/auth.controller';
import { protect } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.get('/me', protect, getMe);
router.put('/profile', protect, validateBody(updateProfileSchema), updateProfile);
router.get('/users', protect, searchUsers);

export default router;

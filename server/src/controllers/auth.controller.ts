import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User';
import { signToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  title: z.string().optional(),
  department: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  title: z.string().optional(),
  department: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, title, department } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      sendError(res, 'User with this email already exists', 409);
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      name
    )}&backgroundColor=7c3aed,6d28d9,4f46e5`;

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      avatarUrl,
      title: title || 'Team Contributor',
      department: department || 'Engineering',
      role: 'MEMBER',
    });

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    sendSuccess(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
          title: user.title,
          department: user.department,
        },
        token,
      },
      'User registered successfully',
      201
    );
  } catch (error) {
    sendError(res, 'Error during user registration', 500, error);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    sendSuccess(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
          title: user.title,
          department: user.department,
        },
        token,
      },
      'Logged in successfully'
    );
  } catch (error) {
    sendError(res, 'Error during user login', 500, error);
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    sendSuccess(res, {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatarUrl: req.user.avatarUrl,
        title: req.user.title,
        department: req.user.department,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    sendError(res, 'Error fetching user profile', 500, error);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    sendSuccess(res, { user }, 'Profile updated successfully');
  } catch (error) {
    sendError(res, 'Error updating profile', 500, error);
  }
};

export const searchUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const q = req.query.q as string;
    if (!q || q.trim().length < 2) {
      sendSuccess(res, { users: [] });
      return;
    }

    const regex = new RegExp(q.trim(), 'i');
    const users = await User.find({
      $or: [{ name: regex }, { email: regex }],
    })
      .select('name email avatarUrl title department')
      .limit(10);

    sendSuccess(res, { users });
  } catch (error) {
    sendError(res, 'Error searching users', 500, error);
  }
};

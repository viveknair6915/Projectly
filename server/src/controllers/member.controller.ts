import { Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { Project } from '../models/Project';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import { logActivity } from '../services/activity.service';

export const addMemberSchema = z.object({
  email: z.string().email().optional(),
  userId: z.string().optional(),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
});

export const updateRoleSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER']),
});

export const getProjectMembers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId).populate(
      'members.user',
      'name email avatarUrl title department role'
    );

    if (!project) {
      sendError(res, 'Project not found', 404);
      return;
    }

    sendSuccess(res, { members: project.members });
  } catch (error) {
    sendError(res, 'Error fetching project members', 500, error);
  }
};

export const addProjectMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { email, userId, role } = req.body;

    if (!req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const project = await Project.findById(projectId);
    if (!project) {
      sendError(res, 'Project not found', 404);
      return;
    }

    let userToAdd: any = null;
    if (userId) {
      userToAdd = await User.findById(userId);
    } else if (email) {
      userToAdd = await User.findOne({ email: email.toLowerCase() });
    }

    if (!userToAdd) {
      sendError(res, 'User not found with the provided email or ID', 404);
      return;
    }

    const isAlreadyMember = project.members.some(
      (m) => m.user.toString() === userToAdd._id.toString()
    );

    if (isAlreadyMember) {
      sendError(res, 'This user is already a member of this project', 409);
      return;
    }

    project.members.push({
      user: userToAdd._id,
      role: role || 'MEMBER',
      joinedAt: new Date(),
    });

    await project.save();

    await logActivity({
      projectId: project._id,
      userId: req.user._id,
      action: 'MEMBER_ADDED',
      message: `${req.user.name} added ${userToAdd.name} to the project as ${role || 'MEMBER'}`,
    });

    const updatedProject = await Project.findById(projectId).populate(
      'members.user',
      'name email avatarUrl title department'
    );

    sendSuccess(
      res,
      { members: updatedProject?.members },
      `${userToAdd.name} added to project`,
      201
    );
  } catch (error) {
    sendError(res, 'Error adding project member', 500, error);
  }
};

export const updateMemberRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId, memberId } = req.params;
    const { role } = req.body;

    if (!req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const project = await Project.findById(projectId);
    if (!project) {
      sendError(res, 'Project not found', 404);
      return;
    }

    const memberIndex = project.members.findIndex(
      (m) => m.user.toString() === memberId
    );

    if (memberIndex === -1) {
      sendError(res, 'Member not found in this project', 404);
      return;
    }

    if (project.members[memberIndex].role === 'OWNER') {
      sendError(res, 'Cannot modify the project owner role', 403);
      return;
    }

    project.members[memberIndex].role = role;
    await project.save();

    const updatedProject = await Project.findById(projectId).populate(
      'members.user',
      'name email avatarUrl title department'
    );

    sendSuccess(res, { members: updatedProject?.members }, 'Role updated successfully');
  } catch (error) {
    sendError(res, 'Error updating member role', 500, error);
  }
};

export const removeProjectMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId, memberId } = req.params;

    if (!req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const project = await Project.findById(projectId);
    if (!project) {
      sendError(res, 'Project not found', 404);
      return;
    }

    if (project.owner.toString() === memberId) {
      sendError(res, 'Cannot remove the project owner', 403);
      return;
    }

    project.members = project.members.filter(
      (m) => m.user.toString() !== memberId
    );

    await project.save();

    await logActivity({
      projectId: project._id,
      userId: req.user._id,
      action: 'MEMBER_REMOVED',
      message: `${req.user.name} removed a member from the project`,
    });

    const updatedProject = await Project.findById(projectId).populate(
      'members.user',
      'name email avatarUrl title department'
    );

    sendSuccess(res, { members: updatedProject?.members }, 'Member removed successfully');
  } catch (error) {
    sendError(res, 'Error removing member', 500, error);
  }
};

import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { User, IUser } from '../models/User';
import { Project, IProject } from '../models/Project';
import { sendError } from '../utils/response';

export interface AuthRequest extends Request {
  user?: IUser;
  project?: IProject;
  projectRole?: 'OWNER' | 'ADMIN' | 'MEMBER';
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      sendError(res, 'Authentication required. Please log in.', 401);
      return;
    }

    const decoded: JwtPayload = verifyToken(token);
    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user) {
      sendError(res, 'The user belonging to this token no longer exists.', 401);
      return;
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      sendError(res, 'Token has expired. Please log in again.', 401);
      return;
    }
    sendError(res, 'Invalid token. Please authenticate.', 401);
  }
};

export const requireProjectRole = (
  minRole: 'OWNER' | 'ADMIN' | 'MEMBER' = 'MEMBER'
) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const projectId = req.params.projectId || req.params.id;
      if (!projectId) {
        sendError(res, 'Project ID parameter is required.', 400);
        return;
      }

      const project = await Project.findById(projectId);
      if (!project) {
        sendError(res, 'Project not found.', 404);
        return;
      }

      if (!req.user) {
        sendError(res, 'Authentication required.', 401);
        return;
      }

      const userIdStr = req.user._id.toString();
      const isOwner = project.owner.toString() === userIdStr;

      let userRole: 'OWNER' | 'ADMIN' | 'MEMBER' | null = null;
      if (isOwner) {
        userRole = 'OWNER';
      } else {
        const member = project.members.find(
          (m) => m.user.toString() === userIdStr
        );
        if (member) {
          userRole = member.role;
        }
      }

      if (!userRole) {
        sendError(
          res,
          'You do not have access to this project.',
          403
        );
        return;
      }

      const roleHierarchy = {
        OWNER: 3,
        ADMIN: 2,
        MEMBER: 1,
      };

      if (roleHierarchy[userRole] < roleHierarchy[minRole]) {
        sendError(
          res,
          `Permission denied. Requires at least ${minRole} privileges.`,
          403
        );
        return;
      }

      req.project = project;
      req.projectRole = userRole;
      next();
    } catch (error) {
      sendError(res, 'Error verifying project permissions', 500, error);
    }
  };
};

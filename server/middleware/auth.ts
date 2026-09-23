import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { queryOne } from '../db/database.js';
import { sendError } from '../utils/response.js';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'WARDEN' | 'STUDENT';
  status?: string;
  avatar?: string;
  studentId?: string;
  studentRecordId?: string;
  wardenRecordId?: string;
  hostelId?: string;
  blockId?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return sendError(res, 'Authentication token missing. Please sign in.', null, 401);
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; email: string; role: string };
    const user = await queryOne(
      'SELECT id, email, name, role, status, avatar FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!user) {
      return sendError(res, 'User session is invalid or user no longer exists.', null, 401);
    }

    const userStatus = (user.status || 'active').toLowerCase();
    if (userStatus === 'inactive' || userStatus === 'suspended' || userStatus === 'disabled') {
      return sendError(res, 'Account is disabled', null, 403);
    }

    const normalizedRole = (user.role || 'STUDENT').toUpperCase() as 'ADMIN' | 'WARDEN' | 'STUDENT';

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: normalizedRole,
      status: userStatus,
      avatar: user.avatar
    };

    // If Warden, fetch warden-specific record details
    if (normalizedRole === 'WARDEN') {
      const warden = await queryOne(
        'SELECT id, warden_id, hostel_id, block_id FROM wardens WHERE user_id = ?',
        [user.id]
      );
      if (warden) {
        authUser.wardenRecordId = warden.id;
        authUser.hostelId = warden.hostel_id;
        authUser.blockId = warden.block_id;
      }
    }

    // If Student, fetch student record details
    if (normalizedRole === 'STUDENT') {
      const student = await queryOne(
        'SELECT id, student_id, hostel_id FROM students WHERE user_id = ?',
        [user.id]
      );
      if (student) {
        authUser.studentRecordId = student.id;
        authUser.studentId = student.student_id;
        authUser.hostelId = student.hostel_id;
      }
    }

    req.user = authUser;
    next();
  } catch (err: any) {
    return sendError(res, 'Session has expired or token is invalid. Please log in again.', err.message, 401);
  }
}

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized access. Please authenticate.', null, 401);
    }

    const userRole = (req.user.role || '').toUpperCase();
    const upperAllowed = allowedRoles.map((r) => r.toUpperCase());

    if (!upperAllowed.includes(userRole)) {
      return sendError(
        res,
        `Access denied. Your role (${req.user.role}) is not authorized to access this resource.`,
        null,
        403
      );
    }

    next();
  };
}

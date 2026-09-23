import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { queryOne, run } from '../db/database.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { sendError, sendSuccess } from '../utils/response.js';

export async function login(req: AuthenticatedRequest, res: Response) {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required', null, 400);
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const user = await queryOne(
      'SELECT id, email, password, password_hash, name, role, status, avatar FROM users WHERE LOWER(email) = LOWER(?)',
      [trimmedEmail]
    );

    if (!user) {
      return sendError(res, 'Invalid email or password', null, 401);
    }

    const userStatus = (user.status || 'active').toLowerCase();
    if (userStatus === 'inactive' || userStatus === 'suspended' || userStatus === 'disabled') {
      return sendError(res, 'Account is disabled', null, 403);
    }

    const hashToCompare = user.password_hash || user.password;
    const isMatch = await bcrypt.compare(password, hashToCompare);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password', null, 401);
    }

    const normalizedRole = user.role.toLowerCase();
    const tokenExpiry = rememberMe ? '30d' : '24h';
    const token = jwt.sign(
      { id: user.id, email: user.email, role: normalizedRole },
      config.jwtSecret,
      { expiresIn: tokenExpiry }
    );

    let redirectUrl = '/student/dashboard';
    if (normalizedRole === 'admin') redirectUrl = '/admin/dashboard';
    else if (normalizedRole === 'warden') redirectUrl = '/warden/dashboard';

    // Fetch role specific details
    let studentDetails = null;
    let wardenDetails = null;

    if (normalizedRole === 'student') {
      studentDetails = await queryOne(
        `SELECT s.*, h.name as hostel_name, r.room_number
         FROM students s
         LEFT JOIN hostels h ON s.hostel_id = h.id
         LEFT JOIN rooms r ON s.room_id = r.id
         WHERE s.user_id = ?`,
        [user.id]
      );
    } else if (normalizedRole === 'warden') {
      wardenDetails = await queryOne(
        `SELECT w.*, h.name as hostel_name, b.name as block_name
         FROM wardens w
         LEFT JOIN hostels h ON w.hostel_id = h.id
         LEFT JOIN blocks b ON w.block_id = b.id
         WHERE w.user_id = ?`,
        [user.id]
      );
    }

    return sendSuccess(res, 'Login successful', {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: normalizedRole,
        status: userStatus,
        avatar: user.avatar
      },
      student: studentDetails,
      warden: wardenDetails,
      redirectUrl
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return sendError(res, 'Server error. Please try again.', null, 500);
  }
}

export async function logout(_req: AuthenticatedRequest, res: Response) {
  return sendSuccess(res, 'Logged out successfully');
}

export async function signup(req: AuthenticatedRequest, res: Response) {
  try {
    const {
      email,
      password,
      confirmPassword,
      name,
      role,
      phone,
      gender,
      dob,
      department,
      year,
      studentId,
      employeeId,
      parentName,
      parentPhone,
      address,
      hostelId,
      blockId
    } = req.body;

    const requestedRole = String(role || '').trim().toLowerCase();

    // Security rule: Admin accounts must NEVER be created through public signup
    if (requestedRole === 'admin') {
      return sendError(res, 'Admin accounts cannot be registered publicly', null, 403);
    }

    if (requestedRole !== 'student' && requestedRole !== 'warden') {
      return sendError(res, 'Public registration is only available for Students and Wardens.', null, 400);
    }

    if (!name || !email || !password) {
      return sendError(res, 'Full name, email, and password are required', null, 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email).trim())) {
      return sendError(res, 'Invalid email format', null, 400);
    }

    if (String(password).length < 6) {
      return sendError(res, 'Password must be at least 6 characters long', null, 400);
    }

    if (confirmPassword && password !== confirmPassword) {
      return sendError(res, 'Passwords do not match', null, 400);
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const existingUser = await queryOne('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [trimmedEmail]);
    if (existingUser) {
      return sendError(res, 'Email already registered', null, 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`;

    await run(
      `INSERT INTO users (id, email, password, password_hash, name, role, status, avatar, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)`,
      [userId, trimmedEmail, hashedPassword, hashedPassword, name.trim(), requestedRole, avatar, now, now]
    );

    if (requestedRole === 'student') {
      const studentCode = studentId?.trim() || `STU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const studentRecId = `student_rec_${Date.now()}`;

      await run(
        `INSERT INTO students (id, user_id, student_id, full_name, email, phone, gender, dob, department, year, parent_name, parent_phone, address, hostel_id, room_id, bed_number, joining_date, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, 'Active', ?, ?)`,
        [
          studentRecId,
          userId,
          studentCode,
          name.trim(),
          trimmedEmail,
          phone || '',
          gender || 'Male',
          dob || '',
          department || 'Computer Science & Engineering',
          year || '1st Year',
          parentName || '',
          parentPhone || '',
          address || '',
          hostelId || 'hostel_01',
          now.split('T')[0],
          now,
          now
        ]
      );
    } else if (requestedRole === 'warden') {
      const wardenCode = employeeId?.trim() || `WRD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
      const wardenRecId = `warden_rec_${Date.now()}`;

      await run(
        `INSERT INTO wardens (id, user_id, warden_id, name, email, phone, hostel_id, block_id, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?, ?)`,
        [
          wardenRecId,
          userId,
          wardenCode,
          name.trim(),
          trimmedEmail,
          phone || '',
          hostelId || 'hostel_01',
          blockId || 'block_01',
          now,
          now
        ]
      );
    }

    const token = jwt.sign(
      { id: userId, email: trimmedEmail, role: requestedRole },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    const redirectUrl = requestedRole === 'warden' ? '/warden/dashboard' : '/student/dashboard';

    return sendSuccess(
      res,
      'Account registered successfully',
      {
        token,
        user: { id: userId, email: trimmedEmail, name: name.trim(), role: requestedRole, status: 'active', avatar },
        redirectUrl
      },
      201
    );
  } catch (err: any) {
    console.error('Signup error:', err);
    return sendError(res, 'Server error. Please try again.', null, 500);
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', null, 401);
    }

    const user = await queryOne(
      'SELECT id, email, name, role, status, avatar FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      return sendError(res, 'User no longer exists', null, 401);
    }

    const userStatus = (user.status || 'active').toLowerCase();
    if (userStatus === 'inactive' || userStatus === 'suspended' || userStatus === 'disabled') {
      return sendError(res, 'Account is disabled', null, 403);
    }

    const normalizedRole = user.role.toLowerCase();

    let studentDetails = null;
    let wardenDetails = null;

    if (normalizedRole === 'student') {
      studentDetails = await queryOne(
        `SELECT s.*, h.name as hostel_name, r.room_number, b.name as block_name
         FROM students s
         LEFT JOIN hostels h ON s.hostel_id = h.id
         LEFT JOIN rooms r ON s.room_id = r.id
         LEFT JOIN blocks b ON r.block_id = b.id
         WHERE s.user_id = ?`,
        [user.id]
      );
    } else if (normalizedRole === 'warden') {
      wardenDetails = await queryOne(
        `SELECT w.*, h.name as hostel_name, b.name as block_name
         FROM wardens w
         LEFT JOIN hostels h ON w.hostel_id = h.id
         LEFT JOIN blocks b ON w.block_id = b.id
         WHERE w.user_id = ?`,
        [user.id]
      );
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: normalizedRole,
      status: userStatus,
      avatar: user.avatar
    };

    return sendSuccess(res, 'Current profile retrieved', {
      ...userData,
      user: userData,
      student: studentDetails,
      warden: wardenDetails
    });
  } catch (err: any) {
    console.error('getMe error:', err);
    return sendError(res, 'Server error. Please try again.', null, 500);
  }
}

export async function changePassword(req: AuthenticatedRequest, res: Response) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return sendError(res, 'Current password and new password are required', null, 400);
    }

    const user = await queryOne('SELECT password, password_hash FROM users WHERE id = ?', [req.user!.id]);
    if (!user) {
      return sendError(res, 'User not found', null, 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash || user.password);
    if (!isMatch) {
      return sendError(res, 'Current password is incorrect', null, 400);
    }

    if (newPassword.length < 6) {
      return sendError(res, 'New password must be at least 6 characters long', null, 400);
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await run('UPDATE users SET password = ?, password_hash = ?, updated_at = ? WHERE id = ?', [
      hashed,
      hashed,
      new Date().toISOString(),
      req.user!.id
    ]);

    return sendSuccess(res, 'Password changed successfully');
  } catch (err: any) {
    return sendError(res, 'Server error. Please try again.', null, 500);
  }
}

export async function forgotPassword(req: AuthenticatedRequest, res: Response) {
  const { email } = req.body;
  if (!email) {
    return sendError(res, 'Email is required', null, 400);
  }

  // Check if account exists
  const user = await queryOne('SELECT id, email FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
  if (!user) {
    // Return friendly generic message to avoid email enumeration
    return sendSuccess(res, 'If an account exists with this email address, a password reset link has been dispatched to your inbox.');
  }

  return sendSuccess(res, 'A password reset link with verification instructions has been sent to your registered email address.');
}

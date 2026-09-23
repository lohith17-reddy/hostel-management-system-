import { Response } from 'express';
import { query, queryOne, run } from '../db/database.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { sendError, sendSuccess } from '../utils/response.js';

export async function getVisitors(req: AuthenticatedRequest, res: Response) {
  try {
    const { status, hostelId, search } = req.query;

    let sql = `
      SELECT v.*, h.name as hostel_name
      FROM visitors v
      LEFT JOIN hostels h ON v.hostel_id = h.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (req.user?.role === 'WARDEN' && req.user.hostelId && !hostelId) {
      sql += ` AND v.hostel_id = ?`;
      params.push(req.user.hostelId);
    } else if (hostelId) {
      sql += ` AND v.hostel_id = ?`;
      params.push(hostelId);
    }

    if (status) {
      sql += ` AND v.status = ?`;
      params.push(status);
    }
    if (search) {
      sql += ` AND (v.visitor_name LIKE ? OR v.student_name LIKE ? OR v.phone LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY v.created_at DESC`;
    const visitors = await query(sql, params);

    return sendSuccess(res, 'Visitor records retrieved', visitors);
  } catch (err: any) {
    return sendError(res, 'Failed to fetch visitors', err, 500);
  }
}

export async function createVisitor(req: AuthenticatedRequest, res: Response) {
  try {
    const {
      visitorName,
      studentId,
      studentName,
      phone,
      purpose,
      idProofType,
      idProofNumber,
      hostelId
    } = req.body;

    if (!visitorName || !studentName || !phone || !purpose || !idProofType) {
      return sendError(res, 'Visitor name, student name, phone, purpose, and ID proof type are required', null, 400);
    }

    const now = new Date();
    const entryTime = now.toISOString().replace('T', ' ').substring(0, 16);
    const id = `vis_${Date.now()}`;

    await run(`
      INSERT INTO visitors (id, visitor_name, student_id, student_name, phone, purpose, entry_time, exit_time, id_proof_type, id_proof_number, status, hostel_id, warden_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, 'Inside', ?, ?, ?)
    `, [
      id,
      visitorName,
      studentId || null,
      studentName,
      phone,
      purpose,
      entryTime,
      idProofType,
      idProofNumber || '',
      hostelId || req.user?.hostelId || 'hostel_01',
      req.user?.id || 'warden',
      now.toISOString()
    ]);

    // Send notification to student if studentId is present
    if (studentId) {
      const studentUser = await queryOne('SELECT user_id FROM students WHERE id = ?', [studentId]);
      if (studentUser) {
        await run(`
          INSERT INTO notifications (id, user_id, role, title, message, type, link, created_at)
          VALUES (?, ?, 'STUDENT', 'Visitor Checked-In', ?, 'visitor', '/student/dashboard', ?)
        `, [
          `notif_${Date.now()}`,
          studentUser.user_id,
          `${visitorName} has checked in at the hostel reception.`,
          now.toISOString()
        ]);
      }
    }

    return sendSuccess(res, 'Visitor logged in successfully', { id }, 201);
  } catch (err: any) {
    return sendError(res, 'Failed to log visitor', err, 500);
  }
}

export async function markVisitorExit(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const now = new Date();
    const exitTime = now.toISOString().replace('T', ' ').substring(0, 16);

    await run(`
      UPDATE visitors
      SET exit_time = ?,
          status = 'Departed'
      WHERE id = ?
    `, [exitTime, id]);

    return sendSuccess(res, 'Visitor departure logged successfully');
  } catch (err: any) {
    return sendError(res, 'Failed to update visitor departure', err, 500);
  }
}

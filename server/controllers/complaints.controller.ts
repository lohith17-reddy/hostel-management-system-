import { Response } from 'express';
import { query, queryOne, run } from '../db/database.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { sendError, sendSuccess } from '../utils/response.js';

export async function getComplaints(req: AuthenticatedRequest, res: Response) {
  try {
    const { category, priority, status, search } = req.query;

    let sql = `
      SELECT
        c.*,
        s.full_name as student_name,
        s.student_id as student_roll,
        s.phone as student_phone,
        h.name as hostel_name,
        r.room_number,
        b.name as block_name
      FROM complaints c
      JOIN students s ON c.student_id = s.id
      LEFT JOIN hostels h ON s.hostel_id = h.id
      LEFT JOIN rooms r ON s.room_id = r.id
      LEFT JOIN blocks b ON r.block_id = b.id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Students only see their own complaints
    if (req.user?.role === 'STUDENT') {
      sql += ` AND s.user_id = ?`;
      params.push(req.user.id);
    } else if (req.user?.role === 'WARDEN' && req.user.hostelId) {
      sql += ` AND s.hostel_id = ?`;
      params.push(req.user.hostelId);
    }

    if (category) {
      sql += ` AND c.category = ?`;
      params.push(category);
    }
    if (priority) {
      sql += ` AND c.priority = ?`;
      params.push(priority);
    }
    if (status) {
      sql += ` AND c.status = ?`;
      params.push(status);
    }
    if (search) {
      sql += ` AND (c.title LIKE ? OR c.description LIKE ? OR c.complaint_id LIKE ? OR s.full_name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY c.created_at DESC`;
    const complaints = await query(sql, params);

    return sendSuccess(res, 'Complaints retrieved successfully', complaints);
  } catch (err: any) {
    return sendError(res, 'Failed to fetch complaints', err, 500);
  }
}

export async function createComplaint(req: AuthenticatedRequest, res: Response) {
  try {
    const { category, title, description, priority } = req.body;

    if (!category || !title || !description) {
      return sendError(res, 'Category, title, and description are required', null, 400);
    }

    // Identify student
    let studentId = '';
    if (req.user?.role === 'STUDENT') {
      const student = await queryOne('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
      if (!student) return sendError(res, 'Student record not found', null, 404);
      studentId = student.id;
    } else {
      studentId = req.body.studentId;
      if (!studentId) return sendError(res, 'Student ID is required', null, 400);
    }

    const complaintSeq = Math.floor(1000 + Math.random() * 9000);
    const complaintCode = `CMP-${complaintSeq}`;
    const id = `cmp_${Date.now()}`;
    const now = new Date().toISOString();

    await run(
      `INSERT INTO complaints (id, complaint_id, student_id, category, title, description, priority, status, assigned_warden, resolution_notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', NULL, '', ?, ?)`,
      [id, complaintCode, studentId, category, title, description, priority || 'Medium', now, now]
    );

    // Notify wardens/admins
    await run(
      `INSERT INTO notifications (id, user_id, role, title, message, type, link, created_at)
       VALUES (?, NULL, 'WARDEN', 'New Complaint Logged', ?, 'complaint', '/warden/complaints', ?)`,
      [`notif_${Date.now()}`, `Complaint ${complaintCode} (${category}) submitted: "${title}"`, now]
    );

    return sendSuccess(res, 'Complaint submitted successfully', { id, complaintId: complaintCode }, 201);
  } catch (err: any) {
    return sendError(res, 'Failed to create complaint', err, 500);
  }
}

export async function updateComplaint(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status, assignedWarden, resolutionNotes, priority } = req.body;

    const complaint = await queryOne('SELECT * FROM complaints WHERE id = ?', [id]);
    if (!complaint) {
      return sendError(res, 'Complaint not found', null, 404);
    }

    const now = new Date().toISOString();
    await run(`
      UPDATE complaints
      SET status = COALESCE(?, status),
          assigned_warden = COALESCE(?, assigned_warden),
          resolution_notes = COALESCE(?, resolution_notes),
          priority = COALESCE(?, priority),
          updated_at = ?
      WHERE id = ?
    `, [status, assignedWarden, resolutionNotes, priority, now, id]);

    // If status updated, notify student
    if (status && status !== complaint.status) {
      const studentUser = await queryOne('SELECT user_id FROM students WHERE id = ?', [complaint.student_id]);
      if (studentUser) {
        await run(
          `INSERT INTO notifications (id, user_id, role, title, message, type, link, created_at)
           VALUES (?, ?, 'STUDENT', 'Complaint Status Updated', ?, 'complaint', '/student/complaints', ?)`,
          [
            `notif_${Date.now()}`,
            studentUser.user_id,
            `Your complaint ${complaint.complaint_id} status changed to "${status}".`,
            now
          ]
        );
      }
    }

    return sendSuccess(res, 'Complaint updated successfully');
  } catch (err: any) {
    return sendError(res, 'Failed to update complaint', err, 500);
  }
}

import { Response } from 'express';
import { query, queryOne, run } from '../db/database.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { sendError, sendSuccess } from '../utils/response.js';

export async function getAttendance(req: AuthenticatedRequest, res: Response) {
  try {
    const { date, hostelId, studentId, month } = req.query;

    let sql = `
      SELECT
        a.*,
        s.full_name as student_name,
        s.student_id as student_roll,
        s.department,
        s.year,
        r.room_number,
        h.name as hostel_name
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      LEFT JOIN rooms r ON s.room_id = r.id
      LEFT JOIN hostels h ON a.hostel_id = h.id
      WHERE 1=1
    `;
    const params: any[] = [];

    // If Student role, only allow access to their own attendance!
    if (req.user?.role === 'STUDENT') {
      sql += ` AND s.user_id = ?`;
      params.push(req.user.id);
    } else if (studentId) {
      sql += ` AND a.student_id = ?`;
      params.push(studentId);
    }

    if (date) {
      sql += ` AND a.date = ?`;
      params.push(date);
    }

    if (month) {
      sql += ` AND strftime('%Y-%m', a.date) = ?`;
      params.push(month);
    }

    if (req.user?.role === 'WARDEN' && req.user.hostelId && !hostelId) {
      sql += ` AND a.hostel_id = ?`;
      params.push(req.user.hostelId);
    } else if (hostelId) {
      sql += ` AND a.hostel_id = ?`;
      params.push(hostelId);
    }

    sql += ` ORDER BY a.date DESC, s.full_name ASC`;
    const records = await query(sql, params);

    return sendSuccess(res, 'Attendance records retrieved', records);
  } catch (err: any) {
    return sendError(res, 'Failed to fetch attendance records', err, 500);
  }
}

export async function markAttendance(req: AuthenticatedRequest, res: Response) {
  try {
    const { date, records } = req.body; // records: [{ studentId, hostelId, status, remarks }]
    if (!date || !Array.isArray(records) || records.length === 0) {
      return sendError(res, 'Date and student attendance records array are required', null, 400);
    }

    const now = new Date().toISOString();
    const markedBy = req.user?.name || 'Warden';

    for (const item of records) {
      const { studentId, hostelId, status, remarks } = item;
      if (!studentId || !status) continue;

      const existing = await queryOne(
        'SELECT id FROM attendance WHERE student_id = ? AND date = ?',
        [studentId, date]
      );

      if (existing) {
        await run(
          `UPDATE attendance SET status = ?, marked_by = ?, remarks = ? WHERE id = ?`,
          [status, markedBy, remarks || '', existing.id]
        );
      } else {
        const id = `att_${studentId}_${date}_${Date.now()}`;
        await run(
          `INSERT INTO attendance (id, student_id, hostel_id, date, status, marked_by, remarks, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, studentId, hostelId || 'hostel_01', date, status, markedBy, remarks || '', now]
        );
      }
    }

    return sendSuccess(res, `Attendance marked successfully for ${records.length} students on ${date}`);
  } catch (err: any) {
    return sendError(res, 'Failed to mark attendance', err, 500);
  }
}

export async function getAttendanceStats(req: AuthenticatedRequest, res: Response) {
  try {
    const { studentId, hostelId } = req.query;

    let targetStudentId = studentId as string;
    if (req.user?.role === 'STUDENT') {
      const student = await queryOne('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
      if (student) targetStudentId = student.id;
    }

    if (targetStudentId) {
      // Individual student breakdown
      const counts = await query(`
        SELECT status, COUNT(*) as count
        FROM attendance
        WHERE student_id = ?
        GROUP BY status
      `, [targetStudentId]);

      const monthlyHistory = await query(`
        SELECT
          strftime('%Y-%m', date) as month,
          COUNT(*) as total,
          SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present,
          SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent
        FROM attendance
        WHERE student_id = ?
        GROUP BY strftime('%Y-%m', date)
        ORDER BY month DESC
        LIMIT 6
      `, [targetStudentId]);

      return sendSuccess(res, 'Student attendance statistics retrieved', {
        breakdown: counts,
        monthlyHistory
      });
    }

    // General or hostel level overview
    let summarySql = `
      SELECT
        status,
        COUNT(*) as count
      FROM attendance
      WHERE date >= date('now', '-30 days')
    `;
    const params: any[] = [];
    if (hostelId) {
      summarySql += ` AND hostel_id = ?`;
      params.push(hostelId);
    }
    summarySql += ` GROUP BY status`;

    const summary = await query(summarySql, params);
    return sendSuccess(res, 'Attendance summary retrieved', summary);
  } catch (err: any) {
    return sendError(res, 'Failed to fetch attendance stats', err, 500);
  }
}

import { Response } from 'express';
import { query, queryOne, run } from '../db/database.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { sendError, sendSuccess } from '../utils/response.js';

export async function getStudentDashboard(req: AuthenticatedRequest, res: Response) {
  try {
    const student = await queryOne(`
      SELECT
        s.*,
        h.name as hostel_name,
        h.contact_phone as hostel_contact,
        b.name as block_name,
        r.room_number,
        r.floor,
        r.room_type,
        r.capacity
      FROM students s
      LEFT JOIN hostels h ON s.hostel_id = h.id
      LEFT JOIN rooms r ON s.room_id = r.id
      LEFT JOIN blocks b ON r.block_id = b.id
      WHERE s.user_id = ?
    `, [req.user?.id]);

    if (!student) {
      return sendError(res, 'Student profile not found', null, 404);
    }

    // Roommates in the same room
    let roommates: any[] = [];
    if (student.room_id) {
      roommates = await query(`
        SELECT full_name, bed_number, department, year, phone
        FROM students
        WHERE room_id = ? AND id != ?
      `, [student.room_id, student.id]);
    }

    // Attendance stats
    const totalAttendance = (await queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM attendance WHERE student_id = ?',
      [student.id]
    ))?.count || 0;

    const presentCount = (await queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM attendance WHERE student_id = ? AND status = "Present"',
      [student.id]
    ))?.count || 0;

    const attendancePercentage = totalAttendance > 0 ? Number(((presentCount / totalAttendance) * 100).toFixed(1)) : 100;

    // Complaints count
    const pendingComplaints = (await queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM complaints WHERE student_id = ? AND status = "Pending"',
      [student.id]
    ))?.count || 0;

    // Latest leave request
    const latestLeave = await queryOne(
      'SELECT * FROM leave_requests WHERE student_id = ? ORDER BY created_at DESC LIMIT 1',
      [student.id]
    );

    // Fee summary
    const feeSummary = await queryOne<{ total: number; paid: number; pending: number }>(`
      SELECT
        COALESCE(SUM(amount), 0) as total,
        COALESCE(SUM(paid_amount), 0) as paid,
        COALESCE(SUM(pending_amount), 0) as pending
      FROM fees
      WHERE student_id = ?
    `, [student.id]);

    // Active Announcements
    const announcements = await query(`
      SELECT * FROM announcements
      WHERE audience = 'All Students' OR target_hostel_id = ?
      ORDER BY created_at DESC
      LIMIT 4
    `, [student.hostel_id]);

    // Today's meal menu
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[new Date().getDay()];
    const todayMenu = await query(
      'SELECT * FROM food_menus WHERE day_of_week = ? ORDER BY meal_type',
      [currentDay]
    );

    return sendSuccess(res, 'Student dashboard retrieved', {
      student,
      room: {
        hostelName: student.hostel_name,
        blockName: student.block_name,
        roomNumber: student.room_number,
        floor: student.floor,
        roomType: student.room_type,
        bedNumber: student.bed_number,
        roommates
      },
      cards: {
        roomNumber: student.room_number ? `${student.room_number} (Bed ${student.bed_number})` : 'Unassigned',
        attendancePercentage,
        presentDays: presentCount,
        totalDays: totalAttendance,
        pendingComplaints,
        leaveStatus: latestLeave ? latestLeave.status : 'None',
        feeStatus: feeSummary && feeSummary.pending > 0 ? `Due: $${feeSummary.pending}` : 'All Cleared',
        announcementsCount: announcements.length
      },
      latestLeave,
      feeSummary,
      announcements,
      todayMenu
    });
  } catch (err: any) {
    return sendError(res, 'Failed to fetch student dashboard', err, 500);
  }
}

export async function updateStudentProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const { phone, parentName, parentPhone, address } = req.body;

    // Strict Rule: Students must NOT be able to change studentId, room allocation, fee status, role, or hostel assignment!
    const student = await queryOne('SELECT id FROM students WHERE user_id = ?', [req.user?.id]);
    if (!student) {
      return sendError(res, 'Student profile not found', null, 404);
    }

    const now = new Date().toISOString();
    await run(`
      UPDATE students
      SET phone = COALESCE(?, phone),
          parent_name = COALESCE(?, parent_name),
          parent_phone = COALESCE(?, parent_phone),
          address = COALESCE(?, address),
          updated_at = ?
      WHERE id = ?
    `, [phone, parentName, parentPhone, address, now, student.id]);

    return sendSuccess(res, 'Profile updated successfully');
  } catch (err: any) {
    return sendError(res, 'Failed to update profile', err, 500);
  }
}

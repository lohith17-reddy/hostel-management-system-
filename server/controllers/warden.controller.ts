import { Response } from 'express';
import { query, queryOne } from '../db/database.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { sendError, sendSuccess } from '../utils/response.js';

export async function getWardenDashboard(req: AuthenticatedRequest, res: Response) {
  try {
    const wardenId = req.user?.wardenRecordId;
    const warden = await queryOne('SELECT * FROM wardens WHERE user_id = ? OR id = ?', [req.user?.id, wardenId]);

    const hostelId = warden?.hostel_id || req.user?.hostelId;
    const blockId = warden?.block_id || req.user?.blockId;

    const todayStr = new Date().toISOString().split('T')[0];

    // Total Students under warden's hostel
    let studentsSql = `SELECT COUNT(*) as count FROM students WHERE 1=1`;
    const sParams: any[] = [];
    if (hostelId) {
      studentsSql += ` AND hostel_id = ?`;
      sParams.push(hostelId);
    }
    const totalStudents = (await queryOne<{ count: number }>(studentsSql, sParams))?.count || 0;

    // Today's attendance for these students
    let presentSql = `
      SELECT COUNT(*) as count
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE a.date = ? AND a.status = 'Present'
    `;
    const attParams: any[] = [todayStr];
    if (hostelId) {
      presentSql += ` AND s.hostel_id = ?`;
      attParams.push(hostelId);
    }
    const presentStudents = (await queryOne<{ count: number }>(presentSql, attParams))?.count || 0;

    let absentSql = `
      SELECT COUNT(*) as count
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE a.date = ? AND a.status = 'Absent'
    `;
    const absentStudents = (await queryOne<{ count: number }>(absentSql, attParams))?.count || 0;

    // Rooms under hostel
    let roomsSql = `SELECT COUNT(*) as total_rooms, SUM(occupied_beds) as occupied, SUM(available_beds) as available FROM rooms WHERE 1=1`;
    const rParams: any[] = [];
    if (hostelId) {
      roomsSql += ` AND hostel_id = ?`;
      rParams.push(hostelId);
    }
    const roomStats = await queryOne<{ total_rooms: number; occupied: number; available: number }>(roomsSql, rParams);

    // Pending complaints in hostel
    let complaintsSql = `
      SELECT COUNT(*) as count
      FROM complaints c
      JOIN students s ON c.student_id = s.id
      WHERE c.status = 'Pending'
    `;
    const cParams: any[] = [];
    if (hostelId) {
      complaintsSql += ` AND s.hostel_id = ?`;
      cParams.push(hostelId);
    }
    const pendingComplaints = (await queryOne<{ count: number }>(complaintsSql, cParams))?.count || 0;

    // Pending leave requests
    let leaveSql = `
      SELECT COUNT(*) as count
      FROM leave_requests l
      JOIN students s ON l.student_id = s.id
      WHERE l.status = 'Pending'
    `;
    const lParams: any[] = [];
    if (hostelId) {
      leaveSql += ` AND s.hostel_id = ?`;
      lParams.push(hostelId);
    }
    const pendingLeave = (await queryOne<{ count: number }>(leaveSql, lParams))?.count || 0;

    // Announcements
    const announcementsCount = (await queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM announcements WHERE audience = "All Students" OR target_hostel_id = ?',
      [hostelId || 'hostel_01']
    ))?.count || 0;

    // Current active visitors
    const activeVisitors = (await queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM visitors WHERE status = "Inside" AND hostel_id = ?',
      [hostelId || 'hostel_01']
    ))?.count || 0;

    // Recent hostel complaints
    const recentComplaints = await query(`
      SELECT c.*, s.full_name as student_name, r.room_number
      FROM complaints c
      JOIN students s ON c.student_id = s.id
      LEFT JOIN rooms r ON s.room_id = r.id
      WHERE s.hostel_id = ?
      ORDER BY c.created_at DESC
      LIMIT 5
    `, [hostelId || 'hostel_01']);

    // Recent leave requests
    const recentLeaves = await query(`
      SELECT l.*, s.full_name as student_name, s.department, r.room_number
      FROM leave_requests l
      JOIN students s ON l.student_id = s.id
      LEFT JOIN rooms r ON s.room_id = r.id
      WHERE s.hostel_id = ?
      ORDER BY l.created_at DESC
      LIMIT 5
    `, [hostelId || 'hostel_01']);

    // Attendance distribution for chart
    const attendanceSummary = [
      { name: 'Present', value: presentStudents, color: '#10B981' },
      { name: 'Absent', value: absentStudents, color: '#EF4444' },
      { name: 'On Leave', value: pendingLeave, color: '#F59E0B' }
    ];

    return sendSuccess(res, 'Warden dashboard data retrieved', {
      cards: {
        totalStudents,
        presentStudents,
        absentStudents,
        availableRooms: roomStats?.available || 0,
        occupiedRooms: roomStats?.occupied || 0,
        pendingComplaints,
        pendingLeaveRequests: pendingLeave,
        announcements: announcementsCount,
        activeVisitors
      },
      charts: {
        attendanceDistribution: attendanceSummary
      },
      hostelInfo: {
        hostelId,
        blockId,
        wardenName: warden?.name || req.user?.name
      },
      recent: {
        complaints: recentComplaints,
        leaves: recentLeaves
      }
    });
  } catch (err: any) {
    return sendError(res, 'Failed to fetch warden dashboard data', err, 500);
  }
}

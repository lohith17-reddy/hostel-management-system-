import { Response } from 'express';
import { query, queryOne, run } from '../db/database.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { sendError, sendSuccess } from '../utils/response.js';

// Normalizes dates like "23-09-2026", "23/09/2026", or "2026-09-23" to standard "YYYY-MM-DD"
export function normalizeDate(val: any): string {
  if (!val) return '';
  const str = String(val).trim();
  // If DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }
  // If YYYY-MM-DD
  const ymdMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return str;
}

export async function getLeaveRequests(req: AuthenticatedRequest, res: Response) {
  try {
    const { status, search, date, fromDate, toDate } = req.query;
    const role = (req.user?.role || '').toUpperCase();

    let sql = `
      SELECT
        l.id,
        l.leave_id,
        l.student_id,
        l.from_date,
        l.to_date,
        COALESCE(l.departure_date, l.from_date) as departure_date,
        COALESCE(l.expected_return, l.to_date) as expected_return,
        l.reason,
        l.destination,
        COALESCE(l.destination_address, l.destination) as destination_address,
        l.emergency_contact,
        COALESCE(l.parent_guardian_contact, l.emergency_contact) as parent_guardian_contact,
        l.status,
        l.reviewed_by,
        l.reviewed_at,
        l.review_notes,
        COALESCE(l.rejection_reason, l.review_notes) as rejection_reason,
        l.created_at,
        l.updated_at,
        s.user_id as student_user_id,
        s.full_name as student_name,
        s.student_id as student_roll,
        s.phone as student_phone,
        s.parent_phone as student_parent_phone,
        h.name as hostel_name,
        h.id as hostel_id,
        r.room_number,
        b.name as block_name
      FROM leave_requests l
      JOIN students s ON l.student_id = s.id
      LEFT JOIN hostels h ON s.hostel_id = h.id
      LEFT JOIN rooms r ON s.room_id = r.id
      LEFT JOIN blocks b ON r.block_id = b.id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Students only see their own leave requests
    if (role === 'STUDENT') {
      sql += ` AND s.user_id = ?`;
      params.push(req.user!.id);
    } else if (role === 'WARDEN' && req.user?.hostelId) {
      sql += ` AND (s.hostel_id = ? OR s.hostel_id IS NULL)`;
      params.push(req.user.hostelId);
    }

    if (status) {
      sql += ` AND (UPPER(l.status) = UPPER(?) OR l.status = ?)`;
      params.push(status, status);
    }

    if (date) {
      const normalizedQueryDate = normalizeDate(date);
      sql += ` AND (l.from_date <= ? AND l.to_date >= ?)`;
      params.push(normalizedQueryDate, normalizedQueryDate);
    }

    if (fromDate) {
      const normFrom = normalizeDate(fromDate);
      sql += ` AND l.from_date >= ?`;
      params.push(normFrom);
    }

    if (toDate) {
      const normTo = normalizeDate(toDate);
      sql += ` AND l.to_date <= ?`;
      params.push(normTo);
    }

    if (search) {
      sql += ` AND (l.destination LIKE ? OR l.reason LIKE ? OR s.full_name LIKE ? OR l.leave_id LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY l.created_at DESC`;
    const leaves = await query(sql, params);

    return sendSuccess(res, 'Leave requests retrieved successfully', leaves);
  } catch (err: any) {
    console.error('Error fetching leave requests:', err);
    return sendError(res, 'Failed to fetch leave requests', err, 500);
  }
}

export async function getStudentLeaveRequests(req: AuthenticatedRequest, res: Response) {
  // Shortcut to fetch current logged-in student's leave requests
  return getLeaveRequests(req, res);
}

export async function getLeaveRequestById(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const leave = await queryOne(`
      SELECT
        l.id,
        l.leave_id,
        l.student_id,
        l.from_date,
        l.to_date,
        COALESCE(l.departure_date, l.from_date) as departure_date,
        COALESCE(l.expected_return, l.to_date) as expected_return,
        l.reason,
        l.destination,
        COALESCE(l.destination_address, l.destination) as destination_address,
        l.emergency_contact,
        COALESCE(l.parent_guardian_contact, l.emergency_contact) as parent_guardian_contact,
        l.status,
        l.reviewed_by,
        l.reviewed_at,
        l.review_notes,
        COALESCE(l.rejection_reason, l.review_notes) as rejection_reason,
        l.created_at,
        l.updated_at,
        s.user_id as student_user_id,
        s.full_name as student_name,
        s.student_id as student_roll,
        s.phone as student_phone,
        h.name as hostel_name,
        h.id as hostel_id,
        r.room_number,
        b.name as block_name
      FROM leave_requests l
      JOIN students s ON l.student_id = s.id
      LEFT JOIN hostels h ON s.hostel_id = h.id
      LEFT JOIN rooms r ON s.room_id = r.id
      LEFT JOIN blocks b ON r.block_id = b.id
      WHERE l.id = ? OR l.leave_id = ?
    `, [id, id]);

    if (!leave) {
      return sendError(res, 'Leave request not found', null, 404);
    }

    const role = (req.user?.role || '').toUpperCase();
    if (role === 'STUDENT' && leave.student_user_id !== req.user?.id) {
      return sendError(res, 'You are not authorized to view this leave request', null, 403);
    }
    if (role === 'WARDEN' && req.user?.hostelId && leave.hostel_id && leave.hostel_id !== req.user.hostelId) {
      return sendError(res, 'You are not authorized to view requests from other hostels', null, 403);
    }

    return sendSuccess(res, 'Leave request retrieved successfully', leave);
  } catch (err: any) {
    console.error('Error fetching leave request by ID:', err);
    return sendError(res, 'Failed to fetch leave request details', err, 500);
  }
}

export async function createLeaveRequest(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, 'Your session has expired. Please log in again.', null, 401);
    }

    // Support both naming schemes: departureDate/expectedReturn/destinationAddress/parentGuardianContact
    // and fromDate/toDate/destination/emergencyContact
    const rawDeparture = req.body.departureDate || req.body.fromDate;
    const rawReturn = req.body.expectedReturn || req.body.toDate;
    const rawDestination = req.body.destinationAddress || req.body.destination;
    const rawContact = req.body.parentGuardianContact || req.body.emergencyContact;
    const rawReason = req.body.reason;

    const departureDate = normalizeDate(rawDeparture);
    const expectedReturn = normalizeDate(rawReturn);
    const destination = typeof rawDestination === 'string' ? rawDestination.trim() : '';
    const contact = typeof rawContact === 'string' ? rawContact.trim() : '';
    const reason = typeof rawReason === 'string' ? rawReason.trim() : '';

    // Field validations
    if (!departureDate) {
      return sendError(res, 'Departure date is required.', null, 400);
    }
    if (!expectedReturn) {
      return sendError(res, 'Expected return date is required.', null, 400);
    }
    if (!destination) {
      return sendError(res, 'Destination address is required.', null, 400);
    }
    if (!contact) {
      return sendError(res, 'Parent / Guardian contact is required.', null, 400);
    }
    if (contact.replace(/\D/g, '').length < 7) {
      return sendError(res, 'Please enter a valid guardian contact number (at least 7 digits).', null, 400);
    }
    if (!reason || reason.length < 2) {
      return sendError(res, 'Reason for leave is required.', null, 400);
    }

    // Expected return date must be on or after departure date
    if (expectedReturn < departureDate) {
      return sendError(res, 'Expected return date must be on or after the departure date.', null, 400);
    }

    // Resolve student ownership - NEVER trust studentId provided by student client
    let studentId = '';
    const userRole = (req.user.role || '').toUpperCase();

    if (userRole === 'STUDENT') {
      const student = await queryOne<{ id: string; full_name: string; hostel_id: string }>(
        'SELECT id, full_name, hostel_id FROM students WHERE user_id = ?',
        [req.user.id]
      );
      if (!student) {
        return sendError(res, 'Student record not found for your account. Please contact the administrator.', null, 404);
      }
      studentId = student.id;
    } else {
      // For Admin or Warden creating a request on behalf of a student
      studentId = req.body.studentId;
      if (!studentId) {
        return sendError(res, 'Student ID is required.', null, 400);
      }
      const student = await queryOne('SELECT id FROM students WHERE id = ?', [studentId]);
      if (!student) {
        return sendError(res, 'Student not found with provided ID.', null, 404);
      }
    }

    // Duplicate / Overlap prevention:
    // Check if student already has a pending leave request overlapping this period
    const overlapSql = `
      SELECT id, leave_id, from_date, to_date
      FROM leave_requests
      WHERE student_id = ?
        AND (UPPER(status) = 'PENDING' OR status = 'Pending')
        AND from_date <= ? AND to_date >= ?
      LIMIT 1
    `;
    const existingPending = await queryOne(overlapSql, [studentId, expectedReturn, departureDate]);
    if (existingPending) {
      return sendError(res, 'You already have a pending leave request for this period.', null, 400);
    }

    const leaveCode = `LV-${Math.floor(1000 + Math.random() * 9000)}`;
    const id = `leave_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    // Insert into database with both naming column sets populated for complete compatibility
    await run(
      `INSERT INTO leave_requests (
        id, leave_id, student_id,
        from_date, to_date, departure_date, expected_return,
        reason, destination, destination_address,
        emergency_contact, parent_guardian_contact,
        status, reviewed_by, reviewed_at, review_notes, rejection_reason,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', '', NULL, '', '', ?, ?)`,
      [
        id,
        leaveCode,
        studentId,
        departureDate,
        expectedReturn,
        departureDate,
        expectedReturn,
        reason,
        destination,
        destination,
        contact,
        contact,
        now,
        now
      ]
    );

    // Notify Warden
    await run(
      `INSERT INTO notifications (id, user_id, role, title, message, type, link, created_at)
       VALUES (?, NULL, 'WARDEN', 'New Outpass Application', ?, 'leave', '/warden/leave', ?)`,
      [
        `notif_${Date.now()}`,
        `Outpass request ${leaveCode} submitted for ${departureDate} to ${expectedReturn}.`,
        now
      ]
    );

    return sendSuccess(
      res,
      'Outpass request submitted successfully',
      {
        id,
        leaveId: leaveCode,
        status: 'PENDING'
      },
      201
    );
  } catch (err: any) {
    console.error('Error creating leave request:', err);
    return sendError(res, 'Unable to create leave request.', err, 500);
  }
}

export async function updateLeaveRequest(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    let { status, reviewNotes, rejectionReason } = req.body;
    const reviewerNotes = reviewNotes || rejectionReason || '';

    if (!status) {
      return sendError(res, 'Status is required (Approved, Rejected, or Pending)', null, 400);
    }

    const statusUpper = status.toUpperCase();
    let normalizedStatus = 'Pending';
    if (statusUpper === 'APPROVED') normalizedStatus = 'Approved';
    else if (statusUpper === 'REJECTED') normalizedStatus = 'Rejected';
    else if (statusUpper === 'CANCELLED') normalizedStatus = 'Cancelled';
    else if (statusUpper === 'PENDING') normalizedStatus = 'Pending';
    else {
      return sendError(res, 'Status must be Approved, Rejected, Pending, or Cancelled', null, 400);
    }

    // Require rejection reason when rejecting
    if (normalizedStatus === 'Rejected' && (!reviewerNotes || !reviewerNotes.trim())) {
      return sendError(res, 'Please provide a reason for rejection.', null, 400);
    }

    const leave = await queryOne(`
      SELECT l.*, s.user_id as student_user_id, s.hostel_id
      FROM leave_requests l
      JOIN students s ON l.student_id = s.id
      WHERE l.id = ? OR l.leave_id = ?
    `, [id, id]);

    if (!leave) {
      return sendError(res, 'Leave request not found', null, 404);
    }

    const role = (req.user?.role || '').toUpperCase();
    if (role === 'WARDEN' && req.user?.hostelId && leave.hostel_id && leave.hostel_id !== req.user.hostelId) {
      return sendError(res, 'You are not authorized to review leave requests from another hostel', null, 403);
    }

    const now = new Date().toISOString();
    const reviewer = req.user?.name || (role === 'ADMIN' ? 'Admin' : 'Warden');

    await run(`
      UPDATE leave_requests
      SET status = ?,
          reviewed_by = ?,
          reviewed_at = ?,
          review_notes = ?,
          rejection_reason = ?,
          updated_at = ?
      WHERE id = ?
    `, [
      normalizedStatus,
      reviewer,
      now,
      reviewerNotes,
      reviewerNotes,
      now,
      leave.id
    ]);

    // Send notification to student
    if (leave.student_user_id) {
      await run(
        `INSERT INTO notifications (id, user_id, role, title, message, type, link, created_at)
         VALUES (?, ?, 'STUDENT', 'Leave Request Decision', ?, 'leave', '/student/leave', ?)`,
        [
          `notif_${Date.now()}`,
          leave.student_user_id,
          `Your leave request from ${leave.from_date} to ${leave.to_date} was ${normalizedStatus.toLowerCase()} by ${reviewer}.${reviewerNotes ? ` Remarks: ${reviewerNotes}` : ''}`,
          now
        ]
      );
    }

    return sendSuccess(res, `Leave request marked as ${normalizedStatus}`, {
      id: leave.id,
      status: normalizedStatus
    });
  } catch (err: any) {
    console.error('Error updating leave request:', err);
    return sendError(res, 'Failed to update leave request', err, 500);
  }
}

export async function approveLeaveRequest(req: AuthenticatedRequest, res: Response) {
  req.body.status = 'Approved';
  return updateLeaveRequest(req, res);
}

export async function rejectLeaveRequest(req: AuthenticatedRequest, res: Response) {
  req.body.status = 'Rejected';
  const reason = req.body.rejectionReason || req.body.reviewNotes || req.body.reason;
  if (!reason || !reason.trim()) {
    return sendError(res, 'Please provide a reason for rejection.', null, 400);
  }
  req.body.reviewNotes = reason;
  return updateLeaveRequest(req, res);
}

export async function cancelLeaveRequest(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const leave = await queryOne(`
      SELECT l.*, s.user_id as student_user_id
      FROM leave_requests l
      JOIN students s ON l.student_id = s.id
      WHERE l.id = ? OR l.leave_id = ?
    `, [id, id]);

    if (!leave) {
      return sendError(res, 'Leave request not found', null, 404);
    }

    // Only student owner can cancel their own request
    if (leave.student_user_id !== req.user?.id) {
      return sendError(res, 'You are not authorized to cancel this request', null, 403);
    }

    const currentStatus = (leave.status || '').toUpperCase();
    if (currentStatus !== 'PENDING') {
      return sendError(res, 'Only pending leave requests can be cancelled', null, 400);
    }

    const now = new Date().toISOString();
    await run(`
      UPDATE leave_requests
      SET status = 'Cancelled',
          updated_at = ?
      WHERE id = ?
    `, [now, leave.id]);

    return sendSuccess(res, 'Leave request cancelled successfully', { id: leave.id, status: 'Cancelled' });
  } catch (err: any) {
    console.error('Error cancelling leave request:', err);
    return sendError(res, 'Failed to cancel leave request', err, 500);
  }
}

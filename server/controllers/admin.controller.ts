import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { query, queryOne, run } from '../db/database.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { sendError, sendSuccess } from '../utils/response.js';

export async function getDashboardStats(req: AuthenticatedRequest, res: Response) {
  try {
    // Totals
    const studentsCount = (await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM students WHERE status != "Alumni"'))?.count || 0;
    const wardensCount = (await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM wardens WHERE status = "Active"'))?.count || 0;
    const roomsCount = (await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM rooms'))?.count || 0;
    const totalCapacity = (await queryOne<{ sum: number }>('SELECT COALESCE(SUM(capacity), 0) as sum FROM rooms'))?.sum || 0;
    const occupiedBeds = (await queryOne<{ sum: number }>('SELECT COALESCE(SUM(occupied_beds), 0) as sum FROM rooms'))?.sum || 0;
    const availableBeds = (await queryOne<{ sum: number }>('SELECT COALESCE(SUM(available_beds), 0) as sum FROM rooms'))?.sum || 0;
    const occupiedRooms = (await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM rooms WHERE occupied_beds > 0'))?.count || 0;
    const availableRooms = (await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM rooms WHERE status = "Available"'))?.count || 0;

    const occupancyPercentage = totalCapacity > 0 ? Number(((occupiedBeds / totalCapacity) * 100).toFixed(1)) : 0;

    const pendingComplaints = (await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM complaints WHERE status = "Pending"'))?.count || 0;
    const pendingLeaveRequests = (await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM leave_requests WHERE status = "Pending"'))?.count || 0;

    // Food wastage stats
    const foodWastageTotal = (await queryOne<{ sum: number }>('SELECT COALESCE(SUM(food_wasted_kg), 0) as sum FROM food_wastage WHERE date >= date("now", "-14 days")'))?.sum || 0;
    const foodWastageDailyAvg = Number((foodWastageTotal / 14).toFixed(1));

    // Expenses stats
    const monthlyExpenses = (await queryOne<{ sum: number }>('SELECT COALESCE(SUM(amount), 0) as sum FROM expenses WHERE strftime("%Y-%m", date) = strftime("%Y-%m", "now")'))?.sum || 0;

    // Chart 1: Room Occupancy by Hostel
    const roomOccupancyChart = await query(`
      SELECT
        h.name as hostel_name,
        SUM(r.capacity) as total_capacity,
        SUM(r.occupied_beds) as occupied,
        SUM(r.available_beds) as available
      FROM hostels h
      LEFT JOIN rooms r ON h.id = r.hostel_id
      GROUP BY h.id, h.name
    `);

    // Chart 2: Student Statistics by Department
    const studentDeptChart = await query(`
      SELECT department, COUNT(*) as count
      FROM students
      GROUP BY department
      ORDER BY count DESC
    `);

    // Chart 3: Complaints Statistics by Category
    const complaintsCategoryChart = await query(`
      SELECT category, COUNT(*) as count
      FROM complaints
      GROUP BY category
      ORDER BY count DESC
    `);

    // Chart 4: Food Wastage Trends (Daily aggregated over last 14 days)
    const foodWastageChart = await query(`
      SELECT
        date,
        SUM(food_prepared_kg) as prepared_kg,
        SUM(food_wasted_kg) as wasted_kg,
        ROUND(SUM(food_wasted_kg) / SUM(food_prepared_kg) * 100, 1) as wastage_percentage
      FROM food_wastage
      GROUP BY date
      ORDER BY date ASC
      LIMIT 14
    `);

    // Chart 5: Monthly Hostel Expenses by Category
    const monthlyExpensesChart = await query(`
      SELECT category, SUM(amount) as amount
      FROM expenses
      GROUP BY category
      ORDER BY amount DESC
    `);

    // Recent activity streams
    const recentComplaints = await query(`
      SELECT c.*, s.full_name as student_name, r.room_number
      FROM complaints c
      LEFT JOIN students s ON c.student_id = s.id
      LEFT JOIN rooms r ON s.room_id = r.id
      ORDER BY c.created_at DESC
      LIMIT 5
    `);

    const recentLeaveRequests = await query(`
      SELECT l.*, s.full_name as student_name, s.department
      FROM leave_requests l
      LEFT JOIN students s ON l.student_id = s.id
      ORDER BY l.created_at DESC
      LIMIT 5
    `);

    return sendSuccess(res, 'Admin dashboard metrics retrieved', {
      cards: {
        totalStudents: studentsCount,
        totalWardens: wardensCount,
        totalRooms: roomsCount,
        occupiedRooms,
        availableRooms,
        totalCapacity,
        occupiedBeds,
        availableBeds,
        occupancyPercentage,
        pendingComplaints,
        pendingLeaveRequests,
        foodWastageTotalKg: Number(foodWastageTotal.toFixed(1)),
        foodWastageDailyAvgKg: foodWastageDailyAvg,
        monthlyExpenses
      },
      charts: {
        roomOccupancy: roomOccupancyChart,
        studentDept: studentDeptChart,
        complaintsCategory: complaintsCategoryChart,
        foodWastageTrends: foodWastageChart,
        monthlyExpenses: monthlyExpensesChart
      },
      recent: {
        complaints: recentComplaints,
        leaveRequests: recentLeaveRequests
      }
    });
  } catch (err: any) {
    return sendError(res, 'Failed to fetch admin dashboard metrics', err, 500);
  }
}

// Student Management
export async function getStudents(req: AuthenticatedRequest, res: Response) {
  try {
    const { search, hostelId, department, year, status } = req.query;

    let sql = `
      SELECT
        s.*,
        u.avatar,
        h.name as hostel_name,
        b.name as block_name,
        r.room_number,
        (SELECT COUNT(*) FROM attendance WHERE student_id = s.id AND status = 'Present') as total_present,
        (SELECT COUNT(*) FROM attendance WHERE student_id = s.id) as total_attendance,
        (SELECT COALESCE(SUM(pending_amount), 0) FROM fees WHERE student_id = s.id) as fee_pending
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN hostels h ON s.hostel_id = h.id
      LEFT JOIN rooms r ON s.room_id = r.id
      LEFT JOIN blocks b ON r.block_id = b.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      sql += ` AND (s.full_name LIKE ? OR s.student_id LIKE ? OR s.email LIKE ? OR s.phone LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }
    if (hostelId) {
      sql += ` AND s.hostel_id = ?`;
      params.push(hostelId);
    }
    if (department) {
      sql += ` AND s.department = ?`;
      params.push(department);
    }
    if (year) {
      sql += ` AND s.year = ?`;
      params.push(year);
    }
    if (status) {
      sql += ` AND s.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY s.created_at DESC`;
    const students = await query(sql, params);

    return sendSuccess(res, 'Students retrieved successfully', students);
  } catch (err: any) {
    return sendError(res, 'Failed to fetch students', err, 500);
  }
}

export async function getStudentById(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const student = await queryOne(`
      SELECT
        s.*,
        u.avatar,
        h.name as hostel_name,
        b.name as block_name,
        r.room_number,
        r.floor,
        r.room_type
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN hostels h ON s.hostel_id = h.id
      LEFT JOIN rooms r ON s.room_id = r.id
      LEFT JOIN blocks b ON r.block_id = b.id
      WHERE s.id = ? OR s.student_id = ?
    `, [id, id]);

    if (!student) {
      return sendError(res, 'Student not found', null, 404);
    }

    const attendanceRecords = await query(`
      SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC LIMIT 30
    `, [student.id]);

    const complaints = await query(`
      SELECT * FROM complaints WHERE student_id = ? ORDER BY created_at DESC
    `, [student.id]);

    const leaveRequests = await query(`
      SELECT * FROM leave_requests WHERE student_id = ? ORDER BY created_at DESC
    `, [student.id]);

    const feeRecords = await query(`
      SELECT * FROM fees WHERE student_id = ? ORDER BY created_at DESC
    `, [student.id]);

    const allocations = await query(`
      SELECT ra.*, r.room_number, h.name as hostel_name
      FROM room_allocations ra
      LEFT JOIN rooms r ON ra.room_id = r.id
      LEFT JOIN hostels h ON ra.hostel_id = h.id
      WHERE ra.student_id = ?
      ORDER BY ra.allocated_date DESC
    `, [student.id]);

    return sendSuccess(res, 'Student profile details retrieved', {
      student,
      attendance: attendanceRecords,
      complaints,
      leaveRequests,
      fees: feeRecords,
      allocations
    });
  } catch (err: any) {
    return sendError(res, 'Failed to fetch student profile', err, 500);
  }
}

export async function createStudent(req: AuthenticatedRequest, res: Response) {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      gender,
      dob,
      department,
      year,
      parentName,
      parentPhone,
      address,
      hostelId,
      roomId,
      bedNumber,
      joiningDate
    } = req.body;

    if (!fullName || !email) {
      return sendError(res, 'Full Name and Email are mandatory fields', null, 400);
    }

    const existingUser = await queryOne('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (existingUser) {
      return sendError(res, 'A user account with this email already exists', null, 409);
    }

    const hashedPassword = await bcrypt.hash(password || 'Student@123', 10);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const studentRecId = `student_rec_${Date.now()}`;
    const studentCode = `STU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`;

    await run(
      `INSERT INTO users (id, email, password, name, role, avatar, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'STUDENT', ?, ?, ?)`,
      [userId, email.trim().toLowerCase(), hashedPassword, fullName.trim(), avatar, now, now]
    );

    await run(
      `INSERT INTO students (id, user_id, student_id, full_name, email, phone, gender, dob, department, year, parent_name, parent_phone, address, hostel_id, room_id, bed_number, joining_date, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?, ?)`,
      [
        studentRecId,
        userId,
        studentCode,
        fullName.trim(),
        email.trim().toLowerCase(),
        phone || '',
        gender || 'Male',
        dob || '',
        department || 'Computer Science',
        year || '1st Year',
        parentName || '',
        parentPhone || '',
        address || '',
        hostelId || null,
        roomId || null,
        bedNumber || null,
        joiningDate || now.split('T')[0],
        now,
        now
      ]
    );

    // If room allocation requested
    if (roomId && bedNumber) {
      await run(
        `INSERT INTO room_allocations (id, student_id, hostel_id, room_id, bed_number, allocated_date, vacated_date, status, allocated_by, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NULL, 'Active', ?, 'Initial student enrolment allocation', ?)`,
        [`alloc_${Date.now()}`, studentRecId, hostelId, roomId, bedNumber, joiningDate || now.split('T')[0], req.user!.name, now]
      );

      await run(
        `UPDATE beds SET status = 'Occupied', student_id = ? WHERE room_id = ? AND bed_number = ?`,
        [studentRecId, roomId, bedNumber]
      );

      await run(`
        UPDATE rooms
        SET occupied_beds = (SELECT COUNT(*) FROM beds WHERE beds.room_id = rooms.id AND beds.status = 'Occupied'),
            available_beds = capacity - (SELECT COUNT(*) FROM beds WHERE beds.room_id = rooms.id AND beds.status = 'Occupied')
        WHERE id = ?
      `, [roomId]);
    }

    return sendSuccess(res, 'Student created successfully', { studentId: studentRecId, code: studentCode }, 201);
  } catch (err: any) {
    return sendError(res, 'Failed to create student', err, 500);
  }
}

export async function updateStudent(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const {
      fullName,
      phone,
      gender,
      dob,
      department,
      year,
      parentName,
      parentPhone,
      address,
      status
    } = req.body;

    const student = await queryOne('SELECT id, user_id FROM students WHERE id = ?', [id]);
    if (!student) {
      return sendError(res, 'Student not found', null, 404);
    }

    const now = new Date().toISOString();

    await run(`
      UPDATE students
      SET full_name = COALESCE(?, full_name),
          phone = COALESCE(?, phone),
          gender = COALESCE(?, gender),
          dob = COALESCE(?, dob),
          department = COALESCE(?, department),
          year = COALESCE(?, year),
          parent_name = COALESCE(?, parent_name),
          parent_phone = COALESCE(?, parent_phone),
          address = COALESCE(?, address),
          status = COALESCE(?, status),
          updated_at = ?
      WHERE id = ?
    `, [fullName, phone, gender, dob, department, year, parentName, parentPhone, address, status, now, id]);

    if (fullName) {
      await run('UPDATE users SET name = ?, updated_at = ? WHERE id = ?', [fullName, now, student.user_id]);
    }

    return sendSuccess(res, 'Student information updated successfully');
  } catch (err: any) {
    return sendError(res, 'Failed to update student', err, 500);
  }
}

export async function deleteStudent(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const student = await queryOne('SELECT id, user_id, room_id, bed_number FROM students WHERE id = ?', [id]);
    if (!student) {
      return sendError(res, 'Student not found', null, 404);
    }

    // Vacate bed if assigned
    if (student.room_id && student.bed_number) {
      await run(
        `UPDATE beds SET status = 'Available', student_id = NULL WHERE room_id = ? AND bed_number = ?`,
        [student.room_id, student.bed_number]
      );
      await run(`
        UPDATE rooms
        SET occupied_beds = (SELECT COUNT(*) FROM beds WHERE beds.room_id = rooms.id AND beds.status = 'Occupied'),
            available_beds = capacity - (SELECT COUNT(*) FROM beds WHERE beds.room_id = rooms.id AND beds.status = 'Occupied')
        WHERE id = ?
      `, [student.room_id]);
    }

    // Cascade delete user
    await run('DELETE FROM users WHERE id = ?', [student.user_id]);

    return sendSuccess(res, 'Student record removed successfully');
  } catch (err: any) {
    return sendError(res, 'Failed to delete student', err, 500);
  }
}

// Warden Management
export async function getWardens(req: AuthenticatedRequest, res: Response) {
  try {
    const wardens = await query(`
      SELECT
        w.*,
        u.avatar,
        h.name as hostel_name,
        b.name as block_name,
        (SELECT COUNT(*) FROM students WHERE hostel_id = w.hostel_id) as assigned_students_count,
        (SELECT COUNT(*) FROM rooms WHERE hostel_id = w.hostel_id) as assigned_rooms_count
      FROM wardens w
      JOIN users u ON w.user_id = u.id
      LEFT JOIN hostels h ON w.hostel_id = h.id
      LEFT JOIN blocks b ON w.block_id = b.id
      ORDER BY w.created_at DESC
    `);
    return sendSuccess(res, 'Wardens list retrieved', wardens);
  } catch (err: any) {
    return sendError(res, 'Failed to fetch wardens', err, 500);
  }
}

export async function createWarden(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, email, password, phone, hostelId, blockId } = req.body;
    if (!name || !email) {
      return sendError(res, 'Name and email are required', null, 400);
    }

    const existingUser = await queryOne('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (existingUser) {
      return sendError(res, 'User with this email already exists', null, 409);
    }

    const hashedPassword = await bcrypt.hash(password || 'Warden@123', 10);
    const userId = `user_w_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const wardenRecId = `warden_rec_${Date.now()}`;
    const wardenCode = `WRD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();
    const avatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';

    await run(
      `INSERT INTO users (id, email, password, name, role, avatar, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'WARDEN', ?, ?, ?)`,
      [userId, email.trim().toLowerCase(), hashedPassword, name.trim(), avatar, now, now]
    );

    await run(
      `INSERT INTO wardens (id, user_id, warden_id, name, email, phone, hostel_id, block_id, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?, ?)`,
      [wardenRecId, userId, wardenCode, name.trim(), email.trim().toLowerCase(), phone || '', hostelId || null, blockId || null, now, now]
    );

    return sendSuccess(res, 'Warden created successfully', { id: wardenRecId, wardenCode }, 201);
  } catch (err: any) {
    return sendError(res, 'Failed to create warden', err, 500);
  }
}

export async function updateWarden(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, phone, hostelId, blockId, status } = req.body;

    const warden = await queryOne('SELECT id, user_id FROM wardens WHERE id = ?', [id]);
    if (!warden) {
      return sendError(res, 'Warden not found', null, 404);
    }

    const now = new Date().toISOString();
    await run(`
      UPDATE wardens
      SET name = COALESCE(?, name),
          phone = COALESCE(?, phone),
          hostel_id = COALESCE(?, hostel_id),
          block_id = COALESCE(?, block_id),
          status = COALESCE(?, status),
          updated_at = ?
      WHERE id = ?
    `, [name, phone, hostelId, blockId, status, now, id]);

    if (name) {
      await run('UPDATE users SET name = ?, updated_at = ? WHERE id = ?', [name, now, warden.user_id]);
    }

    return sendSuccess(res, 'Warden updated successfully');
  } catch (err: any) {
    return sendError(res, 'Failed to update warden', err, 500);
  }
}

export async function deleteWarden(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const warden = await queryOne('SELECT id, user_id FROM wardens WHERE id = ?', [id]);
    if (!warden) {
      return sendError(res, 'Warden not found', null, 404);
    }

    await run('DELETE FROM users WHERE id = ?', [warden.user_id]);
    return sendSuccess(res, 'Warden record removed successfully');
  } catch (err: any) {
    return sendError(res, 'Failed to delete warden', err, 500);
  }
}

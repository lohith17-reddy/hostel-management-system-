import { Response } from 'express';
import { query, queryOne, run } from '../db/database.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { sendError, sendSuccess } from '../utils/response.js';

export async function getHostels(req: AuthenticatedRequest, res: Response) {
  try {
    const hostels = await query(`
      SELECT h.*,
        (SELECT COUNT(*) FROM blocks WHERE hostel_id = h.id) as total_blocks,
        (SELECT COUNT(*) FROM rooms WHERE hostel_id = h.id) as total_rooms,
        (SELECT COALESCE(SUM(capacity), 0) FROM rooms WHERE hostel_id = h.id) as total_capacity,
        (SELECT COALESCE(SUM(occupied_beds), 0) FROM rooms WHERE hostel_id = h.id) as total_occupied
      FROM hostels h
      ORDER BY h.name
    `);
    return sendSuccess(res, 'Hostels list retrieved', hostels);
  } catch (err: any) {
    return sendError(res, 'Failed to fetch hostels', err, 500);
  }
}

export async function getBlocks(req: AuthenticatedRequest, res: Response) {
  try {
    const { hostelId } = req.query;
    let sql = `SELECT b.*, h.name as hostel_name FROM blocks b JOIN hostels h ON b.hostel_id = h.id`;
    const params: any[] = [];
    if (hostelId) {
      sql += ` WHERE b.hostel_id = ?`;
      params.push(hostelId);
    }
    sql += ` ORDER BY b.name`;
    const blocks = await query(sql, params);
    return sendSuccess(res, 'Blocks list retrieved', blocks);
  } catch (err: any) {
    return sendError(res, 'Failed to fetch blocks', err, 500);
  }
}

export async function getRooms(req: AuthenticatedRequest, res: Response) {
  try {
    const { hostelId, blockId, status, floor, search } = req.query;

    let sql = `
      SELECT
        r.*,
        h.name as hostel_name,
        b.name as block_name,
        b.code as block_code
      FROM rooms r
      JOIN hostels h ON r.hostel_id = h.id
      JOIN blocks b ON r.block_id = b.id
      WHERE 1=1
    `;
    const params: any[] = [];

    // If Warden is querying, warden should only see students/rooms assigned to their hostel/block if specified
    if (req.user?.role === 'WARDEN' && req.user.hostelId && !hostelId) {
      sql += ` AND r.hostel_id = ?`;
      params.push(req.user.hostelId);
    } else if (hostelId) {
      sql += ` AND r.hostel_id = ?`;
      params.push(hostelId);
    }

    if (blockId) {
      sql += ` AND r.block_id = ?`;
      params.push(blockId);
    }
    if (status) {
      sql += ` AND r.status = ?`;
      params.push(status);
    }
    if (floor) {
      sql += ` AND r.floor = ?`;
      params.push(floor);
    }
    if (search) {
      sql += ` AND (r.room_number LIKE ? OR h.name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY r.floor ASC, r.room_number ASC`;
    const rooms = await query(sql, params);

    // Attach Beds with occupied student names for visual layout
    const roomIds = rooms.map(r => r.id);
    let beds: any[] = [];
    if (roomIds.length > 0) {
      const placeholders = roomIds.map(() => '?').join(',');
      beds = await query(`
        SELECT
          b.*,
          s.full_name as student_name,
          s.student_id as student_roll,
          s.department,
          s.year
        FROM beds b
        LEFT JOIN students s ON b.student_id = s.id
        WHERE b.room_id IN (${placeholders})
        ORDER BY b.room_id, b.bed_number ASC
      `, roomIds);
    }

    const bedsByRoomId: Record<string, any[]> = {};
    for (const b of beds) {
      if (!bedsByRoomId[b.room_id]) bedsByRoomId[b.room_id] = [];
      bedsByRoomId[b.room_id].push(b);
    }

    const enrichedRooms = rooms.map(r => ({
      ...r,
      beds: bedsByRoomId[r.id] || []
    }));

    return sendSuccess(res, 'Rooms retrieved successfully', enrichedRooms);
  } catch (err: any) {
    return sendError(res, 'Failed to fetch rooms', err, 500);
  }
}

export async function createRoom(req: AuthenticatedRequest, res: Response) {
  try {
    const { hostelId, blockId, roomNumber, floor, roomType, capacity, status } = req.body;
    if (!hostelId || !blockId || !roomNumber || !capacity) {
      return sendError(res, 'Hostel, Block, Room Number and Capacity are required', null, 400);
    }

    const existing = await queryOne(
      'SELECT id FROM rooms WHERE hostel_id = ? AND block_id = ? AND room_number = ?',
      [hostelId, blockId, roomNumber]
    );
    if (existing) {
      return sendError(res, `Room ${roomNumber} already exists in this block`, null, 409);
    }

    const roomId = `room_${blockId}_${floor}_${roomNumber}`;
    const now = new Date().toISOString();
    const parsedCap = parseInt(capacity, 10);

    await run(
      `INSERT INTO rooms (id, hostel_id, block_id, room_number, floor, room_type, capacity, occupied_beds, available_beds, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`,
      [roomId, hostelId, blockId, roomNumber, parseInt(floor, 10) || 1, roomType || 'Double', parsedCap, parsedCap, status || 'Available', now, now]
    );

    // Create Beds
    for (let bedNo = 1; bedNo <= parsedCap; bedNo++) {
      const bedId = `bed_${roomId}_${bedNo}`;
      await run(
        `INSERT INTO beds (id, room_id, bed_number, status, student_id)
         VALUES (?, ?, ?, 'Available', NULL)`,
        [bedId, roomId, bedNo]
      );
    }

    return sendSuccess(res, 'Room and beds created successfully', { id: roomId }, 201);
  } catch (err: any) {
    return sendError(res, 'Failed to create room', err, 500);
  }
}

export async function updateRoom(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status, roomType } = req.body;

    const room = await queryOne('SELECT id FROM rooms WHERE id = ?', [id]);
    if (!room) {
      return sendError(res, 'Room not found', null, 404);
    }

    const now = new Date().toISOString();
    await run(
      `UPDATE rooms SET status = COALESCE(?, status), room_type = COALESCE(?, room_type), updated_at = ? WHERE id = ?`,
      [status, roomType, now, id]
    );

    return sendSuccess(res, 'Room updated successfully');
  } catch (err: any) {
    return sendError(res, 'Failed to update room', err, 500);
  }
}

export async function deleteRoom(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const occupied = await queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM beds WHERE room_id = ? AND status = "Occupied"',
      [id]
    );

    if (occupied && occupied.count > 0) {
      return sendError(res, 'Cannot delete room with active student occupancy. Vacate or reallocate students first.', null, 400);
    }

    await run('DELETE FROM rooms WHERE id = ?', [id]);
    return sendSuccess(res, 'Room deleted successfully');
  } catch (err: any) {
    return sendError(res, 'Failed to delete room', err, 500);
  }
}

// Allocations
export async function getAllocations(req: AuthenticatedRequest, res: Response) {
  try {
    const { studentId, status } = req.query;
    let sql = `
      SELECT
        ra.*,
        s.full_name as student_name,
        s.student_id as student_roll,
        s.department,
        h.name as hostel_name,
        r.room_number,
        b.name as block_name
      FROM room_allocations ra
      JOIN students s ON ra.student_id = s.id
      JOIN hostels h ON ra.hostel_id = h.id
      JOIN rooms r ON ra.room_id = r.id
      JOIN blocks b ON r.block_id = b.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (req.user?.role === 'STUDENT') {
      sql += ` AND s.user_id = ?`;
      params.push(req.user.id);
    } else if (studentId) {
      sql += ` AND ra.student_id = ?`;
      params.push(studentId);
    }

    if (status) {
      sql += ` AND ra.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY ra.allocated_date DESC`;
    const allocations = await query(sql, params);
    return sendSuccess(res, 'Allocations retrieved successfully', allocations);
  } catch (err: any) {
    return sendError(res, 'Failed to fetch allocations', err, 500);
  }
}

export async function allocateRoom(req: AuthenticatedRequest, res: Response) {
  try {
    const { studentId, hostelId, roomId, bedNumber, notes } = req.body;

    if (!studentId || !hostelId || !roomId || !bedNumber) {
      return sendError(res, 'Student, Hostel, Room, and Bed Number are required', null, 400);
    }

    // 1. Prevent allocation if student already has an active allocation
    const existingActive = await queryOne(
      'SELECT id, room_id, bed_number FROM students WHERE id = ? AND room_id IS NOT NULL',
      [studentId]
    );
    if (existingActive) {
      return sendError(
        res,
        'Student already has an active room allocation. Please use "Change Room" or vacate their current room before allocating.',
        null,
        400
      );
    }

    // 2. Prevent allocation if room or bed is already full/occupied
    const bed = await queryOne(
      'SELECT id, status FROM beds WHERE room_id = ? AND bed_number = ?',
      [roomId, bedNumber]
    );

    if (!bed) {
      return sendError(res, `Bed ${bedNumber} does not exist in the selected room.`, null, 404);
    }

    if (bed.status === 'Occupied') {
      return sendError(res, `Bed ${bedNumber} in this room is already occupied.`, null, 409);
    }

    const now = new Date().toISOString();
    const allocId = `alloc_${Date.now()}`;

    // Record allocation
    await run(
      `INSERT INTO room_allocations (id, student_id, hostel_id, room_id, bed_number, allocated_date, vacated_date, status, allocated_by, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NULL, 'Active', ?, ?, ?)`,
      [allocId, studentId, hostelId, roomId, bedNumber, now.split('T')[0], req.user?.name || 'Admin', notes || '', now]
    );

    // Update Bed
    await run(
      `UPDATE beds SET status = 'Occupied', student_id = ? WHERE room_id = ? AND bed_number = ?`,
      [studentId, roomId, bedNumber]
    );

    // Update Student record
    await run(
      `UPDATE students SET hostel_id = ?, room_id = ?, bed_number = ?, updated_at = ? WHERE id = ?`,
      [hostelId, roomId, bedNumber, now, studentId]
    );

    // Recalculate room occupancy
    await updateRoomOccupancyStats(roomId);

    // Notify student
    const studentUser = await queryOne('SELECT user_id FROM students WHERE id = ?', [studentId]);
    if (studentUser) {
      await run(
        `INSERT INTO notifications (id, user_id, role, title, message, type, link, created_at)
         VALUES (?, ?, 'STUDENT', 'Room Allocation Complete', 'Your hostel room has been successfully allocated.', 'allocation', '/student/room', ?)`,
        [`notif_${Date.now()}`, studentUser.user_id, now]
      );
    }

    return sendSuccess(res, 'Room allocated successfully', { allocationId: allocId }, 201);
  } catch (err: any) {
    return sendError(res, 'Failed to allocate room', err, 500);
  }
}

export async function changeRoom(req: AuthenticatedRequest, res: Response) {
  try {
    const { studentId, newHostelId, newRoomId, newBedNumber, reason } = req.body;

    if (!studentId || !newHostelId || !newRoomId || !newBedNumber) {
      return sendError(res, 'Student ID, New Hostel, New Room, and New Bed Number are required', null, 400);
    }

    const student = await queryOne(
      'SELECT id, hostel_id, room_id, bed_number FROM students WHERE id = ?',
      [studentId]
    );
    if (!student) {
      return sendError(res, 'Student not found', null, 404);
    }

    // Check new bed availability
    const newBed = await queryOne(
      'SELECT id, status FROM beds WHERE room_id = ? AND bed_number = ?',
      [newRoomId, newBedNumber]
    );
    if (!newBed || newBed.status === 'Occupied') {
      return sendError(res, 'Selected target bed is already occupied or does not exist.', null, 409);
    }

    const now = new Date().toISOString();

    // 1. Vacate old bed if assigned
    if (student.room_id && student.bed_number) {
      await run(
        `UPDATE beds SET status = 'Available', student_id = NULL WHERE room_id = ? AND bed_number = ?`,
        [student.room_id, student.bed_number]
      );
      // Mark old allocation transferred
      await run(
        `UPDATE room_allocations SET status = 'Transferred', vacated_date = ? WHERE student_id = ? AND status = 'Active'`,
        [now.split('T')[0], studentId]
      );
      await updateRoomOccupancyStats(student.room_id);
    }

    // 2. Allocate new bed
    await run(
      `UPDATE beds SET status = 'Occupied', student_id = ? WHERE room_id = ? AND bed_number = ?`,
      [studentId, newRoomId, newBedNumber]
    );

    // 3. Update student record
    await run(
      `UPDATE students SET hostel_id = ?, room_id = ?, bed_number = ?, updated_at = ? WHERE id = ?`,
      [newHostelId, newRoomId, newBedNumber, now, studentId]
    );

    // 4. Create new allocation record
    await run(
      `INSERT INTO room_allocations (id, student_id, hostel_id, room_id, bed_number, allocated_date, vacated_date, status, allocated_by, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NULL, 'Active', ?, ?, ?)`,
      [`alloc_${Date.now()}`, studentId, newHostelId, newRoomId, newBedNumber, now.split('T')[0], req.user?.name || 'Admin', reason || 'Room transfer', now]
    );

    await updateRoomOccupancyStats(newRoomId);

    return sendSuccess(res, 'Student room transfer completed successfully');
  } catch (err: any) {
    return sendError(res, 'Failed to change room', err, 500);
  }
}

export async function vacateRoom(req: AuthenticatedRequest, res: Response) {
  try {
    const { studentId, reason } = req.body;
    if (!studentId) {
      return sendError(res, 'Student ID is required', null, 400);
    }

    const student = await queryOne(
      'SELECT id, hostel_id, room_id, bed_number FROM students WHERE id = ?',
      [studentId]
    );
    if (!student || !student.room_id) {
      return sendError(res, 'Student has no active room to vacate', null, 400);
    }

    const now = new Date().toISOString();

    // 1. Release bed
    await run(
      `UPDATE beds SET status = 'Available', student_id = NULL WHERE room_id = ? AND bed_number = ?`,
      [student.room_id, student.bed_number]
    );

    // 2. Update allocation record
    await run(
      `UPDATE room_allocations SET status = 'Vacated', vacated_date = ?, notes = notes || ? WHERE student_id = ? AND status = 'Active'`,
      [now.split('T')[0], ` [Vacated: ${reason || 'N/A'}]`, studentId]
    );

    // 3. Clear student room fields
    await run(
      `UPDATE students SET room_id = NULL, bed_number = NULL, updated_at = ? WHERE id = ?`,
      [now, studentId]
    );

    await updateRoomOccupancyStats(student.room_id);

    return sendSuccess(res, 'Student has successfully vacated the room');
  } catch (err: any) {
    return sendError(res, 'Failed to vacate room', err, 500);
  }
}

async function updateRoomOccupancyStats(roomId: string) {
  await run(`
    UPDATE rooms
    SET occupied_beds = (SELECT COUNT(*) FROM beds WHERE beds.room_id = rooms.id AND beds.status = 'Occupied'),
        available_beds = capacity - (SELECT COUNT(*) FROM beds WHERE beds.room_id = rooms.id AND beds.status = 'Occupied')
    WHERE id = ?
  `, [roomId]);

  await run(`
    UPDATE rooms
    SET status = CASE
      WHEN available_beds = 0 THEN 'Full'
      WHEN occupied_beds > 0 THEN 'Partially Occupied'
      ELSE 'Available'
    END
    WHERE id = ? AND status != 'Maintenance'
  `, [roomId]);
}

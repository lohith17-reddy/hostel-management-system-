import bcrypt from 'bcryptjs';
import { flushSaveToDisk, query, queryOne, run } from './database.js';

export async function seedDatabase() {
  console.log('🌱 Checking & seeding Hostel Management System database...');

  const now = new Date().toISOString();

  // Ensure password_hash and status columns exist
  try {
    const tableInfo = await query<{ name: string }>('PRAGMA table_info(users)');
    const colNames = tableInfo.map((c) => c.name);

    if (!colNames.includes('password_hash')) {
      await run('ALTER TABLE users ADD COLUMN password_hash TEXT;');
      await run('UPDATE users SET password_hash = password WHERE password_hash IS NULL;');
    }
    if (!colNames.includes('password')) {
      await run('ALTER TABLE users ADD COLUMN password TEXT;');
      await run('UPDATE users SET password = password_hash WHERE password IS NULL;');
    }
    if (!colNames.includes('status')) {
      await run("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active';");
      await run("UPDATE users SET status = 'active' WHERE status IS NULL;");
    }
  } catch (err) {
    console.warn('Column check in seed:', err);
  }

  // Pre-hash demo passwords
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
  const wardenPasswordHash = await bcrypt.hash('Warden123!', 10);
  const studentPasswordHash = await bcrypt.hash('Student123!', 10);
  const generalPasswordHash = await bcrypt.hash('Hostel123!', 10);

  // ============================================================
  // 1. DEMO ACCOUNTS (Idempotent Upsert)
  // ============================================================

  // ADMIN: admin@hostel.com
  const existingAdmin = await queryOne(
    'SELECT id FROM users WHERE id = ? OR LOWER(email) = ? OR LOWER(email) = ?',
    ['user_admin_01', 'admin@hostel.com', 'admin@hostel.edu']
  );

  let adminUserId = 'user_admin_01';
  if (existingAdmin) {
    adminUserId = existingAdmin.id;
    await run(
      'UPDATE users SET name = ?, email = ?, password = ?, password_hash = ?, role = ?, status = ?, updated_at = ? WHERE id = ?',
      ['Administrator', 'admin@hostel.com', adminPasswordHash, adminPasswordHash, 'admin', 'active', now, adminUserId]
    );
  } else {
    await run(
      `INSERT INTO users (id, name, email, password, password_hash, role, status, avatar, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'admin', 'active', ?, ?, ?)`,
      [
        adminUserId,
        'Administrator',
        'admin@hostel.com',
        adminPasswordHash,
        adminPasswordHash,
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        now,
        now
      ]
    );
  }

  // WARDEN: warden.boys@hostel.com
  const existingWarden = await queryOne(
    'SELECT id FROM users WHERE id = ? OR LOWER(email) = ? OR LOWER(email) = ?',
    ['user_warden_01', 'warden.boys@hostel.com', 'warden.alpha@hostel.edu']
  );

  let wardenUserId = 'user_warden_01';
  if (existingWarden) {
    wardenUserId = existingWarden.id;
    await run(
      'UPDATE users SET name = ?, email = ?, password = ?, password_hash = ?, role = ?, status = ?, updated_at = ? WHERE id = ?',
      ['Prof. Arthur Pendelton', 'warden.boys@hostel.com', wardenPasswordHash, wardenPasswordHash, 'warden', 'active', now, wardenUserId]
    );
  } else {
    await run(
      `INSERT INTO users (id, name, email, password, password_hash, role, status, avatar, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'warden', 'active', ?, ?, ?)`,
      [
        wardenUserId,
        'Prof. Arthur Pendelton',
        'warden.boys@hostel.com',
        wardenPasswordHash,
        wardenPasswordHash,
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        now,
        now
      ]
    );
  }

  // Update or insert warden record in wardens table
  const existingWardenRec = await queryOne('SELECT id FROM wardens WHERE user_id = ? OR id = ?', [wardenUserId, 'warden_rec_WRD-2024-001']);
  if (existingWardenRec) {
    await run(
      'UPDATE wardens SET email = ?, name = ?, status = ?, updated_at = ? WHERE id = ?',
      ['warden.boys@hostel.com', 'Prof. Arthur Pendelton', 'Active', now, existingWardenRec.id]
    );
  } else {
    await run(
      `INSERT INTO wardens (id, user_id, warden_id, name, email, phone, hostel_id, block_id, status, created_at, updated_at)
       VALUES (?, ?, 'WRD-2024-001', 'Prof. Arthur Pendelton', 'warden.boys@hostel.com', '+1 (555) 101-2020', 'hostel_01', 'block_01', 'Active', ?, ?)`,
      ['warden_rec_WRD-2024-001', wardenUserId, now, now]
    );
  }

  // STUDENT: alexander.hayes@hostel.com
  const existingStudent = await queryOne(
    'SELECT id FROM users WHERE id = ? OR LOWER(email) = ? OR LOWER(email) = ?',
    ['user_student_1', 'alexander.hayes@hostel.com', 'student1@hostel.edu']
  );

  let studentUserId = 'user_student_1';
  if (existingStudent) {
    studentUserId = existingStudent.id;
    await run(
      'UPDATE users SET name = ?, email = ?, password = ?, password_hash = ?, role = ?, status = ?, updated_at = ? WHERE id = ?',
      ['Alexander Hayes', 'alexander.hayes@hostel.com', studentPasswordHash, studentPasswordHash, 'student', 'active', now, studentUserId]
    );
  } else {
    await run(
      `INSERT INTO users (id, name, email, password, password_hash, role, status, avatar, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'student', 'active', ?, ?, ?)`,
      [
        studentUserId,
        'Alexander Hayes',
        'alexander.hayes@hostel.com',
        studentPasswordHash,
        studentPasswordHash,
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        now,
        now
      ]
    );
  }

  // Update or insert student record for Alexander Hayes
  const existingStudentRec = await queryOne('SELECT id FROM students WHERE user_id = ? OR id = ? OR id = ?', [studentUserId, 'student_rec_01', 'student_rec_user_student_1']);
  let alexanderStudentRecId = 'student_rec_01';
  if (existingStudentRec) {
    alexanderStudentRecId = existingStudentRec.id;
    await run(
      'UPDATE students SET email = ?, full_name = ?, status = ?, updated_at = ? WHERE id = ?',
      ['alexander.hayes@hostel.com', 'Alexander Hayes', 'Active', now, alexanderStudentRecId]
    );
  } else {
    await run(
      `INSERT INTO students (id, user_id, student_id, full_name, email, phone, gender, dob, department, year, parent_name, parent_phone, address, hostel_id, room_id, bed_number, joining_date, status, created_at, updated_at)
       VALUES ('student_rec_01', ?, 'STU-2024-101', 'Alexander Hayes', 'alexander.hayes@hostel.com', '+1 (555) 901-1111', 'Male', '2004-03-14', 'Computer Science', '3rd Year', 'Michael Hayes', '+1 (555) 901-2222', '742 Evergreen Terrace, Springfield, OR', 'hostel_01', 'room_block_01_1_1', 1, '2024-08-01', 'Active', ?, ?)`,
      [studentUserId, now, now]
    );
  }

  // Make sure all other existing users have password_hash and active status
  await run('UPDATE users SET password_hash = password WHERE password_hash IS NULL;');
  await run('UPDATE users SET password = password_hash WHERE password IS NULL;');
  await run('UPDATE users SET status = "active" WHERE status IS NULL;');

  // ============================================================
  // 2. HOSTELS & BLOCKS (Check if exists)
  // ============================================================
  const existingHostel = await queryOne('SELECT id FROM hostels LIMIT 1');
  if (!existingHostel) {
    const hostels = [
      { id: 'hostel_01', name: 'Aryabhata Boys Hostel', code: 'ABH-01', gender_type: 'Boys', total_floors: 4, contact_phone: '+1 (555) 234-5678' },
      { id: 'hostel_02', name: 'Gargi Girls Hostel', code: 'GGH-02', gender_type: 'Girls', total_floors: 4, contact_phone: '+1 (555) 345-6789' },
      { id: 'hostel_03', name: 'Ramanujan Scholar Residence', code: 'RSR-03', gender_type: 'Co-Ed', total_floors: 3, contact_phone: '+1 (555) 456-7890' }
    ];

    for (const h of hostels) {
      await run(
        `INSERT INTO hostels (id, name, code, gender_type, total_floors, contact_phone, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [h.id, h.name, h.code, h.gender_type, h.total_floors, h.contact_phone, now]
      );
    }

    const blocks = [
      { id: 'block_01', hostel_id: 'hostel_01', name: 'Block A (Engineering)', code: 'A', floors_count: 4 },
      { id: 'block_02', hostel_id: 'hostel_01', name: 'Block B (Science)', code: 'B', floors_count: 4 },
      { id: 'block_03', hostel_id: 'hostel_02', name: 'Block C (Main Wing)', code: 'C', floors_count: 4 },
      { id: 'block_04', hostel_id: 'hostel_02', name: 'Block D (New Wing)', code: 'D', floors_count: 4 },
      { id: 'block_05', hostel_id: 'hostel_03', name: 'Block E (Postgraduate)', code: 'E', floors_count: 3 }
    ];

    for (const b of blocks) {
      await run(
        `INSERT INTO blocks (id, hostel_id, name, code, floors_count)
         VALUES (?, ?, ?, ?, ?)`,
        [b.id, b.hostel_id, b.name, b.code, b.floors_count]
      );
    }
  }

  // ============================================================
  // 3. ROOMS AND BEDS (Check if exists)
  // ============================================================
  const existingRoom = await queryOne('SELECT id FROM rooms LIMIT 1');
  if (!existingRoom) {
    const blocks = await query<{ id: string; hostel_id: string }>('SELECT id, hostel_id FROM blocks');
    const roomTypes = [
      { type: 'Single', capacity: 1 },
      { type: 'Double', capacity: 2 },
      { type: 'Triple', capacity: 3 },
      { type: 'Four Bed', capacity: 4 }
    ];

    for (const b of blocks) {
      for (let floor = 1; floor <= 2; floor++) {
        for (let r = 1; r <= 3; r++) {
          const roomNum = `${floor}0${r}`;
          const roomTypeObj = roomTypes[(floor + r) % roomTypes.length];
          const roomId = `room_${b.id}_${floor}_${r}`;

          await run(
            `INSERT INTO rooms (id, hostel_id, block_id, room_number, floor, room_type, capacity, occupied_beds, available_beds, status, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, 'Available', ?, ?)`,
            [roomId, b.hostel_id, b.id, roomNum, floor, roomTypeObj.type, roomTypeObj.capacity, roomTypeObj.capacity, now, now]
          );

          for (let bedNo = 1; bedNo <= roomTypeObj.capacity; bedNo++) {
            const bedId = `bed_${roomId}_${bedNo}`;
            await run(
              `INSERT INTO beds (id, room_id, bed_number, status, student_id)
               VALUES (?, ?, ?, 'Available', NULL)`,
              [bedId, roomId, bedNo]
            );
          }
        }
      }
    }
  }

  // ============================================================
  // 4. SECOND WARDEN & OTHER STUDENTS (Upsert)
  // ============================================================
  const existingWarden2 = await queryOne(
    'SELECT id FROM users WHERE id = ? OR LOWER(email) = ?',
    ['user_warden_02', 'warden.beta@hostel.edu']
  );
  if (existingWarden2) {
    await run(
      'UPDATE users SET name = ?, email = ?, password = ?, password_hash = ?, role = ?, status = ?, updated_at = ? WHERE id = ?',
      ['Dr. Evelyn Martinez', 'warden.beta@hostel.edu', generalPasswordHash, generalPasswordHash, 'warden', 'active', now, existingWarden2.id]
    );
  } else {
    await run(
      `INSERT INTO users (id, name, email, password, password_hash, role, status, avatar, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'warden', 'active', ?, ?, ?)`,
      [
        'user_warden_02',
        'Dr. Evelyn Martinez',
        'warden.beta@hostel.edu',
        generalPasswordHash,
        generalPasswordHash,
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        now,
        now
      ]
    );

    await run(
      `INSERT INTO wardens (id, user_id, warden_id, name, email, phone, hostel_id, block_id, status, created_at, updated_at)
       VALUES (?, ?, 'WRD-2024-002', 'Dr. Evelyn Martinez', 'warden.beta@hostel.edu', '+1 (555) 202-3030', 'hostel_02', 'block_03', 'Active', ?, ?)`,
      ['warden_rec_WRD-2024-002', 'user_warden_02', now, now]
    );
  }

  // Additional students
  const additionalStudents = [
    { id: 'user_student_2', name: 'Sophia Sterling', email: 'sophia.sterling@hostel.edu', phone: '+1 (555) 901-1112', gender: 'Female', dept: 'Electrical Engineering', year: '2nd Year', hostelId: 'hostel_02', blockId: 'block_03', room: 'room_block_03_1_1' },
    { id: 'user_student_3', name: 'Marcus Brody', email: 'marcus.brody@hostel.edu', phone: '+1 (555) 901-1113', gender: 'Male', dept: 'Mechanical Engineering', year: '4th Year', hostelId: 'hostel_01', blockId: 'block_01', room: 'room_block_01_1_1' },
    { id: 'user_student_4', name: 'Emma Watson-Lee', email: 'emma.watson@hostel.edu', phone: '+1 (555) 901-1114', gender: 'Female', dept: 'Biotechnology', year: '1st Year', hostelId: 'hostel_02', blockId: 'block_04', room: 'room_block_04_1_1' },
    { id: 'user_student_5', name: 'Liam Zhang', email: 'liam.zhang@hostel.edu', phone: '+1 (555) 901-1115', gender: 'Male', dept: 'Civil Engineering', year: '3rd Year', hostelId: 'hostel_01', blockId: 'block_02', room: 'room_block_02_1_1' },
    { id: 'user_student_6', name: 'Olivia Martinez', email: 'olivia.m@hostel.edu', phone: '+1 (555) 901-1116', gender: 'Female', dept: 'Architecture', year: '2nd Year', hostelId: 'hostel_02', blockId: 'block_03', room: 'room_block_03_1_2' },
    { id: 'user_student_7', name: 'Ethan Cole', email: 'ethan.cole@hostel.edu', phone: '+1 (555) 901-1117', gender: 'Male', dept: 'Computer Science', year: '1st Year', hostelId: 'hostel_01', blockId: 'block_01', room: 'room_block_01_1_2' },
    { id: 'user_student_8', name: 'Maya Patel', email: 'maya.patel@hostel.edu', phone: '+1 (555) 901-1118', gender: 'Female', dept: 'Information Technology', year: '3rd Year', hostelId: 'hostel_02', blockId: 'block_04', room: 'room_block_04_1_2' },
    { id: 'user_student_9', name: 'Noah Bennett', email: 'noah.bennett@hostel.edu', phone: '+1 (555) 901-1119', gender: 'Male', dept: 'Physics', year: '4th Year', hostelId: 'hostel_03', blockId: 'block_05', room: 'room_block_05_1_1' },
    { id: 'user_student_10', name: 'Ava Robinson', email: 'ava.robinson@hostel.edu', phone: '+1 (555) 901-1120', gender: 'Female', dept: 'Mathematics', year: '2nd Year', hostelId: 'hostel_03', blockId: 'block_05', room: 'room_block_05_1_2' }
  ];

  for (const s of additionalStudents) {
    const exists = await queryOne('SELECT id FROM users WHERE id = ? OR LOWER(email) = LOWER(?)', [s.id, s.email]);
    if (exists) {
      await run(
        'UPDATE users SET name = ?, email = ?, password = ?, password_hash = ?, role = ?, status = ?, updated_at = ? WHERE id = ?',
        [s.name, s.email, studentPasswordHash, studentPasswordHash, 'student', 'active', now, exists.id]
      );
    } else {
      await run(
        `INSERT INTO users (id, name, email, password, password_hash, role, status, avatar, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'student', 'active', ?, ?, ?)`,
        [
          s.id,
          s.name,
          s.email,
          studentPasswordHash,
          studentPasswordHash,
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(s.name)}`,
          now,
          now
        ]
      );
    }

    const stuRecId = `student_rec_${s.id}`;
    const recExists = await queryOne('SELECT id FROM students WHERE id = ? OR user_id = ?', [stuRecId, s.id]);
    if (recExists) {
      await run(
        'UPDATE students SET full_name = ?, email = ?, phone = ?, gender = ?, department = ?, year = ?, hostel_id = ?, status = ?, updated_at = ? WHERE id = ?',
        [s.name, s.email, s.phone, s.gender, s.dept, s.year, s.hostelId, 'Active', now, recExists.id]
      );
    } else {
      await run(
        `INSERT INTO students (id, user_id, student_id, full_name, email, phone, gender, dob, department, year, parent_name, parent_phone, address, hostel_id, room_id, bed_number, joining_date, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, '2004-05-10', ?, ?, 'Parent of ' || ?, '+1 (555) 999-8888', 'Campus Hostel District', ?, ?, 1, '2024-08-01', 'Active', ?, ?)`,
        [stuRecId, s.id, `STU-2024-${s.id.split('_')[2]}`, s.name, s.email, s.phone, s.gender, s.dept, s.year, s.name, s.hostelId, s.room, now, now]
      );
    }
  }

  // ============================================================
  // 5. ALLOCATE ALEXANDER HAYES & ROOM OCCUPANCY
  // ============================================================
  const targetRoomId = 'room_block_01_1_1';
  await run(
    'UPDATE students SET room_id = ?, bed_number = 1 WHERE id = ?',
    [targetRoomId, alexanderStudentRecId]
  );

  await run(
    'UPDATE beds SET status = "Occupied", student_id = ? WHERE room_id = ? AND bed_number = 1',
    [alexanderStudentRecId, targetRoomId]
  );

  const existingAlloc = await queryOne('SELECT id FROM room_allocations WHERE student_id = ?', [alexanderStudentRecId]);
  if (!existingAlloc) {
    await run(
      `INSERT INTO room_allocations (id, student_id, hostel_id, room_id, bed_number, allocated_date, status, allocated_by, notes, created_at)
       VALUES ('alloc_01', ?, 'hostel_01', ?, 1, '2024-08-01', 'Active', 'Dr. Robert Vance', 'Assigned upon enrollment', ?)`,
      [alexanderStudentRecId, targetRoomId, now]
    );
  }

  // Sync room occupancy numbers
  const allRooms = await query<{ id: string; capacity: number }>('SELECT id, capacity FROM rooms');
  for (const r of allRooms) {
    const occupiedCount = (await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM beds WHERE room_id = ? AND status = "Occupied"', [r.id]))?.count || 0;
    const availableBeds = Math.max(0, r.capacity - occupiedCount);
    let status = 'Available';
    if (occupiedCount >= r.capacity) status = 'Full';
    else if (occupiedCount > 0) status = 'Partially Occupied';

    await run(
      'UPDATE rooms SET occupied_beds = ?, available_beds = ?, status = ? WHERE id = ?',
      [occupiedCount, availableBeds, status, r.id]
    );
  }

  // ============================================================
  // 6. ATTENDANCE SEED (Last 14 days)
  // ============================================================
  const existingAttendance = await queryOne('SELECT id FROM attendance LIMIT 1');
  if (!existingAttendance) {
    for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
      const d = new Date();
      d.setDate(d.getDate() - dayOffset);
      const dateStr = d.toISOString().split('T')[0];
      const status = dayOffset === 4 ? 'Leave' : dayOffset === 9 ? 'Late' : 'Present';
      await run(
        `INSERT INTO attendance (id, student_id, date, status, marked_by, remarks, created_at)
         VALUES (?, ?, ?, ?, 'Prof. Arthur Pendelton', 'Biometric turnstile check', ?)`,
        [`att_${dateStr}_alexander`, alexanderStudentRecId, dateStr, status, now]
      );
    }
  }

  // ============================================================
  // 7. COMPLAINTS SEED
  // ============================================================
  const existingComplaint = await queryOne('SELECT id FROM complaints LIMIT 1');
  if (!existingComplaint) {
    const sampleComplaints = [
      {
        id: 'comp_01',
        complaintId: 'CMP-2026-001',
        studentId: alexanderStudentRecId,
        category: 'Electrical',
        title: 'Study lamp fixture flickering in Room 101',
        description: 'The overhead study lamp above bed 1 flickers constantly when turned on. Causes eyestrain during late evening study hours.',
        priority: 'Medium',
        status: 'In Progress',
        warden: 'Prof. Arthur Pendelton',
        notes: 'Campus maintenance electrician dispatched.'
      },
      {
        id: 'comp_02',
        complaintId: 'CMP-2026-002',
        studentId: alexanderStudentRecId,
        category: 'Wi-Fi & Internet',
        title: 'Weak Wi-Fi signal in corner of Block A floor 1',
        description: 'Speed drops below 1 Mbps between 8 PM and 11 PM. Difficult to access campus LMS video lectures.',
        priority: 'High',
        status: 'Resolved',
        warden: 'Prof. Arthur Pendelton',
        notes: 'Access point rebooted and antenna adjusted. Signal restored to 85 Mbps.'
      }
    ];

    for (const c of sampleComplaints) {
      await run(
        `INSERT INTO complaints (id, complaint_id, student_id, category, title, description, priority, status, assigned_warden, resolution_notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [c.id, c.complaintId, c.studentId, c.category, c.title, c.description, c.priority, c.status, c.warden, c.notes, now, now]
      );
    }
  }

  // ============================================================
  // 8. LEAVE REQUESTS SEED
  // ============================================================
  const existingLeave = await queryOne('SELECT id FROM leave_requests LIMIT 1');
  if (!existingLeave) {
    await run(
      `INSERT INTO leave_requests (id, leave_id, student_id, from_date, to_date, reason, destination, emergency_contact, status, reviewed_by, review_notes, created_at, updated_at)
       VALUES ('leave_01', 'LVE-2026-042', ?, '2026-10-05', '2026-10-08', 'Attending National Collegiate AI Hackathon at Tech City', 'Grand Tech Convention Center, Seattle, WA', '+1 (555) 901-2222', 'Approved', 'Prof. Arthur Pendelton', 'Official college sponsorship letter attached. Safe travels.', ?, ?)`,
      [alexanderStudentRecId, now, now]
    );
  }

  // ============================================================
  // 9. FOOD MENUS SEED
  // ============================================================
  const existingMenu = await queryOne('SELECT id FROM food_menus LIMIT 1');
  if (!existingMenu) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const menuTemplates = [
      { meal: 'Breakfast', timings: '07:30 - 09:30 AM', items: 'Oatmeal Porridge, Scrambled Eggs, Whole Wheat Toast, Fresh Seasonal Fruit, Tea & Coffee' },
      { meal: 'Lunch', timings: '12:30 - 02:30 PM', items: 'Basmati Rice, Yellow Lentil Dal, Paneer Tikka Masala / Grilled Herb Chicken, Cucumber Raita, Fresh Green Salad' },
      { meal: 'Snacks', timings: '05:00 - 06:00 PM', items: 'Crispy Veg Samosas / Banana Walnut Bread, Masala Chai, Filter Coffee' },
      { meal: 'Dinner', timings: '07:30 - 09:30 PM', items: 'Steamed Rice, Garlic Naan, Mixed Vegetable Curry, Grilled Tofu / Butter Chicken, Gulab Jamun dessert' }
    ];

    for (const d of days) {
      for (const m of menuTemplates) {
        const isSpecial = (d === 'Sunday' && m.meal === 'Lunch') || (d === 'Wednesday' && m.meal === 'Dinner') ? 1 : 0;
        await run(
          `INSERT INTO food_menus (id, day_of_week, meal_type, items, timings, is_special, special_notes, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [`menu_${d}_${m.meal}`, d, m.meal, m.items, m.timings, isSpecial, isSpecial ? 'Special Chef Feast' : null, now]
        );
      }
    }
  }

  // ============================================================
  // 10. FOOD WASTAGE LOGS (Last 7 days)
  // ============================================================
  const existingWastage = await queryOne('SELECT id FROM food_wastage LIMIT 1');
  if (!existingWastage) {
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const prepKg = 120 + Math.floor(Math.sin(i) * 15);
      const wastedKg = Number((4.5 + Math.random() * 3.5).toFixed(1));
      const consumedKg = Number((prepKg - wastedKg).toFixed(1));
      const costPerKg = 3.5;
      const totalCost = Number((wastedKg * costPerKg).toFixed(2));

      await run(
        `INSERT INTO food_wastage (id, hostel_id, date, meal_type, prepared_quantity_kg, consumed_quantity_kg, wasted_quantity_kg, attended_students_count, cost_per_kg, total_cost_wasted, notes, created_at)
         VALUES (?, 'hostel_01', ?, 'Dinner', ?, ?, ?, 92, ?, ?, 'Evening dinner mess audit', ?)`,
        [`fw_${dateStr}_dinner`, dateStr, prepKg, consumedKg, wastedKg, costPerKg, totalCost, now]
      );
    }
  }

  // ============================================================
  // 11. FEES SEED
  // ============================================================
  const existingFees = await queryOne('SELECT id FROM fees LIMIT 1');
  if (!existingFees) {
    const feeInvoices = [
      {
        id: 'fee_01',
        inv: 'INV-2026-AUG-101',
        studentId: alexanderStudentRecId,
        title: 'Fall Semester Room & Maintenance Fee 2026',
        type: 'Hostel Accommodation',
        amount: 2400,
        paid: 2400,
        pending: 0,
        due: '2026-08-15',
        status: 'Paid',
        paidDate: '2026-08-10',
        method: 'Online Card Payment',
        ref: 'TXN_CARD_9921882'
      },
      {
        id: 'fee_02',
        inv: 'INV-2026-OCT-101',
        studentId: alexanderStudentRecId,
        title: 'Semester Dining & Mess Membership (Oct - Dec)',
        type: 'Mess Catering',
        amount: 850,
        paid: 0,
        pending: 850,
        due: '2026-10-15',
        status: 'Pending',
        paidDate: null,
        method: null,
        ref: null
      }
    ];

    for (const f of feeInvoices) {
      await run(
        `INSERT INTO fees (id, invoice_number, student_id, title, fee_type, amount, paid_amount, pending_amount, due_date, status, paid_date, payment_method, transaction_ref, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [f.id, f.inv, f.studentId, f.title, f.type, f.amount, f.paid, f.pending, f.due, f.status, f.paidDate, f.method, f.ref, now]
      );
    }
  }

  // ============================================================
  // 12. EXPENSES SEED
  // ============================================================
  const existingExpenses = await queryOne('SELECT id FROM expenses LIMIT 1');
  if (!existingExpenses) {
    const expensesList = [
      { id: 'exp_01', hostelId: 'hostel_01', cat: 'Utilities & Power', title: 'Monthly High-Voltage Electricity Bill (Block A & B)', amt: 3450, date: '2026-09-01', vendor: 'City Energy Power Corp' },
      { id: 'exp_02', hostelId: 'hostel_01', cat: 'Mess & Food Supply', title: 'Organic Farm Fresh Vegetables & Dairy Weekly Bulk', amt: 2150, date: '2026-09-12', vendor: 'Valley Wholesale Farms' },
      { id: 'exp_03', hostelId: 'hostel_02', cat: 'Repairs & Maintenance', title: 'Plumbing repair & solar water heater maintenance', amt: 850, date: '2026-09-18', vendor: 'Apex Plumbing Services' },
      { id: 'exp_04', hostelId: 'hostel_01', cat: 'Security & Surveillance', title: 'Biometric Access turnstile bi-annual firmware maintenance', amt: 620, date: '2026-09-20', vendor: 'SecureAccess Global' }
    ];

    for (const exp of expensesList) {
      await run(
        `INSERT INTO expenses (id, hostel_id, category, title, amount, expense_date, description, vendor, added_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'Scheduled monthly operational cost', ?, 'Administrator', ?)`,
        [exp.id, exp.hostelId, exp.cat, exp.title, exp.amt, exp.date, exp.vendor, now]
      );
    }
  }

  // ============================================================
  // 13. ANNOUNCEMENTS SEED
  // ============================================================
  const existingAnnouncements = await queryOne('SELECT id FROM announcements LIMIT 1');
  if (!existingAnnouncements) {
    const notices = [
      {
        id: 'ann_01',
        title: 'Semester Mid-Term Night Study Hours Extension',
        content: 'The central library, Block A common study hall, and courtyard Wi-Fi zones will remain open 24/7 during mid-term examination week. Cafeteria will serve midnight coffee and light snacks.',
        audience: 'All Students',
        urgent: 0,
        author: 'Administrator',
        role: 'Chief Warden / Admin'
      },
      {
        id: 'ann_02',
        title: 'Mandatory Fire Safety Drill on Saturday 10:00 AM',
        content: 'Annual comprehensive campus fire safety drill and emergency stairwell evacuation practice scheduled for all resident blocks. All students and wardens must participate.',
        audience: 'Campus-wide',
        urgent: 1,
        author: 'Prof. Arthur Pendelton',
        role: 'Hostel Warden'
      }
    ];

    for (const a of notices) {
      await run(
        `INSERT INTO announcements (id, title, content, audience, target_hostel_id, is_urgent, author_name, author_role, created_at)
         VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?)`,
        [a.id, a.title, a.content, a.audience, a.urgent, a.author, a.role, now]
      );
    }
  }

  // ============================================================
  // 14. VISITORS SEED
  // ============================================================
  const existingVisitors = await queryOne('SELECT id FROM visitors LIMIT 1');
  if (!existingVisitors) {
    await run(
      `INSERT INTO visitors (id, visitor_name, student_id, student_name, phone, purpose, entry_time, exit_time, id_proof_type, id_proof_number, status, hostel_id, warden_id, created_at)
       VALUES ('vis_01', 'Michael Hayes', ?, 'Alexander Hayes', '+1 (555) 901-2222', 'Family visit and delivering books', '2026-09-23 09:30', NULL, 'National ID', 'NID-77221199', 'Inside', 'hostel_01', 'user_warden_01', ?)`,
      [alexanderStudentRecId, now]
    );
  }

  // ============================================================
  // 15. NOTIFICATIONS SEED
  // ============================================================
  const existingNotif = await queryOne('SELECT id FROM notifications LIMIT 1');
  if (!existingNotif) {
    const notifs = [
      { id: 'notif_01', userId: adminUserId, role: 'admin', title: 'System Active', msg: 'HostelSphere operations hub initialized successfully.', type: 'general', link: '/admin/dashboard' },
      { id: 'notif_02', userId: wardenUserId, role: 'warden', title: 'Night Curfew Verification', msg: 'Daily roll call attendance register ready for verification.', type: 'attendance', link: '/warden/attendance' },
      { id: 'notif_03', userId: studentUserId, role: 'student', title: 'Room Allocation Confirmed', msg: 'Welcome Alexander Hayes! You are assigned to Room 101, Bed 1.', type: 'allocation', link: '/student/room' }
    ];

    for (const n of notifs) {
      await run(
        `INSERT INTO notifications (id, user_id, role, title, message, type, is_read, link, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`,
        [n.id, n.userId, n.role, n.title, n.msg, n.type, n.link, now]
      );
    }
  }

  flushSaveToDisk();

  console.log('✅ Database seeded and demo credentials verified:');
  console.log('   - Admin:   admin@hostel.com / Admin123! (Role: admin)');
  console.log('   - Warden:  warden.boys@hostel.com / Warden123! (Role: warden)');
  console.log('   - Student: alexander.hayes@hostel.com / Student123! (Role: student)');
}

import { exec, query, queryOne } from './database.js';

export async function initDatabaseSchema() {
  const schemaSql = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(LOWER(role) IN ('admin', 'warden', 'student')),
      status TEXT NOT NULL DEFAULT 'active' CHECK(LOWER(status) IN ('active', 'inactive', 'suspended')),
      avatar TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS hostels (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      gender_type TEXT NOT NULL CHECK(gender_type IN ('Boys', 'Girls', 'Co-Ed')),
      total_floors INTEGER NOT NULL DEFAULT 4,
      contact_phone TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS blocks (
      id TEXT PRIMARY KEY,
      hostel_id TEXT NOT NULL,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      floors_count INTEGER NOT NULL DEFAULT 4,
      FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      hostel_id TEXT NOT NULL,
      block_id TEXT NOT NULL,
      room_number TEXT NOT NULL,
      floor INTEGER NOT NULL,
      room_type TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      occupied_beds INTEGER NOT NULL DEFAULT 0,
      available_beds INTEGER NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('Available', 'Partially Occupied', 'Full', 'Maintenance')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE,
      FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS beds (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      bed_number INTEGER NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('Available', 'Occupied', 'Maintenance')),
      student_id TEXT,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS wardens (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      warden_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      hostel_id TEXT,
      block_id TEXT,
      status TEXT NOT NULL DEFAULT 'Active' CHECK(status IN ('Active', 'On Leave', 'Inactive')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      student_id TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      gender TEXT NOT NULL,
      dob TEXT,
      department TEXT NOT NULL,
      year TEXT NOT NULL,
      parent_name TEXT,
      parent_phone TEXT,
      address TEXT,
      hostel_id TEXT,
      room_id TEXT,
      bed_number INTEGER,
      joining_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Active' CHECK(status IN ('Active', 'Suspended', 'Alumni')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS room_allocations (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      hostel_id TEXT NOT NULL,
      room_id TEXT NOT NULL,
      bed_number INTEGER NOT NULL,
      allocated_date TEXT NOT NULL,
      vacated_date TEXT,
      status TEXT NOT NULL DEFAULT 'Active' CHECK(status IN ('Active', 'Vacated', 'Transferred')),
      allocated_by TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('Present', 'Absent', 'Late', 'Leave')),
      marked_by TEXT,
      remarks TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS complaints (
      id TEXT PRIMARY KEY,
      complaint_id TEXT UNIQUE NOT NULL,
      student_id TEXT NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      priority TEXT NOT NULL CHECK(priority IN ('Low', 'Medium', 'High', 'Urgent')),
      status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'In Progress', 'Resolved', 'Rejected')),
      assigned_warden TEXT,
      resolution_notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS leave_requests (
      id TEXT PRIMARY KEY,
      leave_id TEXT UNIQUE NOT NULL,
      student_id TEXT NOT NULL,
      from_date TEXT NOT NULL,
      to_date TEXT NOT NULL,
      departure_date TEXT,
      expected_return TEXT,
      reason TEXT NOT NULL,
      destination TEXT NOT NULL,
      destination_address TEXT,
      emergency_contact TEXT NOT NULL,
      parent_guardian_contact TEXT,
      status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Approved', 'Rejected', 'Cancelled', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
      reviewed_by TEXT,
      reviewed_at TEXT,
      review_notes TEXT,
      rejection_reason TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS food_menus (
      id TEXT PRIMARY KEY,
      day_of_week TEXT NOT NULL,
      meal_type TEXT NOT NULL CHECK(meal_type IN ('Breakfast', 'Lunch', 'Snacks', 'Dinner')),
      items TEXT NOT NULL,
      timings TEXT,
      is_special INTEGER NOT NULL DEFAULT 0,
      special_notes TEXT,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS food_wastage (
      id TEXT PRIMARY KEY,
      hostel_id TEXT,
      date TEXT NOT NULL,
      meal_type TEXT NOT NULL,
      prepared_quantity_kg REAL NOT NULL,
      consumed_quantity_kg REAL NOT NULL,
      wasted_quantity_kg REAL NOT NULL,
      attended_students_count INTEGER NOT NULL,
      cost_per_kg REAL NOT NULL DEFAULT 3.5,
      total_cost_wasted REAL NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS fees (
      id TEXT PRIMARY KEY,
      invoice_number TEXT UNIQUE NOT NULL,
      student_id TEXT NOT NULL,
      title TEXT NOT NULL,
      fee_type TEXT NOT NULL,
      amount REAL NOT NULL,
      paid_amount REAL NOT NULL DEFAULT 0,
      pending_amount REAL NOT NULL,
      due_date TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('Paid', 'Pending', 'Overdue', 'Partially Paid')),
      paid_date TEXT,
      payment_method TEXT,
      transaction_ref TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      hostel_id TEXT NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      expense_date TEXT NOT NULL,
      description TEXT,
      vendor TEXT,
      added_by TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      audience TEXT NOT NULL CHECK(audience IN ('All Students', 'Wardens Only', 'Campus-wide', 'Specific Hostel')),
      target_hostel_id TEXT,
      is_urgent INTEGER NOT NULL DEFAULT 0,
      author_name TEXT NOT NULL,
      author_role TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS visitors (
      id TEXT PRIMARY KEY,
      hostel_id TEXT NOT NULL,
      visitor_name TEXT NOT NULL,
      student_id TEXT NOT NULL,
      relation TEXT NOT NULL,
      phone TEXT NOT NULL,
      purpose TEXT NOT NULL,
      entry_time TEXT NOT NULL,
      exit_time TEXT,
      id_proof_type TEXT,
      id_proof_number TEXT,
      vehicle_number TEXT,
      approved_by TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      role TEXT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'general',
      is_read INTEGER NOT NULL DEFAULT 0,
      link TEXT,
      created_at TEXT NOT NULL
    );

    -- Indexes for high-performance lookup
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(email));
    CREATE INDEX IF NOT EXISTS idx_students_user ON students(user_id);
    CREATE INDEX IF NOT EXISTS idx_students_hostel ON students(hostel_id);
    CREATE INDEX IF NOT EXISTS idx_wardens_user ON wardens(user_id);
    CREATE INDEX IF NOT EXISTS idx_rooms_hostel ON rooms(hostel_id);
    CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
    CREATE INDEX IF NOT EXISTS idx_complaints_student ON complaints(student_id);
    CREATE INDEX IF NOT EXISTS idx_leave_student ON leave_requests(student_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
  `;

  await exec(schemaSql);

  // Run migration on existing users table if columns are missing or check constraints need update
  try {
    const userTableSql = await queryOne<{ sql: string }>("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'");
    if (userTableSql && (!userTableSql.sql.includes('password_hash') || !userTableSql.sql.includes('status') || userTableSql.sql.includes("role IN ('ADMIN'"))) {
      await exec(`
        PRAGMA foreign_keys = OFF;
        CREATE TABLE IF NOT EXISTS users_temp (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL CHECK(LOWER(role) IN ('admin', 'warden', 'student')),
          status TEXT NOT NULL DEFAULT 'active' CHECK(LOWER(status) IN ('active', 'inactive', 'suspended')),
          avatar TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        INSERT OR IGNORE INTO users_temp (id, name, email, password_hash, password, role, status, avatar, created_at, updated_at)
        SELECT id, name, email, password, password, LOWER(role), 'active', avatar, created_at, updated_at FROM users;
        DROP TABLE users;
        ALTER TABLE users_temp RENAME TO users;
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(email));
        PRAGMA foreign_keys = ON;
      `);
    }

    // Ensure leave_requests table has all necessary columns and supports PENDING / CANCELLED / etc.
    const leaveTableSql = await queryOne<{ sql: string }>("SELECT sql FROM sqlite_master WHERE type='table' AND name='leave_requests'");
    if (leaveTableSql && (!leaveTableSql.sql.includes('departure_date') || !leaveTableSql.sql.includes('destination_address') || !leaveTableSql.sql.includes('Cancelled') || !leaveTableSql.sql.includes('PENDING'))) {
      await exec(`
        PRAGMA foreign_keys = OFF;
        CREATE TABLE IF NOT EXISTS leave_requests_v2 (
          id TEXT PRIMARY KEY,
          leave_id TEXT UNIQUE NOT NULL,
          student_id TEXT NOT NULL,
          from_date TEXT NOT NULL,
          to_date TEXT NOT NULL,
          departure_date TEXT,
          expected_return TEXT,
          reason TEXT NOT NULL,
          destination TEXT NOT NULL,
          destination_address TEXT,
          emergency_contact TEXT NOT NULL,
          parent_guardian_contact TEXT,
          status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Approved', 'Rejected', 'Cancelled', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
          reviewed_by TEXT,
          reviewed_at TEXT,
          review_notes TEXT,
          rejection_reason TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
        );
        INSERT OR REPLACE INTO leave_requests_v2 (
          id, leave_id, student_id, from_date, to_date, departure_date, expected_return,
          reason, destination, destination_address, emergency_contact, parent_guardian_contact,
          status, reviewed_by, reviewed_at, review_notes, rejection_reason, created_at, updated_at
        )
        SELECT
          id, leave_id, student_id, from_date, to_date,
          COALESCE(from_date, ''), COALESCE(to_date, ''),
          reason, destination, destination, emergency_contact, emergency_contact,
          status, reviewed_by, NULL, review_notes, review_notes, created_at, updated_at
        FROM leave_requests;
        DROP TABLE leave_requests;
        ALTER TABLE leave_requests_v2 RENAME TO leave_requests;
        PRAGMA foreign_keys = ON;
      `);
    }
  } catch (migErr) {
    console.warn('Database schema migration note:', migErr);
  }
}

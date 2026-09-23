export type UserRole = 'ADMIN' | 'WARDEN' | 'STUDENT' | 'admin' | 'warden' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status?: string;
  avatar?: string;
  studentId?: string;
  studentRecordId?: string;
  wardenRecordId?: string;
  hostelId?: string;
  blockId?: string;
}

export interface Student {
  id: string;
  user_id: string;
  student_id: string;
  full_name: string;
  email: string;
  phone: string;
  gender: string;
  dob?: string;
  department: string;
  year?: string;
  parent_name?: string;
  parent_phone?: string;
  address?: string;
  hostel_id?: string;
  room_id?: string | null;
  bed_number?: number | null;
  joining_date?: string;
  date_of_joining?: string;
  blood_group?: string;
  status: 'Active' | 'Suspended' | 'Alumni';
  avatar?: string;
  hostel_name?: string;
  block_name?: string;
  room_number?: string;
  total_present?: number;
  total_attendance?: number;
  fee_pending?: number;
  created_at: string;
  updated_at?: string;
}

export interface Warden {
  id: string;
  user_id?: string;
  warden_id: string;
  name: string;
  email: string;
  phone: string;
  hostel_id: string;
  block_id: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  avatar?: string;
  hostel_name?: string;
  block_name?: string;
  assigned_students_count?: number;
  assigned_rooms_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Hostel {
  id: string;
  name: string;
  code: string;
  gender_type: 'Boys' | 'Girls' | 'Co-Ed';
  total_floors?: number;
  contact_phone?: string;
  total_blocks?: number;
  total_rooms?: number;
  total_capacity?: number;
  total_occupied?: number;
  created_at?: string;
}

export interface Block {
  id: string;
  hostel_id: string;
  name: string;
  code: string;
  floors_count?: number;
  hostel_name?: string;
}

export interface Bed {
  id: string;
  room_id: string;
  bed_number: number;
  status: 'Available' | 'Occupied' | 'Maintenance';
  student_id?: string | null;
  student_name?: string;
  student_roll?: string;
  department?: string;
  year?: string;
}

export interface Room {
  id: string;
  hostel_id: string;
  block_id: string;
  room_number: string;
  floor: number;
  room_type: string;
  capacity: number;
  occupied_beds: number;
  available_beds: number;
  status: 'Available' | 'Partially Occupied' | 'Full' | 'Maintenance';
  hostel_name?: string;
  block_name?: string;
  block_code?: string;
  beds?: Bed[];
  created_at?: string;
  updated_at?: string;
}

export interface RoomAllocation {
  id: string;
  student_id: string;
  hostel_id: string;
  room_id: string;
  bed_number: number;
  allocated_date: string;
  vacated_date?: string | null;
  status: 'Active' | 'Vacated' | 'Transferred';
  allocated_by?: string;
  notes?: string;
  student_name?: string;
  student_roll?: string;
  department?: string;
  hostel_name?: string;
  room_number?: string;
  block_name?: string;
  created_at?: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  hostel_id?: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
  marked_by?: string;
  remarks?: string;
  student_name?: string;
  student_roll?: string;
  department?: string;
  year?: string;
  room_number?: string;
  hostel_name?: string;
  created_at?: string;
}

export interface Complaint {
  id: string;
  complaint_id?: string;
  student_id: string;
  category: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';
  assigned_warden?: string;
  resolution_notes?: string;
  student_name?: string;
  student_roll?: string;
  student_phone?: string;
  hostel_name?: string;
  room_number?: string;
  block_name?: string;
  created_at: string;
  updated_at?: string;
}

export interface LeaveRequest {
  id: string;
  leave_id?: string;
  student_id: string;
  from_date: string;
  to_date: string;
  reason: string;
  destination: string;
  emergency_contact: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reviewed_by?: string;
  review_notes?: string;
  student_name?: string;
  student_roll?: string;
  student_phone?: string;
  department?: string;
  hostel_name?: string;
  room_number?: string;
  created_at: string;
  updated_at?: string;
}

export interface FoodMenu {
  id: string;
  day_of_week: string;
  meal_type: string;
  items: string;
  timings?: string;
  is_special?: number;
  special_notes?: string;
  is_active?: number;
  updated_at?: string;
}

export interface FoodWastageLog {
  id: string;
  hostel_id?: string;
  date: string;
  meal_type: string;
  prepared_quantity_kg: number;
  consumed_quantity_kg: number;
  wasted_quantity_kg: number;
  attended_students_count: number;
  cost_per_kg: number;
  total_cost_wasted: number;
  notes?: string;
  created_at?: string;
}

export interface FoodWastageRecord extends FoodWastageLog {}

export interface FeeInvoice {
  id: string;
  invoice_number?: string;
  student_id: string;
  title: string;
  fee_type: string;
  amount: number;
  due_date: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  paid_date?: string | null;
  payment_method?: string | null;
  transaction_ref?: string | null;
  student_name?: string;
  student_roll?: string;
  department?: string;
  hostel_name?: string;
  created_at?: string;
}

export interface Fee extends FeeInvoice {}

export interface HostelExpense {
  id: string;
  hostel_id: string;
  category: string;
  title: string;
  amount: number;
  expense_date: string;
  description?: string;
  vendor?: string;
  hostel_name?: string;
  created_at?: string;
}

export interface Expense extends HostelExpense {}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  description?: string;
  target_role: string;
  is_urgent: number;
  author_name: string;
  author_role?: string;
  created_at: string;
}

export interface VisitorLog {
  id: string;
  visitor_name: string;
  student_id: string;
  relation: string;
  phone: string;
  purpose: string;
  entry_time: string;
  exit_time?: string | null;
  id_proof_type?: string;
  id_proof_number?: string;
  vehicle_number?: string;
  student_name?: string;
  room_number?: string;
  created_at?: string;
}

export interface Visitor extends VisitorLog {}

export interface NotificationItem {
  id: string;
  user_id?: string;
  role?: string;
  title: string;
  message: string;
  type: string;
  is_read: number;
  link?: string;
  created_at: string;
}

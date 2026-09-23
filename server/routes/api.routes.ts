import { Router } from 'express';
import {
  login,
  signup,
  logout,
  getMe,
  changePassword,
  forgotPassword
} from '../controllers/auth.controller.js';
import {
  getDashboardStats,
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getWardens,
  createWarden,
  updateWarden,
  deleteWarden
} from '../controllers/admin.controller.js';
import { getWardenDashboard } from '../controllers/warden.controller.js';
import { getStudentDashboard, updateStudentProfile } from '../controllers/student.controller.js';
import {
  getHostels,
  getBlocks,
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  getAllocations,
  allocateRoom,
  changeRoom,
  vacateRoom
} from '../controllers/room.controller.js';
import { getAttendance, markAttendance, getAttendanceStats } from '../controllers/attendance.controller.js';
import { getComplaints, createComplaint, updateComplaint } from '../controllers/complaints.controller.js';
import {
  getLeaveRequests,
  getStudentLeaveRequests,
  getLeaveRequestById,
  createLeaveRequest,
  updateLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
  cancelLeaveRequest
} from '../controllers/leave.controller.js';
import {
  getFoodMenu,
  updateFoodMenu,
  getFoodWastage,
  createFoodWastage,
  getFoodWastagePrediction
} from '../controllers/food.controller.js';
import { getFees, createFee, recordPayment } from '../controllers/fees.controller.js';
import { getExpenses, createExpense, deleteExpense } from '../controllers/expenses.controller.js';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '../controllers/announcements.controller.js';
import { getVisitors, createVisitor, markVisitorExit } from '../controllers/visitors.controller.js';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notifications.controller.js';
import { chatAssistant } from '../controllers/ai.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

// ==================== AUTHENTICATION ====================
router.post('/auth/login', login);
router.post('/auth/signup', signup);
router.post('/auth/logout', logout);
router.post('/auth/forgot-password', forgotPassword);
router.get('/auth/me', authenticateToken, getMe);
router.post('/auth/change-password', authenticateToken, changePassword);

// ==================== ADMIN EXCLUSIVE ====================
router.get('/admin/dashboard', authenticateToken, requireRole('ADMIN'), getDashboardStats);

router.get('/admin/students', authenticateToken, requireRole('ADMIN', 'WARDEN'), getStudents);
router.get('/admin/students/:id', authenticateToken, requireRole('ADMIN', 'WARDEN'), getStudentById);
router.post('/admin/students', authenticateToken, requireRole('ADMIN'), createStudent);
router.put('/admin/students/:id', authenticateToken, requireRole('ADMIN'), updateStudent);
router.delete('/admin/students/:id', authenticateToken, requireRole('ADMIN'), deleteStudent);

router.get('/admin/wardens', authenticateToken, requireRole('ADMIN'), getWardens);
router.post('/admin/wardens', authenticateToken, requireRole('ADMIN'), createWarden);
router.put('/admin/wardens/:id', authenticateToken, requireRole('ADMIN'), updateWarden);
router.delete('/admin/wardens/:id', authenticateToken, requireRole('ADMIN'), deleteWarden);

// ==================== WARDEN EXCLUSIVE ====================
router.get('/warden/dashboard', authenticateToken, requireRole('ADMIN', 'WARDEN'), getWardenDashboard);

// ==================== STUDENT EXCLUSIVE ====================
router.get('/student/dashboard', authenticateToken, requireRole('STUDENT'), getStudentDashboard);
router.put('/student/profile', authenticateToken, requireRole('STUDENT'), updateStudentProfile);

// ==================== HOSTEL & ROOM MANAGEMENT ====================
router.get('/hostels', authenticateToken, getHostels);
router.get('/blocks', authenticateToken, getBlocks);
router.get('/rooms', authenticateToken, getRooms);
router.post('/rooms', authenticateToken, requireRole('ADMIN'), createRoom);
router.put('/rooms/:id', authenticateToken, requireRole('ADMIN', 'WARDEN'), updateRoom);
router.delete('/rooms/:id', authenticateToken, requireRole('ADMIN'), deleteRoom);

// ==================== ROOM ALLOCATIONS ====================
router.get('/allocations', authenticateToken, getAllocations);
router.post('/allocations', authenticateToken, requireRole('ADMIN', 'WARDEN'), allocateRoom);
router.post('/allocations/change', authenticateToken, requireRole('ADMIN', 'WARDEN'), changeRoom);
router.post('/allocations/vacate', authenticateToken, requireRole('ADMIN', 'WARDEN'), vacateRoom);

// ==================== ATTENDANCE ====================
router.get('/attendance', authenticateToken, getAttendance);
router.get('/attendance/stats', authenticateToken, getAttendanceStats);
router.post('/attendance', authenticateToken, requireRole('ADMIN', 'WARDEN'), markAttendance);

// ==================== COMPLAINTS ====================
router.get('/complaints', authenticateToken, getComplaints);
router.post('/complaints', authenticateToken, createComplaint);
router.put('/complaints/:id', authenticateToken, requireRole('ADMIN', 'WARDEN'), updateComplaint);

// ==================== LEAVE MANAGEMENT ====================
router.get('/leave', authenticateToken, getLeaveRequests);
router.get('/leave/my', authenticateToken, requireRole('STUDENT'), getStudentLeaveRequests);
router.get('/student/leave', authenticateToken, requireRole('STUDENT'), getStudentLeaveRequests);
router.get('/leave/:id', authenticateToken, getLeaveRequestById);
router.post('/leave', authenticateToken, createLeaveRequest);
router.post('/student/leave', authenticateToken, createLeaveRequest);
router.put('/leave/:id', authenticateToken, requireRole('ADMIN', 'WARDEN'), updateLeaveRequest);
router.put('/leave/:id/status', authenticateToken, requireRole('ADMIN', 'WARDEN'), updateLeaveRequest);
router.put('/leave/:id/approve', authenticateToken, requireRole('ADMIN', 'WARDEN'), approveLeaveRequest);
router.put('/leave/:id/reject', authenticateToken, requireRole('ADMIN', 'WARDEN'), rejectLeaveRequest);
router.put('/leave/:id/cancel', authenticateToken, requireRole('STUDENT'), cancelLeaveRequest);

// Warden & Admin Leave Access
router.get('/warden/leave', authenticateToken, requireRole('WARDEN', 'ADMIN'), getLeaveRequests);
router.put('/warden/leave/:id/approve', authenticateToken, requireRole('WARDEN', 'ADMIN'), approveLeaveRequest);
router.put('/warden/leave/:id/reject', authenticateToken, requireRole('WARDEN', 'ADMIN'), rejectLeaveRequest);
router.get('/admin/leave', authenticateToken, requireRole('ADMIN'), getLeaveRequests);

// ==================== FOOD & WASTAGE PREDICTION ====================
router.get('/food/menu', authenticateToken, getFoodMenu);
router.put('/food/menu/:id', authenticateToken, requireRole('ADMIN', 'WARDEN'), updateFoodMenu);
router.get('/food-wastage', authenticateToken, requireRole('ADMIN', 'WARDEN'), getFoodWastage);
router.post('/food-wastage', authenticateToken, requireRole('ADMIN', 'WARDEN'), createFoodWastage);
router.get('/food-wastage/prediction', authenticateToken, requireRole('ADMIN', 'WARDEN'), getFoodWastagePrediction);

// ==================== FEES & PAYMENTS ====================
router.get('/fees', authenticateToken, getFees);
router.post('/fees', authenticateToken, requireRole('ADMIN'), createFee);
router.post('/fees/pay', authenticateToken, recordPayment);

// ==================== EXPENSES ====================
router.get('/expenses', authenticateToken, requireRole('ADMIN'), getExpenses);
router.post('/expenses', authenticateToken, requireRole('ADMIN'), createExpense);
router.delete('/expenses/:id', authenticateToken, requireRole('ADMIN'), deleteExpense);

// ==================== ANNOUNCEMENTS ====================
router.get('/announcements', authenticateToken, getAnnouncements);
router.post('/announcements', authenticateToken, requireRole('ADMIN', 'WARDEN'), createAnnouncement);
router.delete('/announcements/:id', authenticateToken, requireRole('ADMIN', 'WARDEN'), deleteAnnouncement);

// ==================== VISITORS ====================
router.get('/visitors', authenticateToken, requireRole('ADMIN', 'WARDEN'), getVisitors);
router.post('/visitors', authenticateToken, requireRole('ADMIN', 'WARDEN'), createVisitor);
router.put('/visitors/:id/exit', authenticateToken, requireRole('ADMIN', 'WARDEN'), markVisitorExit);

// ==================== NOTIFICATIONS ====================
router.get('/notifications', authenticateToken, getNotifications);
router.put('/notifications/:id/read', authenticateToken, markAsRead);
router.post('/notifications/read-all', authenticateToken, markAllAsRead);

// ==================== AI ASSISTANT ====================
router.post('/ai/chat', authenticateToken, chatAssistant);

export default router;

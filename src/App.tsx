import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.js';
import { ThemeProvider } from './contexts/ThemeContext.js';
import { ToastProvider } from './contexts/ToastContext.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';
import { DashboardLayout } from './components/DashboardLayout.js';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage.js';
import { SignupPage } from './pages/auth/SignupPage.js';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage.js';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard.js';
import { StudentsPage } from './pages/admin/StudentsPage.js';
import { RoomsPage } from './pages/admin/RoomsPage.js';
import { AllocationsPage } from './pages/admin/AllocationsPage.js';
import { WardensPage } from './pages/admin/WardensPage.js';
import { ComplaintsPage } from './pages/admin/ComplaintsPage.js';
import { LeavePage } from './pages/admin/LeavePage.js';
import { AttendancePage } from './pages/admin/AttendancePage.js';
import { FoodMenuPage } from './pages/admin/FoodMenuPage.js';
import { FoodWastagePage } from './pages/admin/FoodWastagePage.js';
import { FeesPage } from './pages/admin/FeesPage.js';
import { ExpensesPage } from './pages/admin/ExpensesPage.js';
import { AnnouncementsPage } from './pages/admin/AnnouncementsPage.js';
import { ReportsPage } from './pages/admin/ReportsPage.js';
import { SettingsPage } from './pages/admin/SettingsPage.js';

// Warden Pages
import { WardenDashboard } from './pages/warden/WardenDashboard.js';
import { VisitorsPage } from './pages/warden/VisitorsPage.js';
import { WardenProfilePage } from './pages/warden/WardenProfilePage.js';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard.js';
import { StudentRoomPage } from './pages/student/StudentRoomPage.js';
import { StudentAttendancePage } from './pages/student/StudentAttendancePage.js';
import { StudentLeavePage } from './pages/student/StudentLeavePage.js';
import { StudentComplaintsPage } from './pages/student/StudentComplaintsPage.js';
import { StudentFeesPage } from './pages/student/StudentFeesPage.js';
import { StudentFoodPage } from './pages/student/StudentFoodPage.js';
import { StudentProfilePage } from './pages/student/StudentProfilePage.js';

// Common Pages
import { NoticesPage } from './pages/common/NoticesPage.js';

const RootRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  const role = (user.role || '').toLowerCase();
  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'warden') return <Navigate to="/warden/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* ADMIN Protected Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="students" element={<StudentsPage />} />
                <Route path="wardens" element={<WardensPage />} />
                <Route path="rooms" element={<RoomsPage />} />
                <Route path="allocations" element={<AllocationsPage />} />
                <Route path="complaints" element={<ComplaintsPage />} />
                <Route path="leave" element={<LeavePage />} />
                <Route path="attendance" element={<AttendancePage />} />
                <Route path="food" element={<FoodMenuPage />} />
                <Route path="food-wastage" element={<FoodWastagePage />} />
                <Route path="fees" element={<FeesPage />} />
                <Route path="expenses" element={<ExpensesPage />} />
                <Route path="announcements" element={<AnnouncementsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* WARDEN Protected Routes */}
              <Route
                path="/warden"
                element={
                  <ProtectedRoute allowedRoles={['WARDEN']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/warden/dashboard" replace />} />
                <Route path="dashboard" element={<WardenDashboard />} />
                <Route path="attendance" element={<AttendancePage />} />
                <Route path="visitors" element={<VisitorsPage />} />
                <Route path="complaints" element={<ComplaintsPage />} />
                <Route path="leave" element={<LeavePage />} />
                <Route path="food" element={<FoodMenuPage />} />
                <Route path="announcements" element={<NoticesPage />} />
                <Route path="profile" element={<WardenProfilePage />} />
              </Route>

              {/* STUDENT Protected Routes */}
              <Route
                path="/student"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/student/dashboard" replace />} />
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="room" element={<StudentRoomPage />} />
                <Route path="attendance" element={<StudentAttendancePage />} />
                <Route path="leave" element={<StudentLeavePage />} />
                <Route path="complaints" element={<StudentComplaintsPage />} />
                <Route path="fees" element={<StudentFeesPage />} />
                <Route path="food" element={<StudentFoodPage />} />
                <Route path="announcements" element={<NoticesPage />} />
                <Route path="profile" element={<StudentProfilePage />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<RootRedirect />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

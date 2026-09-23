import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Building,
  BedDouble,
  MessageSquareWarning,
  CalendarCheck,
  CalendarDays,
  UtensilsCrossed,
  Sparkles,
  CreditCard,
  Receipt,
  Megaphone,
  FileBarChart,
  UserCheck2,
  Shield,
  LogOut,
  X,
  UserCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.js';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const role = user?.role;

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/students', label: 'Students', icon: Users },
    { to: '/admin/wardens', label: 'Wardens', icon: UserCheck },
    { to: '/admin/rooms', label: 'Rooms & Beds', icon: Building },
    { to: '/admin/allocations', label: 'Room Allocation', icon: BedDouble },
    { to: '/admin/complaints', label: 'Complaints', icon: MessageSquareWarning },
    { to: '/admin/leave', label: 'Leave Requests', icon: CalendarDays },
    { to: '/admin/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/admin/food', label: 'Food Management', icon: UtensilsCrossed },
    { to: '/admin/food-wastage', label: 'Food Wastage AI', icon: Sparkles },
    { to: '/admin/fees', label: 'Fee Management', icon: CreditCard },
    { to: '/admin/expenses', label: 'Hostel Expenses', icon: Receipt },
    { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
    { to: '/admin/reports', label: 'Reports Hub', icon: FileBarChart }
  ];

  const wardenLinks = [
    { to: '/warden/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/warden/students', label: 'Assigned Students', icon: Users },
    { to: '/warden/rooms', label: 'Rooms & Beds', icon: Building },
    { to: '/warden/attendance', label: 'Mark Attendance', icon: CalendarCheck },
    { to: '/warden/complaints', label: 'Complaints', icon: MessageSquareWarning },
    { to: '/warden/leave', label: 'Leave Requests', icon: CalendarDays },
    { to: '/warden/visitors', label: 'Visitors Desk', icon: UserCheck2 },
    { to: '/warden/food', label: 'Mess Menu', icon: UtensilsCrossed },
    { to: '/warden/food-wastage', label: 'Food Wastage', icon: Sparkles },
    { to: '/warden/announcements', label: 'Announcements', icon: Megaphone },
    { to: '/warden/profile', label: 'Warden Profile', icon: UserCircle }
  ];

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/profile', label: 'My Profile', icon: UserCircle },
    { to: '/student/room', label: 'My Room & Bed', icon: BedDouble },
    { to: '/student/attendance', label: 'My Attendance', icon: CalendarCheck },
    { to: '/student/leave', label: 'Leave Requests', icon: CalendarDays },
    { to: '/student/complaints', label: 'My Complaints', icon: MessageSquareWarning },
    { to: '/student/fees', label: 'Fees & Invoices', icon: CreditCard },
    { to: '/student/food', label: 'Mess Schedule', icon: UtensilsCrossed },
    { to: '/student/announcements', label: 'Announcements', icon: Megaphone }
  ];

  const roleLower = user?.role?.toLowerCase();
  let links = studentLinks;
  if (roleLower === 'admin') links = adminLinks;
  else if (roleLower === 'warden') links = wardenLinks;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 px-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
              H
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">HostelSphere</span>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {role} Portal
              </span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Navigation Menu
          </div>

          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 dark:bg-indigo-600'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 shrink-0 transition ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                      }`}
                    />
                    <span className="truncate">{link.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom user badge & logout */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

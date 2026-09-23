import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BedDouble,
  Building,
  CalendarCheck,
  MessageSquareWarning,
  CalendarDays,
  CreditCard,
  UtensilsCrossed,
  Sparkles,
  Users,
  Megaphone,
  ArrowRight,
  CheckCircle2,
  Clock,
  Plus
} from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../contexts/AuthContext.js';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const cards = data?.cards || {};
  const student = data?.student || {};
  const room = data?.room || {};
  const roommates = data?.roommates || [];
  const todayMenu = data?.todayMenu || [];
  const announcements = data?.announcements || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[11px] font-semibold mb-2 text-indigo-200">
            <BedDouble className="w-3.5 h-3.5" />
            {cards.roomNumber ? `Room ${cards.roomNumber} (Bed ${cards.bedNumber})` : 'Room Assignment Pending'} &bull; {cards.hostelName}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs text-indigo-200 mt-1 max-w-xl">
            {student.department} &bull; {student.student_id} &bull; Resident in good standing
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/student/leave"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-500 hover:bg-indigo-400 text-white shadow-md transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Apply Outpass
          </Link>
          <Link
            to="/student/complaints"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition flex items-center gap-1.5"
          >
            <MessageSquareWarning className="w-4 h-4" /> Raise Issue
          </Link>
        </div>
      </div>

      {/* 8 Student Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">My Room & Bed</span>
            <BedDouble className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {cards.roomNumber ? `Room ${cards.roomNumber}` : 'Unassigned'}
          </div>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">
            {cards.bedNumber ? `Bed Slot #${cards.bedNumber}` : 'Pending allocation'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Hostel Campus</span>
            <Building className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white truncate">
            {cards.hostelName || 'Hostel'}
          </div>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">
            {cards.blockName || 'Residential Block'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Curfew Attendance</span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {cards.attendancePercentage}%
          </div>
          <span className="text-[10px] text-emerald-600 font-medium mt-1 block">Roll-call adherence</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Fee Invoices</span>
            <CreditCard className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            ₹{Number(cards.pendingFees || 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-amber-500 font-medium mt-1 block">
            {cards.pendingFees > 0 ? 'Payment due' : 'All dues cleared'}
          </span>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Resident Self-Service Portal</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Link
            to="/student/complaints"
            className="p-3.5 rounded-2xl bg-rose-50/70 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition flex items-center gap-3 text-xs font-semibold text-rose-900 dark:text-rose-200"
          >
            <MessageSquareWarning className="w-4 h-4 text-rose-600" />
            <span>Submit Complaint</span>
          </Link>

          <Link
            to="/student/leave"
            className="p-3.5 rounded-2xl bg-indigo-50/70 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition flex items-center gap-3 text-xs font-semibold text-indigo-900 dark:text-indigo-200"
          >
            <CalendarDays className="w-4 h-4 text-indigo-600" />
            <span>Apply Outpass</span>
          </Link>

          <Link
            to="/student/attendance"
            className="p-3.5 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition flex items-center gap-3 text-xs font-semibold text-emerald-900 dark:text-emerald-200"
          >
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
            <span>My Attendance</span>
          </Link>

          <Link
            to="/student/food"
            className="p-3.5 rounded-2xl bg-amber-50/70 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition flex items-center gap-3 text-xs font-semibold text-amber-900 dark:text-amber-200"
          >
            <UtensilsCrossed className="w-4 h-4 text-amber-600" />
            <span>Mess Schedule</span>
          </Link>

          <Link
            to="/student/fees"
            className="p-3.5 rounded-2xl bg-purple-50/70 hover:bg-purple-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition flex items-center gap-3 text-xs font-semibold text-purple-900 dark:text-purple-200 col-span-2 sm:col-span-1"
          >
            <CreditCard className="w-4 h-4 text-purple-600" />
            <span>Pay Semester Dues</span>
          </Link>
        </div>
      </div>

      {/* Main 2 Column Section: Roommates & Today's Mess */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roommates Card (1 col) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" /> Roommate Information
              </h3>
              <Link to="/student/room" className="text-xs text-indigo-600 hover:underline font-semibold">
                Room &rarr;
              </Link>
            </div>

            {roommates.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                You are currently in a single occupancy room or roommates have not yet been assigned.
              </div>
            ) : (
              <div className="space-y-3">
                {roommates.map((rm: any) => (
                  <div key={rm.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center gap-3 text-xs">
                    <img
                      src={rm.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rm.full_name}`}
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 dark:text-white truncate">{rm.full_name}</div>
                      <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">Bed Slot {rm.bed_number}</div>
                      <div className="text-[10px] text-slate-400 truncate">{rm.department} &bull; {rm.phone}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 text-[11px] text-slate-400">
            Room Type: {room?.room_type || 'Double'} Room &bull; Capacity: {room?.capacity || 2} Beds
          </div>
        </div>

        {/* Today's Mess Menu (2 col) */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-amber-500" /> Today's Mess Meal Schedule
              </h3>
              <p className="text-[11px] text-slate-400">Fresh daily catering in the Central Mess Hall</p>
            </div>
            <Link to="/student/food" className="text-xs text-indigo-600 hover:underline font-semibold">
              Full Week &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {todayMenu.map((m: any) => (
              <div key={m.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 dark:text-white">{m.meal_type}</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-500" /> {m.timings}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  {m.items}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Broadcast Announcements */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-indigo-600" /> Campus & Hostel Notices
          </h3>
          <Link to="/student/announcements" className="text-xs text-indigo-600 hover:underline font-semibold">
            All notices &rarr;
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {announcements.slice(0, 3).map((a: any) => (
            <div key={a.id} className="py-3 flex items-start justify-between gap-4 text-xs">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">{a.title}</div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 line-clamp-2">{a.content}</p>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0">
                {new Date(a.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

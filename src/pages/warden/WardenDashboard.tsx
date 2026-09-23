import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building,
  BedDouble,
  MessageSquareWarning,
  CalendarDays,
  CalendarCheck,
  UserCheck2,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus
} from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../contexts/AuthContext.js';

export const WardenDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/warden/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load warden dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const cards = data?.cards || {};
  const warden = data?.warden || {};
  const recentComplaints = data?.recentComplaints || [];
  const recentLeaves = data?.recentLeaves || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[11px] font-semibold mb-2 text-indigo-200">
            <Building className="w-3.5 h-3.5" /> Assigned: {warden.hostel_name || 'Hostel'} &bull; {warden.block_name || 'Block'}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome back, Warden {user?.name}
          </h1>
          <p className="text-xs text-indigo-200 mt-1 max-w-xl">
            You are overseeing block security, night curfew compliance, resident grievances, and daily outpasses.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/warden/attendance"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-500 hover:bg-indigo-400 text-white shadow-md transition flex items-center gap-1.5"
          >
            <CalendarCheck className="w-4 h-4" /> Night Roll Call
          </Link>
          <Link
            to="/warden/visitors"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition flex items-center gap-1.5"
          >
            <UserCheck2 className="w-4 h-4" /> Visitor Gate
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Assigned Residents</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{cards.assignedStudents || 0}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">In your assigned hostel</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Block Rooms</span>
            <Building className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{cards.totalRooms || 0}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {cards.occupiedBeds || 0} occupied / {cards.availableBeds || 0} free beds
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Pending Grievances</span>
            <MessageSquareWarning className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{cards.pendingComplaints || 0}</div>
          <span className="text-[10px] text-rose-500 mt-1 block">Awaiting supervisor action</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Pending Outpasses</span>
            <CalendarDays className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{cards.pendingLeaves || 0}</div>
          <span className="text-[10px] text-amber-500 mt-1 block">Require approval</span>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Warden Operational Shortcuts</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/warden/attendance"
            className="p-3.5 rounded-2xl bg-indigo-50/70 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition flex items-center gap-3 text-xs font-semibold text-indigo-900 dark:text-indigo-200"
          >
            <CalendarCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Mark Attendance</span>
          </Link>

          <Link
            to="/warden/visitors"
            className="p-3.5 rounded-2xl bg-blue-50/70 hover:bg-blue-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition flex items-center gap-3 text-xs font-semibold text-blue-900 dark:text-blue-200"
          >
            <UserCheck2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Log Visitor Check-In</span>
          </Link>

          <Link
            to="/warden/complaints"
            className="p-3.5 rounded-2xl bg-rose-50/70 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition flex items-center gap-3 text-xs font-semibold text-rose-900 dark:text-rose-200"
          >
            <MessageSquareWarning className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <span>Review Maintenance</span>
          </Link>

          <Link
            to="/warden/leave"
            className="p-3.5 rounded-2xl bg-amber-50/70 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition flex items-center gap-3 text-xs font-semibold text-amber-900 dark:text-amber-200"
          >
            <CalendarDays className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>Approve Outpasses</span>
          </Link>
        </div>
      </div>

      {/* Two Columns: Recent Complaints & Leaves in Assigned Block */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquareWarning className="w-4 h-4 text-rose-500" /> Block Maintenance Tickets
            </h3>
            <Link to="/warden/complaints" className="text-xs text-indigo-600 hover:underline font-semibold">
              View all &rarr;
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentComplaints.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">No active complaints logged</div>
            ) : (
              recentComplaints.map((c: any) => (
                <div key={c.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{c.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {c.student_name} (Room {c.room_number}) &bull; {c.category}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    {c.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-amber-500" /> Pending Student Leave Requests
            </h3>
            <Link to="/warden/leave" className="text-xs text-indigo-600 hover:underline font-semibold">
              Review all &rarr;
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentLeaves.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">No pending leave applications</div>
            ) : (
              recentLeaves.map((l: any) => (
                <div key={l.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{l.student_name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {l.from_date} to {l.to_date} &bull; {l.destination}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    {l.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

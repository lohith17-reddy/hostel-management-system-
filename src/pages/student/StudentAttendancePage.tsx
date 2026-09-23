import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import api from '../../services/api.js';

export const StudentAttendancePage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const res = await api.get('/student/attendance');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load student attendance:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const records = data?.records || [];
  const stats = data?.stats || { totalDays: 0, present: 0, absent: 0, leave: 0, percentage: 100 };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-indigo-600" /> My Night Roll Call & Curfew Attendance
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Audited hostel biometric attendance history and mandatory residential presence tracking.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">Overall Attendance</span>
          <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{stats.percentage}%</div>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Good Standing (&ge;80% required)</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-500 block mb-1">Days Present</span>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.present}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Present in hostel bed</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-500 block mb-1">Unexcused Absences</span>
          <div className="text-3xl font-black text-rose-600 dark:text-rose-400">{stats.absent}</div>
          <span className="text-[10px] text-rose-500 mt-1 block">Missed curfew roll-call</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-500 block mb-1">Authorized Outpass</span>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400">{stats.leave}</div>
          <span className="text-[10px] text-amber-500 mt-1 block">Excused leave days</span>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Daily Curfew Verification Register</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Curfew Status</th>
                <th className="px-6 py-3.5">Supervisor Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-400">
                    No attendance records logged yet.
                  </td>
                </tr>
              ) : (
                records.map((r: any) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white">
                      {r.date}
                    </td>

                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          r.status === 'Present'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : r.status === 'Absent'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {r.status === 'Present' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {r.status === 'Absent' && <XCircle className="w-3.5 h-3.5" />}
                        {r.status === 'Leave' && <Clock className="w-3.5 h-3.5" />}
                        {r.status}
                      </span>
                    </td>

                    <td className="px-6 py-3.5 text-slate-500">
                      {r.remarks || 'Standard hostel night verification'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

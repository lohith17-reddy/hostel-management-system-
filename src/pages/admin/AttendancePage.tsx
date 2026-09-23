import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Building,
  RefreshCw
} from 'lucide-react';
import api from '../../services/api.js';
import { Student, Hostel } from '../../types/index.js';
import { useToast } from '../../contexts/ToastContext.js';

export const AttendancePage: React.FC = () => {
  const { showToast } = useToast();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedHostel, setSelectedHostel] = useState('hostel_01');
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [hRes, sRes, aRes] = await Promise.all([
        api.get('/hostels'),
        api.get('/admin/students', { params: { hostelId: selectedHostel } }),
        api.get('/attendance', { params: { date: selectedDate, hostelId: selectedHostel } })
      ]);

      if (hRes.data.success) setHostels(hRes.data.data);
      if (sRes.data.success) setStudents(sRes.data.data);
      if (aRes.data.success) setAttendanceRecords(aRes.data.data);
    } catch (err) {
      showToast('Failed to load attendance records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate, selectedHostel]);

  const handleMark = async (studentId: string, status: 'Present' | 'Absent' | 'Leave') => {
    try {
      const res = await api.post('/attendance', {
        studentId,
        date: selectedDate,
        status,
        remarks: 'Recorded by Admin'
      });
      if (res.data.success) {
        showToast(`Attendance marked ${status}`, 'success');
        fetchData();
      }
    } catch (err: any) {
      showToast('Failed to record attendance', 'error');
    }
  };

  const attendanceMap = new Map<string, any>();
  attendanceRecords.forEach((r) => attendanceMap.set(r.student_id, r));

  const presentCount = attendanceRecords.filter((r) => r.status === 'Present').length;
  const absentCount = attendanceRecords.filter((r) => r.status === 'Absent').length;
  const leaveCount = attendanceRecords.filter((r) => r.status === 'Leave').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-indigo-600" /> Daily Resident Attendance Register
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Night roll-call verification, gate curfew auditing, and absence monitoring.
          </p>
        </div>
      </div>

      {/* Date & Hostel picker */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Hostel</label>
            <select
              value={selectedHostel}
              onChange={(e) => setSelectedHostel(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              {hostels.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Daily Summary */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
            Present: {presentCount}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
            Absent: {absentCount}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
            On Leave: {leaveCount}
          </span>
        </div>
      </div>

      {/* Student Attendance List */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3.5">Student</th>
                <th className="px-6 py-3.5">Roll ID</th>
                <th className="px-6 py-3.5">Room & Bed</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Quick Mark Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No students assigned to this hostel block.
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const record = attendanceMap.get(student.id);
                  const status = record?.status || 'Unmarked';
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="px-6 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">{student.full_name}</div>
                        <div className="text-[11px] text-slate-400">{student.department}</div>
                      </td>

                      <td className="px-6 py-3.5 text-slate-700 dark:text-slate-300 font-semibold">
                        {student.student_id}
                      </td>

                      <td className="px-6 py-3.5">
                        {student.room_number ? (
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            Room {student.room_number} (Bed {student.bed_number})
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No room allocated</span>
                        )}
                      </td>

                      <td className="px-6 py-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            status === 'Present'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : status === 'Absent'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : status === 'Leave'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleMark(student.id, 'Present')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                              status === 'Present'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            Present
                          </button>

                          <button
                            onClick={() => handleMark(student.id, 'Absent')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                              status === 'Absent'
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-rose-600 hover:bg-rose-50'
                            }`}
                          >
                            Absent
                          </button>

                          <button
                            onClick={() => handleMark(student.id, 'Leave')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                              status === 'Leave'
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-amber-600 hover:bg-amber-50'
                            }`}
                          >
                            Leave
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

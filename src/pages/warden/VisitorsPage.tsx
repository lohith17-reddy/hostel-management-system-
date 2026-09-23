import React, { useState, useEffect } from 'react';
import {
  UserCheck2,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  LogOut,
  Phone,
  Car,
  Shield,
  X
} from 'lucide-react';
import api from '../../services/api.js';
import { VisitorLog, Student } from '../../types/index.js';
import { useToast } from '../../contexts/ToastContext.js';

export const VisitorsPage: React.FC = () => {
  const { showToast } = useToast();
  const [visitors, setVisitors] = useState<VisitorLog[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeOnly, setActiveOnly] = useState(false);
  const [search, setSearch] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    visitorName: '',
    studentId: '',
    relation: 'Parent',
    phone: '',
    purpose: 'Campus Visit',
    idProofType: 'Driver License',
    idProofNumber: '',
    vehicleNumber: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vRes, sRes] = await Promise.all([
        api.get('/visitors', { params: { activeOnly: activeOnly ? 'true' : undefined } }),
        api.get('/admin/students')
      ]);
      if (vRes.data.success) setVisitors(vRes.data.data);
      if (sRes.data.success) setStudents(sRes.data.data);
    } catch (err) {
      showToast('Failed to load visitors registry', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeOnly]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/visitors', form);
      if (res.data.success) {
        showToast('Visitor entry logged', 'success');
        setShowAddModal(false);
        fetchData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to log visitor', 'error');
    }
  };

  const handleRecordExit = async (id: string) => {
    try {
      const res = await api.put(`/visitors/${id}/exit`);
      if (res.data.success) {
        showToast('Visitor exit recorded', 'success');
        fetchData();
      }
    } catch (err) {
      showToast('Failed to log exit', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck2 className="w-5 h-5 text-indigo-600" /> Security Gate & Visitors Registry
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Authenticate visitor access, log entry/exit timestamps, and verify parent credentials.
          </p>
        </div>

        <button
          onClick={() => {
            if (students.length > 0) setForm({ ...form, studentId: students[0].id });
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" /> Log Visitor Entry
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search visitor, student, or vehicle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
          />
          Show Currently On Campus Only
        </label>
      </div>

      {/* Visitors Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3.5">Visitor</th>
                <th className="px-6 py-3.5">Resident Visited</th>
                <th className="px-6 py-3.5">Relationship & Purpose</th>
                <th className="px-6 py-3.5">Entry Timestamp</th>
                <th className="px-6 py-3.5">Exit Timestamp</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {visitors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No visitor logs recorded.
                  </td>
                </tr>
              ) : (
                visitors
                  .filter((v) =>
                    !search ||
                    v.visitor_name?.toLowerCase().includes(search.toLowerCase()) ||
                    v.student_name?.toLowerCase().includes(search.toLowerCase()) ||
                    v.vehicle_number?.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="px-6 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">{v.visitor_name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" /> {v.phone}
                          {v.vehicle_number && (
                            <>
                              &bull; <Car className="w-3 h-3 text-slate-400" /> {v.vehicle_number}
                            </>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-3.5">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{v.student_name}</div>
                        <div className="text-[11px] text-slate-400">Room {v.room_number || 'N/A'}</div>
                      </td>

                      <td className="px-6 py-3.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                          {v.relation}
                        </span>
                        <div className="text-slate-400 text-[11px] mt-0.5">{v.purpose}</div>
                      </td>

                      <td className="px-6 py-3.5 text-slate-700 dark:text-slate-300">
                        {v.entry_time}
                      </td>

                      <td className="px-6 py-3.5">
                        {v.exit_time ? (
                          <span className="text-slate-500 font-medium">{v.exit_time}</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            On Premises
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-3.5 text-right">
                        {!v.exit_time ? (
                          <button
                            onClick={() => handleRecordExit(v.id)}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition flex items-center gap-1 ml-auto"
                          >
                            <LogOut className="w-3.5 h-3.5" /> Check Out
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Exited</span>
                        )}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Visitor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Log Visitor Security Entry</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Visitor Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Robert Hayes"
                  value={form.visitorName}
                  onChange={(e) => setForm({ ...form, visitorName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Resident Student to Visit *</label>
                <select
                  required
                  value={form.studentId}
                  onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} (Room {s.room_number || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Relationship</label>
                  <select
                    value={form.relation}
                    onChange={(e) => setForm({ ...form, relation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Parent">Parent</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Relative">Relative</option>
                    <option value="Friend">Friend / Peer</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Purpose of Visit</label>
                  <input
                    type="text"
                    placeholder="e.g. Delivering luggage"
                    value={form.purpose}
                    onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Vehicle License Plate</label>
                  <input
                    type="text"
                    placeholder="e.g. ABC-1234"
                    value={form.vehicleNumber}
                    onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-semibold bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                >
                  Log In Gate Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

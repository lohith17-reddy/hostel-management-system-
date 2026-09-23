import React, { useState, useEffect } from 'react';
import {
  MessageSquareWarning,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import api from '../../services/api.js';
import { Complaint } from '../../types/index.js';
import { useToast } from '../../contexts/ToastContext.js';

export const StudentComplaintsPage: React.FC = () => {
  const { showToast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const [form, setForm] = useState({
    title: '',
    category: 'Electrical',
    priority: 'Medium',
    description: ''
  });

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/complaints');
      if (res.data.success) {
        setComplaints(res.data.data);
      }
    } catch (err) {
      showToast('Failed to load complaints', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/student/complaints', form);
      if (res.data.success) {
        showToast('Complaint ticket submitted', 'success');
        setShowSubmitModal(false);
        setForm({
          title: '',
          category: 'Electrical',
          priority: 'Medium',
          description: ''
        });
        fetchComplaints();
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to submit complaint', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquareWarning className="w-5 h-5 text-rose-500" /> Maintenance & Grievance Tickets
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Log facility repairs, plumbing, electrical issues, or mess complaints directly with hostel technicians.
          </p>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" /> Raise New Ticket
        </button>
      </div>

      {/* Complaints List */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3.5">Ticket Title</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Priority</th>
                <th className="px-6 py-3.5">Submitted Date</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Technician Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No complaints logged. Your room has no active issues.
                  </td>
                </tr>
              ) : (
                complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="px-6 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{c.title}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5 max-w-sm line-clamp-2">{c.description}</div>
                    </td>

                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {c.category}
                      </span>
                    </td>

                    <td className="px-6 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.priority === 'Urgent' || c.priority === 'High'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {c.priority}
                      </span>
                    </td>

                    <td className="px-6 py-3.5 text-slate-500">
                      {c.created_at.slice(0, 10)}
                    </td>

                    <td className="px-6 py-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          c.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : c.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>

                    <td className="px-6 py-3.5 text-slate-600 dark:text-slate-300">
                      {c.resolution_notes || (c.status === 'Resolved' ? 'Completed' : 'Assigned to hostel maintenance')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit Complaint Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Report Maintenance Issue</h3>
              <button onClick={() => setShowSubmitModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Issue Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Study desk light flickering / Washroom tap leaking"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Internet">Internet / WiFi</option>
                    <option value="Carpentry">Carpentry / Furniture</option>
                    <option value="Cleanliness">Room Cleaning</option>
                    <option value="Mess">Mess / Food Concern</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Urgency Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent (Immediate danger/leak)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Detailed Description *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe location, symptoms, when it started, and access availability..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-semibold bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

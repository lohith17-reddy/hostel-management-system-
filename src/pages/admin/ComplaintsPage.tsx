import React, { useState, useEffect } from 'react';
import {
  MessageSquareWarning,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  User,
  Building,
  BedDouble
} from 'lucide-react';
import api from '../../services/api.js';
import { Complaint } from '../../types/index.js';
import { useToast } from '../../contexts/ToastContext.js';

export const ComplaintsPage: React.FC = () => {
  const { showToast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<'Pending' | 'In Progress' | 'Resolved' | 'Rejected'>('In Progress');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/complaints', {
        params: {
          category: categoryFilter || undefined,
          priority: priorityFilter || undefined,
          status: statusFilter || undefined
        }
      });
      if (res.data.success) {
        setComplaints(res.data.data);
      }
    } catch (err) {
      showToast('Failed to fetch complaints', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [categoryFilter, priorityFilter, statusFilter]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      const res = await api.put(`/complaints/${selectedComplaint.id}`, {
        status: newStatus,
        resolutionNotes
      });
      if (res.data.success) {
        showToast('Complaint status updated', 'success');
        setStatusModalOpen(false);
        fetchComplaints();
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to update complaint', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquareWarning className="w-5 h-5 text-rose-500" /> Maintenance & Grievance Tickets
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Resolve student maintenance issues, facility repairs, plumbing, electrical, and mess inquiries.
          </p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search complaint or student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            <option value="">All Categories</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Electrical">Electrical</option>
            <option value="Internet">Internet / WiFi</option>
            <option value="Carpentry">Carpentry</option>
            <option value="Cleanliness">Cleanliness</option>
            <option value="Mess">Mess / Food</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            <option value="">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3.5">Ticket</th>
                <th className="px-6 py-3.5">Resident & Room</th>
                <th className="px-6 py-3.5">Category & Priority</th>
                <th className="px-6 py-3.5">Logged Date</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No complaints found.
                  </td>
                </tr>
              ) : (
                complaints
                  .filter((c) =>
                    !search ||
                    c.title?.toLowerCase().includes(search.toLowerCase()) ||
                    c.student_name?.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="px-6 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">{c.title}</div>
                        <div className="text-slate-400 text-[11px] max-w-sm truncate">{c.description}</div>
                      </td>

                      <td className="px-6 py-3.5">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{c.student_name}</div>
                        <div className="text-slate-400 text-[11px]">Room {c.room_number || 'N/A'} &bull; {c.hostel_name}</div>
                      </td>

                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {c.category}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              c.priority === 'Urgent' || c.priority === 'High'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}
                          >
                            {c.priority}
                          </span>
                        </div>
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

                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedComplaint(c);
                            setNewStatus(c.status);
                            setResolutionNotes(c.resolution_notes || '');
                            setStatusModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition"
                        >
                          Update Status
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Complaint Status Modal */}
      {statusModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Update Grievance Status</h3>
              <button onClick={() => setStatusModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="p-6 space-y-3.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                <span className="font-bold text-slate-900 dark:text-white block">{selectedComplaint?.title}</span>
                <p className="text-slate-500 text-[11px] mt-1">{selectedComplaint?.description}</p>
                <div className="text-slate-400 text-[10px] mt-2">
                  Resident: {selectedComplaint?.student_name} (Room {selectedComplaint?.room_number})
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Status *</label>
                <select
                  value={newStatus}
                  onChange={(e: any) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="Pending">Pending Review</option>
                  <option value="In Progress">In Progress (Assigned to Technician)</option>
                  <option value="Resolved">Resolved (Fixed & Closed)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Resolution / Handover Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Electrician visited and repaired the loose circuit breaker. Verified working."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-semibold bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

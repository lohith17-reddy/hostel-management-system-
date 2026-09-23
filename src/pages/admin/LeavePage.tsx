import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Phone,
  MapPin,
  X
} from 'lucide-react';
import api from '../../services/api.js';
import { LeaveRequest } from '../../types/index.js';
import { useToast } from '../../contexts/ToastContext.js';

export const LeavePage: React.FC = () => {
  const { showToast } = useToast();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [search, setSearch] = useState('');

  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<'Approved' | 'Rejected'>('Approved');
  const [reviewNotes, setReviewNotes] = useState('');

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leave', {
        params: {
          status: statusFilter || undefined,
          date: dateFilter || undefined
        }
      });
      if (res.data.success) {
        setLeaves(res.data.data);
      }
    } catch (err) {
      showToast('Failed to load leave requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter, dateFilter]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeave) return;

    if (reviewStatus === 'Rejected' && !reviewNotes.trim()) {
      showToast('Please provide a reason for rejection.', 'error');
      return;
    }

    try {
      const res = await api.put(`/leave/${selectedLeave.id}/status`, {
        status: reviewStatus,
        reviewNotes: reviewNotes.trim(),
        rejectionReason: reviewNotes.trim()
      });
      if (res.data.success) {
        showToast(`Leave request marked as ${reviewStatus}`, 'success');
        setReviewModalOpen(false);
        fetchLeaves();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to review leave';
      showToast(msg, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-indigo-600" /> Student Gate Leave & Outpass Applications
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Authorize or reject overnight leaves, weekend departures, and medical permissions.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search student or destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            title="Filter by date"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1 rounded-lg"
            >
              Clear
            </button>
          )}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Leaves Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3.5">Resident</th>
                <th className="px-6 py-3.5">Leave Duration</th>
                <th className="px-6 py-3.5">Destination & Reason</th>
                <th className="px-6 py-3.5">Emergency Contact</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No leave requests found.
                  </td>
                </tr>
              ) : (
                leaves
                  .filter((l) =>
                    !search ||
                    l.student_name?.toLowerCase().includes(search.toLowerCase()) ||
                    l.destination?.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((leave) => (
                    <tr key={leave.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="px-6 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">{leave.student_name}</div>
                        <div className="text-slate-400 text-[11px]">Room {leave.room_number || 'N/A'} &bull; {leave.hostel_name}</div>
                      </td>

                      <td className="px-6 py-3.5">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {leave.from_date} &rarr; {leave.to_date}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Applied: {leave.created_at.slice(0, 10)}
                        </span>
                      </td>

                      <td className="px-6 py-3.5">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-indigo-500" />
                          {leave.destination}
                        </div>
                        <div className="text-slate-400 text-[11px] max-w-xs truncate">{leave.reason}</div>
                      </td>

                      <td className="px-6 py-3.5 text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {leave.emergency_contact}
                        </div>
                      </td>

                      <td className="px-6 py-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            leave.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : leave.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {leave.status}
                        </span>
                      </td>

                      <td className="px-6 py-3.5 text-right">
                        {leave.status === 'Pending' ? (
                          <button
                            onClick={() => {
                              setSelectedLeave(leave);
                              setReviewStatus('Approved');
                              setReviewNotes('');
                              setReviewModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition"
                          >
                            Review
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Reviewed</span>
                        )}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Review Leave Application</h3>
              <button onClick={() => setReviewModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="p-6 space-y-3.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <div className="font-bold text-slate-900 dark:text-white text-sm">{selectedLeave?.student_name}</div>
                <div className="text-slate-500">Dates: {selectedLeave?.from_date} to {selectedLeave?.to_date}</div>
                <div className="text-slate-500">Destination: {selectedLeave?.destination}</div>
                <div className="text-slate-600 dark:text-slate-300 font-medium">Reason: {selectedLeave?.reason}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewStatus('Approved')}
                  className={`py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                    reviewStatus === 'Approved'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve Leave
                </button>

                <button
                  type="button"
                  onClick={() => setReviewStatus('Rejected')}
                  className={`py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                    reviewStatus === 'Rejected'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <XCircle className="w-4 h-4" /> Reject Leave
                </button>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {reviewStatus === 'Rejected' ? 'Rejection Reason *' : 'Supervisor Remarks / Gate Pass Instructions'}
                </label>
                <textarea
                  rows={2}
                  required={reviewStatus === 'Rejected'}
                  placeholder={reviewStatus === 'Rejected' ? 'Please provide a reason for rejection.' : 'e.g. Approved. Must report back by Sunday 8:00 PM.'}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-semibold bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                >
                  Confirm Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  Phone,
  X,
  FileText
} from 'lucide-react';
import api from '../../services/api.js';
import { LeaveRequest } from '../../types/index.js';
import { useToast } from '../../contexts/ToastContext.js';

export const StudentLeavePage: React.FC = () => {
  const { showToast } = useToast();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    fromDate: new Date().toISOString().slice(0, 10),
    toDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    reason: '',
    destination: '',
    emergencyContact: ''
  });

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leave');
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
  }, []);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fromDate || !form.toDate) {
      showToast('Departure and expected return dates are required', 'error');
      return;
    }
    if (form.toDate < form.fromDate) {
      showToast('Expected return date must be on or after the departure date.', 'error');
      return;
    }
    if (!form.destination.trim()) {
      showToast('Destination address is required', 'error');
      return;
    }
    if (!form.emergencyContact.trim()) {
      showToast('Parent / Guardian contact number is required', 'error');
      return;
    }
    if (!form.reason.trim()) {
      showToast('Reason for leave is required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        departureDate: form.fromDate,
        expectedReturn: form.toDate,
        destinationAddress: form.destination,
        parentGuardianContact: form.emergencyContact,
        reason: form.reason,
        // Alias fields for backwards compatibility
        fromDate: form.fromDate,
        toDate: form.toDate,
        destination: form.destination,
        emergencyContact: form.emergencyContact
      };

      const res = await api.post('/leave', payload);
      if (res.data.success) {
        showToast(res.data.message || 'Outpass request submitted successfully', 'success');
        setShowApplyModal(false);
        setForm({
          fromDate: new Date().toISOString().slice(0, 10),
          toDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          reason: '',
          destination: '',
          emergencyContact: ''
        });
        fetchLeaves();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to submit outpass request';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this pending outpass request?')) return;
    try {
      const res = await api.put(`/leave/${id}/cancel`);
      if (res.data.success) {
        showToast('Outpass request cancelled successfully', 'success');
        fetchLeaves();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to cancel request';
      showToast(msg, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-indigo-600" /> Gate Leave & Outpass Applications
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Submit overnight leave requests for warden approval before leaving the campus gates.
          </p>
        </div>

        <button
          onClick={() => setShowApplyModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Apply for New Outpass
        </button>
      </div>

      {/* Leave Requests Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3.5">Request ID</th>
                <th className="px-6 py-3.5">Leave Duration</th>
                <th className="px-6 py-3.5">Destination & Reason</th>
                <th className="px-6 py-3.5">Parent / Contact</th>
                <th className="px-6 py-3.5">Applied Date</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Warden Remarks</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    Loading your leave applications...
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    No leave requests submitted yet. Click "Apply for New Outpass" above to submit one.
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => {
                  const statusUpper = (leave.status || '').toUpperCase();
                  const isPending = statusUpper === 'PENDING';
                  const isApproved = statusUpper === 'APPROVED';
                  const isRejected = statusUpper === 'REJECTED';
                  const isCancelled = statusUpper === 'CANCELLED';

                  return (
                    <tr key={leave.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="px-6 py-3.5">
                        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {leave.leave_id || leave.id}
                        </span>
                      </td>

                      <td className="px-6 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {(leave as any).departure_date || leave.from_date} &rarr; {(leave as any).expected_return || leave.to_date}
                        </div>
                      </td>

                      <td className="px-6 py-3.5">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>{(leave as any).destination_address || leave.destination}</span>
                        </div>
                        <div className="text-slate-400 text-[11px] mt-0.5">{leave.reason}</div>
                      </td>

                      <td className="px-6 py-3.5 text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{(leave as any).parent_guardian_contact || leave.emergency_contact}</span>
                        </div>
                      </td>

                      <td className="px-6 py-3.5 text-slate-500">
                        {(leave.created_at || '').slice(0, 10)}
                      </td>

                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : isRejected
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : isCancelled
                              ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {isApproved && <CheckCircle2 className="w-3 h-3" />}
                          {isRejected && <XCircle className="w-3 h-3" />}
                          {(isPending || isCancelled) && <Clock className="w-3 h-3" />}
                          {isPending ? 'Pending' : isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Cancelled'}
                        </span>
                      </td>

                      <td className="px-6 py-3.5 text-slate-600 dark:text-slate-300 max-w-xs">
                        {(leave as any).rejection_reason || leave.review_notes || (isPending ? 'Pending warden review' : 'No notes')}
                      </td>

                      <td className="px-6 py-3.5 text-right">
                        {isPending ? (
                          <button
                            onClick={() => handleCancelRequest(leave.id)}
                            className="text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 text-[11px] font-semibold hover:underline cursor-pointer"
                          >
                            Cancel
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" /> Apply for Gate Outpass
              </h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Departure Date *</label>
                  <input
                    type="date"
                    required
                    value={form.fromDate}
                    onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Expected Return *</label>
                  <input
                    type="date"
                    required
                    min={form.fromDate}
                    value={form.toDate}
                    onChange={(e) => setForm({ ...form, toDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Destination Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Home, 124 Park Ave / City Center"
                  value={form.destination}
                  onChange={(e) => setForm({ ...form, destination: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Parent / Guardian Contact *</label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 019-2834"
                  value={form.emergencyContact}
                  onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Reason for Leave *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Visiting home for sister's wedding / Family medical obligation"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 rounded-xl font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl font-semibold bg-indigo-600 text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

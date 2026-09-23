import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  IndianRupee,
  Receipt,
  X,
  FileSpreadsheet
} from 'lucide-react';
import api from '../../services/api.js';
import { FeeInvoice, Student } from '../../types/index.js';
import { useToast } from '../../contexts/ToastContext.js';

export const FeesPage: React.FC = () => {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<FeeInvoice | null>(null);

  const [addForm, setAddForm] = useState({
    studentId: '',
    title: 'Semester Hostel & Mess Fee',
    amount: '1200',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    feeType: 'Hostel'
  });

  const [payForm, setPayForm] = useState({
    paymentMethod: 'Card',
    referenceNumber: `TXN-${Math.floor(100000 + Math.random() * 900000)}`
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [feesRes, stuRes] = await Promise.all([
        api.get('/fees', { params: { status: statusFilter || undefined } }),
        api.get('/admin/students')
      ]);
      if (feesRes.data.success) setInvoices(feesRes.data.data);
      if (stuRes.data.success) setStudents(stuRes.data.data);
    } catch (err) {
      showToast('Failed to load fee invoices', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/fees', addForm);
      if (res.data.success) {
        showToast('Fee invoice generated', 'success');
        setShowAddModal(false);
        fetchData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to generate invoice', 'error');
    }
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    try {
      const res = await api.post(`/fees/${selectedInvoice.id}/pay`, payForm);
      if (res.data.success) {
        showToast('Payment recorded successfully', 'success');
        setShowPayModal(false);
        fetchData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Payment failed', 'error');
    }
  };

  const totalBilled = invoices.reduce((acc, i) => acc + (i.amount || 0), 0);
  const totalPaid = invoices.filter((i) => i.status === 'Paid').reduce((acc, i) => acc + (i.amount || 0), 0);
  const totalPending = totalBilled - totalPaid;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" /> Student Fee & Dues Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track hostel accommodation dues, mess billing, payment receipts, and collection status.
          </p>
        </div>

        <button
          onClick={() => {
            if (students.length > 0) setAddForm({ ...addForm, studentId: students[0].id });
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" /> Issue Fee Invoice
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">Total Invoiced</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">₹{totalBilled.toLocaleString()}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-500 block mb-1">Total Collected</span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">₹{totalPaid.toLocaleString()}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-500 block mb-1">Outstanding Dues</span>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">₹{totalPending.toLocaleString()}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search student or invoice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
        >
          <option value="">All Statuses</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      {/* Invoices Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3.5">Invoice & Resident</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Due Date</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No fee invoices found.
                  </td>
                </tr>
              ) : (
                invoices
                  .filter((i) =>
                    !search ||
                    i.student_name?.toLowerCase().includes(search.toLowerCase()) ||
                    i.title?.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="px-6 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">{inv.title}</div>
                        <div className="text-slate-400 text-[11px]">{inv.student_name} ({inv.student_roll})</div>
                      </td>

                      <td className="px-6 py-3.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {inv.fee_type}
                        </span>
                      </td>

                      <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white">
                        ₹{inv.amount.toLocaleString()}
                      </td>

                      <td className="px-6 py-3.5 text-slate-500">
                        {inv.due_date}
                      </td>

                      <td className="px-6 py-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            inv.status === 'Paid'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : inv.status === 'Overdue'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>

                      <td className="px-6 py-3.5 text-right">
                        {inv.status !== 'Paid' ? (
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setShowPayModal(true);
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition"
                          >
                            Record Payment
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Paid on {inv.paid_date}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Invoice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Issue Fee Invoice</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Resident Student *</label>
                <select
                  required
                  value={addForm.studentId}
                  onChange={(e) => setAddForm({ ...addForm, studentId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.full_name} ({s.student_id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Invoice Title *</label>
                <input
                  type="text"
                  required
                  value={addForm.title}
                  onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={addForm.amount}
                    onChange={(e) => setAddForm({ ...addForm, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Fee Type</label>
                  <select
                    value={addForm.feeType}
                    onChange={(e) => setAddForm({ ...addForm, feeType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Hostel">Hostel Accommodation</option>
                    <option value="Mess">Mess / Food</option>
                    <option value="Maintenance">Maintenance & Facilities</option>
                    <option value="Deposit">Caution Deposit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Payment Due Date *</label>
                <input
                  type="date"
                  required
                  value={addForm.dueDate}
                  onChange={(e) => setAddForm({ ...addForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
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
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Record Invoice Payment</h3>
              <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaySubmit} className="p-6 space-y-3.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-slate-800">
                <div className="font-bold text-slate-900 dark:text-white">{selectedInvoice?.title}</div>
                <div className="text-slate-500">Resident: {selectedInvoice?.student_name}</div>
                <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
                  ₹{selectedInvoice?.amount.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Payment Method</label>
                <select
                  value={payForm.paymentMethod}
                  onChange={(e) => setPayForm({ ...payForm, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="Card">Credit / Debit Card</option>
                  <option value="Bank Transfer">Bank Wire Transfer (ACH/NEFT)</option>
                  <option value="Cash">Cash at Campus Bursar</option>
                  <option value="UPI">UPI / Digital Wallet</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Transaction Reference Number
                </label>
                <input
                  type="text"
                  required
                  value={payForm.referenceNumber}
                  onChange={(e) => setPayForm({ ...payForm, referenceNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 rounded-xl font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-semibold bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                >
                  Confirm & Settle Fee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  Receipt,
  X
} from 'lucide-react';
import api from '../../services/api.js';
import { FeeInvoice } from '../../types/index.js';
import { useToast } from '../../contexts/ToastContext.js';

export const StudentFeesPage: React.FC = () => {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<FeeInvoice | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);

  const [payForm, setPayForm] = useState({
    paymentMethod: 'Card',
    referenceNumber: `STU-${Math.floor(100000 + Math.random() * 900000)}`
  });

  const fetchFees = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/fees');
      if (res.data.success) {
        setInvoices(res.data.data);
      }
    } catch (err) {
      showToast('Failed to load fee invoices', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    try {
      const res = await api.post(`/fees/${selectedInvoice.id}/pay`, payForm);
      if (res.data.success) {
        showToast('Payment processed successfully. Receipt saved!', 'success');
        setShowPayModal(false);
        fetchFees();
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Payment failed', 'error');
    }
  };

  const totalOutstanding = invoices
    .filter((i) => i.status !== 'Paid')
    .reduce((acc, i) => acc + (i.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" /> Accommodation & Mess Fee Invoices
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Review your semester billing statements, hostel dues, and digital receipts.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-4">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Balance Due</span>
            <div className="text-xl font-black text-amber-600 dark:text-amber-400">₹{totalOutstanding.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3.5">Invoice Description</th>
                <th className="px-6 py-3.5">Fee Category</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Due Date</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No invoices issued. Your account has no pending balance.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white">
                      {inv.title}
                    </td>

                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {inv.fee_type}
                      </span>
                    </td>

                    <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white text-sm">
                      ₹{inv.amount.toLocaleString()}
                    </td>

                    <td className="px-6 py-3.5 text-slate-500">
                      {inv.due_date}
                    </td>

                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : inv.status === 'Overdue'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {inv.status === 'Paid' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
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
                          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition"
                        >
                          Pay Now
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          Receipt #{inv.transaction_ref || 'PAID'}
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

      {/* Pay Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Pay Semester Fee</h3>
              <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaySubmit} className="p-6 space-y-3.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-slate-800">
                <span className="text-slate-500 block">{selectedInvoice?.title}</span>
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                  ₹{selectedInvoice?.amount.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Due before: {selectedInvoice?.due_date}</div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Payment Method</label>
                <select
                  value={payForm.paymentMethod}
                  onChange={(e) => setPayForm({ ...payForm, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="Credit/Debit Card">Credit / Debit Card</option>
                  <option value="Campus Bursar Portal">Campus Student Portal Account</option>
                  <option value="UPI">UPI / Digital Wallet</option>
                  <option value="Bank Wire">Bank Wire Transfer</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Transaction Confirmation Reference
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
                  Confirm & Pay Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

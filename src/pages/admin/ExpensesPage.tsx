import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  Trash2,
  Calendar,
  Building,
  IndianRupee,
  TrendingUp,
  X
} from 'lucide-react';
import api from '../../services/api.js';
import { HostelExpense, Hostel } from '../../types/index.js';
import { useToast } from '../../contexts/ToastContext.js';

export const ExpensesPage: React.FC = () => {
  const { showToast } = useToast();
  const [expenses, setExpenses] = useState<HostelExpense[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);

  const [categoryFilter, setCategoryFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [addForm, setAddForm] = useState({
    hostelId: 'hostel_01',
    category: 'Utilities',
    title: '',
    amount: '',
    expenseDate: new Date().toISOString().slice(0, 10),
    description: '',
    vendor: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expRes, hRes] = await Promise.all([
        api.get('/expenses', { params: { category: categoryFilter || undefined } }),
        api.get('/hostels')
      ]);
      if (expRes.data.success) setExpenses(expRes.data.data);
      if (hRes.data.success) setHostels(hRes.data.data);
    } catch (err) {
      showToast('Failed to load expenses', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryFilter]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/expenses', addForm);
      if (res.data.success) {
        showToast('Expense recorded', 'success');
        setShowAddModal(false);
        fetchData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to record expense', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense record?')) return;
    try {
      const res = await api.delete(`/expenses/${id}`);
      if (res.data.success) {
        showToast('Expense deleted', 'success');
        fetchData();
      }
    } catch (err) {
      showToast('Failed to delete expense', 'error');
    }
  };

  const totalExpense = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600" /> Operational Expense Tracker
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit power, water, kitchen procurement, facility upkeep, and security expenditures.
          </p>
        </div>

        <button
          onClick={() => {
            setAddForm({
              hostelId: 'hostel_01',
              category: 'Utilities',
              title: '',
              amount: '',
              expenseDate: new Date().toISOString().slice(0, 10),
              description: '',
              vendor: ''
            });
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" /> Log New Expense
        </button>
      </div>

      {/* Summary KPI */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Operational Expenditures
          </span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">₹{totalExpense.toLocaleString()}</div>
          <span className="text-xs text-slate-500 mt-1 block">Logged across all campus blocks</span>
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
        >
          <option value="">All Categories</option>
          <option value="Utilities">Utilities (Power, Water, Gas)</option>
          <option value="Food & Mess">Food & Mess Procurement</option>
          <option value="Maintenance">Maintenance & Repairs</option>
          <option value="Security">Security & Patrol</option>
          <option value="Internet">Campus Broadband</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3.5">Expense & Vendor</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Hostel Campus</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No expense records found.
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="px-6 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{exp.title}</div>
                      <div className="text-slate-400 text-[11px]">{exp.vendor || 'Campus Facility Office'} &bull; {exp.description}</div>
                    </td>

                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                        {exp.category}
                      </span>
                    </td>

                    <td className="px-6 py-3.5 text-slate-600 dark:text-slate-300">
                      {exp.hostel_name}
                    </td>

                    <td className="px-6 py-3.5 text-slate-500">
                      {exp.expense_date}
                    </td>

                    <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white text-sm">
                      ₹{exp.amount.toLocaleString()}
                    </td>

                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Log Operational Expense</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Expense Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Electricity Bill - Block A"
                  value={addForm.title}
                  onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Category *</label>
                  <select
                    value={addForm.category}
                    onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Utilities">Utilities</option>
                    <option value="Food & Mess">Food & Mess</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Security">Security</option>
                    <option value="Internet">Internet</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    placeholder="4500"
                    value={addForm.amount}
                    onChange={(e) => setAddForm({ ...addForm, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Hostel</label>
                  <select
                    value={addForm.hostelId}
                    onChange={(e) => setAddForm({ ...addForm, hostelId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {hostels.map((h) => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={addForm.expenseDate}
                    onChange={(e) => setAddForm({ ...addForm, expenseDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Vendor / Payee</label>
                <input
                  type="text"
                  placeholder="e.g. City Power Grid Corp"
                  value={addForm.vendor}
                  onChange={(e) => setAddForm({ ...addForm, vendor: e.target.value })}
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
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

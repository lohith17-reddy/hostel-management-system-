import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  Building,
  Phone,
  Mail,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api.js';
import { Warden, Hostel, Block } from '../../types/index.js';
import { useToast } from '../../contexts/ToastContext.js';

export const WardensPage: React.FC = () => {
  const { showToast } = useToast();
  const [wardens, setWardens] = useState<Warden[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedWarden, setSelectedWarden] = useState<Warden | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    hostelId: 'hostel_01',
    blockId: 'block_01',
    status: 'Active'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [wRes, hRes, bRes] = await Promise.all([
        api.get('/admin/wardens'),
        api.get('/hostels'),
        api.get('/blocks')
      ]);
      if (wRes.data.success) setWardens(wRes.data.data);
      if (hRes.data.success) setHostels(hRes.data.data);
      if (bRes.data.success) setBlocks(bRes.data.data);
    } catch (err) {
      showToast('Failed to load wardens', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/wardens', formData);
      if (res.data.success) {
        showToast('Warden supervisor added successfully', 'success');
        setShowAddModal(false);
        fetchData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to add warden', 'error');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarden) return;
    try {
      const res = await api.put(`/admin/wardens/${selectedWarden.id}`, formData);
      if (res.data.success) {
        showToast('Warden details updated', 'success');
        setShowEditModal(false);
        fetchData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to update warden', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this warden supervisor?')) return;
    try {
      const res = await api.delete(`/admin/wardens/${id}`);
      if (res.data.success) {
        showToast('Warden removed', 'success');
        fetchData();
      }
    } catch (err: any) {
      showToast('Failed to delete warden', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600" /> Hostel Wardens Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Designate warden supervisors, assigned blocks, and operational custody.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              name: '',
              email: '',
              phone: '',
              hostelId: 'hostel_01',
              blockId: 'block_01',
              status: 'Active'
            });
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" /> Appoint New Warden
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {wardens.map((warden) => (
          <div
            key={warden.id}
            className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={warden.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${warden.name}`}
                  alt=""
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/20"
                />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{warden.name}</h3>
                  <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                    {warden.warden_id}
                  </span>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  warden.status === 'Active'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {warden.status}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-3">
              <div className="flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{warden.hostel_name || 'Hostel'} &bull; {warden.block_name || 'Block'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{warden.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{warden.phone || 'No phone recorded'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">
                {warden.assigned_students_count || 0} residents under supervision
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setSelectedWarden(warden);
                    setFormData({
                      name: warden.name,
                      email: warden.email,
                      phone: warden.phone,
                      hostelId: warden.hostel_id,
                      blockId: warden.block_id,
                      status: warden.status
                    });
                    setShowEditModal(true);
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(warden.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Warden Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Appoint New Hostel Warden</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Supervisor Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Assigned Hostel</label>
                  <select
                    value={formData.hostelId}
                    onChange={(e) => setFormData({ ...formData, hostelId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {hostels.map((h) => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Assigned Block</label>
                  <select
                    value={formData.blockId}
                    onChange={(e) => setFormData({ ...formData, blockId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {blocks.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
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
                  Save Warden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Warden Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Edit Warden Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Supervisor Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Hostel</label>
                  <select
                    value={formData.hostelId}
                    onChange={(e) => setFormData({ ...formData, hostelId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {hostels.map((h) => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-semibold bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

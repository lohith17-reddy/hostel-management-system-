import React, { useState, useEffect } from 'react';
import {
  BedDouble,
  Building,
  Plus,
  ArrowRightLeft,
  LogOut,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  User,
  Clock
} from 'lucide-react';
import api from '../../services/api.js';
import { RoomAllocation, Student, Room } from '../../types/index.js';
import { useToast } from '../../contexts/ToastContext.js';

export const AllocationsPage: React.FC = () => {
  const { showToast } = useToast();
  const [allocations, setAllocations] = useState<RoomAllocation[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showVacateModal, setShowVacateModal] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<RoomAllocation | null>(null);

  // Forms
  const [allocateForm, setAllocateForm] = useState({
    studentId: '',
    hostelId: 'hostel_01',
    roomId: '',
    bedNumber: '1',
    notes: ''
  });

  const [transferForm, setTransferForm] = useState({
    newHostelId: 'hostel_01',
    newRoomId: '',
    newBedNumber: '1',
    reason: ''
  });

  const [vacateReason, setVacateReason] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allocRes, stuRes, roomsRes] = await Promise.all([
        api.get('/allocations', { params: { status: statusFilter || undefined } }),
        api.get('/admin/students'),
        api.get('/rooms')
      ]);

      if (allocRes.data.success) setAllocations(allocRes.data.data);
      if (stuRes.data.success) setStudents(stuRes.data.data);
      if (roomsRes.data.success) setRooms(roomsRes.data.data);
    } catch (err) {
      showToast('Failed to load allocations data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleAllocateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/allocations', allocateForm);
      if (res.data.success) {
        showToast('Room successfully allocated', 'success');
        setShowAllocateModal(false);
        fetchData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Allocation failed', 'error');
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAllocation) return;
    try {
      const res = await api.post('/allocations/change', {
        studentId: selectedAllocation.student_id,
        ...transferForm
      });
      if (res.data.success) {
        showToast('Room transfer completed successfully', 'success');
        setShowTransferModal(false);
        fetchData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Transfer failed', 'error');
    }
  };

  const handleVacateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAllocation) return;
    try {
      const res = await api.post('/allocations/vacate', {
        studentId: selectedAllocation.student_id,
        reason: vacateReason
      });
      if (res.data.success) {
        showToast('Student successfully vacated', 'success');
        setShowVacateModal(false);
        fetchData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to vacate room', 'error');
    }
  };

  const unassignedStudents = students.filter((s) => !s.room_id);
  const selectedRoomBeds = rooms.find((r) => r.id === allocateForm.roomId)?.beds || [];
  const transferRoomBeds = rooms.find((r) => r.id === transferForm.newRoomId)?.beds || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-indigo-600" /> Room Allocations & Transfers
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time bed assignment with automated conflict and double-booking prevention.
          </p>
        </div>

        <button
          onClick={() => {
            if (unassignedStudents.length > 0) {
              setAllocateForm({ ...allocateForm, studentId: unassignedStudents[0].id });
            }
            setShowAllocateModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" /> Allocate New Bed
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search student or room..."
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
          <option value="">All Allocation Statuses</option>
          <option value="Active">Active Allocations</option>
          <option value="Transferred">Transferred</option>
          <option value="Vacated">Vacated</option>
        </select>
      </div>

      {/* Allocations Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3.5">Student</th>
                <th className="px-6 py-3.5">Assigned Room</th>
                <th className="px-6 py-3.5">Hostel & Block</th>
                <th className="px-6 py-3.5">Date Allocated</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {allocations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No room allocations recorded.
                  </td>
                </tr>
              ) : (
                allocations
                  .filter((a) =>
                    !search ||
                    a.student_name?.toLowerCase().includes(search.toLowerCase()) ||
                    a.room_number?.includes(search)
                  )
                  .map((alloc) => (
                    <tr key={alloc.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="px-6 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">{alloc.student_name}</div>
                        <div className="text-[11px] text-slate-400">{alloc.student_roll} &bull; {alloc.department}</div>
                      </td>

                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold">
                          <BedDouble className="w-3.5 h-3.5" />
                          Room {alloc.room_number} (Bed {alloc.bed_number})
                        </span>
                      </td>

                      <td className="px-6 py-3.5 text-slate-600 dark:text-slate-300">
                        {alloc.hostel_name} &bull; {alloc.block_name}
                      </td>

                      <td className="px-6 py-3.5 text-slate-500">
                        {alloc.allocated_date}
                        {alloc.vacated_date && <div className="text-[10px] text-rose-500">Vacated: {alloc.vacated_date}</div>}
                      </td>

                      <td className="px-6 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            alloc.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : alloc.status === 'Transferred'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {alloc.status}
                        </span>
                      </td>

                      <td className="px-6 py-3.5 text-right">
                        {alloc.status === 'Active' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedAllocation(alloc);
                                setShowTransferModal(true);
                              }}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition flex items-center gap-1"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" /> Change
                            </button>

                            <button
                              onClick={() => {
                                setSelectedAllocation(alloc);
                                setShowVacateModal(true);
                              }}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition flex items-center gap-1"
                            >
                              <LogOut className="w-3.5 h-3.5" /> Vacate
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Allocate Room Modal */}
      {showAllocateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Allocate Room & Bed</h3>
              <button onClick={() => setShowAllocateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAllocateSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Select Student Resident *
                </label>
                <select
                  required
                  value={allocateForm.studentId}
                  onChange={(e) => setAllocateForm({ ...allocateForm, studentId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">Select unallocated student...</option>
                  {unassignedStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.student_id}) - {s.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Target Room *</label>
                <select
                  required
                  value={allocateForm.roomId}
                  onChange={(e) => setAllocateForm({ ...allocateForm, roomId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">Choose an available room...</option>
                  {rooms
                    .filter((r) => r.available_beds > 0 && r.status !== 'Maintenance')
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        Room {r.room_number} ({r.hostel_name}) &bull; {r.available_beds} beds free
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Available Bed Number *
                </label>
                <select
                  required
                  value={allocateForm.bedNumber}
                  onChange={(e) => setAllocateForm({ ...allocateForm, bedNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {selectedRoomBeds
                    .filter((b) => b.status === 'Available')
                    .map((b) => (
                      <option key={b.bed_number} value={b.bed_number}>
                        Bed {b.bed_number} (Free)
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAllocateModal(false)}
                  className="px-4 py-2 rounded-xl font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-semibold bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Room Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Transfer Student Room</h3>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="p-6 space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Current: <span className="font-bold">{selectedAllocation?.student_name}</span> in Room {selectedAllocation?.room_number} (Bed {selectedAllocation?.bed_number})
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">New Target Room *</label>
                <select
                  required
                  value={transferForm.newRoomId}
                  onChange={(e) => setTransferForm({ ...transferForm, newRoomId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">Select target room...</option>
                  {rooms
                    .filter((r) => r.available_beds > 0 && r.id !== selectedAllocation?.room_id)
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        Room {r.room_number} ({r.hostel_name}) &bull; {r.available_beds} beds free
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Select New Bed *</label>
                <select
                  required
                  value={transferForm.newBedNumber}
                  onChange={(e) => setTransferForm({ ...transferForm, newBedNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {transferRoomBeds
                    .filter((b) => b.status === 'Available')
                    .map((b) => (
                      <option key={b.bed_number} value={b.bed_number}>
                        Bed {b.bed_number} (Available)
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Reason for Transfer</label>
                <input
                  type="text"
                  placeholder="e.g. Student requested medical floor ground accommodation"
                  value={transferForm.reason}
                  onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 rounded-xl font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-semibold bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                >
                  Complete Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vacate Modal */}
      {showVacateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Vacate Bed?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Release bed for <span className="font-bold text-slate-800 dark:text-slate-200">{selectedAllocation?.student_name}</span> in Room {selectedAllocation?.room_number}?
              </p>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 text-xs block mb-1">Reason for Vacating</label>
              <input
                type="text"
                placeholder="e.g. Semester completion / Hostel checkout"
                value={vacateReason}
                onChange={(e) => setVacateReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-semibold pt-2">
              <button
                onClick={() => setShowVacateModal(false)}
                className="py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleVacateSubmit}
                className="py-2.5 rounded-xl bg-rose-600 text-white shadow-md shadow-rose-600/20"
              >
                Confirm Vacate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  BedDouble,
  Building,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  MessageSquareWarning,
  CalendarDays
} from 'lucide-react';
import api from '../../services/api.js';
import { Student } from '../../types/index.js';
import { useToast } from '../../contexts/ToastContext.js';

export const StudentsPage: React.FC = () => {
  const { showToast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [viewDetails, setViewDetails] = useState<any>(null);

  // Form states
  const [formData, setFormData] = useState<any>({
    fullName: '',
    email: '',
    phone: '',
    gender: 'Male',
    department: 'Computer Science & Engineering',
    year: '1st Year',
    parentName: '',
    parentPhone: '',
    address: '',
    hostelId: 'hostel_01'
  });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/students', {
        params: {
          search,
          department: departmentFilter || undefined,
          year: yearFilter || undefined,
          status: statusFilter || undefined
        }
      });
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      showToast('Failed to fetch students', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [departmentFilter, yearFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleOpenAdd = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      gender: 'Male',
      department: 'Computer Science & Engineering',
      year: '1st Year',
      parentName: '',
      parentPhone: '',
      address: '',
      hostelId: 'hostel_01'
    });
    setShowAddModal(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/students', formData);
      if (res.data.success) {
        showToast('Student enrolled successfully', 'success');
        setShowAddModal(false);
        fetchStudents();
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to enroll student', 'error');
    }
  };

  const handleOpenEdit = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      fullName: student.full_name,
      phone: student.phone,
      gender: student.gender,
      department: student.department,
      year: student.year,
      parentName: student.parent_name,
      parentPhone: student.parent_phone,
      address: student.address,
      status: student.status
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      const res = await api.put(`/admin/students/${selectedStudent.id}`, formData);
      if (res.data.success) {
        showToast('Student updated successfully', 'success');
        setShowEditModal(false);
        fetchStudents();
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to update student', 'error');
    }
  };

  const handleOpenView = async (student: Student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
    try {
      const res = await api.get(`/admin/students/${student.id}`);
      if (res.data.success) {
        setViewDetails(res.data.data);
      }
    } catch (err) {
      showToast('Failed to load student dossier', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStudent) return;
    try {
      const res = await api.delete(`/admin/students/${selectedStudent.id}`);
      if (res.data.success) {
        showToast('Student deleted successfully', 'success');
        setShowDeleteModal(false);
        fetchStudents();
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to delete student', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" /> Student Resident Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage student registrations, academic info, bed assignments, and resident history.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" /> Enrol New Student
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, roll ID, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            <option value="">All Departments</option>
            <option value="Computer Science & Engineering">Computer Science</option>
            <option value="Mechanical Engineering">Mechanical</option>
            <option value="Electrical & Electronics">Electrical</option>
            <option value="Information Technology">Information Tech</option>
          </select>

          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            <option value="">All Years</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Alumni">Alumni</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3.5">Student</th>
                <th className="px-6 py-3.5">Roll / Dept</th>
                <th className="px-6 py-3.5">Room & Bed</th>
                <th className="px-6 py-3.5">Hostel Campus</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No students match the current criteria.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.full_name}`}
                          alt={student.full_name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{student.full_name}</div>
                          <div className="text-slate-400 text-[11px]">{student.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-3.5">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{student.student_id}</div>
                      <div className="text-slate-400 text-[11px]">{student.department} &bull; {student.year}</div>
                    </td>

                    <td className="px-6 py-3.5">
                      {student.room_number ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold">
                          <BedDouble className="w-3.5 h-3.5" />
                          Room {student.room_number} (Bed {student.bed_number})
                        </div>
                      ) : (
                        <span className="text-amber-500 font-medium">Unallocated</span>
                      )}
                    </td>

                    <td className="px-6 py-3.5 text-slate-600 dark:text-slate-400">
                      {student.hostel_name || 'Unassigned'}
                    </td>

                    <td className="px-6 py-3.5">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        student.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {student.status}
                      </span>
                    </td>

                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenView(student)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="View Dossier"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(student)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Edit Student"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowDeleteModal(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Student Dossier Modal */}
      {showViewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" /> Student Profile Dossier
              </h3>
              <button onClick={() => setShowViewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Header profile card */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50/60 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700">
                <img
                  src={selectedStudent?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStudent?.full_name}`}
                  alt=""
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500"
                />
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">{selectedStudent?.full_name}</h2>
                  <div className="text-indigo-600 dark:text-indigo-400 font-semibold">{selectedStudent?.student_id}</div>
                  <div className="text-slate-500 dark:text-slate-400">{selectedStudent?.department} &bull; {selectedStudent?.year}</div>
                </div>
              </div>

              {/* Grid of info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Room Assignment</span>
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedStudent?.room_number ? `Room ${selectedStudent?.room_number} (Bed ${selectedStudent?.bed_number})` : 'Unassigned'}
                  </div>
                  <div className="text-[11px] text-slate-500">{selectedStudent?.hostel_name}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Parent Contact</span>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{selectedStudent?.parent_name || 'N/A'}</div>
                  <div className="text-[11px] text-slate-500">{selectedStudent?.parent_phone || 'N/A'}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Contact Details</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{selectedStudent?.email}</div>
                  <div className="text-[11px] text-slate-500">{selectedStudent?.phone}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Joining Date</span>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{selectedStudent?.joining_date}</div>
                  <div className="text-[11px] text-emerald-600 font-semibold">Status: {selectedStudent?.status}</div>
                </div>
              </div>

              {/* Recent Complaints */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <MessageSquareWarning className="w-3.5 h-3.5 text-rose-500" /> Complaints Logged ({viewDetails?.complaints?.length || 0})
                </h4>
                <div className="space-y-1.5">
                  {(viewDetails?.complaints || []).slice(0, 3).map((c: any) => (
                    <div key={c.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center text-[11px]">
                      <span>{c.title} ({c.category})</span>
                      <span className="font-semibold text-indigo-600">{c.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Leaves */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-amber-500" /> Leave Applications ({viewDetails?.leaveRequests?.length || 0})
                </h4>
                <div className="space-y-1.5">
                  {(viewDetails?.leaveRequests || []).slice(0, 3).map((l: any) => (
                    <div key={l.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center text-[11px]">
                      <span>{l.from_date} to {l.to_date} &bull; {l.destination}</span>
                      <span className="font-semibold text-emerald-600">{l.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Enrol New Student Resident</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Computer Science & Engineering">Computer Science</option>
                    <option value="Mechanical Engineering">Mechanical</option>
                    <option value="Electrical & Electronics">Electrical</option>
                    <option value="Information Technology">Information Tech</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Academic Year</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Parent Name</label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Parent Phone</label>
                  <input
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
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
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Delete Student?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <span className="font-bold text-slate-800 dark:text-slate-200">{selectedStudent?.full_name}</span>? Their active bed allocation will also be released.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="py-2.5 rounded-xl bg-rose-600 text-white shadow-md shadow-rose-600/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

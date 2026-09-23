import React, { useState } from 'react';
import {
  User,
  Building,
  BedDouble,
  Mail,
  Phone,
  Lock,
  CheckCircle2,
  GraduationCap,
  Save
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.js';
import { useToast } from '../../contexts/ToastContext.js';
import api from '../../services/api.js';

export const StudentProfilePage: React.FC = () => {
  const { user, studentInfo } = useAuth();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      if (res.data.success) {
        showToast('Password updated successfully', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to update password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-600" /> Resident Profile & Credentials
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          View enrollment information, assigned room, and manage account security.
        </p>
      </div>

      {/* Profile Overview */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <img
          src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
          alt=""
          className="w-20 h-20 rounded-3xl object-cover ring-4 ring-indigo-500/20 shadow-md"
        />
        <div className="text-center sm:text-left space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            <GraduationCap className="w-3.5 h-3.5" /> Enrolled Resident Student
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
          <div className="text-xs text-slate-500 flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1">
            <span>Roll: <strong className="text-slate-700 dark:text-slate-300">{studentInfo?.student_id}</strong></span>
            <span>Department: <strong className="text-slate-700 dark:text-slate-300">{studentInfo?.department}</strong></span>
            <span>Room: <strong className="text-indigo-600 dark:text-indigo-400">#{studentInfo?.room_number || 'N/A'} (Bed {studentInfo?.bed_number || 'N/A'})</strong></span>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Contact Information</h3>
          <div className="space-y-2 text-slate-600 dark:text-slate-300">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-slate-400">Institutional Email:</span>
              <span className="font-semibold">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-slate-400">Mobile Phone:</span>
              <span className="font-semibold">{studentInfo?.phone || 'Not provided'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Date of Joining:</span>
              <span className="font-semibold">{studentInfo?.date_of_joining || '2024-08-15'}</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Guardian Information</h3>
          <div className="space-y-2 text-slate-600 dark:text-slate-300">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-slate-400">Parent / Guardian:</span>
              <span className="font-semibold">{studentInfo?.parent_name || 'Recorded on File'}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-slate-400">Emergency Phone:</span>
              <span className="font-semibold">{studentInfo?.parent_phone || 'Recorded on File'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Blood Group:</span>
              <span className="font-semibold">{studentInfo?.blood_group || 'O+'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-indigo-600" /> Change Password
        </h3>

        <form onSubmit={handlePasswordChange} className="space-y-3.5 max-w-md text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Current Password *</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">New Password *</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Confirm New Password *</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save New Password
          </button>
        </form>
      </div>
    </div>
  );
};

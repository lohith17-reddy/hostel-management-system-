import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Trash2,
  Calendar,
  AlertTriangle,
  Users,
  ShieldCheck,
  X
} from 'lucide-react';
import api from '../../services/api.js';
import { Announcement } from '../../types/index.js';
import { useToast } from '../../contexts/ToastContext.js';

export const AnnouncementsPage: React.FC = () => {
  const { showToast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    title: '',
    content: '',
    targetRole: 'ALL',
    isUrgent: false
  });

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/announcements');
      if (res.data.success) {
        setAnnouncements(res.data.data);
      }
    } catch (err) {
      showToast('Failed to load announcements', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/announcements', form);
      if (res.data.success) {
        showToast('Announcement broadcasted', 'success');
        setShowAddModal(false);
        setForm({ title: '', content: '', targetRole: 'ALL', isUrgent: false });
        fetchAnnouncements();
      }
    } catch (err: any) {
      showToast('Failed to post announcement', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this bulletin announcement?')) return;
    try {
      const res = await api.delete(`/announcements/${id}`);
      if (res.data.success) {
        showToast('Announcement removed', 'success');
        fetchAnnouncements();
      }
    } catch (err) {
      showToast('Failed to remove announcement', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-indigo-600" /> Hostel Noticeboard & Broadcasts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Publish notices to students, wardens, and institutional management staff.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" /> New Announcement
        </button>
      </div>

      {/* Announcements Stream */}
      <div className="space-y-4">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className={`p-5 rounded-3xl border transition-all ${
              ann.is_urgent === 1
                ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {ann.title}
                </span>
                {ann.is_urgent === 1 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> URGENT NOTICE
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Target: {ann.target_role}
                </span>
              </div>

              <button
                onClick={() => handleDelete(ann.id)}
                className="text-slate-400 hover:text-rose-600 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line mb-3">
              {ann.content}
            </p>

            <div className="text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
              <span>Posted by: {ann.author_name}</span>
              <span>{new Date(ann.created_at).toLocaleDateString()} {new Date(ann.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Announcement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Broadcast New Notice</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Headline / Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scheduled Water Pipeline Maintenance Tomorrow"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Target Audience</label>
                <select
                  value={form.targetRole}
                  onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="ALL">Everyone (Students & Wardens)</option>
                  <option value="STUDENT">Student Residents Only</option>
                  <option value="WARDEN">Warden Supervisors Only</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Detailed Message Content *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide complete notice details, dates, rules, or instructions..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.isUrgent}
                    onChange={(e) => setForm({ ...form, isUrgent: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                  />
                  Mark as High Priority / Urgent Alert
                </label>
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
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Search,
  Calendar,
  AlertTriangle,
  Users,
  ShieldCheck
} from 'lucide-react';
import api from '../../services/api.js';
import { Announcement } from '../../types/index.js';

export const NoticesPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const res = await api.get('/announcements');
        if (res.data.success) {
          setAnnouncements(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load notices:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-indigo-600" /> Official Notices & Circulars
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Important residential campus notifications, maintenance alerts, and institutional bulletins.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search notices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
          />
        </div>
      </div>

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            No notices published.
          </div>
        ) : (
          announcements
            .filter(
              (a) =>
                !search ||
                a.title.toLowerCase().includes(search.toLowerCase()) ||
                a.content.toLowerCase().includes(search.toLowerCase())
            )
            .map((ann) => (
              <div
                key={ann.id}
                className={`p-6 rounded-3xl border transition-all ${
                  ann.is_urgent === 1
                    ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-white text-base">
                      {ann.title}
                    </span>
                    {ann.is_urgent === 1 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> URGENT ALERT
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400 shrink-0">
                    {new Date(ann.created_at).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line mb-4">
                  {ann.content}
                </p>

                <div className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between">
                  <span>Author: {ann.author_name}</span>
                  <span>Target: {ann.target_role === 'ALL' ? 'All Hostel Residents & Staff' : ann.target_role}</span>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

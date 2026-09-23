import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Sun,
  Moon,
  LogOut,
  Sparkles,
  Menu,
  Check,
  User as UserIcon,
  ShieldCheck,
  Building2,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.js';
import { useTheme } from '../contexts/ThemeContext.js';
import api from '../services/api.js';
import { NotificationItem } from '../types/index.js';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
  onOpenAiAssistant: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar, onOpenAiAssistant }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch (err) {
      // quiet fail
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 25000);
    return () => clearInterval(interval);
  }, []);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      // quiet
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (e) {
      // quiet
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 lg:px-8 flex items-center justify-between transition-colors">
      {/* Left items */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              Hostel<span className="text-indigo-600 dark:text-indigo-400">Sphere</span>
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 -mt-1">
              Enterprise HMS
            </span>
          </div>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* AI Assistant button */}
        <button
          onClick={onOpenAiAssistant}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 hover:border-indigo-400 dark:hover:border-indigo-600 transition shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
          <span className="hidden md:inline">HostelAI Copilot</span>
          <span className="md:hidden">AI</span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">No new notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkAsRead(n.id)}
                      className={`p-3.5 text-xs transition cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 flex gap-3 items-start ${
                        n.is_read === 0 ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          n.is_read === 0 ? 'bg-indigo-600' : 'bg-transparent'
                        }`}
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 dark:text-white mb-0.5">{n.title}</div>
                        <div className="text-slate-500 dark:text-slate-400 leading-relaxed">{n.message}</div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {new Date(n.created_at).toLocaleDateString()} {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`}
              alt={user?.name || 'User'}
              className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
            />
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                {user?.name}
              </span>
              <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                {user?.role?.toUpperCase() === 'ADMIN' && <ShieldCheck className="w-2.5 h-2.5 text-indigo-500" />}
                {user?.role?.toUpperCase()}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
          </button>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</div>
                <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                  {user?.role?.toUpperCase()} Access
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={logout}
                  className="w-full px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out of Session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

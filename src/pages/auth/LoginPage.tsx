import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Building2, Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, User, Users, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.js';
import { useToast } from '../../contexts/ToastContext.js';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const remembered = localStorage.getItem('hostel_remember_email');
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    setLoading(true);
    try {
      const { redirectUrl } = await login({ email, password, rememberMe });
      showToast('Welcome back! Authentication successful.', 'success');
      const origin = (location.state as any)?.from?.pathname || redirectUrl;
      navigate(origin, { replace: true });
    } catch (err: any) {
      const message = err.response?.data?.error || err.response?.data?.message || 'Invalid email or password';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    try {
      const { redirectUrl } = await login({ email: demoEmail, password: demoPass, rememberMe: true });
      showToast('Welcome back! Authentication successful.', 'success');
      const origin = (location.state as any)?.from?.pathname || redirectUrl;
      navigate(origin, { replace: true });
    } catch (err: any) {
      const message = err.response?.data?.error || err.response?.data?.message || 'Invalid email or password';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Left hero banner */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 p-12 flex-col justify-between relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight">HostelSphere</span>
              <span className="block text-[11px] font-semibold text-indigo-300 uppercase tracking-widest">
                Campus Living Operating System
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 my-auto py-12 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Next-Generation Hostel Operations
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight mb-4">
            Unified Management for Residents, Wardens & Campus Admins
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed mb-8">
            Complete institutional infrastructure powering smart room allocation, real-time biometric attendance, food wastage AI intelligence, and transparent billing.
          </p>

          <div className="grid grid-cols-2 gap-4 text-xs font-medium">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Visual Room & Bed Allocation</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>AI Mess Wastage Predictor</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Strict Role-Based Control</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Automated Leave & Grievances</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-6 border-t border-white/10">
          <span>Enterprise Grade Security & JWT Auth</span>
          <span>Version 3.4 Production</span>
        </div>
      </div>

      {/* Right Login form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24">
        <div className="max-w-md w-full mx-auto">
          {/* Brand header on mobile */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">HostelSphere</span>
              <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Hostel Management
              </span>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Please enter your credentials to access your portal.
            </p>
          </div>

          {/* Quick 1-Click Role Switcher Demo Box */}
          <div className="mb-6 p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-slate-900 border border-indigo-100 dark:border-slate-800">
            <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> 1-Click Demo Logins
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@hostel.com', 'Admin123!')}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left hover:border-indigo-500 transition group text-xs shadow-xs"
              >
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Admin
                </div>
                <div className="text-[10px] text-slate-400 truncate">admin@hostel.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('warden.boys@hostel.com', 'Warden123!')}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left hover:border-indigo-500 transition group text-xs shadow-xs"
              >
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-emerald-600" /> Warden
                </div>
                <div className="text-[10px] text-slate-400 truncate">warden.boys@hostel.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('alexander.hayes@hostel.com', 'Student123!')}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left hover:border-indigo-500 transition group text-xs shadow-xs"
              >
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-blue-600" /> Student
                </div>
                <div className="text-[10px] text-slate-400 truncate">alexander.hayes@hostel.com</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-300 dark:border-slate-700 focus:ring-indigo-500"
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/20 disabled:opacity-60 transition flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 mt-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/signup" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
              Create student or warden account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

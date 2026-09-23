import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Building,
  BedDouble,
  PieChart as PieIcon,
  MessageSquareWarning,
  CalendarDays,
  UtensilsCrossed,
  Receipt,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Clock,
  ChevronRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import api from '../../services/api.js';

const COLORS = ['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#14B8A6'];

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading executive metrics...</p>
        </div>
      </div>
    );
  }

  const cards = data?.cards || {};
  const charts = data?.charts || {};
  const recent = data?.recent || {};

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold mb-2 text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Real-Time Operational Overview
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Hostel Executive Command Center
          </h1>
          <p className="text-indigo-200 text-xs mt-1 max-w-xl">
            Managing student housing, room capacity, resident safety, mess consumption, and institutional finances.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <button
            onClick={fetchStats}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
          </button>
          <Link
            to="/admin/reports"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-500 hover:bg-indigo-400 text-white shadow-md transition"
          >
            Generate Reports <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 11 KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Students</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{cards.totalStudents || 0}</div>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> Active Residents
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Wardens</span>
            <UserCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{cards.totalWardens || 0}</div>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">Supervisors</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Rooms</span>
            <Building className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{cards.totalRooms || 0}</div>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">Across all blocks</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Occupied Beds</span>
            <BedDouble className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{cards.occupiedBeds || 0}</div>
          <span className="text-[10px] text-emerald-600 font-medium mt-1 block">{cards.occupancyPercentage}% full</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Available Beds</span>
            <BedDouble className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{cards.availableBeds || 0}</div>
          <span className="text-[10px] text-cyan-600 font-medium mt-1 block">Ready to allocate</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Hostel Capacity</span>
            <PieIcon className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{cards.totalCapacity || 0}</div>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">Max beds planned</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Occupancy %</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{cards.occupancyPercentage}%</div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${cards.occupancyPercentage}%` }}></div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Complaints</span>
            <MessageSquareWarning className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{cards.pendingComplaints || 0}</div>
          <span className="text-[10px] text-rose-500 font-medium mt-1 block">Awaiting resolution</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Leave Requests</span>
            <CalendarDays className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{cards.pendingLeaveRequests || 0}</div>
          <span className="text-[10px] text-amber-500 font-medium mt-1 block">Pending approval</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Mess Wastage</span>
            <UtensilsCrossed className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{cards.foodWastageDailyAvgKg || 0} <span className="text-xs text-slate-400">kg/day</span></div>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">14-day rolling average</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs sm:col-span-2 lg:col-span-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Monthly Expenses</span>
            <Receipt className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            ₹{Number(cards.monthlyExpenses || 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium mt-1 block">Current Month Utilities & Operations</span>
        </div>
      </div>

      {/* Analytics Charts Grid - 5 Charts Required */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Room Occupancy */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">1. Room Occupancy by Hostel</h3>
              <p className="text-[11px] text-slate-400">Total capacity vs Occupied vs Available beds</p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Capacity Meter</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.roomOccupancy || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="hostel_name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px', background: '#1E293B', color: '#fff', border: 'none' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="occupied" name="Occupied" fill="#6366F1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="available" name="Available" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Student Statistics by Department */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">2. Student Statistics by Department</h3>
              <p className="text-[11px] text-slate-400">Distribution of residents across engineering faculties</p>
            </div>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.studentDept || []}
                  dataKey="count"
                  nameKey="department"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  label={({ name, percent }: any) => `${(name || '').substring(0, 10)}... ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {(charts.studentDept || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px', background: '#1E293B', color: '#fff', border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Complaints Statistics */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">3. Complaints Statistics by Category</h3>
              <p className="text-[11px] text-slate-400">Maintenance, electrical, plumbing & internet grievances</p>
            </div>
            <Link to="/admin/complaints" className="text-xs text-indigo-600 hover:underline font-semibold">
              Manage all &rarr;
            </Link>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.complaintsCategory || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 11 }} width={85} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px', background: '#1E293B', color: '#fff', border: 'none' }} />
                <Bar dataKey="count" name="Incidents" fill="#F43F5E" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Food Wastage Trends */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">4. Food Wastage Trends (Last 14 Days)</h3>
              <p className="text-[11px] text-slate-400">Food prepared vs Food wasted (kg)</p>
            </div>
            <Link to="/admin/food-wastage" className="text-xs text-indigo-600 hover:underline font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> AI Predictor
            </Link>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.foodWastageTrends || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(val) => val.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px', background: '#1E293B', color: '#fff', border: 'none' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="prepared_kg" name="Prepared (kg)" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
                <Area type="monotone" dataKey="wasted_kg" name="Wasted (kg)" stroke="#EF4444" fill="#EF4444" fillOpacity={0.25} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Monthly Hostel Expenses */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">5. Monthly Hostel Expenses by Category</h3>
              <p className="text-[11px] text-slate-400">Utilities, kitchen procurement, facility maintenance, and campus security</p>
            </div>
            <Link to="/admin/expenses" className="text-xs text-indigo-600 hover:underline font-semibold">
              View Expense Tracker &rarr;
            </Link>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.monthlyExpenses || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `₹${val}`} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px', background: '#1E293B', color: '#fff', border: 'none' }} formatter={(v) => `₹${v}`} />
                <Bar dataKey="amount" name="Cost (₹)" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Streams: Complaints & Leaves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Complaints */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquareWarning className="w-4 h-4 text-rose-500" /> Recent Student Complaints
            </h3>
            <Link to="/admin/complaints" className="text-xs text-indigo-600 hover:underline font-semibold">
              View all
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {(recent.complaints || []).map((c: any) => (
              <div key={c.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{c.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      c.priority === 'Urgent' || c.priority === 'High'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {c.priority}
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    {c.student_name} (Room {c.room_number || 'N/A'}) &bull; {c.category}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-lg text-[10px] font-semibold shrink-0 ${
                  c.status === 'Resolved'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : c.status === 'In Progress'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Leave Requests */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-amber-500" /> Recent Leave Applications
            </h3>
            <Link to="/admin/leave" className="text-xs text-indigo-600 hover:underline font-semibold">
              Review all
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {(recent.leaveRequests || []).map((l: any) => (
              <div key={l.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{l.student_name}</div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    {l.from_date} to {l.to_date} &bull; {l.destination}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-lg text-[10px] font-semibold shrink-0 ${
                  l.status === 'Approved'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : l.status === 'Rejected'
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {l.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Lock, Mail, User, Phone, BookOpen, MapPin, Eye, EyeOff, ArrowRight, Sparkles, Shield, Briefcase } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.js';
import { useToast } from '../../contexts/ToastContext.js';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { showToast } = useToast();

  const [role, setRole] = useState<'STUDENT' | 'WARDEN'>('STUDENT');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [year, setYear] = useState('1st Year');
  const [studentId, setStudentId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [address, setAddress] = useState('');
  const [hostelId, setHostelId] = useState('hostel_01');
  const [blockId, setBlockId] = useState('block_01');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !password) {
      showToast('Name, email, and password are required', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
        role: role.toLowerCase(),
        phone,
        gender,
        department,
        year,
        studentId: studentId.trim(),
        employeeId: employeeId.trim(),
        parentName,
        parentPhone,
        address,
        hostelId,
        blockId
      };

      const { redirectUrl } = await signup(payload);
      showToast('Account created successfully! Welcome to HostelSphere.', 'success');
      navigate(redirectUrl, { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to complete registration';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-xl w-full mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-indigo-600 items-center justify-center text-white shadow-lg shadow-indigo-600/30 mb-4">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Create Your HostelSphere Account
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Register as a Student resident or Hostel Warden. (Admin accounts are strictly provisioned internally)
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
          {/* Role selector tabs */}
          <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-6">
            <button
              type="button"
              onClick={() => setRole('STUDENT')}
              className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                role === 'STUDENT'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              Student Registration
            </button>
            <button
              type="button"
              onClick={() => setRole('WARDEN')}
              className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                role === 'WARDEN'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Warden Registration
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane.doe@university.edu"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password * (Min 6 chars)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Hostel Campus
                </label>
                <select
                  value={hostelId}
                  onChange={(e) => setHostelId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="hostel_01">Aryabhata Boys Hostel</option>
                  <option value="hostel_02">Gargi Girls Hostel</option>
                  <option value="hostel_03">Ramanujan Scholar Residence</option>
                </select>
              </div>

              {role === 'WARDEN' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Supervised Block / Wing
                  </label>
                  <select
                    value={blockId}
                    onChange={(e) => setBlockId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="block_01">Block A (Engineering)</option>
                    <option value="block_02">Block B (Science)</option>
                    <option value="block_03">Block C (Main Wing)</option>
                    <option value="block_04">Block D (New Wing)</option>
                    <option value="block_05">Block E (Postgraduate)</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Student ID / Roll No (Optional)
                  </label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g. STU-2026-088"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {role === 'STUDENT' ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Academic Department
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Electrical & Electronics">Electrical & Electronics</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Business Administration">Business Administration</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Academic Year
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Postgraduate">Postgraduate</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Parent / Guardian Name
                    </label>
                    <input
                      type="text"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="Guardian Name"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Parent Emergency Phone
                    </label>
                    <input
                      type="tel"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      placeholder="+1 (555) 999-0000"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Staff / Employee Code (Optional)
                </label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="e.g. WRD-2026-04"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Permanent Residential Address
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, city, state, postal code"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/20 disabled:opacity-60 transition flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 mt-4 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Complete {role === 'STUDENT' ? 'Student' : 'Warden'} Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
              Log in to your account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

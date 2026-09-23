import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';
import { User, Student, Warden } from '../types/index.js';

interface AuthContextType {
  user: User | null;
  studentInfo: Student | null;
  wardenInfo: Warden | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string; rememberMe?: boolean }) => Promise<{ redirectUrl: string }>;
  signup: (formData: any) => Promise<{ redirectUrl: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [studentInfo, setStudentInfo] = useState<Student | null>(null);
  const [wardenInfo, setWardenInfo] = useState<Warden | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const token = localStorage.getItem('hostel_token') || sessionStorage.getItem('hostel_token');
    if (!token) {
      setUser(null);
      setStudentInfo(null);
      setWardenInfo(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        const userData = response.data.data.user || response.data.data;
        setUser(userData);
        setStudentInfo(response.data.data.student || null);
        setWardenInfo(response.data.data.warden || null);
      }
    } catch (err) {
      console.warn('Failed to verify existing session:', err);
      localStorage.removeItem('hostel_token');
      localStorage.removeItem('hostel_user');
      sessionStorage.removeItem('hostel_token');
      sessionStorage.removeItem('hostel_user');
      setUser(null);
      setStudentInfo(null);
      setWardenInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async ({ email, password, rememberMe }: { email: string; password: string; rememberMe?: boolean }) => {
    const response = await api.post('/auth/login', { email, password, rememberMe });
    const { token, user: loggedUser, student, warden, redirectUrl } = response.data.data;

    localStorage.setItem('hostel_token', token);
    localStorage.setItem('hostel_user', JSON.stringify(loggedUser));
    if (rememberMe) {
      localStorage.setItem('hostel_remember_email', email);
    } else {
      localStorage.removeItem('hostel_remember_email');
    }

    setUser(loggedUser);
    setStudentInfo(student || null);
    setWardenInfo(warden || null);

    return { redirectUrl };
  };

  const signup = async (formData: any) => {
    const response = await api.post('/auth/signup', formData);
    const { token, user: newUser, redirectUrl } = response.data.data;

    localStorage.setItem('hostel_token', token);
    localStorage.setItem('hostel_user', JSON.stringify(newUser));
    setUser(newUser);
    await refreshUser();

    return { redirectUrl };
  };

  const logout = () => {
    api.post('/auth/logout').catch(() => {});
    localStorage.removeItem('hostel_token');
    localStorage.removeItem('hostel_user');
    sessionStorage.removeItem('hostel_token');
    sessionStorage.removeItem('hostel_user');
    setUser(null);
    setStudentInfo(null);
    setWardenInfo(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        studentInfo,
        wardenInfo,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

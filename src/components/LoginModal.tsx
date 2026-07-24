import React, { useState } from 'react';
import { Shield, Lock, User as UserIcon, Eye, EyeOff, Check, LogIn } from 'lucide-react';
import { User } from '../types';
import { storage } from '../services/storage';

interface LoginModalProps {
  users?: User[];
  onLogin?: (user: User) => void;
  onLoginSuccess?: (user: User) => void;
  onClose?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  users: propUsers,
  onLogin,
  onLoginSuccess,
  onClose
}) => {
  const triggerLoginSuccess = (user: User) => {
    if (onLogin) onLogin(user);
    if (onLoginSuccess) onLoginSuccess(user);
  };
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    setTimeout(() => {
      const users = storage.getUsers();
      const inputClean = usernameOrEmail.trim().toLowerCase();

      // Flexible auth matching username or email
      const foundUser = users.find(
        (u) =>
          (u.username.toLowerCase() === inputClean || u.email.toLowerCase() === inputClean) &&
          u.status === 'aktif'
      );

      // Validate credentials
      if (!foundUser) {
        setErrorMsg('Username atau Email tidak ditemukan atau akun nonaktif!');
        setLoading(false);
        return;
      }

      // Password check (simple pass for demo users or default)
      if (password.length < 3) {
        setErrorMsg('Password minimal 3 karakter!');
        setLoading(false);
        return;
      }

      // Login success
      storage.setCurrentUser(foundUser);
      triggerLoginSuccess(foundUser);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#08110A]/90 backdrop-blur-xl animate-in fade-in">
      <div className="w-full max-w-md glass-panel-gold rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#D4AF37]/30 relative overflow-hidden">
        {/* Glow ambient circle */}
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-[#102A0B]/60 blur-2xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-8 relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#102A0B] to-[#1B4D1A] border border-[#D4AF37]/50 mb-3 shadow-xl gold-glow">
            <Shield className="w-9 h-9 text-[#D4AF37]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-widest gold-gradient-text uppercase">
            TASK ERROR MONITOR
          </h1>
          <p className="text-xs font-semibold text-[#F5E6C8]/70 tracking-widest uppercase mt-1">
            LIGABANDOT STAFF MONITORING SYSTEM
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-900/40 border border-red-500/50 text-red-200 text-xs font-medium text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Username/Email Input */}
          <div>
            <label className="block text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-1.5">
              Username / Email
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-[#D4AF37]/60" />
              <input
                type="text"
                required
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="Masukkan username atau email"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#08110A]/80 border border-[#D4AF37]/30 text-[#F5E6C8] text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-[#D4AF37]/60" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full pl-10 pr-12 py-3 rounded-xl bg-[#08110A]/80 border border-[#D4AF37]/30 text-[#F5E6C8] text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-[#F5E6C8]/60 hover:text-[#D4AF37] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#D4AF37]/40 bg-[#08110A] text-[#D4AF37] focus:ring-[#D4AF37]"
              />
              <span className="text-xs text-[#F5E6C8]/80 font-medium">Ingat Saya</span>
            </label>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl gold-gradient-bg text-[#08110A] font-extrabold text-sm uppercase tracking-wider shadow-xl hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <span className="animate-pulse">MEMPROSES LOGIN...</span>
            ) : (
              <>
                <LogIn className="w-5 h-5" /> LOGIN SISTEM
              </>
            )}
          </button>
        </form>

        {/* Quick Direct Login */}
        <div className="mt-6 space-y-2">
          <button
            type="button"
            onClick={() => {
              const users = storage.getUsers();
              const adminUser = users.find((u) => u.role === 'admin') || users[0];
              storage.setCurrentUser(adminUser);
              triggerLoginSuccess(adminUser);
            }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#102A0B] to-[#1B4D1A] border border-[#D4AF37]/50 text-[#D4AF37] font-bold text-xs uppercase tracking-wider hover:border-[#D4AF37] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <Shield className="w-4 h-4 text-[#D4AF37]" /> Akses Langsung (Super Admin - Akses Semua Dashboard)
          </button>
        </div>


      </div>
    </div>
  );
};

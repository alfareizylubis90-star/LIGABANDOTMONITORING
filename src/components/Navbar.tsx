import React, { useState, useEffect } from 'react';
import {
  Menu,
  Bell,
  User as UserIcon,
  Settings,
  LogOut,
  ChevronDown,
  ShieldAlert,
  Volume2,
  VolumeX,
  Sparkles
} from 'lucide-react';
import { User, ViewMode } from '../types';
import { storage } from '../services/storage';

interface NavbarProps {
  currentUser: User | null;
  onToggleSidebar: () => void;
  onNavigate: (view: ViewMode) => void;
  onLogout: () => void;
  unhandledCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onToggleSidebar,
  onNavigate,
  onLogout,
  unhandledCount
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(storage.getSoundEnabled());
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
      );
      setDateStr(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    storage.setSoundEnabled(next);
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'supervisor':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full h-18 bg-[#08110A]/90 backdrop-blur-md border-b border-[#D4AF37]/20 px-4 lg:px-6 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3 lg:gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2.5 text-[#F5E6C8] hover:bg-[#102A0B] rounded-xl border border-[#D4AF37]/20 transition-all active:scale-95"
          title="Toggle Sidebar"
        >
          <Menu className="w-5 h-5 text-[#D4AF37]" />
        </button>

        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#102A0B] to-[#1B4D1A] border border-[#D4AF37]/40 flex items-center justify-center shadow-inner group">
            <ShieldAlert className="w-6 h-6 text-[#D4AF37] group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-sm lg:text-base tracking-wider gold-gradient-text uppercase leading-none">
                TASK ERROR MONITOR
              </h1>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold bg-[#D4AF37]/20 text-[#D4AF37] rounded border border-[#D4AF37]/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] font-semibold text-[#F5E6C8]/70 tracking-widest uppercase mt-0.5">
              LIGABANDOT
            </p>
          </div>
        </div>
      </div>

      {/* Center - Realtime Clock */}
      <div className="hidden md:flex flex-col items-center justify-center px-4 py-1.5 rounded-xl bg-[#0F2012]/80 border border-[#D4AF37]/20 shadow-inner">
        <div className="text-xs font-bold text-[#D4AF37] tracking-widest font-mono">
          {timeStr} <span className="text-[10px] font-normal text-emerald-400">WIB</span>
        </div>
        <div className="text-[11px] text-[#F5E6C8]/70 font-medium">
          {dateStr}
        </div>
      </div>

      {/* Right - Notifications & User Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Sound toggle button */}
        <button
          onClick={toggleSound}
          className="p-2 text-[#F5E6C8]/80 hover:text-[#D4AF37] hover:bg-[#102A0B] rounded-xl transition-all"
          title={soundEnabled ? 'Notifikasi Suara Aktif' : 'Notifikasi Suara Muted'}
        >
          {soundEnabled ? (
            <Volume2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <VolumeX className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => onNavigate('data_kesalahan')}
          className="relative p-2.5 text-[#F5E6C8] hover:bg-[#102A0B] rounded-xl border border-[#D4AF37]/20 transition-all active:scale-95"
          title="Laporan Belum Ditangani"
        >
          <Bell className="w-5 h-5 text-[#D4AF37]" />
          {unhandledCount > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[20px] text-[10px] font-bold bg-red-600 text-white rounded-full border border-red-400 flex items-center justify-center animate-pulse shadow-lg">
              {unhandledCount}
            </span>
          )}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 pl-3 rounded-xl bg-[#0F2012] hover:bg-[#102A0B] border border-[#D4AF37]/30 transition-all"
          >
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-[#F5E6C8] truncate max-w-[130px]">
                {currentUser?.nama || 'Pengguna'}
              </div>
              <div className="flex items-center justify-end gap-1 mt-0.5">
                <span
                  className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${getRoleBadgeColor(
                    currentUser?.role
                  )}`}
                >
                  {currentUser?.role || 'Staff'}
                </span>
              </div>
            </div>

            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#8C6D15] text-[#08110A] font-bold flex items-center justify-center shadow">
              {currentUser?.nama ? currentUser.nama.charAt(0).toUpperCase() : 'U'}
            </div>
            <ChevronDown className={`w-4 h-4 text-[#D4AF37] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0F2012] border border-[#D4AF37]/30 shadow-2xl py-2 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2"
              onClick={() => setDropdownOpen(false)}
            >
              <div className="px-4 py-3 border-b border-[#D4AF37]/10 mb-1">
                <p className="text-xs font-bold text-[#F5E6C8]">{currentUser?.nama}</p>
                <p className="text-[11px] text-[#F5E6C8]/60 truncate">{currentUser?.email || `@${currentUser?.username}`}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                    Sesi Aktif
                  </span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('pengaturan')}
                className="w-full px-4 py-2 text-left text-xs text-[#F5E6C8] hover:bg-[#102A0B] hover:text-[#D4AF37] flex items-center gap-2.5 transition-colors"
              >
                <UserIcon className="w-4 h-4 text-[#D4AF37]" /> Profile Saya
              </button>

              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => onNavigate('pengaturan')}
                  className="w-full px-4 py-2 text-left text-xs text-[#F5E6C8] hover:bg-[#102A0B] hover:text-[#D4AF37] flex items-center gap-2.5 transition-colors"
                >
                  <Settings className="w-4 h-4 text-[#D4AF37]" /> Pengaturan & User
                </button>
              )}

              <div className="my-1 border-t border-[#D4AF37]/10" />

              <button
                onClick={onLogout}
                className="w-full px-4 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors"
              >
                <LogOut className="w-4 h-4 text-red-400" /> Logout Sesi
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import {
  Home,
  FilePlus,
  ClipboardList,
  Users,
  Globe,
  Tag,
  BarChart3,
  TrendingUp,
  Download,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Shield,
  Layers,
  Sparkles,
  Folder,
  Database,
  PieChart
} from 'lucide-react';
import { ViewMode, User } from '../types';

interface SidebarProps {
  currentView: ViewMode;
  onSelectView?: (view: ViewMode) => void;
  onNavigate?: (view: ViewMode) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  currentUser: User | null;
  onLogout?: () => void;
  unhandledCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

interface MenuGroup {
  id: string;
  title: string;
  icon: React.ElementType;
  items: {
    id: ViewMode;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  onNavigate,
  collapsed = false,
  onToggleCollapse,
  currentUser,
  onLogout,
  unhandledCount = 0,
  isOpenMobile = false,
  onCloseMobile
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    utama: true,
    data: true,
    rekap: true,
    system: true
  });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleSelect = (v: ViewMode) => {
    if (onSelectView) onSelectView(v);
    if (onNavigate) onNavigate(v);
    if (onCloseMobile) onCloseMobile();
  };

  const menuGroups: MenuGroup[] = [
    {
      id: 'utama',
      title: 'Utama',
      icon: Home,
      items: [
        { id: 'dashboard', label: 'Dashboard Overview', icon: Home },
        { id: 'input_kesalahan', label: 'Input Kesalahan', icon: FilePlus }
      ]
    },
    {
      id: 'data',
      title: 'Kelola Data',
      icon: Database,
      items: [
        {
          id: 'data_kesalahan',
          label: 'Data Kesalahan',
          icon: ClipboardList,
          badge: unhandledCount > 0 ? unhandledCount : undefined
        },
        { id: 'data_staff', label: 'Data Staff', icon: Users },
        { id: 'data_situs', label: 'Data Situs', icon: Globe },
        { id: 'kategori_kesalahan', label: 'Kategori Kesalahan', icon: Tag }
      ]
    },
    {
      id: 'rekap',
      title: 'Rekap & Analitik',
      icon: PieChart,
      items: [
        { id: 'rekap_kesalahan', label: 'Rekap Kesalahan', icon: BarChart3 },
        { id: 'rekap_per_staff', label: 'Rekap Per Staff', icon: Users },
        { id: 'rekap_per_situs', label: 'Rekap Per Situs', icon: Globe },
        { id: 'statistik', label: 'Statistik Performa', icon: TrendingUp }
      ]
    },
    {
      id: 'system',
      title: 'Sistem & Admin',
      icon: Settings,
      items: [
        { id: 'export_data', label: 'Export Data', icon: Download },
        ...(currentUser?.role === 'admin'
          ? [{ id: 'pengaturan' as ViewMode, label: 'Pengaturan System', icon: Settings }]
          : [])
      ]
    }
  ];

  return (
    <aside
      className={`fixed lg:sticky top-18 left-0 z-20 h-[calc(100vh-4.5rem)] bg-[#08110A]/95 border-r border-[#D4AF37]/20 flex flex-col justify-between transition-all duration-300 shadow-2xl backdrop-blur-md ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header info in Sidebar */}
      <div className="p-3 border-b border-[#D4AF37]/10 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider px-1">
            <Layers className="w-4 h-4 text-[#D4AF37]" /> NAVIGASI SISTEM
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-[#F5E6C8]/70 hover:text-[#D4AF37] hover:bg-[#102A0B] transition-colors ml-auto cursor-pointer"
          title={collapsed ? 'Perluas Sidebar' : 'Menciutkan Sidebar'}
        >
          <ChevronLeft className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Menu List with Accordion / Dropdown Groups */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-3 scrollbar-thin">
        {menuGroups.map((group) => {
          const GroupIcon = group.icon;
          const isExpanded = expandedGroups[group.id] ?? true;

          return (
            <div key={group.id} className="space-y-1">
              {/* Group Header (Dropdown Trigger) */}
              {!collapsed ? (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-[#D4AF37]/80 uppercase tracking-widest hover:text-[#D4AF37] hover:bg-[#102A0B]/50 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <GroupIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{group.title}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-[#D4AF37]/60" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37]/60" />
                  )}
                </button>
              ) : (
                <div className="h-px bg-[#D4AF37]/20 my-2" />
              )}

              {/* Submenu Items (Collapsible Content) */}
              {(isExpanded || collapsed) && (
                <div className="space-y-1 pl-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      currentView === item.id ||
                      currentView === item.id.replace(/_/g, '-') ||
                      (currentView === 'data-error' && item.id === 'data_kesalahan') ||
                      (currentView === 'input-error' && item.id === 'input_kesalahan') ||
                      (currentView === 'rekap-staff' && item.id === 'rekap_per_staff') ||
                      (currentView === 'rekap-situs' && item.id === 'rekap_per_situs') ||
                      (currentView === 'export-data' && item.id === 'export_data');

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative group cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-r from-[#102A0B] to-[#1B4D1A] text-[#D4AF37] border border-[#D4AF37]/40 shadow-lg gold-glow'
                            : 'text-[#F5E6C8]/80 hover:bg-[#0F2012] hover:text-[#F5E6C8]'
                        }`}
                        title={collapsed ? item.label : undefined}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? 'text-[#D4AF37]' : 'text-[#F5E6C8]/60 group-hover:text-[#D4AF37]'
                          }`}
                        />

                        {!collapsed && <span className="truncate">{item.label}</span>}

                        {/* Badge if present */}
                        {item.badge && (
                          <span
                            className={`ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full border shadow-sm ${
                              collapsed ? 'absolute top-1 right-1' : ''
                            } bg-red-600/90 text-white border-red-400`}
                          >
                            {item.badge}
                          </span>
                        )}

                        {/* Active Indicator bar */}
                        {isActive && (
                          <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#D4AF37] rounded-r-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer User Info / Logout */}
      <div className="p-3 border-t border-[#D4AF37]/10 bg-[#0F2012]/40">
        {!collapsed ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-9 h-9 rounded-xl bg-[#102A0B] border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-[#F5E6C8] truncate">{currentUser?.nama}</p>
                <p className="text-[10px] text-[#D4AF37] uppercase font-bold tracking-wider">
                  {currentUser?.role}
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onLogout}
            className="w-full p-2.5 flex justify-center text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
            title="Logout Sesi"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </aside>
  );
};


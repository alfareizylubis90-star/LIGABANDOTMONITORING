import React, { useState, useMemo } from 'react';
import {
  FilePlus,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  Calendar,
  UserX,
  Eye,
  Filter,
  BarChart,
  PieChart as PieChartIcon,
  TrendingUp,
  Activity,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart as ReBarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { ErrorReport, Staff, Site, ViewMode, FilterPeriod, ErrorStatus } from '../../types';

interface DashboardViewProps {
  reports: ErrorReport[];
  staffList: Staff[];
  sitesList: Site[];
  onNavigate: (view: ViewMode) => void;
  onSelectReportDetail: (report: ErrorReport) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  reports,
  staffList,
  sitesList,
  onNavigate,
  onSelectReportDetail
}) => {
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('30_hari');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Current Date Strings
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7); // YYYY-MM

  // Filtered reports based on period
  const filteredReports = useMemo(() => {
    const now = new Date();
    return reports.filter((r) => {
      const rDate = new Date(r.tanggal);

      if (filterPeriod === 'hari_ini') {
        return r.tanggal === todayStr;
      }
      if (filterPeriod === '7_hari') {
        const diffDays = (now.getTime() - rDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }
      if (filterPeriod === '30_hari') {
        const diffDays = (now.getTime() - rDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 30;
      }
      if (filterPeriod === 'bulan_ini') {
        return r.tanggal.startsWith(currentMonthStr);
      }
      if (filterPeriod === 'bulan_lalu') {
        const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonthStr = prevMonthDate.toISOString().substring(0, 7);
        return r.tanggal.startsWith(prevMonthStr);
      }
      if (filterPeriod === 'custom' && customStartDate && customEndDate) {
        return r.tanggal >= customStartDate && r.tanggal <= customEndDate;
      }
      return true;
    });
  }, [reports, filterPeriod, customStartDate, customEndDate, todayStr, currentMonthStr]);

  // --- CARD METRICS ---
  const totalReports = reports.length;
  const todayReports = reports.filter((r) => r.tanggal === todayStr).length;
  const unhandledReports = reports.filter((r) => r.status === 'Belum Ditangani').length;
  const inProgressReports = reports.filter((r) => r.status === 'Diproses').length;
  const completedReports = reports.filter((r) => r.status === 'Selesai').length;
  const totalActiveStaff = staffList.filter((s) => s.status === 'aktif').length;
  const monthReports = reports.filter((r) => r.tanggal.startsWith(currentMonthStr)).length;

  // Most error staff calculation
  const topStaff = useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach((r) => {
      counts[r.nama_staff] = (counts[r.nama_staff] || 0) + 1;
    });

    let maxName = '-';
    let maxVal = 0;
    Object.entries(counts).forEach(([name, count]) => {
      if (count > maxVal) {
        maxVal = count;
        maxName = name;
      }
    });

    return { name: maxName, count: maxVal };
  }, [reports]);

  // --- CHART DATA GENERATION ---

  // A. Daily Trend Chart
  const dailyData = useMemo(() => {
    const dateMap: Record<string, number> = {};
    filteredReports.forEach((r) => {
      dateMap[r.tanggal] = (dateMap[r.tanggal] || 0) + 1;
    });

    return Object.keys(dateMap)
      .sort()
      .map((date) => ({
        tanggal: date.substring(5), // MM-DD
        jumlah: dateMap[date]
      }));
  }, [filteredReports]);

  // B. Category Chart
  const categoryData = useMemo(() => {
    const catMap: Record<string, number> = {};
    filteredReports.forEach((r) => {
      catMap[r.kategori_kesalahan] = (catMap[r.kategori_kesalahan] || 0) + 1;
    });

    return Object.entries(catMap).map(([name, total]) => ({
      name,
      total
    }));
  }, [filteredReports]);

  // C. Staff Chart (Horizontal Bar)
  const staffChartData = useMemo(() => {
    const staffMap: Record<string, number> = {};
    filteredReports.forEach((r) => {
      staffMap[r.nama_staff] = (staffMap[r.nama_staff] || 0) + 1;
    });

    return Object.entries(staffMap)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8); // Top 8
  }, [filteredReports]);

  // D. Sites Chart
  const sitesChartData = useMemo(() => {
    const siteMap: Record<string, number> = {};
    filteredReports.forEach((r) => {
      siteMap[r.situs] = (siteMap[r.situs] || 0) + 1;
    });

    return Object.entries(siteMap).map(([name, total]) => ({ name, total }));
  }, [filteredReports]);

  // E. Status Donut Chart
  const statusData = useMemo(() => {
    const statusMap: Record<string, number> = {
      'Belum Ditangani': 0,
      Diproses: 0,
      Selesai: 0,
      Ditolak: 0
    };
    filteredReports.forEach((r) => {
      if (statusMap[r.status] !== undefined) {
        statusMap[r.status]++;
      }
    });

    return [
      { name: 'Belum Ditangani', value: statusMap['Belum Ditangani'], color: '#E53935' },
      { name: 'Diproses', value: statusMap['Diproses'], color: '#EAB308' },
      { name: 'Selesai', value: statusMap['Selesai'], color: '#22C55E' },
      { name: 'Ditolak', value: statusMap['Ditolak'], color: '#6B7280' }
    ].filter((item) => item.value > 0);
  }, [filteredReports]);

  // F. Severity Donut Chart
  const severityData = useMemo(() => {
    const sevMap: Record<string, number> = {
      Rendah: 0,
      Sedang: 0,
      Tinggi: 0,
      'Sangat Tinggi': 0
    };
    filteredReports.forEach((r) => {
      if (sevMap[r.tingkat_kesalahan] !== undefined) {
        sevMap[r.tingkat_kesalahan]++;
      }
    });

    return [
      { name: 'Rendah', value: sevMap['Rendah'], color: '#3B82F6' },
      { name: 'Sedang', value: sevMap['Sedang'], color: '#EAB308' },
      { name: 'Tinggi', value: sevMap['Tinggi'], color: '#F97316' },
      { name: 'Sangat Tinggi', value: sevMap['Sangat Tinggi'], color: '#E53935' }
    ].filter((item) => item.value > 0);
  }, [filteredReports]);

  // Recent 10 error reports
  const recentReports = useMemo(() => {
    return [...reports].slice(0, 10);
  }, [reports]);

  const getStatusBadge = (status: ErrorStatus) => {
    switch (status) {
      case 'Belum Ditangani':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'Diproses':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Selesai':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/40';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Top Banner / Quick Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl glass-panel-gold border border-[#D4AF37]/30 shadow-xl">
        <div>
          <h2 className="text-xl font-black gold-gradient-text uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#D4AF37]" /> DASHBOARD MONITORING KESALAHAN
          </h2>
          <p className="text-xs text-[#F5E6C8]/80 mt-1">
            Pantau performa staff CS, rekap kesalahan, dan eskalasi kendala secara realtime.
          </p>
        </div>

        <button
          onClick={() => onNavigate('input_kesalahan')}
          className="px-5 py-3 rounded-xl gold-gradient-bg text-[#08110A] font-extrabold text-xs uppercase tracking-wider shadow-xl hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <FilePlus className="w-4 h-4" /> + INPUT KESALAHAN
        </button>
      </div>

      {/* SUMMARY CARDS (8 CARDS) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: Total Kesalahan */}
        <div className="p-4 rounded-2xl bg-[#0F2012] border border-[#D4AF37]/20 shadow-lg relative overflow-hidden group hover:border-[#D4AF37]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#F5E6C8]/70 uppercase tracking-wider">
              Total Kesalahan
            </span>
            <div className="p-2 rounded-xl bg-[#102A0B] text-[#D4AF37] border border-[#D4AF37]/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#F5E6C8] mt-2 font-mono">
            {totalReports}
          </div>
          <p className="text-[11px] text-[#F5E6C8]/60 mt-1">Seluruh laporan tercatat</p>
        </div>

        {/* CARD 2: Kesalahan Hari Ini */}
        <div className="p-4 rounded-2xl bg-[#0F2012] border border-[#D4AF37]/20 shadow-lg relative overflow-hidden group hover:border-[#D4AF37]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#F5E6C8]/70 uppercase tracking-wider">
              Hari Ini
            </span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-300 mt-2 font-mono">
            {todayReports}
          </div>
          <p className="text-[11px] text-amber-400/80 mt-1">Dibuat tanggal ini</p>
        </div>

        {/* CARD 3: Belum Ditangani */}
        <div className="p-4 rounded-2xl bg-[#0F2012] border border-red-500/30 shadow-lg relative overflow-hidden group hover:border-red-500/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
              Belum Ditangani
            </span>
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-red-400 mt-2 font-mono">
            {unhandledReports}
          </div>
          <p className="text-[11px] text-red-300/80 mt-1">Memerlukan penanganan</p>
        </div>

        {/* CARD 4: Sedang Diproses */}
        <div className="p-4 rounded-2xl bg-[#0F2012] border border-amber-500/30 shadow-lg relative overflow-hidden group hover:border-amber-500/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Sedang Diproses
            </span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-300 mt-2 font-mono">
            {inProgressReports}
          </div>
          <p className="text-[11px] text-amber-200/80 mt-1">Tahap klarifikasi CS</p>
        </div>

        {/* CARD 5: Selesai */}
        <div className="p-4 rounded-2xl bg-[#0F2012] border border-emerald-500/30 shadow-lg relative overflow-hidden group hover:border-emerald-500/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Selesai
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2 font-mono">
            {completedReports}
          </div>
          <p className="text-[11px] text-emerald-300/80 mt-1">Laporan terselesaikan</p>
        </div>

        {/* CARD 6: Total Staff */}
        <div className="p-4 rounded-2xl bg-[#0F2012] border border-[#D4AF37]/20 shadow-lg relative overflow-hidden group hover:border-[#D4AF37]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#F5E6C8]/70 uppercase tracking-wider">
              Total Staff Aktif
            </span>
            <div className="p-2 rounded-xl bg-[#102A0B] text-[#D4AF37] border border-[#D4AF37]/30">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#F5E6C8] mt-2 font-mono">
            {totalActiveStaff}
          </div>
          <p className="text-[11px] text-[#F5E6C8]/60 mt-1">Petugas CS terdaftar</p>
        </div>

        {/* CARD 7: Kesalahan Bulan Ini */}
        <div className="p-4 rounded-2xl bg-[#0F2012] border border-[#D4AF37]/20 shadow-lg relative overflow-hidden group hover:border-[#D4AF37]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#F5E6C8]/70 uppercase tracking-wider">
              Kesalahan Bulan Ini
            </span>
            <div className="p-2 rounded-xl bg-[#102A0B] text-[#D4AF37] border border-[#D4AF37]/30">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#F5E6C8] mt-2 font-mono">
            {monthReports}
          </div>
          <p className="text-[11px] text-[#F5E6C8]/60 mt-1">Total bulan berjalan</p>
        </div>

        {/* CARD 8: Staff Paling Banyak Kesalahan */}
        <div className="p-4 rounded-2xl bg-[#0F2012] border border-amber-500/30 shadow-lg relative overflow-hidden group hover:border-amber-500/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Staff Paling Banyak Kesalahan
            </span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-sm font-extrabold text-[#F5E6C8] mt-2 truncate">
            {topStaff.name}
          </div>
          <p className="text-[11px] text-amber-300/80 font-mono mt-1">
            {topStaff.count} Kesalahan Tercatat
          </p>
        </div>
      </div>

      {/* PERIOD FILTER HEADER FOR CHARTS */}
      <div className="p-4 rounded-2xl bg-[#0F2012] border border-[#D4AF37]/20 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
          <Filter className="w-4 h-4" /> Filter Grafik Periode:
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: 'hari_ini', label: 'Hari Ini' },
              { id: '7_hari', label: '7 Hari' },
              { id: '30_hari', label: '30 Hari' },
              { id: 'bulan_ini', label: 'Bulan Ini' },
              { id: 'bulan_lalu', label: 'Bulan Lalu' },
              { id: 'custom', label: 'Custom' }
            ] as const
          ).map((p) => (
            <button
              key={p.id}
              onClick={() => setFilterPeriod(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterPeriod === p.id
                  ? 'bg-[#D4AF37] text-[#08110A] shadow-md'
                  : 'bg-[#102A0B] text-[#F5E6C8]/70 hover:text-[#F5E6C8] border border-[#D4AF37]/20'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {filterPeriod === 'custom' && (
          <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-[#08110A] border border-[#D4AF37]/30 text-xs text-[#F5E6C8]"
            />
            <span className="text-xs text-[#F5E6C8]/60">s/d</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-[#08110A] border border-[#D4AF37]/30 text-xs text-[#F5E6C8]"
            />
          </div>
        )}
      </div>

      {/* GRAFIK DASHBOARD (6 CHARTS GRID) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* A. Line Chart: Kesalahan Per Hari */}
        <div className="p-5 rounded-2xl bg-[#0F2012] border border-[#D4AF37]/20 shadow-xl">
          <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#D4AF37]" /> A. Grafik Kesalahan Per Hari (Line Chart)
          </h3>
          <div className="h-64">
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 175, 55, 0.1)" />
                  <XAxis dataKey="tanggal" stroke="#F5E6C8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#F5E6C8" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F2012',
                      borderColor: '#D4AF37',
                      color: '#F5E6C8',
                      fontSize: '12px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="jumlah"
                    stroke="#D4AF37"
                    strokeWidth={3}
                    dot={{ fill: '#D4AF37', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#F5E6C8]/50">
                Tidak ada data pada periode ini
              </div>
            )}
          </div>
        </div>

        {/* B. Bar Chart: Kesalahan Per Kategori */}
        <div className="p-5 rounded-2xl bg-[#0F2012] border border-[#D4AF37]/20 shadow-xl">
          <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider mb-4 flex items-center gap-2">
            <BarChart className="w-4 h-4 text-[#D4AF37]" /> B. Grafik Kesalahan Per Kategori (Bar Chart)
          </h3>
          <div className="h-64">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 175, 55, 0.1)" />
                  <XAxis dataKey="name" stroke="#F5E6C8" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis stroke="#F5E6C8" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F2012',
                      borderColor: '#D4AF37',
                      color: '#F5E6C8',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="total" fill="#22C55E" radius={[6, 6, 0, 0]} />
                </ReBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#F5E6C8]/50">
                Tidak ada data pada periode ini
              </div>
            )}
          </div>
        </div>

        {/* C. Horizontal Bar Chart: Kesalahan Per Staff */}
        <div className="p-5 rounded-2xl bg-[#0F2012] border border-[#D4AF37]/20 shadow-xl">
          <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#D4AF37]" /> C. Grafik Kesalahan Per Staff (Top Staff)
          </h3>
          <div className="h-64">
            {staffChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={staffChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 175, 55, 0.1)" />
                  <XAxis type="number" stroke="#F5E6C8" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" stroke="#F5E6C8" tick={{ fontSize: 10 }} width={120} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F2012',
                      borderColor: '#D4AF37',
                      color: '#F5E6C8',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="total" fill="#EAB308" radius={[0, 6, 6, 0]} />
                </ReBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#F5E6C8]/50">
                Tidak ada data pada periode ini
              </div>
            )}
          </div>
        </div>

        {/* D. Bar Chart: Kesalahan Per Situs */}
        <div className="p-5 rounded-2xl bg-[#0F2012] border border-[#D4AF37]/20 shadow-xl">
          <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider mb-4 flex items-center gap-2">
            <BarChart className="w-4 h-4 text-[#D4AF37]" /> D. Grafik Kesalahan Per Situs
          </h3>
          <div className="h-64">
            {sitesChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={sitesChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 175, 55, 0.1)" />
                  <XAxis dataKey="name" stroke="#F5E6C8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#F5E6C8" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F2012',
                      borderColor: '#D4AF37',
                      color: '#F5E6C8',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="total" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </ReBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#F5E6C8]/50">
                Tidak ada data pada periode ini
              </div>
            )}
          </div>
        </div>

        {/* E. Donut Chart: Status Kesalahan */}
        <div className="p-5 rounded-2xl bg-[#0F2012] border border-[#D4AF37]/20 shadow-xl">
          <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider mb-4 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-[#D4AF37]" /> E. Grafik Status Kesalahan (Donut)
          </h3>
          <div className="h-64">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F2012',
                      borderColor: '#D4AF37',
                      color: '#F5E6C8',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#F5E6C8' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#F5E6C8]/50">
                Tidak ada data
              </div>
            )}
          </div>
        </div>

        {/* F. Donut Chart: Tingkat Kesalahan */}
        <div className="p-5 rounded-2xl bg-[#0F2012] border border-[#D4AF37]/20 shadow-xl">
          <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider mb-4 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-[#D4AF37]" /> F. Grafik Tingkat Kesalahan
          </h3>
          <div className="h-64">
            {severityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F2012',
                      borderColor: '#D4AF37',
                      color: '#F5E6C8',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#F5E6C8' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#F5E6C8]/50">
                Tidak ada data
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RECENT ERROR REPORTS (10 LAPORAN TERBARU) */}
      <div className="p-5 rounded-2xl bg-[#0F2012] border border-[#D4AF37]/20 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider">
              Laporan Kesalahan Terbaru (10 Terakhir)
            </h3>
            <p className="text-xs text-[#F5E6C8]/60 mt-0.5">
              Daftar laporan yang paling baru dimasukkan ke dalam sistem
            </p>
          </div>

          <button
            onClick={() => onNavigate('data_kesalahan')}
            className="text-xs font-bold text-[#D4AF37] hover:underline flex items-center gap-1"
          >
            Lihat Semua Data →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#D4AF37]/20 text-[#D4AF37] uppercase tracking-wider">
                <th className="py-3 px-3">No Laporan</th>
                <th className="py-3 px-3">Waktu</th>
                <th className="py-3 px-3">Staff (ID)</th>
                <th className="py-3 px-3">Situs</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-3">Tingkat</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/10">
              {recentReports.map((r) => (
                <tr key={r.id} className="hover:bg-[#102A0B]/50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-[#F5E6C8]">
                    {r.nomor_laporan}
                  </td>
                  <td className="py-3 px-3 text-[#F5E6C8]/80 whitespace-nowrap">
                    {r.tanggal} {r.jam}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-[#F5E6C8]">{r.nama_staff}</div>
                    <div className="text-[10px] text-[#D4AF37]">{r.id_staff}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-[#102A0B] border border-[#D4AF37]/30 text-[#D4AF37] font-bold">
                      {r.situs}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#F5E6C8]/90 max-w-[150px] truncate">
                    {r.kategori_kesalahan}
                  </td>
                  <td className="py-3 px-3 font-semibold text-[#F5E6C8]/80">
                    {r.tingkat_kesalahan}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${getStatusBadge(
                        r.status
                      )}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => onSelectReportDetail(r)}
                      className="p-1.5 rounded-lg bg-[#102A0B] hover:bg-[#1B4D1A] text-[#D4AF37] border border-[#D4AF37]/30 transition-all cursor-pointer"
                      title="Lihat Detail"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

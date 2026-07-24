import React, { useMemo } from 'react';
import { TrendingUp, Activity, CheckCircle2, ShieldAlert, Award, Clock } from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { ErrorReport, Staff } from '../../types';

interface StatistikViewProps {
  reports: ErrorReport[];
  staffList: Staff[];
}

export const StatistikView: React.FC<StatistikViewProps> = ({ reports, staffList }) => {
  const total = reports.length;
  const completed = reports.filter((r) => r.status === 'Selesai').length;
  const resolutionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Severity Distribution
  const severityDistribution = useMemo(() => {
    const counts = { Rendah: 0, Sedang: 0, Tinggi: 0, 'Sangat Tinggi': 0 };
    reports.forEach((r) => {
      if (counts[r.tingkat_kesalahan] !== undefined) {
        counts[r.tingkat_kesalahan]++;
      }
    });

    return [
      { name: 'Rendah', value: counts['Rendah'], color: '#3B82F6' },
      { name: 'Sedang', value: counts['Sedang'], color: '#EAB308' },
      { name: 'Tinggi', value: counts['Tinggi'], color: '#F97316' },
      { name: 'Sangat Tinggi', value: counts['Sangat Tinggi'], color: '#E53935' }
    ];
  }, [reports]);

  // Hourly Peak Time Distribution
  const peakTimes = useMemo(() => {
    const hours: Record<string, number> = {};
    reports.forEach((r) => {
      const hourStr = r.jam ? r.jam.substring(0, 2) + ':00' : '00:00';
      hours[hourStr] = (hours[hourStr] || 0) + 1;
    });

    return Object.keys(hours)
      .sort()
      .map((h) => ({
        jam: h,
        jumlah: hours[h]
      }));
  }, [reports]);

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div className="p-5 rounded-2xl glass-panel-gold border border-[#D4AF37]/30 shadow-xl">
        <h2 className="text-xl font-black gold-gradient-text uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-[#D4AF37]" /> STATISTIK ANALITIK LENGKAP
        </h2>
        <p className="text-xs text-[#F5E6C8]/80 mt-1">
          Analisis mendalam mengenai tingkat penyelesaian, distribusi keparahan, dan waktu puncak insiden kesalahan.
        </p>
      </div>

      {/* METRIC BANNER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-[#0F2012] border border-[#D4AF37]/30 shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs text-[#F5E6C8]/70 uppercase font-bold">Tingkat Penyelesaian</span>
            <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
              {resolutionRate}%
            </div>
            <p className="text-[11px] text-emerald-300/80 mt-0.5">{completed} dari {total} laporan selesai</p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[#0F2012] border border-[#D4AF37]/30 shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs text-[#F5E6C8]/70 uppercase font-bold">Rata-rata Laporan / Hari</span>
            <div className="text-3xl font-black text-amber-300 font-mono mt-1">
              {Math.max(1, Math.round(total / 30))}
            </div>
            <p className="text-[11px] text-amber-200/80 mt-0.5">Estimasi frekuensi harian</p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[#0F2012] border border-[#D4AF37]/30 shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs text-[#F5E6C8]/70 uppercase font-bold">Risiko Sangat Tinggi</span>
            <div className="text-3xl font-black text-red-400 font-mono mt-1">
              {reports.filter((r) => r.tingkat_kesalahan === 'Sangat Tinggi').length}
            </div>
            <p className="text-[11px] text-red-300/80 mt-0.5">Laporan perlu perhatian khusus</p>
          </div>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Pie Chart */}
        <div className="p-5 rounded-2xl bg-[#0F2012] border border-[#D4AF37]/20 shadow-xl">
          <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider mb-4">
            Distribusi Tingkat Keparahan Kesalahan
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {severityDistribution.map((entry, index) => (
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
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Hours Chart */}
        <div className="p-5 rounded-2xl bg-[#0F2012] border border-[#D4AF37]/20 shadow-xl">
          <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Waktu Puncak Kejadian (Per Jam)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakTimes}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 175, 55, 0.1)" />
                <XAxis dataKey="jam" stroke="#F5E6C8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#F5E6C8" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F2012',
                    borderColor: '#D4AF37',
                    color: '#F5E6C8',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="jumlah" fill="#D4AF37" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

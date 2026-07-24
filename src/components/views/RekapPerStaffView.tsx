import React, { useState, useMemo } from 'react';
import { Award, Eye, X, FileText, Medal, BarChart as ReBarChartIcon } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ErrorReport, Staff } from '../../types';

interface RekapPerStaffViewProps {
  reports: ErrorReport[];
  staffList: Staff[];
}

export const RekapPerStaffView: React.FC<RekapPerStaffViewProps> = ({ reports, staffList }) => {
  const [selectedStaffHistory, setSelectedStaffHistory] = useState<{
    staffName: string;
    reports: ErrorReport[];
  } | null>(null);

  // Group error counts per staff
  const staffRankings = useMemo(() => {
    const map: Record<string, { total: number; categories: Record<string, number> }> = {};

    staffList.forEach((st) => {
      map[st.nama_staff] = { total: 0, categories: {} };
    });

    reports.forEach((r) => {
      if (!map[r.nama_staff]) {
        map[r.nama_staff] = { total: 0, categories: {} };
      }
      map[r.nama_staff].total += 1;
      map[r.nama_staff].categories[r.kategori_kesalahan] =
        (map[r.nama_staff].categories[r.kategori_kesalahan] || 0) + 1;
    });

    return Object.entries(map)
      .map(([nama_staff, data]) => ({
        nama_staff,
        total: data.total,
        salahRespon: data.categories['Salah Respon'] || 0,
        salahInfo: data.categories['Salah Informasi'] || 0,
        tidakRespon: data.categories['Tidak Respon'] || 0,
        salahProsedur: data.categories['Salah Prosedur'] || 0,
        lainnya: data.categories['Lainnya'] || 0
      }))
      .sort((a, b) => b.total - a.total);
  }, [reports, staffList]);

  // Top 3 Podium
  const top1 = staffRankings[0];
  const top2 = staffRankings[1];
  const top3 = staffRankings[2];

  const chartData = useMemo(() => {
    return staffRankings.slice(0, 8).map((st) => ({
      name: st.nama_staff,
      total: st.total
    }));
  }, [staffRankings]);

  const handleOpenHistory = (staffName: string) => {
    const history = reports.filter((r) => r.nama_staff === staffName);
    setSelectedStaffHistory({ staffName, reports: history });
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div className="p-5 rounded-2xl glass-panel-gold border border-[#D4AF37]/30 shadow-xl">
        <h2 className="text-xl font-black gold-gradient-text uppercase tracking-wider flex items-center gap-2">
          <Award className="w-6 h-6 text-[#D4AF37]" /> REKAP & RANKING KESALAHAN PER STAFF
        </h2>
        <p className="text-xs text-[#F5E6C8]/80 mt-1">
          Peringkat staff dengan akumulasi kesalahan tertinggi beserta riwayat catatan perorangan.
        </p>
      </div>

      {/* TOP 3 PODIUM BADGES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 🥇 JUARA 1 */}
        {top1 && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-[#0F2012] border-2 border-amber-400 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-2xl">🥇</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-black uppercase">
                RANK #1 KESALAHAN
              </span>
            </div>
            <h3 className="text-base font-extrabold text-[#F5E6C8] mt-3 truncate">
              {top1.nama_staff}
            </h3>
            <p className="text-2xl font-black text-amber-300 font-mono mt-1">
              {top1.total} <span className="text-xs font-normal text-amber-200">Kesalahan</span>
            </p>
          </div>
        )}

        {/* 🥈 JUARA 2 */}
        {top2 && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-400/20 to-[#0F2012] border-2 border-slate-300 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-2xl">🥈</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-300 text-black uppercase">
                RANK #2 KESALAHAN
              </span>
            </div>
            <h3 className="text-base font-extrabold text-[#F5E6C8] mt-3 truncate">
              {top2.nama_staff}
            </h3>
            <p className="text-2xl font-black text-slate-200 font-mono mt-1">
              {top2.total} <span className="text-xs font-normal text-slate-300">Kesalahan</span>
            </p>
          </div>
        )}

        {/* 🥉 JUARA 3 */}
        {top3 && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-700/20 to-[#0F2012] border-2 border-amber-600 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-2xl">🥉</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-600 text-white uppercase">
                RANK #3 KESALAHAN
              </span>
            </div>
            <h3 className="text-base font-extrabold text-[#F5E6C8] mt-3 truncate">
              {top3.nama_staff}
            </h3>
            <p className="text-2xl font-black text-amber-500 font-mono mt-1">
              {top3.total} <span className="text-xs font-normal text-amber-400">Kesalahan</span>
            </p>
          </div>
        )}
      </div>

      {/* RANKING CHART */}
      <div className="p-5 rounded-2xl bg-[#0F2012] border border-[#D4AF37]/20 shadow-xl">
        <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider mb-4 flex items-center gap-2">
          <ReBarChartIcon className="w-4 h-4" /> GRAFIK PERINGKAT KESALAHAN STAFF
        </h3>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 175, 55, 0.1)" />
              <XAxis dataKey="name" stroke="#F5E6C8" tick={{ fontSize: 10 }} />
              <YAxis stroke="#F5E6C8" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F2012',
                  borderColor: '#D4AF37',
                  color: '#F5E6C8',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="total" fill="#E53935" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TABLE RANKING STAFF */}
      <div className="p-5 rounded-2xl bg-[#0F2012] border border-[#D4AF37]/20 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#D4AF37]/20 text-[#D4AF37] uppercase tracking-wider">
                <th className="py-3 px-3">Peringkat</th>
                <th className="py-3 px-3">Nama Staff</th>
                <th className="py-3 px-3 text-center">Total Kesalahan</th>
                <th className="py-3 px-3 text-center">Salah Respon</th>
                <th className="py-3 px-3 text-center">Salah Informasi</th>
                <th className="py-3 px-3 text-center">Tidak Respon</th>
                <th className="py-3 px-3 text-center">Salah Prosedur</th>
                <th className="py-3 px-3 text-center">Lainnya</th>
                <th className="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/10">
              {staffRankings.map((st, idx) => (
                <tr key={st.nama_staff} className="hover:bg-[#102A0B]/50 transition-colors">
                  <td className="py-3 px-3 font-extrabold text-center">
                    {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `#${idx + 1}`}
                  </td>
                  <td className="py-3 px-3 font-bold text-[#F5E6C8]">{st.nama_staff}</td>
                  <td className="py-3 px-3 text-center font-mono font-extrabold text-red-400 bg-red-950/20">
                    {st.total}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-[#F5E6C8]/80">{st.salahRespon}</td>
                  <td className="py-3 px-3 text-center font-mono text-[#F5E6C8]/80">{st.salahInfo}</td>
                  <td className="py-3 px-3 text-center font-mono text-[#F5E6C8]/80">{st.tidakRespon}</td>
                  <td className="py-3 px-3 text-center font-mono text-[#F5E6C8]/80">{st.salahProsedur}</td>
                  <td className="py-3 px-3 text-center font-mono text-[#F5E6C8]/80">{st.lainnya}</td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => handleOpenHistory(st.nama_staff)}
                      className="px-3 py-1.5 rounded-xl gold-gradient-bg text-[#08110A] font-extrabold text-[11px] uppercase flex items-center gap-1 mx-auto cursor-pointer"
                    >
                      <Eye className="w-3 h-3" /> LIHAT DETAIL
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* STAFF ERROR HISTORY MODAL */}
      {selectedStaffHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#08110A]/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-3xl bg-[#0F2012] border border-[#D4AF37]/40 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-3">
              <div>
                <h3 className="text-base font-extrabold gold-gradient-text uppercase">
                  RIWAYAT KESALAHAN STAFF: {selectedStaffHistory.staffName}
                </h3>
                <p className="text-xs text-[#D4AF37]">
                  Total {selectedStaffHistory.reports.length} Catatan Kesalahan Laporan
                </p>
              </div>

              <button
                onClick={() => setSelectedStaffHistory(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {selectedStaffHistory.reports.length > 0 ? (
                selectedStaffHistory.reports.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-xl bg-[#08110A] border border-[#D4AF37]/20 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-[#D4AF37] font-mono">{r.nomor_laporan}</span>
                      <span className="text-[#F5E6C8]/70">
                        {r.tanggal} {r.jam}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#102A0B] text-[#D4AF37] font-bold">
                        {r.situs}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                        {r.kategori_kesalahan}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold">
                        Tingkat: {r.tingkat_kesalahan}
                      </span>
                      <span className="ml-auto font-bold text-emerald-400">Status: {r.status}</span>
                    </div>

                    <p className="text-[#F5E6C8]/90 leading-relaxed pt-1">{r.deskripsi_kesalahan}</p>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-[#F5E6C8]/60">
                  Staff ini tidak memiliki riwayat catatan kesalahan.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useMemo } from 'react';
import { Globe, Building2, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { ErrorReport, Site, Staff } from '../../types';

interface RekapPerSitusViewProps {
  reports: ErrorReport[];
  sitesList: Site[];
  staffList: Staff[];
}

export const RekapPerSitusView: React.FC<RekapPerSitusViewProps> = ({
  reports,
  sitesList,
  staffList
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  const siteSummary = useMemo(() => {
    return sitesList.map((site) => {
      const siteReports = reports.filter((r) => r.situs === site.nama_situs);
      const siteStaffCount = staffList.filter((s) => s.situs === site.nama_situs).length;

      const totalKesalahan = siteReports.length;
      const hariIni = siteReports.filter((r) => r.tanggal === todayStr).length;
      const bulanIni = siteReports.filter((r) => r.tanggal.startsWith(currentMonthStr)).length;
      const selesai = siteReports.filter((r) => r.status === 'Selesai').length;
      const diproses = siteReports.filter((r) => r.status === 'Diproses').length;
      const belumDitangani = siteReports.filter((r) => r.status === 'Belum Ditangani').length;
      const ditolak = siteReports.filter((r) => r.status === 'Ditolak').length;

      return {
        site,
        totalKesalahan,
        siteStaffCount,
        hariIni,
        bulanIni,
        selesai,
        diproses,
        belumDitangani,
        ditolak
      };
    });
  }, [reports, sitesList, staffList, todayStr, currentMonthStr]);

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div className="p-5 rounded-2xl glass-panel-gold border border-[#D4AF37]/30 shadow-xl">
        <h2 className="text-xl font-black gold-gradient-text uppercase tracking-wider flex items-center gap-2">
          <Globe className="w-6 h-6 text-[#D4AF37]" /> REKAP KESALAHAN PER SITUS OPERASIONAL
        </h2>
        <p className="text-xs text-[#F5E6C8]/80 mt-1">
          Rincian statistik perbandingan kesalahan antara situs TOGELON, JUATWANBET, dan LIGABANDOT.
        </p>
      </div>

      {/* CARDS GRID FOR SITES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {siteSummary.map((item) => (
          <div
            key={item.site.id}
            className="p-6 rounded-3xl bg-[#0F2012] border border-[#D4AF37]/30 shadow-2xl space-y-5 hover:border-[#D4AF37]/60 transition-all"
          >
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-4">
              <div>
                <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">
                  KODE: {item.site.kode_situs}
                </span>
                <h3 className="text-2xl font-black text-[#F5E6C8] mt-0.5">{item.site.nama_situs}</h3>
              </div>

              <div className="p-3 rounded-2xl bg-[#102A0B] border border-[#D4AF37]/30 text-[#D4AF37]">
                <Building2 className="w-6 h-6" />
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#08110A] border border-[#D4AF37]/10">
                <span className="text-[#F5E6C8]/80 font-bold">Total Kesalahan:</span>
                <span className="font-mono font-extrabold text-[#D4AF37] text-sm">
                  {item.totalKesalahan}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#08110A] border border-[#D4AF37]/10">
                <span className="text-[#F5E6C8]/80">Jumlah Staff Terdaftar:</span>
                <span className="font-mono font-bold text-[#F5E6C8]">{item.siteStaffCount} Staff</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#08110A] border border-[#D4AF37]/10">
                <span className="text-[#F5E6C8]/80">Kesalahan Hari Ini:</span>
                <span className="font-mono font-bold text-amber-300">{item.hariIni}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#08110A] border border-[#D4AF37]/10">
                <span className="text-[#F5E6C8]/80">Kesalahan Bulan Ini:</span>
                <span className="font-mono font-bold text-[#F5E6C8]">{item.bulanIni}</span>
              </div>

              {/* Status Breakdown */}
              <div className="pt-2 grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">
                  <div>Selesai</div>
                  <div className="text-sm font-mono mt-0.5">{item.selesai}</div>
                </div>

                <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300">
                  <div>Diproses</div>
                  <div className="text-sm font-mono mt-0.5">{item.diproses}</div>
                </div>

                <div className="p-2 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400">
                  <div>Belum Ditangani</div>
                  <div className="text-sm font-mono mt-0.5">{item.belumDitangani}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SUMMARY TABLE */}
      <div className="p-5 rounded-2xl bg-[#0F2012] border border-[#D4AF37]/20 shadow-xl">
        <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider mb-4">
          Tabel Ringkasan Perbandingan Situs
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#D4AF37]/20 text-[#D4AF37] uppercase tracking-wider">
                <th className="py-3 px-3">Nama Situs</th>
                <th className="py-3 px-3 text-center">Total Staff</th>
                <th className="py-3 px-3 text-center">Total Kesalahan</th>
                <th className="py-3 px-3 text-center">Hari Ini</th>
                <th className="py-3 px-3 text-center">Bulan Ini</th>
                <th className="py-3 px-3 text-center">Selesai</th>
                <th className="py-3 px-3 text-center">Belum Selesai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/10">
              {siteSummary.map((item) => (
                <tr key={item.site.id} className="hover:bg-[#102A0B]/50 transition-colors">
                  <td className="py-3 px-3 font-bold text-[#F5E6C8]">{item.site.nama_situs}</td>
                  <td className="py-3 px-3 text-center font-mono text-[#F5E6C8]">
                    {item.siteStaffCount}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-extrabold text-[#D4AF37] bg-[#102A0B]">
                    {item.totalKesalahan}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-amber-300">{item.hariIni}</td>
                  <td className="py-3 px-3 text-center font-mono text-[#F5E6C8]">{item.bulanIni}</td>
                  <td className="py-3 px-3 text-center font-mono text-emerald-400 font-bold">
                    {item.selesai}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-red-400 font-bold">
                    {item.diproses + item.belumDitangani}
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

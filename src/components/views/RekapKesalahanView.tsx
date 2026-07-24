import React, { useState, useMemo } from 'react';
import { BarChart3, Filter, Download, Printer } from 'lucide-react';
import { ErrorReport, Staff, Site, ErrorCategory } from '../../types';
import { exportToExcel, exportToCSV, printReportsWindow } from '../../utils/exportUtils';

interface RekapKesalahanViewProps {
  reports: ErrorReport[];
  staffList: Staff[];
  sitesList: Site[];
  categoriesList: ErrorCategory[];
}

export const RekapKesalahanView: React.FC<RekapKesalahanViewProps> = ({
  reports,
  staffList,
  sitesList,
  categoriesList
}) => {
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [filterStaff, setFilterStaff] = useState('');

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (filterSite && r.situs !== filterSite) return false;
      if (filterStaff && r.nama_staff !== filterStaff) return false;
      if (filterStartDate && r.tanggal < filterStartDate) return false;
      if (filterEndDate && r.tanggal > filterEndDate) return false;
      return true;
    });
  }, [reports, filterSite, filterStaff, filterStartDate, filterEndDate]);

  // List of active categories to form matrix columns
  const activeCatNames = useMemo(() => {
    return categoriesList.map((c) => c.nama_kategori);
  }, [categoriesList]);

  // Matrix calculation per Staff
  const staffMatrix = useMemo(() => {
    const matrix: Record<string, { total: number; counts: Record<string, number> }> = {};

    // Initialize all active staff in matrix
    staffList.forEach((st) => {
      matrix[st.nama_staff] = {
        total: 0,
        counts: {}
      };
      activeCatNames.forEach((cat) => {
        matrix[st.nama_staff].counts[cat] = 0;
      });
    });

    // Populate from filtered reports
    filteredReports.forEach((r) => {
      if (!matrix[r.nama_staff]) {
        matrix[r.nama_staff] = { total: 0, counts: {} };
      }
      matrix[r.nama_staff].total += 1;

      const catName = r.kategori_kesalahan;
      matrix[r.nama_staff].counts[catName] = (matrix[r.nama_staff].counts[catName] || 0) + 1;
    });

    return Object.entries(matrix)
      .map(([nama_staff, data]) => ({
        nama_staff,
        total: data.total,
        counts: data.counts
      }))
      .filter((item) => item.total > 0 || !filterStaff) // show staff with errors or all
      .sort((a, b) => b.total - a.total);
  }, [staffList, activeCatNames, filteredReports, filterStaff]);

  // Overall Category Totals Summary
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    activeCatNames.forEach((cat) => {
      totals[cat] = 0;
    });

    filteredReports.forEach((r) => {
      totals[r.kategori_kesalahan] = (totals[r.kategori_kesalahan] || 0) + 1;
    });

    return totals;
  }, [activeCatNames, filteredReports]);

  const grandTotal = filteredReports.length;

  const handleExportExcel = () => {
    const rows = staffMatrix.map((st) => {
      const row: Record<string, any> = {
        'Nama Staff': st.nama_staff,
        'Total Kesalahan': st.total
      };
      activeCatNames.forEach((cat) => {
        row[cat] = st.counts[cat] || 0;
      });
      return row;
    });
    exportToExcel('Rekap_Kesalahan_Staff_LIGABANDOT', 'Rekap Matrix', rows);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div className="p-5 rounded-2xl glass-panel-gold border border-[#D4AF37]/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black gold-gradient-text uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#D4AF37]" /> REKAPITULASI OTOMATIS KESALAHAN STAFF
          </h2>
          <p className="text-xs text-[#F5E6C8]/80 mt-1">
            Matriks rekapitulasi jumlah kesalahan per staff yang dikategorikan secara otomatis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => printReportsWindow('Rekap Matrix Kesalahan', filteredReports)}
            className="px-4 py-2.5 rounded-xl bg-[#102A0B] hover:bg-[#1B4D1A] text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-bold uppercase flex items-center gap-2 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Cetak
          </button>
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 rounded-xl gold-gradient-bg text-[#08110A] font-extrabold text-xs uppercase flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Excel
          </button>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className="p-4 rounded-2xl bg-[#0F2012] border border-[#D4AF37]/20 flex flex-wrap items-center justify-between gap-4 shadow-md text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[#D4AF37] font-bold">Mulai:</span>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-[#F5E6C8]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#D4AF37] font-bold">Sampai:</span>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-[#F5E6C8]"
            />
          </div>

          <select
            value={filterSite}
            onChange={(e) => setFilterSite(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-[#F5E6C8]"
          >
            <option value="">Semua Situs</option>
            {sitesList.map((s) => (
              <option key={s.id} value={s.nama_situs}>
                {s.nama_situs}
              </option>
            ))}
          </select>

          <select
            value={filterStaff}
            onChange={(e) => setFilterStaff(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-[#F5E6C8]"
          >
            <option value="">Semua Staff</option>
            {staffList.map((st) => (
              <option key={st.id} value={st.nama_staff}>
                {st.nama_staff}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => {
            setFilterStartDate('');
            setFilterEndDate('');
            setFilterSite('');
            setFilterStaff('');
          }}
          className="text-[#D4AF37] hover:underline font-bold"
        >
          Reset Filter
        </button>
      </div>

      {/* OVERALL TOTALS SUMMARY BOX */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#102A0B] to-[#0F2012] border border-[#D4AF37]/30 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-3">
          <h3 className="text-sm font-black gold-gradient-text uppercase tracking-wider">
            TOTAL KESELURUHAN REKAPITULASI
          </h3>
          <span className="text-xl font-mono font-extrabold text-[#D4AF37]">
            Total Kesalahan: {grandTotal}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {activeCatNames.map((cat) => (
            <div key={cat} className="p-3 rounded-xl bg-[#08110A] border border-[#D4AF37]/20">
              <span className="text-[10px] text-[#F5E6C8]/70 block truncate">{cat}</span>
              <span className="text-base font-extrabold text-[#D4AF37] font-mono mt-0.5 block">
                {categoryTotals[cat] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* MATRIX TABLE */}
      <div className="p-5 rounded-2xl bg-[#0F2012] border border-[#D4AF37]/20 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#D4AF37]/20 text-[#D4AF37] uppercase tracking-wider">
                <th className="py-3 px-3">Nama Staff</th>
                <th className="py-3 px-3 text-center bg-[#102A0B]">Total</th>
                {activeCatNames.map((cat) => (
                  <th key={cat} className="py-3 px-2 text-center max-w-[100px] truncate">
                    {cat}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/10">
              {staffMatrix.map((st) => (
                <tr key={st.nama_staff} className="hover:bg-[#102A0B]/50 transition-colors">
                  <td className="py-3 px-3 font-bold text-[#F5E6C8] whitespace-nowrap">
                    {st.nama_staff}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-extrabold text-[#D4AF37] bg-[#102A0B]">
                    {st.total}
                  </td>
                  {activeCatNames.map((cat) => (
                    <td
                      key={cat}
                      className={`py-3 px-2 text-center font-mono ${
                        (st.counts[cat] || 0) > 0 ? 'text-amber-300 font-bold' : 'text-gray-600'
                      }`}
                    >
                      {st.counts[cat] || 0}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

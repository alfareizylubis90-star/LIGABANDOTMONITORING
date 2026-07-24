import React, { useState, useMemo } from 'react';
import { Download, Printer, FileSpreadsheet, FileCode, Filter, FileText } from 'lucide-react';
import { ErrorReport, Staff, Site } from '../../types';
import { exportToExcel, exportToCSV, formatReportsForExport, printReportsWindow } from '../../utils/exportUtils';

interface ExportDataViewProps {
  reports: ErrorReport[];
  staffList: Staff[];
  sitesList: Site[];
}

export const ExportDataView: React.FC<ExportDataViewProps> = ({
  reports,
  staffList,
  sitesList
}) => {
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [filterStaff, setFilterStaff] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Filtered data for export
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (filterSite && r.situs !== filterSite) return false;
      if (filterStaff && r.nama_staff !== filterStaff) return false;
      if (filterStatus && r.status !== filterStatus) return false;
      if (filterStartDate && r.tanggal < filterStartDate) return false;
      if (filterEndDate && r.tanggal > filterEndDate) return false;
      return true;
    });
  }, [reports, filterSite, filterStaff, filterStatus, filterStartDate, filterEndDate]);

  const handleExportExcel = () => {
    const formatted = formatReportsForExport(filteredReports);
    exportToExcel('Export_Error_Monitor_LIGABANDOT', 'Data Kesalahan', formatted);
  };

  const handleExportCSV = () => {
    const formatted = formatReportsForExport(filteredReports);
    exportToCSV('Export_Error_Monitor_LIGABANDOT', formatted);
  };

  const handlePrintPDF = () => {
    const siteLabel = filterSite || 'Semua Situs';
    printReportsWindow(`Periode Filter - ${siteLabel}`, filteredReports);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div className="p-5 rounded-2xl glass-panel-gold border border-[#D4AF37]/30 shadow-xl">
        <h2 className="text-xl font-black gold-gradient-text uppercase tracking-wider flex items-center gap-2">
          <Download className="w-6 h-6 text-[#D4AF37]" /> EXPORT DATA & REKAP LAPORAN
        </h2>
        <p className="text-xs text-[#F5E6C8]/80 mt-1">
          Unduh laporan dalam format Excel, CSV, atau cetak dokumen PDF sesuai kriteria filter aktif.
        </p>
      </div>

      {/* FILTER PANEL */}
      <div className="p-6 rounded-3xl bg-[#0F2012] border border-[#D4AF37]/20 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
          <Filter className="w-4 h-4" /> Atur Filter Sebelum Ekspor:
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-[#F5E6C8]/70 mb-1">Tanggal Mulai</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-[#F5E6C8]"
            />
          </div>

          <div>
            <label className="block text-[#F5E6C8]/70 mb-1">Tanggal Sampai</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-[#F5E6C8]"
            />
          </div>

          <div>
            <label className="block text-[#F5E6C8]/70 mb-1">Filter Situs</label>
            <select
              value={filterSite}
              onChange={(e) => setFilterSite(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-[#F5E6C8]"
            >
              <option value="">Semua Situs</option>
              {sitesList.map((st) => (
                <option key={st.id} value={st.nama_situs}>
                  {st.nama_situs}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#F5E6C8]/70 mb-1">Filter Staff</label>
            <select
              value={filterStaff}
              onChange={(e) => setFilterStaff(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-[#F5E6C8]"
            >
              <option value="">Semua Staff</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.nama_staff}>
                  {s.nama_staff}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 text-xs border-t border-[#D4AF37]/10">
          <span className="text-amber-300 font-bold">
            Data Terpilih: {filteredReports.length} Laporan Ditemukan
          </span>

          <button
            onClick={() => {
              setFilterStartDate('');
              setFilterEndDate('');
              setFilterSite('');
              setFilterStaff('');
              setFilterStatus('');
            }}
            className="text-[#D4AF37] hover:underline font-bold"
          >
            Reset Filter
          </button>
        </div>
      </div>

      {/* EXPORT BUTTONS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* EXCEL */}
        <button
          onClick={handleExportExcel}
          className="p-6 rounded-3xl bg-[#0F2012] border border-emerald-500/30 hover:border-emerald-400 shadow-2xl flex flex-col items-center text-center space-y-3 transition-all cursor-pointer group"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#F5E6C8] uppercase">EXPORT EXCEL (.XLSX)</h3>
            <p className="text-[11px] text-[#F5E6C8]/60 mt-1">Unduh spreadsheet data terstruktur</p>
          </div>
        </button>

        {/* CSV */}
        <button
          onClick={handleExportCSV}
          className="p-6 rounded-3xl bg-[#0F2012] border border-[#D4AF37]/30 hover:border-[#D4AF37] shadow-2xl flex flex-col items-center text-center space-y-3 transition-all cursor-pointer group"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#102A0B] text-[#D4AF37] border border-[#D4AF37]/40 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileCode className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#F5E6C8] uppercase">EXPORT CSV (.CSV)</h3>
            <p className="text-[11px] text-[#F5E6C8]/60 mt-1">Format teks dipisahkan koma</p>
          </div>
        </button>

        {/* PRINT */}
        <button
          onClick={handlePrintPDF}
          className="p-6 rounded-3xl bg-[#0F2012] border border-blue-500/30 hover:border-blue-400 shadow-2xl flex flex-col items-center text-center space-y-3 transition-all cursor-pointer group"
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Printer className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#F5E6C8] uppercase">CETAK DOKUMEN</h3>
            <p className="text-[11px] text-[#F5E6C8]/60 mt-1">Tampilan cetak printer langsung</p>
          </div>
        </button>

        {/* PDF */}
        <button
          onClick={handlePrintPDF}
          className="p-6 rounded-3xl bg-[#0F2012] border border-red-500/30 hover:border-red-400 shadow-2xl flex flex-col items-center text-center space-y-3 transition-all cursor-pointer group"
        >
          <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#F5E6C8] uppercase">EXPORT PDF</h3>
            <p className="text-[11px] text-[#F5E6C8]/60 mt-1">Simpan sebagai dokumen PDF resmi</p>
          </div>
        </button>
      </div>
    </div>
  );
};

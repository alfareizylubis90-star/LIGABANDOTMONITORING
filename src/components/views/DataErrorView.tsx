import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  X,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Building2,
  UserCheck
} from 'lucide-react';
import { ErrorReport, Staff, Site, ErrorCategory, ErrorStatus, User, ErrorSeverity } from '../../types';
import { storage } from '../../services/storage';

interface DataErrorViewProps {
  reports: ErrorReport[];
  staffList: Staff[];
  sitesList: Site[];
  categoriesList: ErrorCategory[];
  currentUser: User | null;
  selectedReportDetail: ErrorReport | null;
  onClearReportDetail: () => void;
  onSuccess: (msg: string) => void;
}

export const DataErrorView: React.FC<DataErrorViewProps> = ({
  reports,
  staffList,
  sitesList,
  categoriesList,
  currentUser,
  selectedReportDetail,
  onClearReportDetail,
  onSuccess
}) => {
  // Role Access
  const isAdmin = currentUser?.role === 'admin';
  const isSupervisor = currentUser?.role === 'supervisor';
  const isStaff = currentUser?.role === 'staff';
  const canEdit = isAdmin || isSupervisor;
  const canDelete = isAdmin;

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStaff, setFilterStaff] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Sorting & Pagination
  const [sortField, setSortField] = useState<'tanggal' | 'nomor_laporan' | 'nama_staff'>('tanggal');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals
  const [activeDetailModal, setActiveDetailModal] = useState<ErrorReport | null>(selectedReportDetail);
  const [activeEditModal, setActiveEditModal] = useState<ErrorReport | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<ErrorReport | null>(null);

  // Status Change State in Detail Modal
  const [newStatus, setNewStatus] = useState<ErrorStatus>('Belum Ditangani');
  const [newCatatanAdmin, setNewCatatanAdmin] = useState('');

  // Keep modal state sync if passed from parent
  React.useEffect(() => {
    if (selectedReportDetail) {
      setActiveDetailModal(selectedReportDetail);
      setNewStatus(selectedReportDetail.status);
      setNewCatatanAdmin(selectedReportDetail.catatan_admin || '');
    }
  }, [selectedReportDetail]);

  // Filtered & Sorted Reports
  const filteredReports = useMemo(() => {
    return reports
      .filter((r) => {
        // Search
        const search = searchTerm.toLowerCase();
        const matchSearch =
          r.nomor_laporan.toLowerCase().includes(search) ||
          r.nama_staff.toLowerCase().includes(search) ||
          r.id_staff.toLowerCase().includes(search) ||
          r.deskripsi_kesalahan.toLowerCase().includes(search) ||
          r.situs.toLowerCase().includes(search);

        if (!matchSearch) return false;

        if (filterStaff && r.nama_staff !== filterStaff) return false;
        if (filterSite && r.situs !== filterSite) return false;
        if (filterCategory && r.kategori_kesalahan !== filterCategory) return false;
        if (filterSeverity && r.tingkat_kesalahan !== filterSeverity) return false;
        if (filterStatus && r.status !== filterStatus) return false;

        if (filterStartDate && r.tanggal < filterStartDate) return false;
        if (filterEndDate && r.tanggal > filterEndDate) return false;

        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [
    reports,
    searchTerm,
    filterStaff,
    filterSite,
    filterCategory,
    filterSeverity,
    filterStatus,
    filterStartDate,
    filterEndDate,
    sortField,
    sortOrder
  ]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage) || 1;
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReports.slice(start, start + itemsPerPage);
  }, [filteredReports, currentPage]);

  const handleOpenDetail = (report: ErrorReport) => {
    setActiveDetailModal(report);
    setNewStatus(report.status);
    setNewCatatanAdmin(report.catatan_admin || '');
  };

  const handleCloseDetail = () => {
    setActiveDetailModal(null);
    onClearReportDetail();
  };

  // Status Change Submission
  const handleSaveStatusChange = () => {
    if (!activeDetailModal) return;
    storage.updateReportStatus(
      activeDetailModal.id,
      newStatus,
      newCatatanAdmin,
      currentUser?.nama || 'Administrator'
    );
    onSuccess(`Status laporan ${activeDetailModal.nomor_laporan} berhasil diperbarui menjadi ${newStatus}.`);
    handleCloseDetail();
  };

  // Delete Action
  const handleDeleteReport = () => {
    if (!deleteConfirmModal) return;
    storage.deleteReport(deleteConfirmModal.id);
    onSuccess(`Data laporan ${deleteConfirmModal.nomor_laporan} berhasil dihapus.`);
    setDeleteConfirmModal(null);
  };

  // Edit Submission
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEditModal) return;
    storage.updateReport(activeEditModal);
    onSuccess(`Laporan ${activeEditModal.nomor_laporan} berhasil diperbarui.`);
    setActiveEditModal(null);
  };

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
      <div className="p-5 rounded-2xl glass-panel-gold border border-[#D4AF37]/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black gold-gradient-text uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#D4AF37]" /> DATA LAPORAN KESALAHAN
          </h2>
          <p className="text-xs text-[#F5E6C8]/80 mt-1">
            Daftar lengkap seluruh laporan kesalahan staff. Gunakan filter untuk penyaringan data.
          </p>
        </div>

        <div className="text-xs text-[#D4AF37] font-bold bg-[#102A0B] px-4 py-2 rounded-xl border border-[#D4AF37]/30">
          Total Data Filtered: {filteredReports.length} Laporan
        </div>
      </div>

      {isStaff && (
        <div className="p-4 rounded-2xl bg-[#0F2012] border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold flex items-center gap-3 shadow-lg">
          <ShieldAlert className="w-5 h-5 shrink-0 text-[#D4AF37]" />
          <div>
            <strong className="block font-bold uppercase text-white">Role Access: Staff (Hanya Akses Data Diri)</strong>
            <span>Anda berada dalam mode Lihat Data. Akses Edit, Hapus, dan Ubah Status Laporan dibatasi khusus untuk Supervisor & Admin.</span>
          </div>
        </div>
      )}

      {/* FILTER PANEL */}
      <div className="p-5 rounded-2xl bg-[#0F2012] border border-[#D4AF37]/20 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row items-center gap-4">
          {/* Search Box */}
          <div className="relative w-full lg:w-1/3">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-[#D4AF37]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari No Laporan, Nama Staff, ID, Deskripsi..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-xs text-[#F5E6C8] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full lg:w-2/3">
            <select
              value={filterSite}
              onChange={(e) => setFilterSite(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-xs text-[#F5E6C8]"
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
              className="px-3 py-2 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-xs text-[#F5E6C8]"
            >
              <option value="">Semua Staff</option>
              {staffList.map((st) => (
                <option key={st.id} value={st.nama_staff}>
                  {st.nama_staff}
                </option>
              ))}
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-xs text-[#F5E6C8]"
            >
              <option value="">Semua Kategori</option>
              {categoriesList.map((c) => (
                <option key={c.id} value={c.nama_kategori}>
                  {c.nama_kategori}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-xs text-[#F5E6C8]"
            >
              <option value="">Semua Status</option>
              <option value="Belum Ditangani">Belum Ditangani</option>
              <option value="Diproses">Diproses</option>
              <option value="Selesai">Selesai</option>
              <option value="Ditolak">Ditolak</option>
            </select>
          </div>
        </div>

        {/* Date Filter & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#D4AF37]/10 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#D4AF37] font-bold">Periode Tanggal:</span>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-[#08110A] border border-[#D4AF37]/30 text-[#F5E6C8]"
            />
            <span className="text-[#F5E6C8]/60">s/d</span>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-[#08110A] border border-[#D4AF37]/30 text-[#F5E6C8]"
            />
          </div>

          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStaff('');
              setFilterSite('');
              setFilterCategory('');
              setFilterSeverity('');
              setFilterStatus('');
              setFilterStartDate('');
              setFilterEndDate('');
            }}
            className="text-[#D4AF37] hover:underline font-bold"
          >
            Reset Filter
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="p-5 rounded-2xl bg-[#0F2012] border border-[#D4AF37]/20 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#D4AF37]/20 text-[#D4AF37] uppercase tracking-wider">
                <th className="py-3 px-3 text-center">No</th>
                <th className="py-3 px-3">No Laporan</th>
                <th className="py-3 px-3">Waktu</th>
                <th className="py-3 px-3">Staff (ID)</th>
                <th className="py-3 px-3">Situs</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-3">Tingkat</th>
                <th className="py-3 px-3">Bukti</th>
                <th className="py-3 px-3">Pelapor</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/10">
              {paginatedReports.length > 0 ? (
                paginatedReports.map((r, index) => (
                  <tr key={r.id} className="hover:bg-[#102A0B]/50 transition-colors">
                    <td className="py-3 px-3 text-center text-[#F5E6C8]/60">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[#F5E6C8] whitespace-nowrap">
                      {r.nomor_laporan}
                    </td>
                    <td className="py-3 px-3 text-[#F5E6C8]/80 whitespace-nowrap">
                      {r.tanggal} <span className="text-[#D4AF37] font-mono">{r.jam}</span>
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
                    <td className="py-3 px-3 text-[#F5E6C8]/90 max-w-[140px] truncate">
                      {r.kategori_kesalahan}
                    </td>
                    <td className="py-3 px-3 font-medium text-[#F5E6C8]/80 whitespace-nowrap">
                      {r.tingkat_kesalahan}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {r.bukti_screenshot || r.link_bukti ? (
                        <span className="text-emerald-400 font-bold">Ada</span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-[#F5E6C8]/70 whitespace-nowrap">
                      {r.nama_pelapor}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${getStatusBadge(
                          r.status
                        )}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenDetail(r)}
                          className="p-1.5 rounded-lg bg-[#102A0B] hover:bg-[#1B4D1A] text-[#D4AF37] border border-[#D4AF37]/30 transition-all cursor-pointer"
                          title="Detail Laporan"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {canEdit && (
                          <button
                            onClick={() => setActiveEditModal(r)}
                            className="p-1.5 rounded-lg bg-[#102A0B] hover:bg-[#1B4D1A] text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
                            title="Edit Laporan"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {canDelete && (
                          <button
                            onClick={() => setDeleteConfirmModal(r)}
                            className="p-1.5 rounded-lg bg-red-900/30 hover:bg-red-800/50 text-red-300 border border-red-500/30 transition-all cursor-pointer"
                            title="Hapus Laporan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-xs text-[#F5E6C8]/50">
                    Belum ada data kesalahan yang sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-[#D4AF37]/10 text-xs">
          <div className="text-[#F5E6C8]/60">
            Halaman {currentPage} dari {totalPages}
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-2 rounded-lg bg-[#102A0B] text-[#D4AF37] disabled:opacity-40 border border-[#D4AF37]/30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-2 rounded-lg bg-[#102A0B] text-[#D4AF37] disabled:opacity-40 border border-[#D4AF37]/30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {activeDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#08110A]/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#0F2012] border border-[#D4AF37]/40 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-4">
              <div>
                <h3 className="text-base font-extrabold gold-gradient-text uppercase">
                  DETAIL LAPORAN KESALAHAN
                </h3>
                <p className="text-xs text-[#D4AF37] font-mono mt-0.5">
                  {activeDetailModal.nomor_laporan}
                </p>
              </div>

              <button
                onClick={handleCloseDetail}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#102A0B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#D4AF37] font-bold block mb-0.5">Waktu Laporan</span>
                <span className="text-[#F5E6C8]">
                  {activeDetailModal.tanggal} {activeDetailModal.jam}
                </span>
              </div>

              <div>
                <span className="text-[#D4AF37] font-bold block mb-0.5">Nama Staff & ID</span>
                <span className="text-[#F5E6C8] font-bold">
                  {activeDetailModal.nama_staff} ({activeDetailModal.id_staff})
                </span>
              </div>

              <div>
                <span className="text-[#D4AF37] font-bold block mb-0.5">Situs</span>
                <span className="px-2 py-0.5 rounded bg-[#102A0B] border border-[#D4AF37]/30 text-[#D4AF37] font-bold">
                  {activeDetailModal.situs}
                </span>
              </div>

              <div>
                <span className="text-[#D4AF37] font-bold block mb-0.5">Kategori</span>
                <span className="text-[#F5E6C8]">{activeDetailModal.kategori_kesalahan}</span>
              </div>

              <div>
                <span className="text-[#D4AF37] font-bold block mb-0.5">Tingkat Kesalahan</span>
                <span className="text-[#F5E6C8] font-semibold">
                  {activeDetailModal.tingkat_kesalahan}
                </span>
              </div>

              <div>
                <span className="text-[#D4AF37] font-bold block mb-0.5">Pelapor</span>
                <span className="text-[#F5E6C8]">{activeDetailModal.nama_pelapor}</span>
              </div>
            </div>

            {/* Deskripsi */}
            <div>
              <span className="text-[#D4AF37] font-bold block mb-1.5 text-xs">
                Deskripsi Kesalahan:
              </span>
              <p className="p-4 rounded-xl bg-[#08110A] border border-[#D4AF37]/20 text-xs text-[#F5E6C8] leading-relaxed whitespace-pre-wrap">
                {activeDetailModal.deskripsi_kesalahan}
              </p>
            </div>

            {/* Bukti Screenshot / Link */}
            {(activeDetailModal.bukti_screenshot || activeDetailModal.link_bukti) && (
              <div className="space-y-2">
                <span className="text-[#D4AF37] font-bold block text-xs">Bukti Lampiran:</span>
                {activeDetailModal.link_bukti && (
                  <a
                    href={activeDetailModal.link_bukti}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Buka Link Bukti Screenshot
                  </a>
                )}
                {activeDetailModal.bukti_screenshot && (
                  <div>
                    <img
                      src={activeDetailModal.bukti_screenshot}
                      alt="Bukti Screenshot"
                      className="max-h-60 rounded-xl border border-[#D4AF37]/30 object-contain bg-[#08110A]"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Status change section or Read-only status */}
            {canEdit ? (
              <div className="p-4 rounded-2xl bg-[#08110A] border border-[#D4AF37]/30 space-y-3">
                <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block">
                  Ubah Status & Catatan Laporan
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    ['Belum Ditangani', 'Diproses', 'Selesai', 'Ditolak'] as ErrorStatus[]
                  ).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNewStatus(st)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        newStatus === st
                          ? 'bg-[#D4AF37] text-[#08110A] shadow-lg'
                          : 'bg-[#102A0B] text-[#F5E6C8]/70 border border-[#D4AF37]/20'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-[11px] text-[#F5E6C8]/70 mb-1">Catatan Admin</label>
                  <textarea
                    rows={2}
                    value={newCatatanAdmin}
                    onChange={(e) => setNewCatatanAdmin(e.target.value)}
                    placeholder="Tuliskan catatan tindak lanjut..."
                    className="w-full p-3 rounded-xl bg-[#0F2012] border border-[#D4AF37]/30 text-xs text-[#F5E6C8]"
                  />
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleSaveStatusChange}
                    className="px-5 py-2.5 rounded-xl gold-gradient-bg text-[#08110A] font-extrabold text-xs uppercase"
                  >
                    Update Status & Catatan
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#08110A] border border-[#D4AF37]/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                    Status Laporan: <span className="text-[#F5E6C8]">{activeDetailModal.status}</span>
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#102A0B] text-[#D4AF37] border border-[#D4AF37]/30">
                    Mode Lihat (Akses Staff)
                  </span>
                </div>
                {activeDetailModal.catatan_admin && (
                  <div className="text-xs text-[#F5E6C8]/80 bg-[#0F2012] p-3 rounded-xl border border-[#D4AF37]/20">
                    <strong className="text-[#D4AF37] block mb-0.5">Catatan Admin:</strong>
                    {activeDetailModal.catatan_admin}
                  </div>
                )}
              </div>
            )}

            {activeDetailModal.status === 'Selesai' && activeDetailModal.diselesaikan_oleh && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300">
                Laporan diselesaikan oleh <b>{activeDetailModal.diselesaikan_oleh}</b> pada{' '}
                {activeDetailModal.tanggal_selesai} {activeDetailModal.jam_selesai}.
              </div>
            )}
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#08110A]/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-[#0F2012] border border-red-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-900/40 border border-red-500/50 flex items-center justify-center mx-auto text-red-400">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-red-400">Konfirmasi Hapus Laporan</h3>
            <p className="text-xs text-[#F5E6C8]/80 leading-relaxed">
              Apakah Anda yakin ingin menghapus laporan{' '}
              <b className="text-[#D4AF37]">{deleteConfirmModal.nomor_laporan}</b> dari database? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmModal(null)}
                className="px-5 py-2.5 rounded-xl bg-[#102A0B] text-[#F5E6C8] text-xs font-bold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteReport}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

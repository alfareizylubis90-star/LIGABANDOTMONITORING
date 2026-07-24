import React, { useState } from 'react';
import { Users, UserPlus, Search, Edit2, Trash2, Power, X, ShieldCheck } from 'lucide-react';
import { Staff, StaffJabatan, StaffShift, Site, User } from '../../types';
import { storage } from '../../services/storage';

interface DataStaffViewProps {
  staffList: Staff[];
  sitesList: Site[];
  currentUser: User | null;
  onSuccess: (msg: string) => void;
}

export const DataStaffView: React.FC<DataStaffViewProps> = ({
  staffList,
  sitesList,
  currentUser,
  onSuccess
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const isSupervisor = currentUser?.role === 'supervisor';
  const isStaffRole = currentUser?.role === 'staff';
  const canEdit = isAdmin || isSupervisor;
  const canDelete = isAdmin;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [filterShift, setFilterShift] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);

  // Form State
  const [formNamaStaff, setFormNamaStaff] = useState('');
  const [formIdStaff, setFormIdStaff] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formJabatan, setFormJabatan] = useState<StaffJabatan>('CS');
  const [formSitus, setFormSitus] = useState('');
  const [formShift, setFormShift] = useState<StaffShift>('Pagi');

  const filteredStaff = staffList.filter((s) => {
    const search = searchTerm.toLowerCase();
    const matchSearch =
      s.nama_staff.toLowerCase().includes(search) ||
      s.id_staff.toLowerCase().includes(search) ||
      s.username.toLowerCase().includes(search);

    if (!matchSearch) return false;
    if (filterSite && s.situs !== filterSite) return false;
    if (filterShift && s.shift !== filterShift) return false;
    return true;
  });

  const handleOpenAdd = () => {
    setFormNamaStaff('');
    setFormIdStaff('');
    setFormUsername('');
    setFormJabatan('CS');
    setFormSitus(sitesList[0]?.nama_situs || 'LIGABANDOT');
    setFormShift('Pagi');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (staff: Staff) => {
    setEditingStaff(staff);
    setFormNamaStaff(staff.nama_staff);
    setFormIdStaff(staff.id_staff);
    setFormUsername(staff.username);
    setFormJabatan(staff.jabatan);
    setFormSitus(staff.situs);
    setFormShift(staff.shift);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNamaStaff || !formIdStaff) {
      alert('Nama Staff dan ID Staff wajib diisi.');
      return;
    }

    storage.addStaff({
      nama_staff: formNamaStaff,
      id_staff: formIdStaff,
      username: formUsername || formNamaStaff.toLowerCase().replace(/\s+/g, '_'),
      jabatan: formJabatan,
      situs: formSitus,
      shift: formShift,
      status: 'aktif'
    });

    onSuccess(`Staff ${formNamaStaff} berhasil ditambahkan.`);
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    storage.updateStaff({
      ...editingStaff,
      nama_staff: formNamaStaff,
      id_staff: formIdStaff,
      username: formUsername,
      jabatan: formJabatan,
      situs: formSitus,
      shift: formShift
    });

    onSuccess(`Data staff ${formNamaStaff} berhasil diperbarui.`);
    setEditingStaff(null);
  };

  const handleToggleStatus = (staff: Staff) => {
    storage.toggleStaffStatus(staff.id);
    onSuccess(
      `Status staff ${staff.nama_staff} diubah menjadi ${
        staff.status === 'aktif' ? 'Nonaktif' : 'Aktif'
      }.`
    );
  };

  const confirmDeleteStaff = () => {
    if (!staffToDelete) return;
    storage.deleteStaff(staffToDelete.id);
    onSuccess(`Staff ${staffToDelete.nama_staff} berhasil dihapus.`);
    setStaffToDelete(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div className="p-5 rounded-2xl glass-panel-gold border border-[#D4AF37]/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black gold-gradient-text uppercase tracking-wider flex items-center gap-2">
            <Users className="w-6 h-6 text-[#D4AF37]" /> DATA PETUGAS STAFF CS
          </h2>
          <p className="text-xs text-[#F5E6C8]/80 mt-1">
            Kelola data petugas, ID Staff, jabatan, situs penugasan, dan status keaktifan.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="px-5 py-3 rounded-xl gold-gradient-bg text-[#08110A] font-extrabold text-xs uppercase tracking-wider shadow-xl hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" /> + TAMBAH STAFF
          </button>
        )}
      </div>

      {isStaffRole && (
        <div className="p-4 rounded-2xl bg-[#0F2012] border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold flex items-center gap-3 shadow-lg">
          <ShieldCheck className="w-5 h-5 shrink-0 text-[#D4AF37]" />
          <div>
            <strong className="block font-bold uppercase text-white">Akses Staff (Mode Lihat)</strong>
            <span>Penambahan, pengeditan, dan penghapusan data staff hanya dapat dilakukan oleh Supervisor atau Admin.</span>
          </div>
        </div>
      )}

      {/* FILTER & SEARCH */}
      <div className="p-4 rounded-2xl bg-[#0F2012] border border-[#D4AF37]/20 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#D4AF37]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama staff, ID, username..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-xs text-[#F5E6C8] focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterSite}
            onChange={(e) => setFilterSite(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-xs text-[#F5E6C8]"
          >
            <option value="">Semua Situs</option>
            {sitesList.map((st) => (
              <option key={st.id} value={st.nama_situs}>
                {st.nama_situs}
              </option>
            ))}
          </select>

          <select
            value={filterShift}
            onChange={(e) => setFilterShift(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-xs text-[#F5E6C8]"
          >
            <option value="">Semua Shift</option>
            <option value="Pagi">Shift Pagi</option>
            <option value="Siang">Shift Siang</option>
            <option value="Malam">Shift Malam</option>
          </select>
        </div>
      </div>

      {/* TABLE STAFF */}
      <div className="p-5 rounded-2xl bg-[#0F2012] border border-[#D4AF37]/20 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#D4AF37]/20 text-[#D4AF37] uppercase tracking-wider">
                <th className="py-3 px-3">No</th>
                <th className="py-3 px-3">Nama Staff</th>
                <th className="py-3 px-3">ID Staff</th>
                <th className="py-3 px-3">Username</th>
                <th className="py-3 px-3">Jabatan</th>
                <th className="py-3 px-3">Situs</th>
                <th className="py-3 px-3">Shift</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/10">
              {filteredStaff.length > 0 ? (
                filteredStaff.map((staff, index) => (
                  <tr key={staff.id} className="hover:bg-[#102A0B]/50 transition-colors">
                    <td className="py-3 px-3 text-[#F5E6C8]/60">{index + 1}</td>
                    <td className="py-3 px-3 font-bold text-[#F5E6C8]">{staff.nama_staff}</td>
                    <td className="py-3 px-3 font-mono text-[#D4AF37] font-bold">
                      {staff.id_staff}
                    </td>
                    <td className="py-3 px-3 text-[#F5E6C8]/80">{staff.username}</td>
                    <td className="py-3 px-3 font-semibold text-[#F5E6C8]">{staff.jabatan}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-[#102A0B] border border-[#D4AF37]/30 text-[#D4AF37] font-bold">
                        {staff.situs}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#F5E6C8]/80">{staff.shift}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          staff.status === 'aktif'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}
                      >
                        {staff.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {canEdit ? (
                          <>
                            <button
                              onClick={() => handleToggleStatus(staff)}
                              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                staff.status === 'aktif'
                                  ? 'bg-red-900/30 text-red-300 border-red-500/30'
                                  : 'bg-emerald-900/30 text-emerald-300 border-emerald-500/30'
                              }`}
                              title={staff.status === 'aktif' ? 'Nonaktifkan Staff' : 'Aktifkan Staff'}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleOpenEdit(staff)}
                              className="p-1.5 rounded-lg bg-[#102A0B] hover:bg-[#1B4D1A] text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
                              title="Edit Staff"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : null}

                        {canDelete && (
                          <button
                            onClick={() => setStaffToDelete(staff)}
                            className="p-1.5 rounded-lg bg-red-900/30 hover:bg-red-800/50 text-red-300 border border-red-500/30 transition-all cursor-pointer"
                            title="Hapus Staff"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {!canEdit && !canDelete && (
                          <span className="text-[11px] text-[#F5E6C8]/40 italic">Read-Only</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-xs text-[#F5E6C8]/50">
                    Tidak ada data staff ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {(isAddModalOpen || editingStaff) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#08110A]/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-[#0F2012] border border-[#D4AF37]/40 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-4">
              <h3 className="text-base font-extrabold gold-gradient-text uppercase">
                {editingStaff ? 'EDIT DATA STAFF' : 'TAMBAH STAFF BARU'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingStaff(null);
                }}
                className="p-2 rounded-xl text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={editingStaff ? handleSaveEdit : handleSaveAdd}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-[#D4AF37] font-bold mb-1">Nama Staff *</label>
                <input
                  type="text"
                  required
                  value={formNamaStaff}
                  onChange={(e) => setFormNamaStaff(e.target.value)}
                  placeholder="Contoh: RIAN ARIEL HUTAGAOL"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-[#F5E6C8]"
                />
              </div>

              <div>
                <label className="block text-[#D4AF37] font-bold mb-1">ID Staff *</label>
                <input
                  type="text"
                  required
                  value={formIdStaff}
                  onChange={(e) => setFormIdStaff(e.target.value)}
                  placeholder="Contoh: E7721650"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-[#F5E6C8] font-mono"
                />
              </div>

              <div>
                <label className="block text-[#D4AF37] font-bold mb-1">Username System</label>
                <input
                  type="text"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  placeholder="Contoh: rian_h"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-[#F5E6C8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#D4AF37] font-bold mb-1">Jabatan *</label>
                  <select
                    value={formJabatan}
                    onChange={(e) => setFormJabatan(e.target.value as StaffJabatan)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-[#F5E6C8]"
                  >
                    <option value="CS">CS</option>
                    <option value="Kapten">Kapten</option>
                    <option value="Kasir">Kasir</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#D4AF37] font-bold mb-1">Shift *</label>
                  <select
                    value={formShift}
                    onChange={(e) => setFormShift(e.target.value as StaffShift)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-[#F5E6C8]"
                  >
                    <option value="Pagi">Pagi</option>
                    <option value="Siang">Siang</option>
                    <option value="Malam">Malam</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#D4AF37] font-bold mb-1">Situs Penugasan *</label>
                <select
                  value={formSitus}
                  onChange={(e) => setFormSitus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-[#F5E6C8]"
                >
                  {sitesList.map((st) => (
                    <option key={st.id} value={st.nama_situs}>
                      {st.nama_situs}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#D4AF37]/20">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingStaff(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#102A0B] text-[#F5E6C8]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl gold-gradient-bg text-[#08110A] font-extrabold uppercase"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {staffToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#08110A]/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-[#0F2012] border border-red-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto text-red-400">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-red-400 uppercase tracking-wider">
                Konfirmasi Hapus Staff
              </h3>
              <p className="text-xs text-[#F5E6C8]/80 mt-2">
                Apakah Anda yakin ingin menghapus petugas <strong className="text-[#D4AF37]">{staffToDelete.nama_staff}</strong> ({staffToDelete.id_staff})?
              </p>
              <p className="text-[11px] text-red-400/80 mt-1 italic">
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStaffToDelete(null)}
                className="px-5 py-2.5 rounded-xl bg-[#102A0B] border border-[#D4AF37]/30 text-[#F5E6C8] font-bold text-xs uppercase cursor-pointer hover:bg-[#1B4D1A]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteStaff}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase shadow-lg shadow-red-900/50 cursor-pointer"
              >
                Ya, Hapus Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

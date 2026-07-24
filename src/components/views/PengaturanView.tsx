import React, { useState } from 'react';
import {
  Settings,
  UserPlus,
  Users,
  Shield,
  Download,
  Upload,
  RefreshCw,
  Edit2,
  Trash2,
  X,
  Power,
  KeyRound
} from 'lucide-react';
import { User, UserRole, UserStatus } from '../../types';
import { storage } from '../../services/storage';

interface PengaturanViewProps {
  currentUser: User | null;
  usersList: User[];
  onSuccess: (msg: string) => void;
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({
  currentUser,
  usersList,
  onSuccess
}) => {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [nama, setNama] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('staff');

  const handleOpenAdd = () => {
    setNama('');
    setUsername('');
    setEmail('');
    setRole('staff');
    setIsAddUserOpen(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setNama(u.nama);
    setUsername(u.username);
    setEmail(u.email);
    setRole(u.role);
  };

  const handleSaveAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !username) return;

    storage.addUser({
      nama,
      username,
      email: email || `${username}@ligabandot.com`,
      role,
      status: 'aktif'
    });

    onSuccess(`Pengguna ${nama} berhasil dibuat dengan role ${role.toUpperCase()}.`);
    setIsAddUserOpen(false);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    storage.updateUser({
      ...editingUser,
      nama,
      username,
      email,
      role
    });

    onSuccess(`Pengguna ${nama} berhasil diperbarui.`);
    setEditingUser(null);
  };

  const handleToggleUserStatus = (u: User) => {
    const updatedStatus: UserStatus = u.status === 'aktif' ? 'nonaktif' : 'aktif';
    storage.updateUser({
      ...u,
      status: updatedStatus
    });
    onSuccess(`Status pengguna ${u.nama} diubah menjadi ${updatedStatus.toUpperCase()}.`);
  };

  const handleDeleteUser = (u: User) => {
    if (u.id === currentUser?.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif!');
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus user ${u.nama}?`)) {
      storage.deleteUser(u.id);
      onSuccess(`Pengguna ${u.nama} berhasil dihapus.`);
    }
  };

  // Backup & Restore handlers
  const handleBackup = () => {
    const jsonStr = storage.exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_Task_Error_Monitor_LIGABANDOT_${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    onSuccess('Backup database JSON berhasil diunduh.');
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (storage.importBackupJSON(content)) {
          onSuccess('Database berhasil dipulihkan dari file backup!');
        } else {
          alert('Format file JSON backup tidak valid.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetData = () => {
    if (
      confirm(
        'APAKAH ANDA YAKIN INGIN MENGEMBALIKAN DATABASE KE DATA SEED AWAL? Semua data baru akan digantikan.'
      )
    ) {
      storage.resetToSeedData();
      onSuccess('Database berhasil direset ke data sampel awal.');
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="p-8 rounded-3xl bg-[#0F2012] border border-amber-500/40 text-center space-y-4 max-w-2xl mx-auto my-12 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-900/30 border border-amber-500/50 flex items-center justify-center mx-auto text-amber-400">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black gold-gradient-text uppercase">Akses Terbatas: Role Admin</h2>
        <p className="text-xs text-[#F5E6C8]/80 leading-relaxed">
          Halaman Pengaturan Sistem & Manajemen Akun Pengguna hanya dapat diakses oleh akun dengan Role <b>ADMIN</b>. Akun Anda saat ini terdaftar sebagai <b>{currentUser?.role.toUpperCase() || 'STAFF'}</b>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div className="p-5 rounded-2xl glass-panel-gold border border-[#D4AF37]/30 shadow-xl">
        <h2 className="text-xl font-black gold-gradient-text uppercase tracking-wider flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#D4AF37]" /> PENGATURAN SISTEM & KELOLA PENGGUNA
        </h2>
        <p className="text-xs text-[#F5E6C8]/80 mt-1">
          Kelola hak akses role (Admin, Supervisor, Staff), backup restore database, dan konfigurasi sistem.
        </p>
      </div>

      {/* USER MANAGEMENT TABLE */}
      <div className="p-6 rounded-3xl bg-[#0F2012] border border-[#D4AF37]/20 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-extrabold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-[#D4AF37]" /> MANAJEMEN AKUN & ROLE PENGGUNA
            </h3>
            <p className="text-xs text-[#F5E6C8]/60 mt-0.5">
              Admin memiliki akses penuh, Supervisor dapat mengelola rekap, Staff dapat melihat laporan diri.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl gold-gradient-bg text-[#08110A] font-extrabold text-xs uppercase flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> + TAMBAH PENGGUNA
          </button>
        </div>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#D4AF37]/20 text-[#D4AF37] uppercase tracking-wider">
                <th className="py-3 px-3">Nama</th>
                <th className="py-3 px-3">Username</th>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/10">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-[#102A0B]/50 transition-colors">
                  <td className="py-3 px-3 font-bold text-[#F5E6C8]">{u.nama}</td>
                  <td className="py-3 px-3 text-[#D4AF37] font-mono">{u.username}</td>
                  <td className="py-3 px-3 text-[#F5E6C8]/80">{u.email}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                        u.role === 'admin'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : u.role === 'supervisor'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        u.status === 'aktif'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}
                    >
                      {u.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleToggleUserStatus(u)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          u.status === 'aktif'
                            ? 'bg-red-900/30 text-red-300 border-red-500/30'
                            : 'bg-emerald-900/30 text-emerald-300 border-emerald-500/30'
                        }`}
                        title={u.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 rounded-lg bg-[#102A0B] text-amber-300 border border-amber-500/30 cursor-pointer"
                        title="Edit User"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u)}
                        className="p-1.5 rounded-lg bg-red-900/30 text-red-300 border border-red-500/30 cursor-pointer"
                        title="Hapus User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BACKUP & RESTORE UTILITIES */}
      <div className="p-6 rounded-3xl bg-[#0F2012] border border-[#D4AF37]/20 shadow-xl space-y-4">
        <h3 className="text-sm font-extrabold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4" /> PEMELIHARAAN DATABASE & BACKUP DATA
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#08110A] border border-[#D4AF37]/20 space-y-2">
            <span className="font-bold text-[#F5E6C8] block">Unduh Backup JSON</span>
            <p className="text-[#F5E6C8]/60 text-[11px]">
              Simpan salinan cadangan seluruh data staff, situs, kategori, dan laporan ke file komputer.
            </p>
            <button
              onClick={handleBackup}
              className="mt-2 px-4 py-2 rounded-xl gold-gradient-bg text-[#08110A] font-extrabold uppercase flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" /> Download Backup
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-[#08110A] border border-[#D4AF37]/20 space-y-2">
            <span className="font-bold text-[#F5E6C8] block">Pulihkan dari Backup JSON</span>
            <p className="text-[#F5E6C8]/60 text-[11px]">
              Unggah file JSON backup untuk memulihkan seluruh data database.
            </p>
            <label className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#102A0B] border border-[#D4AF37]/30 text-[#D4AF37] font-extrabold uppercase cursor-pointer hover:bg-[#1B4D1A]">
              <Upload className="w-4 h-4" /> Pilih File JSON
              <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
            </label>
          </div>

          <div className="p-4 rounded-2xl bg-[#08110A] border border-red-500/30 space-y-2">
            <span className="font-bold text-red-400 block">Reset ke Sampel Awal</span>
            <p className="text-[#F5E6C8]/60 text-[11px]">
              Kembalikan database ke data awal contoh LIGABANDOT.
            </p>
            <button
              onClick={handleResetData}
              className="mt-2 px-4 py-2 rounded-xl bg-red-900/40 border border-red-500/50 text-red-200 font-extrabold uppercase flex items-center gap-1.5 hover:bg-red-800/50"
            >
              <RefreshCw className="w-4 h-4" /> Reset Database
            </button>
          </div>
        </div>
      </div>

      {/* ADD / EDIT USER MODAL */}
      {(isAddUserOpen || editingUser) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#08110A]/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-[#0F2012] border border-[#D4AF37]/40 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-4">
              <h3 className="text-base font-extrabold gold-gradient-text uppercase">
                {editingUser ? 'EDIT AKUN USER' : 'TAMBAH AKUN PENGGUNA'}
              </h3>
              <button
                onClick={() => {
                  setIsAddUserOpen(false);
                  setEditingUser(null);
                }}
                className="p-2 rounded-xl text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={editingUser ? handleSaveEditUser : handleSaveAddUser}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-[#D4AF37] font-bold mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-[#F5E6C8]"
                />
              </div>

              <div>
                <label className="block text-[#D4AF37] font-bold mb-1">Username Login *</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: budi_admin"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-[#F5E6C8]"
                />
              </div>

              <div>
                <label className="block text-[#D4AF37] font-bold mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="budi@ligabandot.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-[#F5E6C8]"
                />
              </div>

              <div>
                <label className="block text-[#D4AF37] font-bold mb-1">Role Akses Sistem *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-[#F5E6C8]"
                >
                  <option value="staff">Staff (Hanya Akses Data Diri)</option>
                  <option value="supervisor">Supervisor (Input, Edit, Export, Rekap)</option>
                  <option value="admin">Admin (Akses Penuh & Kelola User)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#D4AF37]/20">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddUserOpen(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#102A0B] text-[#F5E6C8]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl gold-gradient-bg text-[#08110A] font-extrabold uppercase"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
